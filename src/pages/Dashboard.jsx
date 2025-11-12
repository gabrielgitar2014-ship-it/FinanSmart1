import React, { useState } from 'react';
import { motion } from 'framer-motion';
// Removido: ChevronLeft, ChevronRight
import { Plus, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { Helmet } from 'react-helmet';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { useTransactions } from '../hooks/useTransactions'; // Hook é chamado sem props
import { useAccounts } from '../hooks/useAccounts';
import { useCategories } from '../hooks/useCategories';
// Removido: import { useMonth } from '../contexts/MonthContext';
import AddTransactionModal from '../components/AddTransactionModal';
import TransactionsList from '../components/TransactionsList';

const Dashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // MUDANÇA: O hook é chamado sem props (startDate/endDate)
  // Ele vai pegar o contexto (useMonth) internamente.
  const { transactions } = useTransactions(); 
  
  const { accounts } = useAccounts();
  const { categories } = useCategories();

  // Esta lógica agora é dinâmica para o mês selecionado (via hook)
  const totalIncome = transactions
    .filter(t => t.tipo === 'income')
    .reduce((sum, t) => sum + parseFloat(t.valor || 0), 0);

  const totalExpense = transactions
    .filter(t => t.tipo === 'expense')
    .reduce((sum, t) => sum + parseFloat(t.valor || 0), 0);

  const balance = totalIncome - totalExpense;

  const recentTransactions = transactions.slice(0, 5);

  return (
    <>
      <Helmet>
        <title>Dashboard - Gerenciador Financeiro</title>
        <meta name="description" content="Visualize suas finanças e gerencie suas transações" />
      </Helmet>

      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:justify-between md:items-center"
        >
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
            {/* MUDANÇA: Seletor de mês removido daqui */}
            <p className="text-gray-600 mt-1">Visão geral das suas finanças</p>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-700 hover:to-purple-700 mt-4 md:mt-0"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Transação
          </Button>
        </motion.div>

        {/* Cards de Saldo (Tema Claro/Vidro) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-fuchsia-600/50 to-purple-100/50 backdrop-blur-lg border border-fuchsia-200/80">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-fuchsia-800">
                  Saldo Total
                </CardTitle>
                <Wallet className="w-4 h-4 text-fuchsia-700" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-fuchsia-950">
                  R$ {balance.toFixed(2)}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-green-600/50 to-emerald-100/50 backdrop-blur-lg border border-green-200/80">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-green-800">
                  Receitas
                </CardTitle>
                <TrendingUp className="w-4 h-4 text-green-700" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-950">
                  R$ {totalIncome.toFixed(2)}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-red-600/50 to-pink-100/50 backdrop-blur-lg border border-red-200/80">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-red-800">
                  Despesas
                </CardTitle>
                <TrendingDown className="w-4 h-4 text-red-700" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-950">
                  R$ {totalExpense.toFixed(2)}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Card de Transações (Vidro Neutro) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-white/75 backdrop-blur-lg border border-gray-200/80">
            <CardHeader>
              <CardTitle className="text-slate-900">Transações Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <TransactionsList transactions={recentTransactions} />
            </CardContent>
          </Card>
        </motion.div>

        {/* Modal de Transação */}
        <AddTransactionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          accounts={accounts}
          categories={categories}
        />
      </div>
    </>
  );
};

export default Dashboard;