const competitors = [
  {
    name: 'Wispr Flow',
    price: '$15',
    period: '/mo',
    note: 'macOS · Windows beta · subscription',
    locked: ['account login required', 'recurring charge', 'cloud-stored history'],
    highlight: false
  },
  {
    name: 'Superwhisper',
    price: '$8.49',
    period: '/mo',
    note: 'macOS only · subscription tier',
    locked: ['mac-only', 'recurring charge', 'limited model choice on free tier'],
    highlight: false
  },
  {
    name: 'Monologue',
    price: '$10',
    period: '/mo',
    note: 'macOS only · subscription',
    locked: ['mac-only', 'recurring charge', 'requires account'],
    highlight: false
  },
  {
    name: 'WisperTalk',
    price: '$49',
    period: 'once',
    note: 'Windows native · pay once · own it',
    locked: [],
    perks: ['no subscription', 'one device at a time', 'open source core'],
    highlight: true
  }
];

export function Comparison() {
  return (
    <section className="px-6 lg:px-10 py-24 lg:py-32 relative">
      <div className="mx-auto max-w-[1280px]">
        <div className="flex items-baseline gap-4 mb-16">
          <span className="font-mono text-[11px] uppercase-track text-paper-faint">03 / Compared</span>
          <div className="hairline flex-1" />
        </div>

        <h2 className="font-display text-5xl sm:text-6xl lg:text-7xl leading-[0.95] tracking-tight text-balance mb-4 max-w-3xl">
          The math is <em className="text-ember">not</em> subtle.
        </h2>
        <p className="text-paper-mute max-w-xl text-[15px] leading-relaxed mb-16">
          Five months on any of those subscriptions costs more than a <em className="not-italic text-paper">lifetime</em> of WisperTalk. Here's what the rest of the market looks like:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
          {competitors.map((c) => (
            <div
              key={c.name}
              className={`relative rounded-xl border p-6 transition-all ${
                c.highlight
                  ? 'border-ember bg-ember/[0.07] ring-2 ring-ember/50 shadow-ember scale-[1.015]'
                  : 'border-paper-trace bg-ink-2/50'
              }`}
            >
              {c.highlight && (
                <>
                  <span className="absolute -top-3 left-6 px-3 py-1 bg-ember text-ink font-mono text-[10px] uppercase-track rounded shadow-lg">
                    ★ Our price
                  </span>
                  <span aria-hidden className="absolute -inset-px rounded-xl bg-gradient-to-b from-ember/[0.08] to-transparent pointer-events-none" />
                </>
              )}

              <div className="flex items-baseline justify-between mb-4 pb-4 border-b border-paper-trace">
                <span className="font-display text-2xl leading-none">{c.name}</span>
              </div>

              <div className="flex items-baseline gap-1 mb-2">
                <span className={`font-display text-5xl leading-none ${c.highlight ? 'text-ember' : 'text-paper'}`}>
                  {c.price}
                </span>
                <span className="font-mono text-[11px] uppercase-track text-paper-faint">{c.period}</span>
              </div>

              <p className="font-mono text-[11px] uppercase-track text-paper-faint mb-5">{c.note}</p>

              <ul className="space-y-2 text-[13px] leading-relaxed">
                {c.highlight
                  ? c.perks?.map((p) => (
                      <li key={p} className="flex items-start gap-2 text-paper">
                        <span className="text-ember mt-0.5">+</span>
                        <span>{p}</span>
                      </li>
                    ))
                  : c.locked.map((p) => (
                      <li key={p} className="flex items-start gap-2 text-paper-mute">
                        <span className="text-paper-faint mt-0.5">−</span>
                        <span>{p}</span>
                      </li>
                    ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="text-paper-faint text-[12px] mt-8 max-w-xl leading-relaxed">
          Pricing as of May 2026, public marketing pages of each competitor. WisperTalk is independent and not affiliated with any of them.
        </p>
      </div>
    </section>
  );
}
