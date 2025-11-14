import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { 
  TrendingUp, TrendingDown, Lightbulb, TrendingUp as InvestmentUp, PlusCircle,
  ShieldCheck, AlertTriangle, AlertCircle, Ban 
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';

// ========================================================================
// LÓGICA CORRIGIDA: Importando AMBOS os hooks, como dita a arquitetura
// ========================================================================
import { useTransactions } from '../hooks/useTransactions'; // Apenas Despesas
import { useAccounts } from '../hooks/useAccounts';         // Para Renda (Saldo Inicial)
import { useCategories } from '../hooks/useCategories';

import AddTransactionModal from '../components/AddTransactionModal';
import TransactionsList from '../components/TransactionsList';

// Componente EmptyState (sem alteração)
const EmptyState = ({ icon: Icon, title, description, actionButton }) => (
  <div className="flex flex-col items-center justify-center p-8 text-center text-gray-500 bg-white rounded-xl shadow-inner border border-dashed border-gray-200">
    {Icon && <Icon className="w-12 h-12 text-gray-400 mb-4" />}
    <p className="text-lg font-semibold text-gray-700 mb-2">{title}</p>
    <p className="text-sm text-gray-500 mb-4">{description}</p>
    {actionButton && (
      <Button variant="outline" onClick={actionButton.onClick} className="mt-2">
        {actionButton.text}
      </Button>
    )}
  </div>
);

// Função Auxiliar BRL (sem alteração)
function formatBRL(value) {
  try {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value || 0);
  } catch (_) {
    return `R$ ${parseFloat(value || 0).toFixed(2)}`;
  }
}

// Helper para o Sistema de Alertas (sem alteração na lógica)
const getAlertStyle = (ratio, totalIncome) => {
  const ratioPercent = ratio.toFixed(0);

  if (totalIncome === 0) {
    return {
      label: 'Nenhuma renda registrada',
      icon: <AlertTriangle className="w-4 h-4 text-yellow-300" />,
      className: 'text-yellow-300',
      percent: ''
    };
  }
  
  if (ratio === 0) {
      return {
      label: 'Seguro',
      icon: <ShieldCheck className="w-4 h-4 text-green-300" />,
      className: 'text-green-300',
      percent: `(0%)`
    };
  }

  // < 65% (Verde)
  if (ratio < 65) {
    return {
      label: 'Seguro',
      icon: <ShieldCheck className="w-4 h-4 text-green-300" />,
      className: 'text-green-300',
      percent: `(${ratioPercent}%)`
    };
  }
  // 65% - 74.9% (Laranja/Amarelo)
  if (ratio < 75) {
    return {
      label: 'Atenção',
      icon: <AlertTriangle className="w-4 h-4 text-yellow-300" />,
      className: 'text-yellow-300',
      percent: `(${ratioPercent}%)`
    };
  }
  // 75% - 94.9% (Vermelho)
  if (ratio < 95) {
    return {
      label: 'Perigo',
      icon: <AlertCircle className="w-4 h-4 text-red-300" />,
      className: 'text-red-300',
      percent: `(${ratioPercent}%)`
    };
  }
  // >= 95% (Preto/Crítico)
  return {
    label: 'Crítico',
    icon: <Ban className="w-4 h-4 text-white" />,
    className: 'text-white text-xs font-bold px-2 py-0.5 bg-gray-900/80 rounded-full', 
    percent: `(${ratioPercent}%)`
  };
};


// Componente Gráfico (sem alteração)
const CategoryChart = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  if (total === 0) {
    return (
      <EmptyState
        icon={Lightbulb}
        title="Comece a Registrar Despesas!"
        description="Seus gastos aparecerão aqui em um lindo gráfico."
      />
    );
  }
  
  const chartData = data.filter(item => item.value > 0);
  let currentAngle = 0;

  return (
    <div className="flex flex-col md:flex-row items-center justify-center p-4 gap-6">
      <div className="w-36 h-36 rounded-full bg-gray-100 relative flex items-center justify-center">
        <svg className="w-full h-full" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="50" cy="50" r="40" fill="transparent" stroke="#e5e7eb" strokeWidth="10" />
          {chartData.map((item, index) => {
            const sliceAngle = (item.value / total) * 360;
            const startAngle = currentAngle;
            currentAngle += sliceAngle;
            const endAngle = currentAngle;
            const x1 = 50 + 40 * Math.cos(Math.PI * startAngle / 180);
            const y1 = 50 + 40 * Math.sin(Math.PI * startAngle / 180);
            const x2 = 50 + 40 * Math.cos(Math.PI * endAngle / 180);
            const y2 = 50 + 40 * Math.sin(Math.PI * endAngle / 180);
            const largeArcFlag = sliceAngle > 180 ? 1 : 0;
            return (
              <path
                key={item.category}
                d={`M ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`}
                fill="transparent"
                stroke={item.color}
                strokeWidth="10"
              />
            );
          })}
        </svg>
        <div className="absolute w-20 h-20 bg-white rounded-full" />
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-700">
        {chartData.map((item) => (
          <div key={item.category} className="flex items-center">
            <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></span>
            {item.category}
          </div>
        ))}
      </div>
    </div>
  );
};


// --- Componente Principal do Dashboard (LÓGICA CORRIGIDA) ---

const Dashboard = () => {
  const [isAddTransactionModalOpen, setIsAddTransactionModalOpen] = useState(false);
  
  // ========================================================================
  // LÓGICA CORRIGIDA: Usando os hooks corretos para cada total
  // ========================================================================
  const { transactions } = useTransactions(); // Hook de Despesas
  const { accounts } = useAccounts();         // Hook de Contas
  const { categories } = useCategories();
  
  // Calcula Renda (baseado no saldo_inicial das contas)
  const totalIncome = useMemo(() => {
    // Esta é a lógica correta, baseada no seu useAccounts.js
    return accounts.reduce((sum, acc) => sum + parseFloat(acc.saldo_inicial || 0), 0);
  }, [accounts]); // Recalcula quando as contas mudam

  // Calcula Despesa (baseado no useTransactions)
  const totalExpense = useMemo(() => {
    // Esta é a lógica correta, baseada no seu useTransactions.js
    return transactions.reduce((sum, t) => sum + parseFloat(t.valor || 0), 0);
  }, [transactions]); // Recalcula quando as transações (despesas) mudam

  // Calcula Saldo e Ratio
  const { balance, ratio } = useMemo(() => {
    const balanceCalc = totalIncome - totalExpense;
    let ratioCalc = 0;
    if (totalIncome > 0) {
      ratioCalc = (totalExpense / totalIncome) * 100;
    }
    return { balance: balanceCalc, ratio: ratioCalc };
  }, [totalIncome, totalExpense]);


  // Gráfico de Categorias (só usa 'transactions', que já são despesas)
  const categoryExpenses = useMemo(() => {
    const expenseMap = new Map();
    // Não precisa filtrar por tipo, useTransactions já fez isso
    transactions.forEach(t => { 
      const categoryName = t.categories?.nome || 'Outros';
      const categoryColor = t.categories?.color_hex || '#A1A1AA';
      const value = parseFloat(t.valor || 0);
      if (expenseMap.has(categoryName)) {
        expenseMap.get(categoryName).value += value;
      } else {
        expenseMap.set(categoryName, { category: categoryName, value, color: categoryColor });
      }
    });
    return Array.from(expenseMap.values());
  }, [transactions]);

  // Chama o helper de Alerta
  const alertStyle = getAlertStyle(ratio, totalIncome);


  return (
    <>
      <Helmet>
        <title>Dashboard - FinanSmart</title>
      </Helmet>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-3xl mx-auto bg-white/95 backdrop-blur-lg border border-gray-200/80 rounded-3xl shadow-lg p-6 sm:p-8 space-y-8"
      >
        {/* Cabeçalho */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-slate-900 text-center flex-1">
            Dashboard
          </h1>
        </div>

        {/* Card de Saldo Total (Com Alerta) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="w-full rounded-2xl p-6 text-center 
                     bg-gradient-to-br from-blue-600 to-blue-800 
                     shadow-xl shadow-blue-200/50 transform hover:scale-[1.01] transition-transform duration-300 ease-out"
        >
          <p className="text-sm font-medium text-blue-200 uppercase tracking-wider">Saldo Total</p>
          <p className="text-4xl sm:text-5xl font-bold text-white mt-2">
            {/* Usa o 'balance' calculado pela nova lógica */}
            {formatBRL(balance)}
          </p>
          
          {/* UI do Sistema de Alertas */}
          <div className="flex items-center justify-center gap-2 mt-4 text-sm">
            {alertStyle.icon}
            <span className={alertStyle.className}>
              {alertStyle.label} {alertStyle.percent}
            </span>
          </div>
        </motion.div>

        {/* Cards de Renda/Despesa */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Card className="bg-white rounded-xl shadow-md border border-gray-100 h-full transform hover:scale-[1.02] transition-transform duration-200 ease-out">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                {/* O título agora reflete a origem do dado */}
                <CardTitle className="text-sm font-medium text-gray-500">Renda</CardTitle>
                <TrendingUp className="h-5 w-5 text-green-600" />
              </CardHeader>
              <CardContent>
                {/* Usa o 'totalIncome' vindo de useAccounts */}
                <p className="text-2xl font-bold text-green-600">{formatBRL(totalIncome)}</p>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Card className="bg-white rounded-xl shadow-md border border-gray-100 h-full transform hover:scale-[1.02] transition-transform duration-200 ease-out">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Despesas (Mês)</CardTitle>
                <TrendingDown className="h-5 w-5 text-red-600" />
              </CardHeader>
              <CardContent>
                 {/* Usa o 'totalExpense' vindo de useTransactions */}
                <p className="text-2xl font-bold text-red-600">{formatBRL(totalExpense)}</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Gráfico de Categorias */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="w-full"
        >
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Gastos por Categoria</h2>
          <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
            <CardContent className="pt-6">
              <CategoryChart data={categoryExpenses} />
            </CardContent>
          </Card>
        </motion.div>

        {/* Transações Recentes */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="w-full"
        >
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Transações Recentes (Despesas)</h2>
          <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
            <CardContent className="p-0">
              {transactions.length > 0 ? (
                <TransactionsList transactions={transactions.slice(0, 5)} />
              ) : (
                <EmptyState
                  icon={PlusCircle}
                  title="Nenhuma despesa registrada."
                  description="Clique no '+' na barra de navegação para adicionar sua primeira despesa."
                  actionButton={{
                    text: "Adicionar Despesa",
                    onClick: () => setIsAddTransactionModalOpen(true)
                  }}
                />
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Insights da IA (sem alteração) */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="w-full"
        >
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Insights da IA</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-white rounded-xl shadow-sm border border-gray-100 h-full">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Lightbulb className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Economize R$300 este mês consolidando assinaturas.</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white rounded-xl shadow-sm border border-gray-100 h-full">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <InvestmentUp className="w-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Seu potencial de investimento aumentou 5%.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

      </motion.div>

      {/* Modal (sem alteração) */}
      <AddTransactionModal
        isOpen={isAddTransactionModalOpen}
        onClose={() => setIsAddTransactionModalOpen(false)}
        categories={categories}
      />
    </>
  );
};

export default Dashboard;