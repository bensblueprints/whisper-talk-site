import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { LoginForm } from './login-form';

export const metadata = { title: 'Admin sign in — WisperTalk' };

export default function AdminLoginPage() {
  return (
    <main className="min-h-screen grain">
      <Nav />
      <section className="px-6 lg:px-10 py-24">
        <div className="mx-auto max-w-[460px]">
          <h1 className="font-display text-4xl mb-3">Admin sign in</h1>
          <p className="text-paper-mute text-[14px] mb-8">Restricted to the operator of this storefront.</p>
          <LoginForm />
        </div>
      </section>
      <Footer />
    </main>
  );
}
