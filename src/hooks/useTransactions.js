import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { useMonth } from '../contexts/MonthContext'; 

// Este hook gerencia APENAS DESPESAS
export const useTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { activeHousehold, user } = useAuth(); 
  const activeHouseholdId = activeHousehold?.id;
  
  const { startDate, endDate } = useMonth();

  const loadTransactions = async () => {
    if (!activeHouseholdId || !user || !startDate || !endDate) {
      setLoading(false);
      return;
    }
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    // Busca apenas 'expense' e faz join com 'payment_methods'
    const { data, error } = await supabase
      .from('transactions')
      .select('*, payment_methods(*), categories(*)') 
      .eq('household_id', activeHouseholdId)
      .eq('tipo', 'expense') // SÓ PEGA DESPESAS
      .gte('data', startDate) 
      .lte('data', endDate)   
      .order('data', { ascending: false });

    if (!error) {
      setTransactions(data || []);
    } else {
      console.error("Erro ao carregar transações (despesas):", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadTransactions();
  }, [activeHouseholdId, user, startDate, endDate]); 

  // Esta função agora é 'addExpense'
  const addTransaction = async (transactionData) => {
    if (!activeHouseholdId || !user) return { error: new Error("Usuário ou família não carregados.") };
    if (!transactionData.payment_method_id) return { error: new Error("Método de Pagamento é obrigatório.")};

    const dataToInsert = {
      ...transactionData,
      household_id: activeHouseholdId,
      user_id: user.id,
      tipo: 'expense' // Força o tipo para 'expense'
    };

    const { data, error } = await supabase
      .from('transactions')
      .insert([dataToInsert]) 
      .select('*, payment_methods(*), categories(*)')
      .single();

    if (!error) {
      await loadTransactions();
    }
    return { data, error };
  };
  
  const updateTransaction = async (id, updates) => {
      if (!activeHouseholdId) return { error: new Error("Nenhuma família ativa.") };
      
      const { error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id)
        .eq('household_id', activeHouseholdId);

      if (!error) {
        await loadTransactions();
      }
      return { error };
  };

  const deleteTransaction = async (id) => {
    if (!activeHouseholdId) return { error: new Error("Nenhuma família ativa.") };

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('household_id', activeHouseholdId); 

    if (!error) {
      await loadTransactions();
    }
    return { error };
  };

  return { transactions, loading, addTransaction, updateTransaction, deleteTransaction, refreshTransactions: loadTransactions };
};