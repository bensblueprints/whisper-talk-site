const steps = [
  {
    n: '01',
    title: 'Hold a key',
    body: 'Bind any key — Right Alt, Scroll Lock, F19. Hold to talk; release to send. Or tap a chord to toggle on/off.',
    sub: 'configurable hotkeys'
  },
  {
    n: '02',
    title: 'Speak naturally',
    body: 'Filler words, false starts, unfinished sentences — fine. The cleanup pass turns rough speech into the sentence you meant.',
    sub: 'whisper · llama 3.3'
  },
  {
    n: '03',
    title: 'Text appears',
    body: 'Inserted at your cursor in whatever app has focus — IDE, browser, email, chat. Your clipboard is left untouched.',
    sub: '<300ms end-to-end'
  }
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="px-6 lg:px-10 py-24 lg:py-32 relative">
      <div className="mx-auto max-w-[1280px]">
        <div className="flex items-baseline gap-4 mb-16">
          <span className="font-mono text-[11px] uppercase-track text-paper-faint">02 / How it works</span>
          <div className="hairline flex-1" />
        </div>

        <h2 className="font-display text-5xl sm:text-6xl lg:text-7xl leading-[0.95] tracking-tight text-balance mb-20 max-w-3xl">
          Three actions. <em className="text-violet">No</em> mouse. <em className="text-ember">No</em> menus.
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-paper-trace border-t border-b border-paper-trace">
          {steps.map((s) => (
            <div key={s.n} className="bg-ink p-8 lg:p-10">
              <div className="flex items-baseline justify-between mb-6">
                <span className="font-display italic text-6xl text-paper-faint leading-none">{s.n}</span>
                <span className="font-mono text-[10px] uppercase-track text-paper-faint">{s.sub}</span>
              </div>
              <h3 className="font-display text-3xl mb-3">{s.title}</h3>
              <p className="text-paper-mute text-[14.5px] leading-relaxed text-pretty">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
