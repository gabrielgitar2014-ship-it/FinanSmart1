// src/contexts/MonthContext.jsx

import React, { createContext, useContext, useState, useMemo } from 'react';
import { 
  startOfMonth, // Pega o primeiro dia do mês
  endOfMonth,   // Pega o último dia do mês
  addMonths,    // Adiciona meses
  subMonths,    // Subtrai meses
  format        // Formata a data
} from 'date-fns';
import { ptBR } from 'date-fns/locale'; // Para formatar em português (ex: "Novembro")

const MonthContext = createContext({});

export const MonthProvider = ({ children }) => {
  // 1. Armazena a data de referência (sempre o dia 1º, para evitar bugs)
  const [selectedDate, setSelectedDate] = useState(startOfMonth(new Date()));

  // 2. Funções para navegar entre os meses
  const nextMonth = () => {
    setSelectedDate(prevDate => addMonths(prevDate, 1));
  };

  const previousMonth = () => {
    setSelectedDate(prevDate => subMonths(prevDate, 1));
  };
  
  // Função para pular para um mês específico (ex: um date picker)
  const setMonth = (date) => {
    setSelectedDate(startOfMonth(date));
  };

  // 3. Os valores derivados (A MÁGICA ACONTECE AQUI)
  // Usamos 'useMemo' para recalcular isso apenas quando 'selectedDate' mudar.
  const { startDate, endDate, displayMonth } = useMemo(() => {
    // Pega o primeiro momento do mês (ex: 1 de Nov, 00:00:00)
    const start = startOfMonth(selectedDate);
    
    // Pega o último momento do mês (ex: 30 de Nov, 23:59:59)
    const end = endOfMonth(selectedDate);

    return {
      // Formata como YYYY-MM-DD. O Supabase entende isso perfeitamente
      // e não se confunde com fuso horário.
      startDate: format(start, 'yyyy-MM-dd'),
      endDate: format(end, 'yyyy-MM-dd'),
      
      // Formata um texto amigável para o usuário (ex: "Novembro de 2025")
      displayMonth: format(selectedDate, "LLLL 'de' yyyy", { locale: ptBR }),
    };
  }, [selectedDate]); // Recalcula quando a data mudar

  // 4. Fornece os valores para o resto do app
  const value = {
    selectedDate, // O objeto Date (dia 1º do mês)
    startDate,    // String 'yyyy-MM-dd' do início
    endDate,      // String 'yyyy-MM-dd' do fim
    displayMonth, // String "Novembro de 2025"
    nextMonth,
    previousMonth,
    setMonth,
  };

  return <MonthContext.Provider value={value}>{children}</MonthContext.Provider>;
};

// Hook customizado para consumir o contexto
export const useMonth = () => {
  const context = useContext(MonthContext);
  if (!context) {
    throw new Error('useMonth deve ser usado dentro de um MonthProvider');
  }
  return context;
};