'use client';

export function LogoutButton() {
  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    window.location.href = '/admin/login';
  }
  return (
    <button onClick={logout} className="font-mono text-[10px] uppercase-track text-paper-mute hover:text-ember">
      Sign out
    </button>
  );
}
