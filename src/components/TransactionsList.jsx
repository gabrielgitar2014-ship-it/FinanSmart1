import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { useAccounts } from '../hooks/useAccounts';
import { useCategories } from '../hooks/useCategories';

const TransactionsList = ({ transactions }) => {
  const { accounts } = useAccounts();
  const { categories } = useCategories();

  const getAccountName = (accountId) => {
    const account = accounts.find(a => a.id === accountId);
    return account?.name || 'Conta desconhecida';
  };

  const getCategoryInfo = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category || { name: 'Sem categoria', color: '#6b7280' };
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        Nenhuma transação encontrada
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((transaction, index) => {
        const category = getCategoryInfo(transaction.category_id);
        const isIncome = transaction.type === 'income';

        return (
          <motion.div
            key={transaction.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <div className="flex items-center space-x-4">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: category.color }}
              >
                {isIncome ? (
                  <TrendingUp className="w-6 h-6 text-white" />
                ) : (
                  <TrendingDown className="w-6 h-6 text-white" />
                )}
              </div>
              <div>
                <p className="font-medium text-white">{transaction.description}</p>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <span>{category.name}</span>
                  <span>•</span>
                  <span>{getAccountName(transaction.account_id)}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className={`font-semibold ${isIncome ? 'text-green-400' : 'text-red-400'}`}>
                {isIncome ? '+' : '-'} R$ {parseFloat(transaction.amount).toFixed(2)}
              </p>
              <div className="flex items-center justify-end space-x-1 text-sm text-gray-400">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(transaction.date)}</span>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default TransactionsList;