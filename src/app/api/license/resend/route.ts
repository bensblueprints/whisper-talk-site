import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';
import { sendLicenseEmail } from '@/lib/email';
import { eq, and } from 'drizzle-orm';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const RESEND_COOLDOWN_MS = 10 * 60 * 1000;
const lastResend = new Map<string, number>();

export async function POST(req: Request) {
  let email: string;
  try {
    const body = await req.json();
    email = String(body?.email || '').toLowerCase().trim();
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
  }

  const last = lastResend.get(email);
  if (last && Date.now() - last < RESEND_COOLDOWN_MS) {
    return NextResponse.json({ error: 'Please wait before requesting another resend.' }, { status: 429 });
  }

  const rows = await db
    .select()
    .from(schema.licenses)
    .where(and(eq(schema.licenses.email, email), eq(schema.licenses.status, 'active')));

  if (rows.length === 0) {
    return NextResponse.json({ error: 'No active license found for that email.' }, { status: 404 });
  }

  lastResend.set(email, Date.now());

  const downloadUrl =
    process.env.NEXT_PUBLIC_DOWNLOAD_URL ||
    'https://github.com/bensblueprints/wispertalk-releases/releases/latest';

  const appsumoRows = rows.filter((r) => r.source === 'appsumo');
  const stripeRows = rows.filter((r) => r.source !== 'appsumo');

  if (appsumoRows.length > 0) {
    await sendLicenseEmail({
      to: email,
      licenseKeys: appsumoRows.map((r) => r.key),
      downloadUrl,
      amountCents: appsumoRows[0].amountCents,
      currency: appsumoRows[0].currency,
      source: 'appsumo'
    });
  }
  if (stripeRows.length > 0) {
    await sendLicenseEmail({
      to: email,
      licenseKeys: stripeRows.map((r) => r.key),
      downloadUrl,
      amountCents: stripeRows[0].amountCents,
      currency: stripeRows[0].currency,
      source: 'stripe'
    });
  }

  return NextResponse.json({ ok: true });
}
