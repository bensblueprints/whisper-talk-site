import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db, schema } from '@/lib/db';
import { sql } from 'drizzle-orm';
import { signDeviceToken, fingerprintDevice } from '@/lib/license';
import { randomUUID } from 'node:crypto';

export const runtime = 'nodejs';

// Email-based purchase verification — no license key involved.
// The app sends the email the customer bought with; a row in `licenses`
// (kept in sync with Whop by the webhook + Stripe/AppSumo flows) proves the
// purchase. Whop free-tier memberships (source=whop, amount 0) don't count;
// comp/bulk grants (amount 0 from other sources) do.

const Body = z.object({
  email: z.string().email().max(320),
  deviceId: z.string().min(8).max(128).optional(),
  deviceName: z.string().max(128).optional()
});

export async function POST(req: Request) {
  let parsed;
  try {
    parsed = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 });
  }

  const email = parsed.email.trim().toLowerCase();

  const rows = await db
    .select()
    .from(schema.licenses)
    .where(sql`lower(${schema.licenses.email}) = ${email}`);

  const purchases = rows.filter((r) => !(r.source === 'whop' && r.amountCents === 0));
  const active = purchases.find((r) => r.status === 'active');

  if (!active) {
    if (purchases.length > 0) {
      return NextResponse.json({ ok: false, error: 'license_refunded' }, { status: 403 });
    }
    return NextResponse.json(
      { ok: false, error: 'not_found', message: 'No WisperTalk purchase found for that email.' },
      { status: 404 }
    );
  }

  if (parsed.deviceId) {
    await db.insert(schema.deviceEvents).values({
      id: randomUUID(),
      licenseKey: active.key,
      deviceId: fingerprintDevice(parsed.deviceId),
      deviceName: parsed.deviceName ?? null,
      kind: 'email_verify',
      ip: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null,
      userAgent: req.headers.get('user-agent') ?? null,
      meta: null
    });
  }

  const token = await signDeviceToken(active.key, parsed.deviceId ?? email);
  return NextResponse.json({ ok: true, email: active.email, tier: 'paid', token });
}
