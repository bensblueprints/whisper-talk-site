import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { stripe } from '@/lib/stripe';
import { CopyKey } from './copy-key';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

async function fetchLicense(sessionId: string, attempts = 8): Promise<{ key: string; email: string } | null> {
  for (let i = 0; i < attempts; i++) {
    const rows = await db
      .select()
      .from(schema.licenses)
      .where(eq(schema.licenses.stripeSessionId, sessionId))
      .limit(1);
    if (rows.length > 0) return { key: rows[0].key, email: rows[0].email };
    await new Promise((r) => setTimeout(r, 750));
  }
  return null;
}

export default async function SuccessPage({
  searchParams
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const params = await searchParams;
  const sessionId = params.session_id;
  if (!sessionId) {
    return (
      <main className="min-h-screen grain">
        <Nav />
        <Empty />
        <Footer />
      </main>
    );
  }

  let lic = await fetchLicense(sessionId);

  if (!lic && stripe) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.payment_status === 'paid') {
        lic = await fetchLicense(sessionId, 4);
      }
    } catch {}
  }

  const downloadUrl = process.env.NEXT_PUBLIC_DOWNLOAD_URL || '#';

  return (
    <main className="min-h-screen grain">
      <Nav />
      <section className="px-6 lg:px-10 py-20 lg:py-28">
        <div className="mx-auto max-w-[820px]">
          <div className="flex items-center gap-3 mb-8">
            <span className="block w-2 h-2 rounded-full bg-ember pulse-ember" />
            <span className="font-mono text-[11px] uppercase-track text-paper-mute">
              Payment received · License generated
            </span>
          </div>

          <h1 className="font-display text-5xl sm:text-7xl leading-[0.95] tracking-tight text-balance mb-6">
            <em className="text-ember">Welcome.</em><br /> Here is your license.
          </h1>

          <p className="text-paper-mute text-[15.5px] leading-relaxed max-w-xl mb-12">
            We've also emailed it to <span className="font-mono text-paper">{lic?.email ?? 'your inbox'}</span>.
            Save the key somewhere safe — it's the only thing that proves the license is yours.
          </p>

          {lic ? (
            <CopyKey licenseKey={lic.key} email={lic.email} />
          ) : (
            <div className="rounded-lg border border-paper-trace bg-ink-2 p-8">
              <div className="font-mono text-[11px] uppercase-track text-paper-faint mb-3">
                Generating key…
              </div>
              <p className="text-paper-mute text-[14px] leading-relaxed">
                Your payment is confirmed but the license is still being issued (this usually takes a few seconds).
                Refresh this page in a moment, or check the email we sent to your inbox.
              </p>
            </div>
          )}

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a
              href={downloadUrl}
              target="_blank"
              rel="noopener"
              className="rounded-lg border border-ember/40 bg-ember/5 hover:bg-ember/10 p-6 transition-colors group"
            >
              <div className="font-mono text-[11px] uppercase-track text-ember mb-2">Step 1</div>
              <div className="font-display text-2xl mb-1">Download Whisper Talk →</div>
              <div className="text-paper-mute text-[13px]">Latest .exe for Windows 10/11</div>
            </a>
            <Link
              href="/account"
              className="rounded-lg border border-paper-trace hover:border-paper-faint p-6 transition-colors"
            >
              <div className="font-mono text-[11px] uppercase-track text-paper-faint mb-2">Step 2</div>
              <div className="font-display text-2xl mb-1">Manage license</div>
              <div className="text-paper-mute text-[13px]">View bound device, deactivate, move</div>
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

function Empty() {
  return (
    <section className="px-6 lg:px-10 py-32">
      <div className="mx-auto max-w-[640px] text-center">
        <h1 className="font-display text-5xl mb-4">No session found.</h1>
        <p className="text-paper-mute mb-8">It looks like you reached this page without a checkout session.</p>
        <Link href="/" className="font-mono text-[11px] uppercase-track text-ember hover:text-ember-soft">
          ← Back home
        </Link>
      </div>
    </section>
  );
}
