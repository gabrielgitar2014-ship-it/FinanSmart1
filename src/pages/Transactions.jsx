// src/pages/Transactions.jsx

import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { useTransactions } from '../hooks/useTransactions';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button'; // (Para os filtros)
import { 
  startOfToday, 
  endOfToday, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  format 
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Componente de Item da Lista (para replicar o visual da imagem)
const TransactionItem = ({ transaction }) => {
  const { categories, description, data, valor, tipo } = transaction;
  
  // Define a cor com base no tipo
  const amountColor = tipo === 'income' ? 'text-green-600' : 'text-red-600';
  
  // Pega a cor e o ícone da categoria (você precisará de um componente de Ícone)
  // Por enquanto, usaremos um placeholder
  const categoryColor = categories?.color_hex || '#3b82f6'; // Azul padrão

  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0">
      <div className="flex items-center gap-3">
        {/* Círculo do Ícone */}
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${categoryColor}20` }} // Cor com 20% de opacidade
        >
          {/* Aqui você renderizaria um ícone baseado em 'categories.icon_name' */}
          <span style={{ color: categoryColor }}>{categories?.nome[0] || '?'}</span>
        </div>
        <div>
          <p className="font-semibold text-slate-800">{description}</p>
          <p className="text-sm text-gray-500">
            {format(new Date(data + 'T12:00:00'), "dd 'de' LLLL, yyyy", { locale: ptBR })}
          </p>
        </div>
      </div>
      <p className={`font-bold text-lg ${amountColor}`}>
        {tipo === 'expense' && '-'}{/* Adiciona sinal de menos para despesa */}
        R$ {parseFloat(valor).toFixed(2)}
      </p>
    </div>
  );
};


// Componente da Página Principal
const Transactions = () => {
  const [filter, setFilter] = useState('mes'); // 'hoje', 'semana', 'mes', 'todas'

  // 1. Calcula o 'startDate' e 'endDate' com base no filtro
  const { startDate, endDate, summaryLabel } = useMemo(() => {
    const today = new Date();
    switch (filter) {
      case 'hoje':
        return {
          startDate: format(startOfToday(), 'yyyy-MM-dd'),
          endDate: format(endOfToday(), 'yyyy-MM-dd'),
          summaryLabel: 'Total de hoje'
        };
      case 'semana':
        return {
          startDate: format(startOfWeek(today, { locale: ptBR }), 'yyyy-MM-dd'),
          endDate: format(endOfWeek(today, { locale: ptBR }), 'yyyy-MM-dd'),
          summaryLabel: 'Total desta semana'
        };
      case 'todas':
        return {
          startDate: '1970-01-01', // Data bem antiga
          endDate: format(addYears(today, 10), 'yyyy-MM-dd'), // Data bem futura
          summaryLabel: 'Total'
        };
      case 'mes':
      default:
        return {
          startDate: format(startOfMonth(today), 'yyyy-MM-dd'),
          endDate: format(endOfMonth(today), 'yyyy-MM-dd'),
          summaryLabel: 'Total este mês'
        };
    }
  }, [filter]);

  // 2. Chama o hook atualizado com as datas
  const { transactions, loading } = useTransactions({ startDate, endDate });

  // 3. Calcula os totais
  const totalDespesas = transactions
    .filter(t => t.tipo === 'expense')
    .reduce((sum, t) => sum + parseFloat(t.valor || 0), 0);

  // Filtros
  const filters = [
    { label: 'Hoje', value: 'hoje' },
    { label: 'Esta Semana', value: 'semana' },
    { label: 'Este Mês', value: 'mes' },
    { label: 'Todas', value: 'todas' },
  ];
  
  return (
    <>
      <Helmet>
        <title>Transações - FinanceApp</title>
      </Helmet>

      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-slate-900">Transações</h1>
        
        {/* Botões de Filtro */}
        <div className="flex space-x-2">
          {filters.map(f => (
            <Button
              key={f.value}
              variant={filter === f.value ? 'default' : 'outline'}
              onClick={() => setFilter(f.value)}
              className={filter === f.value ? 'bg-blue-600 text-white' : 'text-slate-700'}
            >
              {f.label}
            </Button>
          ))}
        </div>

        {/* Card de Transações */}
        <Card className="bg-white/75 backdrop-blur-lg border border-gray-200/80">
          <CardHeader>
            <CardTitle className="text-slate-900">
              {summaryLabel}: 
              <span className="text-red-600 ml-2">R$ {totalDespesas.toFixed(2)}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading && <p className="text-gray-500">Carregando...</p>}
            
            {!loading && transactions.length === 0 && (
              <p className="text-gray-500 text-center py-8">Nenhuma transação encontrada para este período.</p>
            )}
            
            {!loading && transactions.length > 0 && (
              <div className="flex flex-col">
                {transactions.map(t => (
                  <TransactionItem key={t.id} transaction={t} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Transactions;