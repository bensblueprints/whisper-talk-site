import { NextResponse } from 'next/server';
import { z } from 'zod';
import { checkAdminPassword, issueAdminCookie } from '@/lib/admin';

export const runtime = 'nodejs';

const Body = z.object({ password: z.string().min(1) });

export async function POST(req: Request) {
  let parsed;
  try {
    parsed = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }

  if (!checkAdminPassword(parsed.password)) {
    await new Promise((r) => setTimeout(r, 500));
    return NextResponse.json({ error: 'invalid' }, { status: 401 });
  }

  await issueAdminCookie();
  return NextResponse.json({ ok: true });
}
