const pubs = [
  {
    name: 'Forbes',
    render: () => (
      <span
        style={{
          fontFamily: 'Georgia, "Times New Roman", serif',
          fontStyle: 'italic',
          fontWeight: 700,
          fontSize: '1.5rem',
          letterSpacing: '-0.01em',
          lineHeight: 1
        }}
      >
        Forbes
      </span>
    )
  },
  {
    name: 'USA Today',
    render: () => (
      <span className="flex items-center gap-2">
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '1.5rem',
            height: '1.5rem',
            borderRadius: '50%',
            border: '2px solid currentColor',
            fontFamily: 'Arial, sans-serif',
            fontWeight: 900,
            fontSize: '0.38rem',
            letterSpacing: '0.02em',
            lineHeight: 1
          }}
        >
          USA
        </span>
        <span
          style={{
            fontFamily: 'Arial, sans-serif',
            fontWeight: 900,
            fontSize: '0.85rem',
            letterSpacing: '0.08em',
            lineHeight: 1
          }}
        >
          TODAY
        </span>
      </span>
    )
  },
  {
    name: 'TechCrunch',
    render: () => (
      <span
        style={{
          fontFamily: '"Arial Black", Arial, sans-serif',
          fontWeight: 900,
          fontSize: '1.1rem',
          letterSpacing: '-0.03em',
          lineHeight: 1
        }}
      >
        TechCrunch
      </span>
    )
  },
  {
    name: 'Yahoo Finance',
    render: () => (
      <span
        style={{
          fontFamily: 'Arial, sans-serif',
          fontWeight: 700,
          fontSize: '1rem',
          letterSpacing: '-0.01em',
          lineHeight: 1
        }}
      >
        Yahoo<span style={{ fontWeight: 400 }}> Finance</span>
      </span>
    )
  },
  {
    name: 'LA Weekly',
    render: () => (
      <span
        style={{
          fontFamily: 'Georgia, serif',
          fontWeight: 700,
          fontSize: '1.15rem',
          letterSpacing: '0.04em',
          lineHeight: 1
        }}
      >
        LA<span style={{ fontWeight: 400, marginLeft: '0.3em' }}>Weekly</span>
      </span>
    )
  }
];

export function PressLogos() {
  return (
    <section className="px-6 lg:px-10 py-10 border-b border-paper-trace">
      <div className="mx-auto max-w-[1280px]">
        <p className="font-mono text-[10px] uppercase-track text-paper-faint text-center mb-8">
          As seen on
        </p>
        <div className="flex flex-wrap items-center justify-center gap-10 lg:gap-16">
          {pubs.map((pub) => (
            <div
              key={pub.name}
              className="text-paper-faint opacity-45 hover:opacity-75 transition-opacity duration-200"
              aria-label={pub.name}
            >
              {pub.render()}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
