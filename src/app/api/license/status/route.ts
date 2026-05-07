import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { normalizeLicenseKey } from '@/lib/license';

export const runtime = 'nodejs';

const Body = z.object({ email: z.string().email() });

export async function POST(req: Request) {
  let parsed;
  try {
    parsed = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 });
  }

  const rows = await db
    .select()
    .from(schema.licenses)
    .where(eq(schema.licenses.email, parsed.email.toLowerCase()))
    .limit(10);

  return NextResponse.json({
    ok: true,
    licenses: rows.map((r) => ({
      key: r.key,
      status: r.status,
      activeDeviceName: r.activeDeviceName,
      activatedAt: r.activatedAt,
      createdAt: r.createdAt
    }))
  });
}
