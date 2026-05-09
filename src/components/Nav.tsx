import Link from 'next/link';

export function Nav() {
  return (
    <header className="relative z-30 px-6 lg:px-10 pt-6 pb-3">
      <div className="mx-auto max-w-[1280px] flex items-center justify-between">
        <Link href="/" className="flex items-baseline gap-2 group">
          <span className="font-display text-[28px] leading-none tracking-tight">
            <em className="text-ember">Wisper</em>Talk
          </span>
          <span className="hidden sm:inline-block font-mono text-[10px] uppercase-track text-paper-faint">
            v0.1
          </span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-3">
          <Link
            href="/account"
            className="hidden sm:inline-block font-mono text-[11px] uppercase-track text-paper-mute hover:text-paper px-3 py-2 transition-colors"
          >
            Account
          </Link>
          <Link
            href="#how-it-works"
            className="hidden md:inline-block font-mono text-[11px] uppercase-track text-paper-mute hover:text-paper px-3 py-2 transition-colors"
          >
            How it works
          </Link>
          <Link
            href="#pricing"
            className="font-mono text-[11px] uppercase-track text-ink bg-ember hover:bg-ember-soft px-4 py-2.5 rounded-md transition-colors"
          >
            Buy — $49
          </Link>
        </nav>
      </div>
    </header>
  );
}
