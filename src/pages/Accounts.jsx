// src/pages/Accounts.jsx
// (Esta é a nova versão, como uma LISTA, que leva aos Detalhes)

import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Plus, Banknote, Landmark, PiggyBank, Wallet } from 'lucide-react';
import { useAccounts } from '../hooks/useAccounts'; // O hook que já corrigimos
import { Card } from '../components/ui/Card'; // Usando o Card simples
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom'; // Para navegar ao clicar

// Precisamos do modal para criar a CONTA (não o método de pagamento)
// Vamos REUTILIZAR o AddAccountModal que fizemos
import AddAccountModal from '../components/AddAccountModal'; 

// Componente para renderizar um card de conta individual
const AccountListItem = ({ account }) => {
  const navigate = useNavigate();

  let Icon;
  switch (account.tipo) {
    case 'checking': Icon = Landmark; break;
    case 'savings': Icon = PiggyBank; break;
    case 'investment': Icon = Banknote; break; // (Exemplo)
    case 'cash': Icon = Wallet; break;
    default: Icon = Landmark;
  }

  // Formata o saldo (exemplo)
  const saldoFormatado = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(account.saldo_inicial || 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }} // Efeito sutil de hover
      onClick={() => navigate(`/accounts/${account.id}`)} // Navega para a página de detalhes
      className="w-full"
    >
      <Card 
        className="bg-white/75 backdrop-blur-lg border border-gray-200/80 overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-shadow"
      >
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: account.cor_personalizada || '#e2e8f0' }} // Usa a cor ou um cinza
            >
              <Icon className="w-6 h-6" 
                style={{ color: account.issuer_id ? '#FFF' : '#334155' }} // Ícone branco se for logo, escuro se for genérico
              /> 
              {/* TODO: No futuro, trocar o Ícone pelo Logo do Banco (account.issuer_id) */}
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-900">{account.nome}</p>
              <p className="text-sm text-slate-600 capitalize">{account.tipo}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-slate-800">{saldoFormatado}</p>
            <p className="text-xs text-slate-500">Saldo atual</p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

// A Página de Contas (LISTA)
const Accounts = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { accounts, loading } = useAccounts(); 

  return (
    <>
      <Helmet>
        <title>Contas - FinanceApp</title>
      </Helmet>
      
      {/* O Modal de Adicionar Conta (Etapa 1: Seletor, Etapa 2: Formulário) */}
      <AddAccountModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <div className="space-y-8">
        {/* Cabeçalho da Página */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:justify-between md:items-center"
        >
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Contas</h1>
            <p className="text-gray-600 mt-1">Onde seu dinheiro está guardado.</p>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-700 hover:to-purple-700 mt-4 md:mt-0"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Conta
          </Button>
        </motion.div>

        {/* Lista de Contas */}
        {loading && (
          <p className="text-slate-600">Carregando contas...</p>
        )}
        
        {!loading && accounts.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <p className="text-slate-600 text-lg">Nenhuma conta cadastrada ainda.</p>
            <Button onClick={() => setIsModalOpen(true)} className="mt-4">
              Adicione sua primeira conta
            </Button>
          </motion.div>
        )}

        {!loading && accounts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {accounts.map(account => (
              <AccountListItem key={account.id} account={account} />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Accounts;