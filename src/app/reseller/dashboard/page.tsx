import Link from 'next/link';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { db, schema } from '@/lib/db';
import { eq, desc } from 'drizzle-orm';
import { resellerByToken } from '@/lib/reseller';
import { GenerateForm } from './generate-form';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Reseller dashboard — WisperTalk' };

function cents(c: number) {
  return (c / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

export default async function ResellerDashboardPage({
  searchParams
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const reseller = token ? await resellerByToken(token) : null;

  if (!reseller) {
    return (
      <main className="min-h-screen grain">
        <Nav />
        <section className="px-6 lg:px-10 py-32">
          <div className="mx-auto max-w-[640px] text-center">
            <h1 className="font-display text-5xl mb-4">Invalid dashboard link.</h1>
            <p className="text-paper-mute mb-8">
              This reseller dashboard link doesn't match any account. Use the exact link from
              your reseller welcome email.
            </p>
            <Link href="/reseller" className="font-mono text-[11px] uppercase-track text-ember hover:text-ember-soft">
              ← Reseller program
            </Link>
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  const keys = await db
    .select()
    .from(schema.licenses)
    .where(eq(schema.licenses.resellerId, reseller.id))
    .orderBy(desc(schema.licenses.createdAt))
    .limit(500);

  const active = keys.filter((k) => k.status === 'active');
  const revenue = active.reduce((a, k) => a + k.amountCents, 0);
  const suspended = reseller.status !== 'active';

  return (
    <main className="min-h-screen grain">
      <Nav />
      <section className="px-6 lg:px-10 py-16 lg:py-20">
        <div className="mx-auto max-w-[1100px]">
          <div className="flex items-baseline gap-4 mb-8">
            <span className="font-mono text-[11px] uppercase-track text-paper-faint">Reseller dashboard</span>
            <div className="hairline flex-1" />
            <span className={`font-mono text-[11px] uppercase-track ${suspended ? 'text-red-400' : 'text-ember'}`}>
              {reseller.status}
            </span>
          </div>

          <h1 className="font-display text-5xl sm:text-6xl leading-[0.95] tracking-tight mb-3">
            <em className="text-ember">Sell</em> WisperTalk.
          </h1>
          <p className="text-paper-mute text-[14px] mb-12 font-mono">{reseller.email}</p>

          {suspended && (
            <div className="rounded-lg border border-red-400/40 bg-red-400/5 p-6 mb-10">
              <p className="text-paper-mute text-[14px] leading-relaxed">
                This reseller account is <span className="text-red-400">{reseller.status}</span> — key
                generation is disabled. Keys you already sold are unaffected. Reply to your
                welcome email if you think this is wrong.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
            <div className="rounded-xl border border-paper-trace bg-ink-2/40 p-6">
              <div className="font-display text-5xl text-ember leading-none mb-2">{keys.length}</div>
              <div className="font-mono text-[10px] uppercase-track text-paper-faint">keys generated</div>
            </div>
            <div className="rounded-xl border border-paper-trace bg-ink-2/40 p-6">
              <div className="font-display text-5xl text-ember leading-none mb-2">{active.length}</div>
              <div className="font-mono text-[10px] uppercase-track text-paper-faint">active licenses</div>
            </div>
            <div className="rounded-xl border border-paper-trace bg-ink-2/40 p-6">
              <div className="font-display text-5xl text-ember leading-none mb-2">{cents(revenue)}</div>
              <div className="font-mono text-[10px] uppercase-track text-paper-faint">your recorded sales</div>
            </div>
          </div>

          {!suspended && (
            <div className="rounded-xl border border-ember/40 bg-ember/5 p-7 sm:p-9 mb-12">
              <div className="font-mono text-[11px] uppercase-track text-ember mb-3">New customer</div>
              <h2 className="font-display text-3xl mb-3 leading-tight">Generate a license key.</h2>
              <p className="text-paper-mute text-[13.5px] leading-relaxed mb-6 max-w-lg">
                One key per customer. Enter what they paid you (for your own records — it's
                never shown to them) and optionally email the key straight to their inbox.
              </p>
              <GenerateForm token={token!} />
            </div>
          )}

          <div className="flex items-baseline gap-4 mb-6">
            <span className="font-mono text-[11px] uppercase-track text-paper-faint">
              Your keys {keys.length > 0 && `(${keys.length}${keys.length === 500 ? '+' : ''})`}
            </span>
            <div className="hairline flex-1" />
          </div>

          {keys.length === 0 ? (
            <p className="text-paper-mute text-[14px]">No keys yet — generate your first one above.</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-paper-trace">
              <table className="w-full text-left text-[13px]">
                <thead>
                  <tr className="border-b border-paper-trace font-mono text-[10px] uppercase-track text-paper-faint">
                    <th className="px-4 py-3">Key</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Sold for</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Device</th>
                    <th className="px-4 py-3">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {keys.map((k) => (
                    <tr key={k.key} className="border-b border-paper-trace/50 last:border-0">
                      <td className="px-4 py-3 font-mono text-ember whitespace-nowrap">{k.key}</td>
                      <td className="px-4 py-3 text-paper-mute">{k.email}</td>
                      <td className="px-4 py-3 text-paper-mute whitespace-nowrap">{cents(k.amountCents)}</td>
                      <td className="px-4 py-3">
                        <span className={k.status === 'active' ? 'text-ember' : 'text-red-400'}>{k.status}</span>
                      </td>
                      <td className="px-4 py-3 text-paper-mute">{k.activeDeviceName ?? '—'}</td>
                      <td className="px-4 py-3 text-paper-faint whitespace-nowrap">
                        {new Date(k.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}
