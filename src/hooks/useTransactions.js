import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { useMonth } from '../contexts/MonthContext'; // 1. Importar o useMonth

// 2. O hook não recebe mais props de data
export const useTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { activeHousehold, user } = useAuth(); 
  const activeHouseholdId = activeHousehold?.id;
  
  // 3. Pegar as datas de dentro do hook
  const { startDate, endDate } = useMonth();

  const loadTransactions = async () => {
    // 4. A guarda de proteção usa o startDate/endDate interno
    if (!activeHouseholdId || !user || !startDate || !endDate) {
      setLoading(false);
      return;
    }

    if (!isSupabaseConfigured) {
      const mockTransactions = JSON.parse(localStorage.getItem(`transactions_${activeHouseholdId}`) || '[]');
      // TODO: A lógica de mock precisaria ser atualizada para filtrar por data
      setTransactions(mockTransactions);
      setLoading(false);
      return;
    }

    // 5. A consulta usa os filtros de data internos
    const { data, error } = await supabase
      .from('transactions')
      .select('*, accounts(*), categories(*)')
      .eq('household_id', activeHouseholdId)
      .gte('data', startDate) // Usa o startDate do useMonth
      .lte('data', endDate)   // Usa o endDate do useMonth
      .order('data', { ascending: false }); 

    if (!error) {
      setTransactions(data || []);
    } else {
      console.error("Erro ao carregar transações:", error);
    }
    setLoading(false);
  };

  // 6. O useEffect depende do startDate/endDate interno
  useEffect(() => {
    loadTransactions();
  }, [activeHouseholdId, user, startDate, endDate]); 

  const addTransaction = async (transaction) => {
    if (!activeHouseholdId || !user) return { error: new Error("Usuário ou família não carregados.") };

    if (!isSupabaseConfigured) {
      const newTransaction = { ...transaction, id: Date.now().toString(), household_id: activeHouseholdId, user_id: user.id };
      const updated = [newTransaction, ...transactions];
      localStorage.setItem(`transactions_${activeHouseholdId}`, JSON.stringify(updated));
      setTransactions(updated);
      return { data: newTransaction, error: null };
    }

    const { data, error } = await supabase
      .from('transactions')
      .insert([{ ...transaction, household_id: activeHouseholdId, user_id: user.id }]) 
      .select('*, accounts(*), categories(*)')
      .single();

    if (!error) {
      // Recarrega as transações (ele vai usar o mês atual)
      await loadTransactions();
    }
    return { data, error };
  };

  const updateTransaction = async (id, updates) => {
    if (!activeHouseholdId) return { error: new Error("Nenhuma família ativa.") };

    if (!isSupabaseConfigured) {
      // ... (lógica de mock) ...
    }

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

    if (!isSupabaseConfigured) {
      // ... (lógica de mock) ...
    }

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('household_id', activeHouseholdId); 

    if (!error) {
      setTransactions(transactions.filter(t => t.id !== id));
    }
    return { error };
  };

  return { transactions, loading, addTransaction, updateTransaction, deleteTransaction, refreshTransactions: loadTransactions };
};