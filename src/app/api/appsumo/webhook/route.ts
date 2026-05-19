import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';
import { generateLicenseKey } from '@/lib/license';
import { sendLicenseEmail } from '@/lib/email';
import { eq } from 'drizzle-orm';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const APPSUMO_PRICE_CENTS = parseInt(process.env.APPSUMO_PRICE_CENTS || '2900', 10);
const MAX_APPSUMO_LICENSES = 5;

function authorized(req: Request): boolean {
  const secret = process.env.APPSUMO_WEBHOOK_SECRET;
  if (!secret) {
    console.warn('APPSUMO_WEBHOOK_SECRET is not set — rejecting all AppSumo webhooks');
    return false;
  }
  const auth = req.headers.get('authorization');
  return auth === `Bearer ${secret}`;
}

export async function POST(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const action = String(body.action || '');
  const email = String(body.email || '');
  const uuid = String(body.uuid || '');
  const quantity = Math.max(1, Math.min(MAX_APPSUMO_LICENSES, Number(body.quantity) || 1));
  const isTest = Boolean(body.test);

  if (isTest) return NextResponse.json({ ok: true, test: true });
  if (!action || !uuid) return NextResponse.json({ error: 'Missing action or uuid' }, { status: 400 });

  try {
    if (action === 'activate') {
      if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 });
      await handleActivate({ email, uuid, quantity });
    } else if (action === 'deactivate') {
      await handleDeactivate(uuid);
    }
  } catch (err) {
    console.error('AppSumo webhook error:', err);
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

async function handleActivate({ email, uuid, quantity }: { email: string; uuid: string; quantity: number }) {
  const existing = await db
    .select({ key: schema.licenses.key })
    .from(schema.licenses)
    .where(eq(schema.licenses.externalId, uuid))
    .limit(1);
  if (existing.length > 0) return;

  const keys: string[] = [];
  for (let i = 0; i < quantity; i++) {
    let key = generateLicenseKey();
    for (let attempt = 0; attempt < 5; attempt++) {
      const dup = await db
        .select({ key: schema.licenses.key })
        .from(schema.licenses)
        .where(eq(schema.licenses.key, key))
        .limit(1);
      if (dup.length === 0) break;
      key = generateLicenseKey();
    }
    keys.push(key);
  }

  await db.transaction(async (tx) => {
    for (let i = 0; i < keys.length; i++) {
      await tx.insert(schema.licenses).values({
        key: keys[i],
        email,
        stripeSessionId: null,
        amountCents: APPSUMO_PRICE_CENTS,
        currency: 'usd',
        status: 'active',
        source: 'appsumo',
        externalId: i === 0 ? uuid : `${uuid}-${i}`
      });
    }
  });

  const downloadUrl =
    process.env.NEXT_PUBLIC_DOWNLOAD_URL ||
    'https://github.com/bensblueprints/wispertalk-releases/releases/latest';

  try {
    await sendLicenseEmail({
      to: email,
      licenseKeys: keys,
      downloadUrl,
      amountCents: APPSUMO_PRICE_CENTS * quantity,
      currency: 'usd',
      source: 'appsumo'
    });
  } catch (err) {
    console.error('AppSumo email send failed (licenses still recorded):', err);
  }
}

async function handleDeactivate(uuid: string) {
  await db
    .update(schema.licenses)
    .set({
      status: 'refunded',
      refundedAt: new Date(),
      activeDeviceId: null,
      activeDeviceName: null
    })
    .where(eq(schema.licenses.externalId, uuid));
}
