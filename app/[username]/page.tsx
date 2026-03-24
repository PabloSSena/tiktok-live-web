'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

type PixCharge = {
  chargeId: string;
  referenceId: string;
  copiaCola: string;
  expiresAt: string;
  status: string;
};

type Streamer = {
  id: string;
  username: string;
};

type View = 'form' | 'payment';

function formatCurrency(cents: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100);
}

function formatExpiry(isoDate: string) {
  const date = new Date(isoDate);
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function parseToCents(value: string): number {
  const clean = value.replace(/[^\d,]/g, '').replace(',', '.');
  return Math.round(parseFloat(clean || '0') * 100);
}

function PixIcon() {
  return (
    <svg viewBox="0 0 512 512" className="w-5 h-5" fill="currentColor">
      <path d="M242.4 292.5C247.8 287.1 257.1 287.1 262.5 292.5L339.5 369.5C353.7 383.7 371.6 391.8 391.1 391.8H407.3L310.9 488.2C280.3 518.8 230.7 518.8 200.1 488.2L103.4 391.5H118.9C138.4 391.5 156.3 383.4 170.5 369.2L242.4 292.5zM242.4 219.5L170.5 142.8C156.3 128.6 138.4 120.5 118.9 120.5H103.4L200.1 23.75C230.7-6.85 280.3-6.85 310.9 23.75L407.3 120.2H391.1C371.6 120.2 353.7 128.3 339.5 142.5L262.5 219.5C257.1 224.9 247.8 224.9 242.4 219.5zM51.4 142.9L95.71 98.58C96.55 98.67 97.4 98.74 98.26 98.74H118.9C131.3 98.74 143.1 104.1 151.6 112.5L218.3 179.2L227.4 170.1C241.6 155.9 260.3 148.1 279.1 148.1C298.7 148.1 317.4 155.9 331.6 170.1L398.4 112.5C406.9 104.1 418.7 98.74 431.1 98.74H451.7C452.6 98.74 453.4 98.67 454.3 98.58L498.6 142.9C529.2 173.5 529.2 223.1 498.6 253.7L454.3 297.1C453.4 297.2 452.6 297.3 451.7 297.3H431.1C418.7 297.3 406.9 291.9 398.4 283.5L331.6 226C317.4 240.1 298.7 247.9 279.1 247.9C260.3 247.9 241.6 240.1 227.4 226L151.6 283.5C143.1 291.9 131.3 297.3 118.9 297.3H98.26C97.4 297.3 96.55 297.2 95.71 297.1L51.4 253.7C20.85 223.1 20.85 173.5 51.4 142.9z" />
    </svg>
  );
}

export default function StreamerPage() {
  const params = useParams();
  const username = params.username as string;

  const [streamer, setStreamer] = useState<Streamer | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loadingStreamer, setLoadingStreamer] = useState(true);

  const [view, setView] = useState<View>('form');
  const [formData, setFormData] = useState({
    username: '',
    message: '',
    amount: '0,00',
  });
  const [charge, setCharge] = useState<PixCharge | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [paidConfirmed, setPaidConfirmed] = useState(false);

  const messageMaxLength = 70;

  useEffect(() => {
    fetch(`http://localhost:3001/users/${username}`)
      .then(async (res) => {
        if (res.status === 404) {
          setNotFound(true);
          return;
        }
        const { data } = await res.json();
        setStreamer(data);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoadingStreamer(false));
  }, [username]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const cents = parseToCents(formData.amount);

    try {
      const streamerId = streamer!.id;
      const referenceId = `order-${Date.now()}`;

      const res = await fetch('http://localhost:3001/pix/charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          streamerId,
          viewerUsername: formData.username,
          message: formData.message,
          amount: cents,
          referenceId,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message || `Erro ${res.status}`);
      }

      const { data } = await res.json();
      setCharge(data);
      setView('payment');

      fetch('http://localhost:3001/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          streamerId,
          username: formData.username,
          message: formData.message,
          amount: cents,
        }),
      }).catch(() => {});
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao gerar cobrança Pix.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!charge) return;
    await navigator.clipboard.writeText(charge.copiaCola);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePaid = () => {
    setPaidConfirmed(true);
  };

  if (loadingStreamer) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0E0E0E] p-4">
        <div className="w-full max-w-md bg-[#1A1A1A] border border-[#353534] rounded-lg p-8 flex flex-col items-center gap-4">
          <div className="w-24 h-24 bg-[#353534] rounded-full animate-pulse" />
          <div className="h-5 w-32 bg-[#353534] rounded animate-pulse" />
          <div className="h-4 w-48 bg-[#353534] rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0E0E0E] p-4">
        <main className="w-full max-w-md bg-[#1A1A1A] border border-[#353534] rounded-lg p-8 flex flex-col items-center gap-4 text-center">
          <p className="text-5xl">😕</p>
          <h1 className="text-xl font-bold text-white">Streamer não encontrado</h1>
          <p className="text-sm text-[#9B9B9B]">
            O usuário <span className="font-mono font-semibold text-white">{username}</span> não existe.
          </p>
        </main>
      </div>
    );
  }

  if (view === 'payment' && charge) {
    const cents = parseToCents(formData.amount);

    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0E0E0E] p-4">
        <main className="w-full max-w-md bg-[#1A1A1A] border border-[#353534] rounded-lg p-8 flex flex-col gap-6">
          <div className="flex flex-col items-center gap-1">
            <div className="w-12 h-12 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-500 mb-1">
              <PixIcon />
            </div>
            <h1 className="text-xl font-bold text-white">Pagamento via Pix</h1>
            <p className="text-sm text-[#9B9B9B]">Copie o código e pague pelo app do seu banco</p>
          </div>

          <div className="text-center">
            <span className="text-5xl font-bold text-white tabular-nums">
              {formatCurrency(cents)}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold uppercase tracking-widest text-[#9B9B9B]">
              Código Pix Copia e Cola
            </label>
            <textarea
              readOnly
              value={charge.copiaCola}
              rows={3}
              className="w-full px-3 py-2 rounded border border-[#353534] bg-[#0E0E0E] text-white text-xs font-mono resize-none focus:outline-none select-all"
              onClick={e => (e.target as HTMLTextAreaElement).select()}
            />
          </div>

          <button
            onClick={handleCopy}
            className={`w-full py-4 rounded font-bold text-[13px] uppercase tracking-wide transition-colors duration-150 ${
              copied
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-[#EF1A2D] hover:bg-[#C8151F] text-white'
            }`}
          >
            {copied ? '✓ Copiado!' : 'Copiar código Pix'}
          </button>

          <p className="text-xs text-center text-[#9B9B9B]">
            Válido até {formatExpiry(charge.expiresAt)}
          </p>

          {paidConfirmed ? (
            <div className="rounded bg-green-500/10 border border-green-500/30 px-4 py-3 text-center">
              <p className="text-green-500 font-medium text-sm">
                ✓ Aguardando confirmação do banco...
              </p>
              <p className="text-xs text-green-500/70 mt-1">
                Sua mensagem será exibida assim que o pagamento for confirmado.
              </p>
            </div>
          ) : (
            <button
              onClick={handlePaid}
              className="w-full py-3 rounded border border-[#353534] text-[#9B9B9B] hover:text-white text-[13px] font-bold uppercase tracking-wide hover:bg-[#353534]/30 transition-colors duration-150"
            >
              Já paguei
            </button>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0E0E0E] p-4">
      <main className="w-full max-w-md bg-[#1A1A1A] border border-[#353534] rounded-lg p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 bg-[#353534] rounded-full mb-3 flex items-center justify-center">
            <svg className="w-12 h-12 text-[#9B9B9B]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-xl font-bold text-white">{streamer!.username}</h1>
            <svg className="w-5 h-5 text-[#EF1A2D]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>

          <p className="text-[#9B9B9B] text-sm">Envie uma mensagem</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold uppercase tracking-widest text-[#9B9B9B]">
              Seu nome de usuário
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="pablosena"
              required
              className="px-4 py-3 rounded border border-[#353534] bg-[#0E0E0E] text-white placeholder:text-[#555] focus:outline-none focus:border-[#EF1A2D] focus:ring-1 focus:ring-[#EF1A2D] transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold uppercase tracking-widest text-[#9B9B9B]">
              Mensagem
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              maxLength={messageMaxLength}
              required
              rows={3}
              className="w-full px-4 py-3 rounded border border-[#353534] bg-[#0E0E0E] text-white placeholder:text-[#555] focus:outline-none focus:border-[#EF1A2D] focus:ring-1 focus:ring-[#EF1A2D] transition-colors resize-none"
            />
            <span className="text-xs text-[#9B9B9B]">
              {formData.message.length}/{messageMaxLength} caracteres
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold uppercase tracking-widest text-[#9B9B9B]">
              Valor
            </label>
            <input
              type="text"
              name="amount"
              value={`R$ ${formData.amount}`}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9,]/g, '');
                setFormData(prev => ({ ...prev, amount: value }));
              }}
              className="px-4 py-3 rounded border border-[#353534] bg-[#0E0E0E] text-white placeholder:text-[#555] focus:outline-none focus:border-[#EF1A2D] focus:ring-1 focus:ring-[#EF1A2D] transition-colors"
            />
            <span className="text-xs text-[#9B9B9B]">
              O valor mínimo é de R$ 5,00
            </span>
          </div>

          {error && (
            <div className="rounded bg-[#EF1A2D]/10 border border-[#EF1A2D]/30 px-4 py-3">
              <p className="text-[#EF1A2D] text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded bg-[#EF1A2D] hover:bg-[#C8151F] active:bg-[#A01018] text-white font-bold text-[13px] uppercase tracking-wide transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Gerando cobrança...
              </>
            ) : (
              'Continuar'
            )}
          </button>

          <p className="text-xs text-[#9B9B9B] text-center leading-relaxed mt-2">
            Ao clicar em continuar, você declara que leu e concorda com os termos de uso.
          </p>
        </form>
      </main>
    </div>
  );
}
