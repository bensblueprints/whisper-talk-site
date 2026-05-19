import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin';
import { sql } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await sql`ALTER TABLE "licenses" ALTER COLUMN "stripe_session_id" DROP NOT NULL`;
    await sql`ALTER TABLE "licenses" ADD COLUMN IF NOT EXISTS "source" text NOT NULL DEFAULT 'stripe'`;
    await sql`ALTER TABLE "licenses" ADD COLUMN IF NOT EXISTS "external_id" text`;
    await sql`CREATE INDEX IF NOT EXISTS "licenses_source_idx" ON "licenses" USING btree ("source")`;
    await sql`CREATE INDEX IF NOT EXISTS "licenses_external_id_idx" ON "licenses" USING btree ("external_id")`;
    return NextResponse.json({ ok: true, message: 'Migration 0001 applied successfully.' });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
