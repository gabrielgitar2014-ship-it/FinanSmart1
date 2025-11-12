import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from 'react-helmet';
import { Button } from '../components/ui/Button';
import { Plus, ArrowLeft } from "lucide-react";
import { useParams, useNavigate } from 'react-router-dom';

// Hooks
import { useAccounts } from '../hooks/useAccounts';
import { usePaymentMethods } from '../hooks/usePaymentMethods';
import { useAuth } from '../contexts/AuthContext';

// Modal
import AddPaymentMethodModal from '../components/AddPaymentMethodModal';

// --- Sub-componentes do Card (baseado na sua inspiração) ---

function formatBRL(value) {
  try {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
  } catch (_) { return `R$ ${value.toFixed(2)}`; }
}

const Chip = () => (
  <div className="w-10 h-7 rounded-md bg-gradient-to-br from-yellow-300 to-yellow-500 shadow-inner" />
);

const MaskedNumber = ({ last4 }) => (
  <div className="flex items-center gap-2 tracking-widest text-white/90">
    {Array.from({ length: 3 }).map((_, i) => (
      <div key={i} className="flex gap-1">
        {Array.from({ length: 4 }).map((__, j) => (
          <span key={j} className="w-1.5 h-1.5 rounded-full bg-white/70 inline-block" />
        ))}
      </div>
    ))}
    <span className="font-semibold">{last4 || '••••'}</span>
  </div>
);

const Badge = ({ issuer }) => (
  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-black/20 text-white/90 backdrop-blur-sm">
    {issuer || 'Método'}
  </span>
);

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

// --- Componente do Cartão (Método de Pagamento) ---
function PaymentMethodCard({ method, active }) {
  const cardGradient = method.cor_personalizada || '#64748b';

  return (
    <motion.div
      aria-label={`Cartão ${method.nome}`}
      className="relative w-[320px] h-[200px] sm:w-[360px] sm:h-[220px] rounded-3xl text-white shadow-2xl select-none"
      style={{
        backgroundImage: `linear-gradient(135deg, ${cardGradient}, ${shade(cardGradient, -25)})`,
      }}
      layout
      transition={{ type: "spring", stiffness: 280, damping: 28, mass: 0.8 }}
    >
      <div className="absolute inset-0 rounded-3xl overflow-hidden">
        <div className="absolute -top-20 -left-16 w-[180%] h-[80%] rotate-[-12deg] opacity-20 bg-white" />
      </div>

      <div className="absolute inset-0 p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <Badge issuer={method.nome} />
          {method.tipo === 'credit_card' && <Badge issuer={method.bandeira} />}
        </div>

        <div className="flex flex-col gap-4">
          {method.tipo !== 'pix' && <Chip />}
          <MaskedNumber last4={method.ultimos_4_digitos} />
          <div className="flex items-end justify-between">
            <div className="text-sm opacity-90">
              <div className="text-white/80 text-[10px] uppercase tracking-wider">Tipo</div>
              <div className="font-semibold capitalize">
                {method.tipo === 'credit_card' && 'Crédito'}
                {method.tipo === 'debit_card' && 'Débito'}
                {method.tipo === 'pix' && 'Pix'}
              </div>
            </div>
            <div className="text-right">
              {method.tipo === 'credit_card' && (
                <>
                  <div className="text-white/80 text-[10px] uppercase tracking-wider">Fechamento</div>
                  <div className="font-semibold text-lg">Dia {method.close_day || 'N/A'}</div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <motion.div
        className="absolute inset-0 rounded-3xl ring-2 ring-blue-500 ring-offset-2"
        initial={false}
        animate={{ opacity: active ? 1 : 0 }}
        transition={{ duration: 0.25 }}
        pointerEvents="none"
      />
    </motion.div>
  );
}

// --- Componente da Página Principal ---
export default function AccountDetail() {
  const [index, setIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const { id: accountId } = useParams(); // Pega o ID da conta da URL

  // Busca a conta "Pai" (ex: "Itaú")
  const { accounts, loading: loadingAccounts } = useAccounts();
  const account = useMemo(() => accounts.find(a => a.id === accountId), [accounts, accountId]);
  
  // Busca os "Filhos" (Cartões, Pix) desta conta
  const { methods, loading: loadingMethods } = usePaymentMethods(accountId);

  const total = methods.length;
  const go = (dir) => setIndex((i) => (i + dir + total) % total);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const layoutFor = (i) => {
    if (i === index) return { x: 0, y: 0, scale: 1, zIndex: 30, opacity: 1 };
    const diff = (i - index + total) % total;
    if (diff === 1) return { x: 48, y: -16, scale: 0.95, zIndex: 20, opacity: 0.9 };
    if ((index - i + total) % total === 1) return { x: -48, y: -16, scale: 0.95, zIndex: 20, opacity: 0.9 };
    return { x: 0, y: -32, scale: 0.9, zIndex: 10, opacity: 0 };
  };
  
  const loading = loadingAccounts || loadingMethods;

  return (
    <>
      <Helmet>
        <title>{account ? account.nome : 'Detalhes da Conta'} - FinanceApp</title>
      </Helmet>
      
      <AddPaymentMethodModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} accountId={accountId} />

      <div className="w-full">
        {/* Cabeçalho */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8 px-2"
        >
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => navigate('/accounts')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                {account ? account.nome : 'Carregando...'}
              </h1>
              <p className="text-gray-600">Métodos de Pagamento</p>
            </div>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-fuchsia-600 to-purple-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Método
          </Button>
        </motion.div>

        {/* Carregando... */}
        {loading && <p className="text-slate-600">Carregando métodos...</p>}
        
        {/* Sem Métodos */}
        {!loading && methods.length === 0 && (
           <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <p className="text-slate-600 text-lg">Nenhum método de pagamento (cartão, pix) cadastrado para esta conta.</p>
            <Button onClick={() => setIsModalOpen(true)} className="mt-4">
              Adicione seu primeiro método
            </Button>
          </motion.div>
        )}

        {/* Pilha de Cartões (Carrossel) */}
        {!loading && methods.length > 0 && (
          <div className="relative h-[320px] sm:h-[360px]">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-[360px] sm:w-[420px] h-[220px] sm:h-[240px]">
                <AnimatePresence initial={false}>
                  {methods.map((method, i) => (
                    <motion.div
                      key={method.id}
                      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={layoutFor(i)}
                      exit={{ opacity: 0, scale: 0.95, y: -32 }}
                      transition={{ type: "spring", stiffness: 260, damping: 26 }}
                      onClick={() => setIndex(i)}
                    >
                      <PaymentMethodCard method={method} active={i === index} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Controles */}
            <div className="absolute inset-x-0 bottom-1 flex items-center justify-between px-4">
              <button
                onClick={() => go(-1)}
                className="rounded-full p-2 bg-white/80 backdrop-blur-sm shadow-lg ring-1 ring-black/5 hover:bg-gray-50 active:scale-95 transition"
                aria-label="Anterior"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M15 18l-6-6 6-6" stroke="#111827" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <div className="flex gap-2">
                {methods.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setIndex(i)}
                    className={`h-2.5 rounded-full transition-all ${
                      i === index ? "w-6 bg-gray-800" : "w-2.5 bg-gray-400/60"
                    }`}
                    aria-label={`Ir para método ${i + 1}`}
                  />
                ))}
              </div>
              <button
                onClick={() => go(1)}
                className="rounded-full p-2 bg-white/80 backdrop-blur-sm shadow-lg ring-1 ring-black/5 hover:bg-gray-50 active:scale-95 transition"
                aria-label="Próximo"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M9 6l6 6-6 6" stroke="#111827" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}