import type { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120;

const UPSTREAM = 'https://api.groq.com/openai/v1';

const ALLOWED_PATHS = new Set([
  '/audio/transcriptions',
  '/audio/translations',
  '/chat/completions',
  '/embeddings',
  '/models'
]);

const HOP_BY_HOP = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
  'host',
  'content-encoding'
]);

async function proxy(req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  const { path } = await params;
  const sub = '/' + (path || []).join('/');
  if (!ALLOWED_PATHS.has(sub)) {
    return new Response(
      JSON.stringify({ error: { message: `path not allowed: ${sub}` } }),
      { status: 404, headers: { 'content-type': 'application/json' } }
    );
  }

  const auth = req.headers.get('authorization');
  if (!auth || !auth.toLowerCase().startsWith('bearer ')) {
    return new Response(
      JSON.stringify({ error: { message: 'missing or invalid Authorization header' } }),
      { status: 401, headers: { 'content-type': 'application/json' } }
    );
  }

  const headers = new Headers();
  for (const [k, v] of req.headers.entries()) {
    if (!HOP_BY_HOP.has(k.toLowerCase())) headers.set(k, v);
  }
  headers.set('host', 'api.groq.com');

  const init: RequestInit & { duplex?: 'half' } = {
    method: req.method,
    headers
  };
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    init.body = req.body;
    init.duplex = 'half';
  }

  const upstream = await fetch(UPSTREAM + sub, init);

  const respHeaders = new Headers();
  for (const [k, v] of upstream.headers.entries()) {
    if (!HOP_BY_HOP.has(k.toLowerCase())) respHeaders.set(k, v);
  }

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: respHeaders
  });
}

export {
  proxy as GET,
  proxy as POST,
  proxy as PUT,
  proxy as DELETE,
  proxy as PATCH
};
