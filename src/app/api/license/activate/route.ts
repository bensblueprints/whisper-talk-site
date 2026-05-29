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
  if (rows.length === 0) {
    return NextResponse.json({ ok: false, error: 'invalid_key' }, { status: 404 });
  }
  const lic = rows[0];

  if (lic.status !== 'active') {
    return NextResponse.json({ ok: false, error: `license_${lic.status}` }, { status: 403 });
  }

  if (lic.source === 'whop') {
    return activateWhop(lic, key, parsed.deviceId, parsed.deviceName, parsed.force, fp, req);
  }

  // — Local key activation (stripe / appsumo) —
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
  return NextResponse.json({ ok: true, token, licenseKey: key, email: lic.email, reassigned: wasReassigned });
}

async function activateWhop(
  lic: License,
  key: string,
  deviceId: string,
  deviceName: string | undefined,
  force: boolean | undefined,
  fp: string,
  req: Request
) {
  const apiKey = process.env.WHOP_API_KEY;
  if (!apiKey) {
    console.error('WHOP_API_KEY not set');
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }

  // Call Whop's validate_license — first call binds the machine_id, subsequent calls must match
  const whopRes = await fetch(
    `https://api.whop.com/api/v2/memberships/${encodeURIComponent(key)}/validate_license`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ metadata: { machine_id: deviceId } })
    }
  );

  if (whopRes.status === 201) {
    const wasReassigned = !!lic.activeDeviceId && lic.activeDeviceId !== fp;

    await db
      .update(schema.licenses)
      .set({ activeDeviceId: fp, activeDeviceName: deviceName ?? null, activatedAt: new Date() })
      .where(eq(schema.licenses.key, key));

    await db.insert(schema.deviceEvents).values({
      id: randomUUID(),
      licenseKey: key,
      deviceId: fp,
      deviceName: deviceName ?? null,
      kind: wasReassigned ? 'reassign' : 'activate',
      ip: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null,
      userAgent: req.headers.get('user-agent') ?? null
    });

    const token = await signDeviceToken(key, deviceId);
    return NextResponse.json({ ok: true, token, licenseKey: key, email: lic.email, reassigned: wasReassigned });
  }

  if (whopRes.status === 400) {
    // Whop has this key bound to a different machine_id
    return NextResponse.json(
      {
        ok: false,
        error: 'already_active',
        message: 'This license is active on another device. To move it, visit whop.com/@me and reset your license key.',
        boundDeviceName: lic.activeDeviceName ?? 'another device'
      },
      { status: 409 }
    );
  }

  // 404 or unexpected
  const body = await whopRes.text().catch(() => '');
  console.error('Whop validate_license unexpected response', whopRes.status, body);
  return NextResponse.json({ ok: false, error: 'invalid_key' }, { status: 404 });
}
