import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { normalizeLicenseKey, signDeviceToken, fingerprintDevice } from '@/lib/license';
import { randomUUID } from 'node:crypto';

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
  } catch (err) {
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
    .set({
      activeDeviceId: fp,
      activeDeviceName: parsed.deviceName ?? null,
      activatedAt: new Date()
    })
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

  return NextResponse.json({
    ok: true,
    token,
    licenseKey: key,
    email: lic.email,
    reassigned: wasReassigned
  });
}
