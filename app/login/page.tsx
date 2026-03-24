'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('http://localhost:3001/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message || `Erro ${res.status}`);
      }

      const { data } = await res.json();
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      router.push('/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0E0E0E] p-4">
      <main className="w-full max-w-md bg-[#1A1A1A] border border-[#353534] rounded-lg p-8 flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-[#EF1A2D] flex items-center justify-center mb-1">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Entrar</h1>
          <p className="text-sm text-[#9B9B9B]">Acesse sua conta de streamer</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold uppercase tracking-widest text-[#9B9B9B]">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="seu@email.com"
              className="px-4 py-3 rounded border border-[#353534] bg-[#0E0E0E] text-white placeholder:text-[#555] focus:outline-none focus:border-[#EF1A2D] focus:ring-1 focus:ring-[#EF1A2D] transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold uppercase tracking-widest text-[#9B9B9B]">Senha</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="px-4 py-3 rounded border border-[#353534] bg-[#0E0E0E] text-white placeholder:text-[#555] focus:outline-none focus:border-[#EF1A2D] focus:ring-1 focus:ring-[#EF1A2D] transition-colors"
            />
          </div>

          {error && (
            <div className="rounded bg-[#EF1A2D]/10 border border-[#EF1A2D]/30 px-4 py-3">
              <p className="text-sm text-[#EF1A2D]">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded bg-[#EF1A2D] hover:bg-[#C8151F] active:bg-[#A01018] text-white font-bold text-[13px] uppercase tracking-wide transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed mt-2"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="text-sm text-center text-[#9B9B9B]">
          Não tem conta?{' '}
          <Link href="/register" className="font-medium text-[#EF1A2D] hover:underline">
            Cadastrar
          </Link>
        </p>
      </main>
    </div>
  );
}
