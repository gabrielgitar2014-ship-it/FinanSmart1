import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ISSUERS } from "../lib/issuers";
import { getProductsByIssuer, Bandeiras } from "../lib/card_products";

// Função de escurecer cor
function shade(hex, percent) {
  if (!hex) hex = "#64748b";
  const _hex = hex.replace("#", "");
  const num = parseInt(_hex, 16);
  const r = (num >> 16) + percent;
  const g = ((num >> 8) & 0x00ff) + percent;
  const b = (num & 0x0000ff) + percent;
  const clamp = (v) => Math.max(0, Math.min(255, v));
  return ("#" + clamp(r).toString(16).padStart(2, "0") + clamp(g).toString(16).padStart(2, "0") + clamp(b).toString(16).padStart(2, "0"));
}

// Componente do "Chip" do cartão
const Chip = () => (
  <div className="w-8 h-6 rounded-sm bg-gradient-to-br from-yellow-300 to-yellow-500 shadow-inner" />
);

// Componente do Mini-Cartão (inspirado na sua referência)
function ProductCard({ product, issuer, active }) {
  const color = issuer.cor || "#4B5563";
  const logoBandeira = product.bandeira?.logo || null;

  return (
    <motion.div
      role="button"
      aria-label={`Cartão ${product.nome}`}
      // Um pouco menor para caber no modal
      className="relative w-[280px] h-[170px] rounded-2xl text-white shadow-lg select-none"
      style={{
        backgroundImage: `linear-gradient(135deg, ${color}, ${shade(color, -25)})`,
      }}
      layout
      transition={{ type: "spring", stiffness: 280, damping: 28 }}
    >
      {/* Overlay brilhante */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden">
        <div className="absolute -top-16 -left-12 w-[180%] h-[80%] rotate-[-12deg] opacity-20 bg-white" />
      </div>

      <div className="absolute inset-0 p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-lg">{issuer.nome}</span>
          <img src={issuer.logo} alt={issuer.nome} className="w-7 h-7 object-contain bg-white/20 rounded-full p-0.5" />
        </div>

        <div className="flex flex-col gap-3">
          <Chip />
          <div className="flex items-end justify-between">
            <div className="text-sm opacity-90">
              <div className="font-semibold">{product.nome}</div>
              <div className="text-white/80 text-xs uppercase tracking-wider">{product.tier}</div>
            </div>
            {logoBandeira && (
              <img src={logoBandeira} alt={product.bandeira.nome} className="h-5 object-contain" />
            )}
          </div>
        </div>
      </div>

      {/* Anel de foco quando ativo */}
      <motion.div
        className="absolute inset-0 rounded-2xl ring-2 ring-blue-500 ring-offset-2"
        initial={false}
        animate={{ opacity: active ? 1 : 0 }}
        transition={{ duration: 0.25 }}
        pointerEvents="none"
      />
    </motion.div>
  );
}

// Componente Principal do Carrossel
export default function CardProductSelector({ issuerId, value, onChange }) {
  // 1. Busca os produtos e o emissor corretos
  const issuer = ISSUERS[issuerId] || ISSUERS['generic'];
  const availableProducts = useMemo(() => getProductsByIssuer(issuerId), [issuerId]);
  
  // 2. Encontra o índice do 'value' (produto selecionado)
  const startIndex = useMemo(() => {
    const idx = availableProducts.findIndex(p => p.id === value);
    return idx > -1 ? idx : 0;
  }, [value, availableProducts]);

  const [index, setIndex] = useState(startIndex);
  const total = availableProducts.length;

  // 3. Atualiza o índice se o 'value' mudar
  useEffect(() => {
    setIndex(startIndex);
  }, [startIndex]);

  // 4. Funções de navegação
  const go = (dir) => {
    const newIndex = (index + dir + total) % total;
    setIndex(newIndex);
  };

  // Posições (lógica da sua referência)
  const layoutFor = (i) => {
    if (i === index) return { x: 0, y: 0, scale: 1, zIndex: 30, opacity: 1 };
    const diff = (i - index + total) % total;
    if (diff === 1) return { x: 40, y: -12, scale: 0.95, zIndex: 20, opacity: 0.9 };
    if ((index - i + total) % total === 1) return { x: -40, y: -12, scale: 0.95, zIndex: 20, opacity: 0.9 };
    return { x: 0, y: -24, scale: 0.85, zIndex: 10, opacity: 0 };
  };

  // 5. Função de clique
  const handleClick = (i) => {
    setIndex(i);
    onChange(availableProducts[i].id); // Atualiza o estado no modal pai
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Stack (Pilha) */}
      <div className="relative h-[220px]">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-[320px] h-[180px]">
            <AnimatePresence initial={false}>
              {availableProducts.map((product, i) => (
                <motion.div
                  key={product.id}
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={layoutFor(i)}
                  exit={{ opacity: 0, scale: 0.95, y: -32 }}
                  transition={{ type: "spring", stiffness: 260, damping: 26 }}
                  onClick={() => handleClick(i)}
                >
                  <ProductCard product={product} issuer={issuer} active={i === index} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Controles (Setas) */}
        <div className="absolute inset-x-0 -top-4 flex items-center justify-between px-4">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); go(-1); }}
            className="rounded-full p-2 bg-white shadow-lg ring-1 ring-black/5 hover:bg-gray-50 active:scale-95 transition"
            aria-label="Anterior"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M15 18l-6-6 6-6" stroke="#111827" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button
            type="button"
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
      <div className="flex gap-2 mt-6">
        {availableProducts.map((_, i) => (
          <button
            type="button"
            key={i}
            onClick={(e) => { e.stopPropagation(); handleClick(i); }}
            className={`h-2.5 rounded-full transition-all ${
              i === index ? "w-6 bg-gray-800" : "w-2.5 bg-gray-400/60"
            }`}
            aria-label={`Ir para produto ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}