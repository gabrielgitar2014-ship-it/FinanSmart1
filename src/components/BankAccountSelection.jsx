// src/components/BankAccountSelection.jsx

import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Landmark } from 'lucide-react'; 

// Lista de bancos com o caminho final da imagem (.png)
const BANK_TEMPLATES = [
  { issuer_id: "nubank", nome: "Nubank", logoPath: "/logos/nubank.png" },
  { issuer_id: "itau", nome: "Itaú", logoPath: "/logos/itau.png" },
  { issuer_id: "bradesco", nome: "Bradesco", logoPath: "/logos/bradesco.png" },
  { issuer_id: "bb", nome: "Banco do Brasil", logoPath: "/logos/bancodobrasil.png" },
  { issuer_id: "santander", nome: "Santander", logoPath: "/logos/santander.png" },
  { issuer_id: "caixa", nome: "Caixa", logoPath: "/logos/caixa.png" },
  { issuer_id: "inter", nome: "Inter", logoPath: "/logos/inter.png" },
  { issuer_id: "c6", nome: "C6 Bank", logoPath: "/logos/c6.png" },
  { issuer_id: "xp", nome: "XP", logoPath: "/logos/xp.png" },
  { issuer_id: "picpay", nome: "PicPay", logoPath: "/logos/picpay.png" },
  { issuer_id: "mercadopago", nome: "Mercado Pago", logoPath: "/logos/mercadopago.png" },
  { issuer_id: "neon", nome: "Neon", logoPath: "/logos/neon.png" },
  { issuer_id: "sicredi", nome: "Sicredi", logoPath: "/logos/sicredi.png" },
  { issuer_id: "sicoob", nome: "Sicoob", logoPath: "/logos/sicoob.png" },
  { issuer_id: "porto", nome: "Porto Bank", logoPath: "/logos/porto.png" },
];

const BankAccountSelection = ({ onBankSelect, onCustomize }) => {
  return (
    <motion.div
      key="step1"
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
    >
      <p className="text-slate-600 mb-4 text-center">Comece selecionando o banco ou crie uma conta personalizada.</p>
      
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 max-h-[50vh] overflow-y-auto p-1">
        
        {BANK_TEMPLATES.map((bank) => (
          <motion.div
            key={bank.issuer_id}
            whileHover={{ scale: 1.05 }}
            onClick={() => onBankSelect(bank)}
            className="flex flex-col items-center justify-center p-4 rounded-lg border bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
          >
            {/* CONTAINER DA LOGO: w-12 h-12 (48x48px) e usa rounded-xl */}
            <div 
              className="w-12 h-12 mb-2 flex items-center justify-center bg-white border border-gray-200 shadow-md overflow-hidden rounded-xl"
            >
              <img 
                src={bank.logoPath} 
                alt={`${bank.nome} logo`} 
                className="w-full h-full object-contain p-1" 
                onError={(e) => {
                  // Fallback para o ícone Lucide se a imagem não carregar (caminho incorreto, arquivo ausente, etc.)
                  e.currentTarget.onerror = null; 
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentNode.innerHTML = '<svg class="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21v-2a4 4 0 00-4-4H9a4 4 0 00-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';
                }}
              />
            </div>
            <p className="text-sm font-medium text-slate-800 text-center">{bank.nome}</p>
          </motion.div>
        ))}
        
        {/* Botão Personalizar (também com rounded-xl para consistência) */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          onClick={onCustomize}
          className="flex flex-col items-center justify-center p-4 rounded-lg border-2 border-dashed border-gray-400 text-gray-600 hover:bg-gray-100 cursor-pointer transition-colors"
        >
          <div className="w-12 h-12 rounded-xl mb-2 flex items-center justify-center bg-gray-300"> 
              <Plus className="w-6 h-6" />
            </div>
          <p className="text-sm font-medium text-center">Outro / Personalizar</p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default BankAccountSelection;