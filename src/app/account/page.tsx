import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { AccountForm } from './account-form';

export const metadata = { title: 'Manage your license — WisperTalk' };

export default function AccountPage() {
  return (
    <main className="min-h-screen grain">
      <Nav />
      <section className="px-6 lg:px-10 py-20 lg:py-28">
        <div className="mx-auto max-w-[820px]">
          <div className="flex items-baseline gap-4 mb-8">
            <span className="font-mono text-[11px] uppercase-track text-paper-faint">License lookup</span>
            <div className="hairline flex-1" />
          </div>

          <h1 className="font-display text-5xl sm:text-7xl leading-[0.95] tracking-tight text-balance mb-6">
            <em className="text-ember">Find</em> your license.
          </h1>

          <p className="text-paper-mute text-[15.5px] leading-relaxed max-w-xl mb-12">
            Enter the email you bought with — we'll list every license on that email and the device each one is bound to.
          </p>

          <AccountForm />
        </div>
      </section>
      <Footer />
    </main>
  );
}
