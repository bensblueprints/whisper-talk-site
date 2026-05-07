import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { fingerprintDevice, normalizeLicenseKey } from '@/lib/license';
import { randomUUID } from 'node:crypto';

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

  if (lic.activeDeviceId !== fp) {
    return NextResponse.json({ ok: false, error: 'not_bound_to_this_device' }, { status: 403 });
  }

  await db
    .update(schema.licenses)
    .set({ activeDeviceId: null, activeDeviceName: null, activatedAt: null })
    .where(eq(schema.licenses.key, key));

  await db.insert(schema.deviceEvents).values({
    id: randomUUID(),
    licenseKey: key,
    deviceId: fp,
    kind: 'deactivate',
    ip: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null,
    userAgent: req.headers.get('user-agent') ?? null
  });

  return NextResponse.json({ ok: true });
}
