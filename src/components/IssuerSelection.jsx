/*
 * COMPONENTE: IssuerSelector.jsx
 * (Refatorado a partir de WalletCardSelector.jsx)
 *
 * Objetivo: Mostrar um carrossel de EMISSORES (Bancos) 
 * baseado no nosso catálogo 'lib/issuers.js'.
 * * Usado em: AddAccountModal
 * Retorna: O 'issuer_id' selecionado (ex: 'itau_unibanco')
 */
import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wifi } from "lucide-react"; // Mantido para estilo

// --- MUDANÇA 1: Importa nossos catálogos ---
import { ISSUERS } from "../lib/issuers";
// (Não precisamos de card_products aqui, apenas dos emissores)

// Transforma o objeto ISSUERS em um array que podemos mapear
// Filtramos o 'generic' para não aparecer no carrossel principal
const issuerList = Object.values(ISSUERS).filter(i => i.id !== 'generic');

/* Função de escurecer cor (sem mudança) */
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

// --- MUDANÇA 2: Componente LogoIssuer (substitui o Chip) ---
const LogoIssuer = ({ logoSrc, issuerName }) => (
  <div className="w-12 h-8 rounded-md bg-white/30 p-1 flex items-center justify-center">
    <img 
      src={logoSrc} 
      alt={issuerName} 
      className="max-w-full max-h-full object-contain"
    />
  </div>
);

const Badge = ({ issuerName }) => (
  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-black/20 text-white/90 backdrop-blur-sm">
    {issuerName}
  </span>
);

// --- MUDANÇA 3: Componente Card (Adaptado para Emissor) ---
// Removemos 'bandeira', 'last4' e adicionamos 'logo'
function Card({ issuer, active }) {
  return (
    <motion.div
      role="button"
      aria-label={`Emissor ${issuer.nome}`}
      className="relative w-[320px] h-[200px] rounded-3xl text-white shadow-2xl select-none"
      style={{
        // Usa a cor do nosso catálogo
        backgroundImage: `linear-gradient(135deg, ${issuer.cor}, ${shade(issuer.cor, -25)})`,
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
          <Badge issuerName={issuer.nome} />
          <Wifi className="w-5 h-5 opacity-90" />
        </div>

        <div className="flex flex-col gap-4">
          {/* Mostra o Logo do Banco */}
          <LogoIssuer logoSrc={issuer.logo} issuerName={issuer.nome} />
          
          {/* Removemos o número do cartão */}
          
          <div className="flex items-end justify-between">
            <div className="text-sm opacity-90">
              <div className="text-white/80 text-[10px] uppercase tracking-wider">Instituição</div>
              <div className="font-semibold text-lg">{issuer.nome}</div>
            </div>
            {/* Removemos a 'bandeira' */}
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

// --- MUDANÇA 4: Componente Principal (Controlado) ---
// Recebe 'value' (o issuer_id) e 'onChange' (a função)
export default function IssuerSelector({ value: selectedIssuerId, onChange }) {
  
  // Encontra o índice inicial baseado no 'value' recebido
  const startIndex = useMemo(() => {
    const idx = issuerList.findIndex(i => i.id === selectedIssuerId);
    return idx > -1 ? idx : 0;
  }, [selectedIssuerId]);

  const [index, setIndex] = useState(startIndex);
  const total = issuerList.length;

  // Atualiza o índice se o 'value' externo mudar
  useEffect(() => {
    setIndex(startIndex);
  }, [startIndex]);

  const go = (dir) => {
    const newIndex = (index + dir + total) % total;
    setIndex(newIndex);
    // Chama o onChange com o ID do novo emissor selecionado
    onChange(issuerList[newIndex].id);
  };

  // Posições (sem mudança)
  const layoutFor = (i) => {
    if (i === index) return { x: 0, y: 0, scale: 1, zIndex: 30, opacity: 1 };
    const diff = (i - index + total) % total;
    if (diff === 1) return { x: 48, y: -16, scale: 0.95, zIndex: 20, opacity: 0.9 };
    if ((index - i + total) % total === 1) return { x: -48, y: -16, scale: 0.95, zIndex: 20, opacity: 0.9 };
    return { x: 0, y: -32, scale: 0.9, zIndex: 10, opacity: 0 };
  };

  const handlePersonalizar = () => {
    // Chama o onChange com o ID 'generic'
    onChange("generic");
  };

  // Função para quando o usuário clica em um cartão
  const handleClickCard = (cardIndex) => {
    setIndex(cardIndex);
    onChange(issuerList[cardIndex].id);
  };

  return (
    <div className="w-full flex flex-col items-center py-6">
      
      {/* Stack (Pilha) */}
      <div className="relative h-[260px]">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-[360px] h-[220px]">
            <AnimatePresence initial={false}>
              {/* --- MUDANÇA 5: Mapeia nossa 'issuerList' --- */}
              {issuerList.map((issuer, i) => (
                <motion.div
                  key={issuer.id}
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={layoutFor(i)}
                  exit={{ opacity: 0, scale: 0.95, y: -32 }}
                  transition={{ type: "spring", stiffness: 260, damping: 26 }}
                  // --- MUDANÇA 6: onClick agora chama nossa função ---
                  onClick={() => handleClickCard(i)} 
                >
                  <Card issuer={issuer} active={i === index} />
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
        {issuerList.map((_, i) => (
          <button
            key={i}
            onClick={(e) => { e.stopPropagation(); const newIndex = i; setIndex(newIndex); onChange(issuerList[newIndex].id); }}
            className={`h-2.5 rounded-full transition-all ${
              i === index ? "w-6 bg-gray-800" : "w-2.5 bg-gray-400/60"
            }`}
            aria-label={`Ir para ${issuerList[i].nome}`}
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
        + Outro / Não listado
      </motion.button>
    </div>
  );
}