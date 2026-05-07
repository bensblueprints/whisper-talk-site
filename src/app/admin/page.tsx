import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/admin';
import { db, schema } from '@/lib/db';
import { sql, desc } from 'drizzle-orm';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { LogoutButton } from './logout-button';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Admin — Whisper Talk' };

export default async function AdminPage() {
  const ok = await isAdmin();
  if (!ok) redirect('/admin/login');

  const [totalsRow] = await db
    .select({
      count: sql<number>`count(*)::int`,
      gross: sql<number>`coalesce(sum(${schema.licenses.amountCents}), 0)::int`,
      refunded: sql<number>`coalesce(sum(case when ${schema.licenses.status} = 'refunded' then ${schema.licenses.amountCents} else 0 end), 0)::int`,
      active: sql<number>`coalesce(sum(case when ${schema.licenses.status} = 'active' then 1 else 0 end), 0)::int`,
      bound: sql<number>`coalesce(sum(case when ${schema.licenses.activeDeviceId} is not null then 1 else 0 end), 0)::int`
    })
    .from(schema.licenses);

  const recent = await db
    .select()
    .from(schema.licenses)
    .orderBy(desc(schema.licenses.createdAt))
    .limit(40);

  const dailyRows = await db.execute(sql`
    select
      date_trunc('day', created_at)::date as day,
      count(*)::int as count,
      coalesce(sum(amount_cents), 0)::int as gross
    from licenses
    where status != 'refunded'
      and created_at >= now() - interval '30 days'
    group by 1
    order by 1 desc
    limit 30
  `);

  const daily = dailyRows as unknown as Array<{ day: Date; count: number; gross: number }>;

  const fmt = (cents: number) =>
    (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  return (
    <main className="min-h-screen grain">
      <Nav />
      <section className="px-6 lg:px-10 py-12 lg:py-16">
        <div className="mx-auto max-w-[1280px]">
          <div className="flex items-baseline justify-between mb-12">
            <div className="flex items-baseline gap-4">
              <span className="font-mono text-[11px] uppercase-track text-paper-faint">Admin</span>
              <div className="hairline w-32" />
            </div>
            <LogoutButton />
          </div>

          <h1 className="font-display text-5xl sm:text-6xl mb-12">
            <em className="text-ember">Sales</em> & licenses.
          </h1>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-12">
            <Stat label="Gross revenue" value={fmt(totalsRow?.gross ?? 0)} accent />
            <Stat label="Refunded" value={fmt(totalsRow?.refunded ?? 0)} muted />
            <Stat label="Net" value={fmt((totalsRow?.gross ?? 0) - (totalsRow?.refunded ?? 0))} />
            <Stat label="Licenses (all)" value={String(totalsRow?.count ?? 0)} />
            <Stat label="Active · bound" value={`${totalsRow?.active ?? 0} · ${totalsRow?.bound ?? 0}`} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 rounded-xl border border-paper-trace bg-ink-2/60 p-6">
              <div className="flex items-baseline justify-between mb-5">
                <h2 className="font-display text-2xl">Last 30 days</h2>
                <span className="font-mono text-[10px] uppercase-track text-paper-faint">
                  {daily.length} day{daily.length === 1 ? '' : 's'} with sales
                </span>
              </div>
              {daily.length === 0 ? (
                <p className="text-paper-mute text-[13px]">No sales yet — you're at the very start.</p>
              ) : (
                <div className="space-y-2">
                  {daily.map((d) => {
                    const dayLabel = new Date(d.day).toLocaleDateString('en-US', {
                      month: 'short',
                      day: '2-digit'
                    });
                    return (
                      <div key={d.day.toString()} className="flex items-center gap-3 text-[13px] font-mono">
                        <span className="text-paper-faint w-16">{dayLabel}</span>
                        <span className="text-paper w-8 text-right tabular-nums">{d.count}</span>
                        <div className="flex-1 h-1.5 bg-ink-3 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-ember"
                            style={{ width: `${Math.min(100, (d.count / 10) * 100)}%` }}
                          />
                        </div>
                        <span className="text-paper-mute w-20 text-right tabular-nums">{fmt(d.gross)}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="lg:col-span-7 rounded-xl border border-paper-trace bg-ink-2/60 p-6">
              <div className="flex items-baseline justify-between mb-5">
                <h2 className="font-display text-2xl">Recent licenses</h2>
                <span className="font-mono text-[10px] uppercase-track text-paper-faint">
                  showing last {recent.length}
                </span>
              </div>

              {recent.length === 0 ? (
                <p className="text-paper-mute text-[13px]">No licenses yet.</p>
              ) : (
                <div className="overflow-x-auto -mx-6 px-6">
                  <table className="w-full text-[12.5px] font-mono">
                    <thead>
                      <tr className="text-paper-faint uppercase-track text-[10px] border-b border-paper-trace">
                        <th className="text-left py-2 pr-4">Key</th>
                        <th className="text-left py-2 pr-4">Email</th>
                        <th className="text-left py-2 pr-4">Status</th>
                        <th className="text-left py-2 pr-4">Bound</th>
                        <th className="text-right py-2 pr-4">Amount</th>
                        <th className="text-right py-2">When</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recent.map((l) => (
                        <tr key={l.key} className="border-b border-paper-trace/50">
                          <td className="py-2.5 pr-4 text-ember whitespace-nowrap">{l.key}</td>
                          <td className="py-2.5 pr-4 text-paper-mute truncate max-w-[180px]">{l.email}</td>
                          <td className="py-2.5 pr-4">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] ${
                                l.status === 'active'
                                  ? 'bg-ember/10 text-ember'
                                  : 'bg-paper-trace text-paper-mute'
                              }`}
                            >
                              {l.status}
                            </span>
                          </td>
                          <td className="py-2.5 pr-4 text-paper-mute">
                            {l.activeDeviceName || (l.activeDeviceId ? '· yes ·' : '—')}
                          </td>
                          <td className="py-2.5 pr-4 text-right text-paper">{fmt(l.amountCents)}</td>
                          <td className="py-2.5 text-right text-paper-faint whitespace-nowrap">
                            {new Date(l.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

function Stat({ label, value, accent, muted }: { label: string; value: string; accent?: boolean; muted?: boolean }) {
  return (
    <div className="rounded-lg border border-paper-trace bg-ink-2/60 p-5">
      <div className="font-mono text-[10px] uppercase-track text-paper-faint mb-2">{label}</div>
      <div
        className={`font-display text-3xl tabular-nums ${
          accent ? 'text-ember' : muted ? 'text-paper-mute' : 'text-paper'
        }`}
      >
        {value}
      </div>
    </div>
  );
}
