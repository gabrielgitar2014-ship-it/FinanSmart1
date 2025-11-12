// src/components/BankAccountCarousel.jsx

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Landmark } from 'lucide-react';

// Dados dos bancos (podem ser expandidos no futuro)
const BANK_TEMPLATES = [
  { issuer_id: "nubank", nome: "Nubank", color: "#8A05BE" },
  { issuer_id: "itau", nome: "Itaú", color: "#EC7000" },
  { issuer_id: "bradesco", nome: "Bradesco", color: "#CC0000" },
  { issuer_id: "bb", nome: "Banco do Brasil", color: "#FFCC00" },
  { issuer_id: "santander", nome: "Santander", color: "#E30613" },
  { issuer_id: "caixa", nome: "Caixa", color: "#005CA9" },
  { issuer_id: "inter", nome: "Inter", color: "#FF7A00" },
  { issuer_id: "c6", nome: "C6 Bank", color: "#121212" },
  { issuer_id: "xp", nome: "XP", color: "#000000" },
  { issuer_id: "picpay", nome: "PicPay", color: "#00C04B" },
  { issuer_id: "mercadopago", nome: "Mercado Pago", color: "#009EE3" },
  { issuer_id: "neon", nome: "Neon", color: "#00FFFF" },
  { issuer_id: "sicredi", nome: "Sicredi", color: "#12A54A" },
  { issuer_id: "sicoob", nome: "Sicoob", color: "#00783E" },
  { issuer_id: "porto", nome: "Porto Bank", color: "#0092D0" },
];

// Função para escurecer ou clarear uma cor HEX
function shade(hex, percent) {
  if (!hex) hex = "#64748b"; 
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

// Card de Banco Individual para o Carrossel
const BankCard = ({ bank, active, onClick }) => {
  const cardGradient = bank.color || '#64748b'; // Cor padrão

  return (
    <motion.div
      aria-label={`Banco ${bank.nome}`}
      className="relative w-[280px] h-[180px] rounded-2xl text-white shadow-lg cursor-pointer select-none"
      style={{
        backgroundImage: `linear-gradient(135deg, ${cardGradient}, ${shade(cardGradient, -25)})`,
      }}
      onClick={onClick}
    >
      <div className="absolute inset-0 rounded-2xl overflow-hidden">
        {/* Efeito de brilho sutil */}
        <div className="absolute -top-16 -left-12 w-[180%] h-[80%] rotate-[-12deg] opacity-20 bg-white" />
      </div>

      <div className="absolute inset-0 p-4 flex flex-col justify-center items-center">
        {/* Logo do banco ou ícone genérico */}
        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-3">
          {/* Você pode substituir 'Landmark' por uma imagem de logo real aqui */}
          <Landmark className="w-8 h-8 text-white" />
        </div>
        <p className="text-xl font-bold text-center">{bank.nome}</p>
        <p className="text-xs text-white/80 mt-1">Clique para selecionar</p>
      </div>

      {/* Indicador de seleção (anel azul) */}
      <motion.div
        className="absolute inset-0 rounded-2xl ring-2 ring-blue-500 ring-offset-2"
        initial={false}
        animate={{ opacity: active ? 1 : 0 }}
        transition={{ duration: 0.25 }}
        pointerEvents="none"
      />
    </motion.div>
  );
};

// Componente principal do Carrossel de Bancos
const BankAccountCarousel = ({ onBankSelect, onCustomize }) => {
  const [index, setIndex] = useState(0);
  const totalBanks = BANK_TEMPLATES.length + 1; // +1 para o botão "Personalizar"

  // Função para navegar pelo carrossel
  const go = (dir) => setIndex((i) => (i + dir + totalBanks) % totalBanks);

  // Layout para os cards no carrossel
  const layoutFor = (i, currentIndex) => {
    if (i === currentIndex) return { x: 0, y: 0, scale: 1, zIndex: 30, opacity: 1 };
    
    const diff = (i - currentIndex + totalBanks) % totalBanks;
    
    // Card à direita do centro
    if (diff === 1) return { x: 40, y: -12, scale: 0.95, zIndex: 20, opacity: 0.9 };
    // Card à esquerda do centro
    if ((currentIndex - i + totalBanks) % totalBanks === 1) return { x: -40, y: -12, scale: 0.95, zIndex: 20, opacity: 0.9 };
    
    // Outros cards (escondidos)
    return { x: 0, y: -24, scale: 0.85, zIndex: 10, opacity: 0 };
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "Enter") {
        if (index === BANK_TEMPLATES.length) { // Se for o botão Personalizar
          onCustomize();
        } else {
          onBankSelect(BANK_TEMPLATES[index]);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, onBankSelect, onCustomize]);

  return (
    <div className="relative w-full h-[280px] flex flex-col items-center justify-center">
      {/* Container dos Cartões */}
      <div className="relative w-full max-w-[320px] h-[200px]">
        <AnimatePresence initial={false}>
          {BANK_TEMPLATES.map((bank, i) => (
            <motion.div
              key={bank.issuer_id}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={layoutFor(i, index)}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
              onClick={() => setIndex(i)} // Ao clicar, o card vai para o centro
            >
              <BankCard bank={bank} active={i === index} onClick={() => onBankSelect(bank)} />
            </motion.div>
          ))}

          {/* Card de "Personalizar" (sempre o último) */}
          <motion.div
            key="customize-bank"
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={layoutFor(BANK_TEMPLATES.length, index)}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            onClick={() => setIndex(BANK_TEMPLATES.length)} // Ao clicar, vai para o centro
          >
            <motion.div
              aria-label="Personalizar Banco"
              className="relative w-[280px] h-[180px] rounded-2xl text-white shadow-lg cursor-pointer select-none border-2 border-dashed border-gray-400 flex flex-col items-center justify-center"
              onClick={onCustomize}
              style={{ backgroundColor: '#e2e8f0' }} // Cor cinza suave
            >
              <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center mb-3">
                <Plus className="w-8 h-8 text-gray-700" />
              </div>
              <p className="text-xl font-bold text-gray-800 text-center">Personalizar Conta</p>
              <p className="text-xs text-gray-600 mt-1">Crie sua própria</p>
            </motion.div>
             {/* Indicador de seleção para o personalizar */}
             <motion.div
                className="absolute inset-0 rounded-2xl ring-2 ring-blue-500 ring-offset-2"
                initial={false}
                animate={{ opacity: (index === BANK_TEMPLATES.length) ? 1 : 0 }}
                transition={{ duration: 0.25 }}
                pointerEvents="none"
             />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controles de Navegação e Indicadores */}
      <div className="absolute inset-x-0 bottom-4 flex items-center justify-center gap-4">
        <button
          onClick={() => go(-1)}
          className="rounded-full p-2 bg-white/80 backdrop-blur-sm shadow-lg ring-1 ring-black/5 hover:bg-gray-50 active:scale-95 transition"
          aria-label="Banco Anterior"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M15 18l-6-6 6-6" stroke="#111827" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div className="flex gap-2">
          {Array.from({ length: totalBanks }).map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`h-2.5 rounded-full transition-all ${
                i === index ? "w-6 bg-gray-800" : "w-2.5 bg-gray-400/60"
              }`}
              aria-label={`Ir para banco ${i + 1}`}
            />
          ))}
        </div>
        <button
          onClick={() => go(1)}
          className="rounded-full p-2 bg-white/80 backdrop-blur-sm shadow-lg ring-1 ring-black/5 hover:bg-gray-50 active:scale-95 transition"
          aria-label="Próximo Banco"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M9 6l6 6-6 6" stroke="#111827" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default BankAccountCarousel;