import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { normalizeLicenseKey, signDeviceToken, fingerprintDevice } from '@/lib/license';
import { randomUUID } from 'node:crypto';
import type { License } from '@/db/schema';

export const runtime = 'nodejs';

const Body = z.object({
  key: z.string().min(8),
  deviceId: z.string().min(8).max(128),
  deviceName: z.string().max(128).optional(),
  force: z.boolean().optional()
});

// Whop key format: W-XXXXXX-XXXXXXXX-XXXXXXXW (22 stripped chars)
function isWhopKey(key: string): boolean {
  return /^W-[A-Z0-9]{6}-[A-Z0-9]{8}-[A-Z0-9]{7}$/.test(key);
}

export async function POST(req: Request) {
  let parsed;
  try {
    parsed = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 });
  }

  const key = normalizeLicenseKey(parsed.key);
  const fp = fingerprintDevice(parsed.deviceId);

  const rows = await db.select().from(schema.licenses).where(eq(schema.licenses.key, key)).limit(1);

  // Key not in DB — if it looks like a Whop key, try Whop API directly (handles resets)
  if (rows.length === 0) {
    if (isWhopKey(key)) {
      return activateWhopUnknown(key, parsed.deviceId, parsed.deviceName, fp, req);
    }
    return NextResponse.json({ ok: false, error: 'invalid_key' }, { status: 404 });
  }

  const lic = rows[0];

  if (lic.status !== 'active') {
    return NextResponse.json({ ok: false, error: `license_${lic.status}` }, { status: 403 });
  }

  if (lic.source === 'whop') {
    return activateWhopKnown(lic, key, parsed.deviceId, parsed.deviceName, parsed.force, fp, req);
  }

  // — Local key (stripe / appsumo) —
  if (lic.activeDeviceId && lic.activeDeviceId !== fp && !parsed.force) {
    return NextResponse.json(
      {
        ok: false,
        error: 'already_active',
        message: 'This license is active on another device. Send force:true to move it.',
        boundDeviceName: lic.activeDeviceName ?? 'Unknown device'
      },
      { status: 409 }
    );
  }

  const wasReassigned = !!lic.activeDeviceId && lic.activeDeviceId !== fp;

  await db
    .update(schema.licenses)
    .set({ activeDeviceId: fp, activeDeviceName: parsed.deviceName ?? null, activatedAt: new Date() })
    .where(eq(schema.licenses.key, key));

  await db.insert(schema.deviceEvents).values({
    id: randomUUID(),
    licenseKey: key,
    deviceId: fp,
    deviceName: parsed.deviceName ?? null,
    kind: wasReassigned ? 'reassign' : 'activate',
    ip: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null,
    userAgent: req.headers.get('user-agent') ?? null,
    meta: wasReassigned ? { previousDevice: lic.activeDeviceName ?? null } : null
  });

  const token = await signDeviceToken(key, parsed.deviceId);
  const tier = lic.amountCents === 0 ? 'free' : 'paid';
  return NextResponse.json({ ok: true, token, licenseKey: key, email: lic.email, reassigned: wasReassigned, tier });
}

// Key is in DB — validate against Whop API
async function activateWhopKnown(
  lic: License, key: string, deviceId: string,
  deviceName: string | undefined, force: boolean | undefined, fp: string, req: Request
) {
  const apiKey = process.env.WHOP_API_KEY;
  if (!apiKey) return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });

  const whopRes = await fetch(
    `https://api.whop.com/api/v2/memberships/${encodeURIComponent(key)}/validate_license`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ metadata: { machine_id: deviceId } })
    }
  );

  if (whopRes.status === 200 || whopRes.status === 201) {
    const wasReassigned = !!lic.activeDeviceId && lic.activeDeviceId !== fp;
    await db.update(schema.licenses)
      .set({ activeDeviceId: fp, activeDeviceName: deviceName ?? null, activatedAt: new Date() })
      .where(eq(schema.licenses.key, key));
    await db.insert(schema.deviceEvents).values({
      id: randomUUID(), licenseKey: key, deviceId: fp, deviceName: deviceName ?? null,
      kind: wasReassigned ? 'reassign' : 'activate',
      ip: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null,
      userAgent: req.headers.get('user-agent') ?? null
    });
    const token = await signDeviceToken(key, deviceId);
    const tier = lic.amountCents === 0 ? 'free' : 'paid';
    return NextResponse.json({ ok: true, token, licenseKey: key, email: lic.email, reassigned: wasReassigned, tier });
  }

  if (whopRes.status === 400) {
    return NextResponse.json({
      ok: false, error: 'already_active',
      message: 'This license is active on another device. To move it, visit whop.com/@me and reset your license key.',
      boundDeviceName: lic.activeDeviceName ?? 'another device'
    }, { status: 409 });
  }

  const body = await whopRes.text().catch(() => '');
  console.error('Whop validate_license unexpected response', whopRes.status, body);
  return NextResponse.json({ ok: false, error: 'invalid_key' }, { status: 404 });
}

// Key not in DB — call Whop API, upsert membership, then activate
// Handles key resets where Whop silently changes the key without firing a webhook
async function activateWhopUnknown(
  key: string, deviceId: string, deviceName: string | undefined, fp: string, req: Request
) {
  const apiKey = process.env.WHOP_API_KEY;
  if (!apiKey) return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });

  const whopRes = await fetch(
    `https://api.whop.com/api/v2/memberships/${encodeURIComponent(key)}/validate_license`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ metadata: { machine_id: deviceId } })
    }
  );

  if (whopRes.status !== 200 && whopRes.status !== 201) {
    return NextResponse.json({ ok: false, error: 'invalid_key' }, { status: 404 });
  }

  const membership = await whopRes.json() as Record<string, unknown>;
  const membershipId = String(membership.id ?? '');
  const email = String((membership as any).email ?? '');
  const planId = String((membership as any).plan ?? '');
  const valid = Boolean((membership as any).valid);

  if (!valid || !email || !membershipId) {
    return NextResponse.json({ ok: false, error: 'invalid_key' }, { status: 404 });
  }

  const paidPlanIds = new Set((process.env.WHOP_PAID_PLAN_IDS || 'plan_cM14gKwLOrelj,plan_Oh4HMckTmxXcE').split(',').map(s => s.trim()));
  const amountCents = paidPlanIds.has(planId) ? 4999 : 0;
  const tier = amountCents === 0 ? 'free' : 'paid';

  // Check if this membership exists under an old key and update, otherwise insert
  const existing = await db.select().from(schema.licenses)
    .where(eq(schema.licenses.externalId, membershipId)).limit(1);

  if (existing.length > 0) {
    // Key was reset — update to new key and clear old device binding
    await db.update(schema.licenses)
      .set({ key, activeDeviceId: fp, activeDeviceName: deviceName ?? null, activatedAt: new Date() })
      .where(eq(schema.licenses.externalId, membershipId));
  } else {
    // Brand new — insert
    await db.insert(schema.licenses).values({
      key, email, amountCents, currency: 'usd', status: 'active',
      source: 'whop', externalId: membershipId
    });
    await db.update(schema.licenses)
      .set({ activeDeviceId: fp, activeDeviceName: deviceName ?? null, activatedAt: new Date() })
      .where(eq(schema.licenses.key, key));
  }

  await db.insert(schema.deviceEvents).values({
    id: randomUUID(), licenseKey: key, deviceId: fp, deviceName: deviceName ?? null,
    kind: 'activate',
    ip: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null,
    userAgent: req.headers.get('user-agent') ?? null
  });

  const token = await signDeviceToken(key, deviceId);
  return NextResponse.json({ ok: true, token, licenseKey: key, email, tier });
}
