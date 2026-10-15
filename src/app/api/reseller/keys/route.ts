import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db, schema } from '@/lib/db';
import { eq, desc } from 'drizzle-orm';
import { generateLicenseKey } from '@/lib/license';
import { resellerByToken } from '@/lib/reseller';
import { sendResellerKeyEmail } from '@/lib/email';

export const runtime = 'nodejs';

const Body = z.object({
  token: z.string().min(16).max(128),
  customerEmail: z.string().email().max(320),
  priceCents: z.number().int().min(0).max(1_000_000).optional(),
  emailCustomer: z.boolean().optional()
});

export async function POST(req: Request) {
  let parsed;
  try {
    parsed = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 });
  }

  const reseller = await resellerByToken(parsed.token);
  if (!reseller) {
    return NextResponse.json({ ok: false, error: 'invalid_token' }, { status: 401 });
  }
  if (reseller.status !== 'active') {
    return NextResponse.json({ ok: false, error: `reseller_${reseller.status}` }, { status: 403 });
  }

  // Guard against double-submits: same reseller + customer email within the last minute
  const recent = await db
    .select()
    .from(schema.licenses)
    .where(eq(schema.licenses.resellerId, reseller.id))
    .orderBy(desc(schema.licenses.createdAt))
    .limit(200);
  const dup = recent.find(
    (r) =>
      r.email.toLowerCase() === parsed.customerEmail.toLowerCase() &&
      Date.now() - new Date(r.createdAt).getTime() < 60_000
  );
  if (dup) {
    return NextResponse.json({ ok: true, key: dup.key, duplicate: true });
  }

  let key = generateLicenseKey();
  for (let i = 0; i < 5; i++) {
    const existing = await db
      .select()
      .from(schema.licenses)
      .where(eq(schema.licenses.key, key))
      .limit(1);
    if (existing.length === 0) break;
    key = generateLicenseKey();
  }

  await db.insert(schema.licenses).values({
    key,
    email: parsed.customerEmail.toLowerCase(),
    amountCents: parsed.priceCents ?? 0,
    currency: 'usd',
    status: 'active',
    source: 'reseller',
    resellerId: reseller.id
  });

  let emailed = false;
  if (parsed.emailCustomer) {
    const downloadUrl =
      process.env.NEXT_PUBLIC_DOWNLOAD_URL ||
      'https://github.com/bensblueprints/wispertalk-releases/releases/latest';
    try {
      await sendResellerKeyEmail({
        to: parsed.customerEmail.toLowerCase(),
        resellerName: reseller.name || reseller.email,
        licenseKey: key,
        downloadUrl
      });
      emailed = true;
    } catch (err) {
      console.error('Reseller key email failed (key still recorded):', err);
    }
  }

  return NextResponse.json({ ok: true, key, emailed });
}
