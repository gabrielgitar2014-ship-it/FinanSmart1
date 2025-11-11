import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { Helmet } from 'react-helmet';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { useTransactions } from '../hooks/useTransactions';
import { useAccounts } from '../hooks/useAccounts';
import { useCategories } from '../hooks/useCategories';
import AddTransactionModal from '../components/AddTransactionModal';
import TransactionsList from '../components/TransactionsList';

const Dashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { transactions } = useTransactions();
  const { accounts } = useAccounts();
  const { categories } = useCategories();

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

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
          className="flex justify-between items-center"
        >
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-gray-400 mt-1">Visão geral das suas finanças</p>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Transação
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-blue-600 to-cyan-600 border-0">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-white/90">
                  Saldo Total
                </CardTitle>
                <Wallet className="w-4 h-4 text-white/90" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">
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
            <Card className="bg-gradient-to-br from-green-600 to-emerald-600 border-0">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-white/90">
                  Receitas
                </CardTitle>
                <TrendingUp className="w-4 h-4 text-white/90" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">
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
            <Card className="bg-gradient-to-br from-red-600 to-pink-600 border-0">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-white/90">
                  Despesas
                </CardTitle>
                <TrendingDown className="w-4 h-4 text-white/90" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">
                  R$ {totalExpense.toFixed(2)}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Transações Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <TransactionsList transactions={recentTransactions} />
            </CardContent>
          </Card>
        </motion.div>

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