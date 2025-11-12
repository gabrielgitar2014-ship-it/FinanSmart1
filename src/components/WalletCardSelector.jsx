import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wifi } from "lucide-react"; // Usando o ícone do Lucide

// 1. ADAPTADO: Usando a nossa lista de emissores
const BANK_CARDS = [
  { id: "nu", issuer: "Nubank", bandeira: "Mastercard", color: "#8A05BE" },
  { id: "itau", issuer: "Itaú", bandeira: "Visa", color: "#EC7000" },
  { id: "bradesco", issuer: "Bradesco", bandeira: "Visa", color: "#CC0000" },
  { id: "bb", issuer: "Banco do Brasil", bandeira: "Visa", color: "#FFCC00" },
  { id: "santander", issuer: "Santander", bandeira: "Mastercard", color: "#E30613" },
  { id: "caixa", issuer: "Caixa", bandeira: "Elo", color: "#005CA9" },
  { id: "inter", issuer: "Inter", bandeira: "Mastercard", color: "#FF7A00" },
  { id: "c6", issuer: "C6 Bank", bandeira: "Mastercard", color: "#121212" },
  { id: "pagbank", issuer: "PagBank", bandeira: "Visa", color: "#009739" },
  { id: "picpay", issuer: "PicPay", bandeira: "Mastercard", color: "#00C04B" },
  { id: "mercadopago", issuer: "Mercado Pago", bandeira: "Visa", color: "#009EE3" },
  { id: "xp", issuer: "XP", bandeira: "Mastercard", color: "#000000" },
];

/* Função de escurecer cor (copiada da sua inspiração) */
function shade(hex, percent) {
  const _hex = hex.replace("#", "");
  const num = parseInt(_hex, 16);
  const r = (num >> 16) + percent;
  const g = ((num >> 8) & 0x00ff) + percent;
  const b = (num & 0x0000ff) + percent;
  const clamp = (v) => Math.max(0, Math.min(255, v));
  return (
    "#" +
    clamp(r).toString(16).padStart(2, "0") +
    clamp(g).toString(16).padStart(2, "0") +
    clamp(b).toString(16).padStart(2, "0")
  );
}

// 2. Componentes auxiliares (copiados da sua inspiração)
const Chip = () => (
  <div className="w-10 h-7 rounded-sm bg-gradient-to-br from-yellow-300 to-yellow-500 shadow-inner" />
);

const MaskedNumber = ({ last4 }) => (
  <div className="flex items-center gap-2 tracking-widest">
    {Array.from({ length: 3 }).map((_, i) => (
      <div key={i} className="flex gap-1">
        {Array.from({ length: 4 }).map((__, j) => (
          <span key={j} className="w-1.5 h-1.5 rounded-full bg-white/70 inline-block" />
        ))}
      </div>
    ))}
    <span className="font-semibold">{last4}</span>
  </div>
);

const Badge = ({ issuer }) => (
  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-black/20 text-white/90 backdrop-blur-sm">
    {issuer}
  </span>
);

// 3. Componente Card (ADAPTADO: removido 'holder' e 'balance')
function Card({ card, active }) {
  return (
    <motion.div
      role="button"
      aria-label={`Cartão ${card.issuer} ${card.bandeira}`}
      className="relative w-[320px] h-[200px] rounded-3xl text-white shadow-2xl select-none"
      style={{
        backgroundImage: `linear-gradient(135deg, ${card.color}, ${shade(card.color, -25)})`,
      }}
      layout
      transition={{ type: "spring", stiffness: 280, damping: 28, mass: 0.8 }}
    >
      {/* glossy overlay */}
      <div className="absolute inset-0 rounded-3xl overflow-hidden">
        <div className="absolute -top-20 -left-16 w-[180%] h-[80%] rotate-[-12deg] opacity-20 bg-white" />
      </div>

      <div className="absolute inset-0 p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <Badge issuer={card.issuer} />
          <Wifi className="w-5 h-5 opacity-90" />
        </div>

        <div className="flex flex-col gap-4">
          <Chip />
          <MaskedNumber last4="1234" />
          <div className="flex items-end justify-between">
            <div className="text-sm opacity-90">
              <div className="text-white/80 text-[10px] uppercase tracking-wider">Emissor</div>
              <div className="font-semibold">{card.issuer}</div>
            </div>
            <div className="text-right">
              <div className="text-white/80 text-[10px] uppercase tracking-wider">Bandeira</div>
              <div className="font-semibold text-lg">{card.bandeira}</div>
            </div>
          </div>
        </div>
      </div>

      {/* focus ring when active */}
      <motion.div
        className="absolute inset-0 rounded-3xl ring-2 ring-white/70"
        initial={false}
        animate={{ opacity: active ? 1 : 0 }}
        transition={{ duration: 0.25 }}
        pointerEvents="none"
      />
    </motion.div>
  );
}

// 4. Componente Principal (ADAPTADO: Renomeado e `onSelect`)
export default function WalletCardSelector({ onSelect }) {
  const [index, setIndex] = useState(0);
  const total = BANK_CARDS.length;

  const go = (dir) => setIndex((i) => (i + dir + total) % total);

  // Posições (copiado da sua inspiração)
  const layoutFor = (i) => {
    if (i === index) return { x: 0, y: 0, scale: 1, zIndex: 30, opacity: 1 };
    const diff = (i - index + total) % total;
    if (diff === 1) return { x: 48, y: -16, scale: 0.95, zIndex: 20, opacity: 0.9 };
    if ((index - i + total) % total === 1) return { x: -48, y: -16, scale: 0.95, zIndex: 20, opacity: 0.9 };
    return { x: 0, y: -32, scale: 0.9, zIndex: 10, opacity: 0 };
  };

  const handlePersonalizar = () => {
    onSelect({ issuer: "Outro", color: "#64748b", bandeira: "Visa" });
  };

  return (
    <div className="w-full flex flex-col items-center py-6">
      
      {/* Stack (Pilha) */}
      <div className="relative h-[260px]">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-[360px] h-[220px]">
            <AnimatePresence initial={false}>
              {BANK_CARDS.map((c, i) => (
                <motion.div
                  key={c.id}
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={layoutFor(i)}
                  exit={{ opacity: 0, scale: 0.95, y: -32 }}
                  transition={{ type: "spring", stiffness: 260, damping: 26 }}
                  // 5. MUDANÇA: onClick agora chama onSelect
                  onClick={() => onSelect(c)} 
                >
                  <Card card={c} active={i === index} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Controles (Setas) */}
        <div className="absolute inset-x-0 -top-4 flex items-center justify-between px-4">
          <button
            onClick={(e) => { e.stopPropagation(); go(-1); }}
            className="rounded-full p-2 bg-white shadow-lg ring-1 ring-black/5 hover:bg-gray-50 active:scale-95 transition"
            aria-label="Anterior"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M15 18l-6-6 6-6" stroke="#111827" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); go(1); }}
            className="rounded-full p-2 bg-white shadow-lg ring-1 ring-black/5 hover:bg-gray-50 active:scale-95 transition"
            aria-label="Próximo"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M9 6l6 6-6 6" stroke="#111827" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Controles (Pontos) */}
      <div className="flex gap-2 mt-8">
        {BANK_CARDS.map((_, i) => (
          <button
            key={i}
            onClick={(e) => { e.stopPropagation(); setIndex(i); }}
            className={`h-2.5 rounded-full transition-all ${
              i === index ? "w-6 bg-gray-800" : "w-2.5 bg-gray-400/60"
            }`}
            aria-label={`Ir para cartão ${i + 1}`}
          />
        ))}
      </div>

      {/* Botão Personalizar */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.5 } }}
        onClick={handlePersonalizar}
        className="mt-8 w-[280px] py-3 rounded-xl border-2 border-dashed border-gray-400 text-sm text-gray-600 bg-white/70 hover:bg-white/90 font-medium cursor-pointer"
      >
        + Outro / Personalizar
      </motion.button>
    </div>
  );
}