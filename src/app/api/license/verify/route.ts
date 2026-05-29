import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { fingerprintDevice, normalizeLicenseKey, signDeviceToken } from '@/lib/license';
import { randomUUID } from 'node:crypto';
import type { License } from '@/db/schema';

export const runtime = 'nodejs';

const Body = z.object({
  key: z.string().min(8),
  deviceId: z.string().min(8).max(128)
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
    return verifyWhop(lic, key, parsed.deviceId, fp, req);
  }

  // — Local key verification (stripe / appsumo) —
  if (!lic.activeDeviceId || lic.activeDeviceId !== fp) {
    return NextResponse.json({ ok: false, error: 'device_mismatch' }, { status: 403 });
  }

  await db.insert(schema.deviceEvents).values({
    id: randomUUID(),
    licenseKey: key,
    deviceId: fp,
    kind: 'verify',
    ip: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null,
    userAgent: req.headers.get('user-agent') ?? null
  });

  const token = await signDeviceToken(key, parsed.deviceId);
  return NextResponse.json({ ok: true, token, licenseKey: key, email: lic.email });
}

async function verifyWhop(
  lic: License,
  key: string,
  deviceId: string,
  fp: string,
  req: Request
) {
  const apiKey = process.env.WHOP_API_KEY;
  if (!apiKey) {
    console.error('WHOP_API_KEY not set');
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }

  // Re-validate against Whop — confirms the membership is still active and device matches
  const whopRes = await fetch(
    `https://api.whop.com/api/v2/memberships/${encodeURIComponent(key)}/validate_license`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ metadata: { machine_id: deviceId } })
    }
  );

  if (whopRes.status === 201) {
    await db.insert(schema.deviceEvents).values({
      id: randomUUID(),
      licenseKey: key,
      deviceId: fp,
      kind: 'verify',
      ip: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null,
      userAgent: req.headers.get('user-agent') ?? null
    });

    const token = await signDeviceToken(key, deviceId);
    return NextResponse.json({ ok: true, token, licenseKey: key, email: lic.email });
  }

  if (whopRes.status === 400) {
    // Device mismatch — user may have reset their key in Whop's hub and activated elsewhere
    return NextResponse.json({ ok: false, error: 'device_mismatch' }, { status: 403 });
  }

  // Membership went invalid since we last recorded it — sync our DB
  if (whopRes.status === 404 || whopRes.status === 403) {
    await db
      .update(schema.licenses)
      .set({ status: 'refunded', refundedAt: new Date(), activeDeviceId: null, activeDeviceName: null })
      .where(eq(schema.licenses.key, key));
    return NextResponse.json({ ok: false, error: 'license_refunded' }, { status: 403 });
  }

  const body = await whopRes.text().catch(() => '');
  console.error('Whop validate_license unexpected response', whopRes.status, body);
  return NextResponse.json({ ok: false, error: 'invalid_key' }, { status: 404 });
}
