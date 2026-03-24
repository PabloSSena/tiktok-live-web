# Pix — Design System

> **Princípio:** Interface de alta energia para streamers ao vivo. Foco total, zero distração, feedback instantâneo.

---

## 1. Color Palette

| Token | Hex | Tailwind class | Usage |
|---|---|---|---|
| `primary-red` | `#EF1A2D` | `bg-[#EF1A2D]` / `text-[#EF1A2D]` | CTA principal, status ativo, destaques |
| `bg-950` | `#0E0E0E` | `bg-[#0E0E0E]` | Background da página |
| `bg-900` | `#131313` | `bg-[#131313]` | Background de tela (fallback) |
| `bg-800` | `#1A1A1A` | `bg-[#1A1A1A]` | Cards e painéis |
| `border` | `#353534` | `bg-[#353534]` | Bordas, estados inativos, cards secundários |
| `text-primary` | `#FFFFFF` | `text-white` | Texto principal |
| `text-muted` | `#9B9B9B` | `text-[#9B9B9B]` | Labels, texto de suporte |
| `success` | `#22C55E` | `text-green-500` | Pagamento confirmado, status liquidado |
| `pending` | `#F59E0B` | `text-amber-400` | Aguardando pagamento |

### Regras
- **Dark mode obrigatório.** Sem variante clara — o streamer fica horas na frente da tela.
- `primary-red` é reservado para **uma única ação principal por tela**. Nunca usar como decoração.
- Nunca colocar texto `primary-red` sobre fundo `#353534` — contraste insuficiente.

---

## 2. Tipografia

**Fonte:** [Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk)

```tsx
// layout.tsx
import { Space_Grotesk } from 'next/font/google';
const font = Space_Grotesk({ subsets: ['latin'], weight: ['400', '500', '700'] });
```

| Role | Size | Weight | Style | Tailwind |
|---|---|---|---|---|
| Label pequeno | 11px | 700 | ALL CAPS | `text-[11px] font-bold uppercase tracking-widest` |
| Label de seção | 12px | 500 | ALL CAPS | `text-xs font-medium uppercase tracking-wider` |
| Body | 14px | 400 | Normal | `text-sm font-normal` |
| Valor / Dado | 32px | 700 | Normal | `text-3xl font-bold` |
| Valor hero | 48px | 700 | Normal | `text-5xl font-bold` |
| Botão | 13px | 700 | ALL CAPS | `text-[13px] font-bold uppercase tracking-wide` |

---

## 3. Shape & Espaçamento

### Border Radius
Todos os componentes usam **4px** (`rounded`) — direto e sem frescura.

```
rounded      → 4px   (botões, inputs, badges)
rounded-lg   → 8px   (cards, modais — usar com moderação)
rounded-full →        badges em pílula apenas
```

### Escala de Espaçamento
Grid de 4px: `4 / 8 / 12 / 16 / 24 / 32 / 48px`.

```
p-1  = 4px    gap-2  = 8px
p-3  = 12px   gap-4  = 16px
p-6  = 24px   gap-8  = 32px
```

---

## 4. Componentes

### 4.1 Botão — Primário

```tsx
<button className="
  w-full py-4 px-6
  bg-[#EF1A2D] hover:bg-[#C8151F] active:bg-[#A01018]
  text-white text-[13px] font-bold uppercase tracking-wide
  rounded transition-colors duration-150
  disabled:opacity-40 disabled:cursor-not-allowed
">
  LABEL DA AÇÃO
</button>
```

### 4.2 Botão — Secundário (Ghost)

```tsx
<button className="
  w-full py-4 px-6
  bg-transparent hover:bg-[#1A1A1A]
  border border-[#353534] hover:border-[#555]
  text-[#9B9B9B] hover:text-white text-[13px] font-bold uppercase tracking-wide
  rounded transition-colors duration-150
">
  AÇÃO SECUNDÁRIA
</button>
```

### 4.3 Input

```tsx
<div className="flex flex-col gap-1">
  <label className="text-[11px] font-bold uppercase tracking-widest text-[#9B9B9B]">
    LABEL DO CAMPO
  </label>
  <input className="
    px-4 py-3
    bg-[#1A1A1A] border border-[#353534]
    text-white text-sm placeholder:text-[#555]
    rounded
    focus:outline-none focus:border-[#EF1A2D] focus:ring-1 focus:ring-[#EF1A2D]
    transition-colors
  " />
</div>
```

### 4.4 Card / Painel

```tsx
<div className="
  bg-[#1A1A1A] border border-[#353534]
  rounded-lg p-6
">
  {/* conteúdo */}
</div>
```

Card com destaque na borda esquerda — para itens em evidência:

```tsx
<div className="
  bg-[#1A1A1A] border border-[#353534]
  rounded-lg p-6
  border-l-2 border-l-[#EF1A2D]
">
```

### 4.5 Badge de Status

```tsx
// Pendente
<span className="
  inline-flex items-center gap-1.5
  px-2 py-0.5 rounded-full
  bg-amber-400/10 border border-amber-400/30
  text-amber-400 text-[11px] font-bold uppercase tracking-wider
">
  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
  PENDENTE
</span>

// Confirmado
<span className="
  inline-flex items-center gap-1.5
  px-2 py-0.5 rounded-full
  bg-green-500/10 border border-green-500/30
  text-green-500 text-[11px] font-bold uppercase tracking-wider
">
  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
  CONFIRMADO
</span>
```

### 4.6 Bloco de Dado (número grande + label)

```tsx
<div className="flex flex-col gap-1">
  <span className="text-[11px] font-bold uppercase tracking-widest text-[#9B9B9B]">
    TOTAL RECEBIDO
  </span>
  <span className="text-5xl font-bold text-white tabular-nums">
    R$ 1.240,00
  </span>
</div>
```

### 4.7 Divisor

```tsx
<hr className="border-[#353534]" />
```

### 4.8 Estado de Erro

```tsx
<div className="
  rounded bg-[#EF1A2D]/10 border border-[#EF1A2D]/30
  px-4 py-3
  text-[#EF1A2D] text-sm
">
  Mensagem de erro aqui.
</div>
```

---

## 5. Layout de Página

Shell padrão para todas as telas:

```tsx
<div className="min-h-screen bg-[#0E0E0E] text-white font-[Space_Grotesk]">
  {/* Opcional: textura de pontos — usar só em dashboards, não em forms/pagamento */}
  <div className="fixed inset-0 bg-[radial-gradient(#353534_1px,transparent_1px)] bg-[length:24px_24px] opacity-30 pointer-events-none" />

  {/* Conteúdo */}
  <div className="relative z-10 max-w-md mx-auto px-4 py-8">
    {/* conteúdo da tela */}
  </div>
</div>
```

---

## 6. Motion

Animações rápidas e com propósito. Nada decorativo.

| Interação | Duração | Easing |
|---|---|---|
| Transições de cor / borda | `150ms` | `ease-in-out` |
| Elementos aparecendo (toast, modal) | `200ms` | `ease-out` |
| Indicador ao vivo (pulsing dot) | `animate-pulse` | — |
| Loading spinner | `animate-spin` | — |

---

## 7. Do / Don't

| Faça | Não faça |
|---|---|
| Use `primary-red` em apenas um CTA por tela | Use `primary-red` como preenchimento de áreas grandes |
| Mantenha ALL CAPS em labels e botões | Misture estilos de casing no mesmo componente |
| Use `tabular-nums` em todos os valores monetários | Deixe o texto de valores mudar de largura durante atualizações |
| Use cantos de 4px em tudo | Misture `rounded-xl` ou `rounded-2xl` com o sistema |
| Mantenha fundos em `#0E0E0E` / `#131313` / `#1A1A1A` | Adicione fundos brancos ou cinza claro |
| Indique status ao vivo com um ponto pulsante | Use apenas cor para transmitir status (acessibilidade) |
