import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { useMonth } from '../contexts/MonthContext'; // Usamos para disparar reloads

export const useAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { activeHousehold } = useAuth(); 
  const activeHouseholdId = activeHousehold?.id;
  
  // Usamos o MonthContext para que, se o mês mudar,
  // possamos (no futuro) recarregar os saldos.
  // Por enquanto, ele garante que o hook se atualize.
  const { startDate, endDate } = useMonth();

  const loadAccounts = async () => {
    if (!activeHouseholdId) {
      setLoading(false);
      return; 
    }

    if (!isSupabaseConfigured) {
      // TODO: Lógica de mock aqui (não implementada)
      setLoading(false);
      return;
    }

    // A consulta agora aponta para a nova tabela 'accounts'
    const { data, error } = await supabase
      .from('accounts') // ✅ Correto
      .select('*') 
      .eq('household_id', activeHouseholdId)
      .order('nome', { ascending: true }); // Ordena pelo nome da conta

    if (!error) {
      setAccounts(data || []);
    } else {
      console.error("Erro ao carregar contas (accounts):", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadAccounts();
  }, [activeHouseholdId, startDate, endDate]); 

  // --- Funções de Escrita (CRUD) ---

  const addAccount = async (accountData) => {
    if (!activeHouseholdId) return { error: new Error("Nenhuma família ativa.") };

    // Garante que o tipo é válido para esta tabela
    const validTypes = ['checking', 'savings', 'investment', 'cash'];
    if (!validTypes.includes(accountData.tipo)) {
      return { error: new Error("Tipo de conta inválido.") };
    }

    const { data, error } = await supabase
      .from('accounts')
      .insert([
        { 
          ...accountData, 
          household_id: activeHouseholdId 
        }
      ])
      .select()
      .single();

    if (!error) {
      setAccounts(prev => [...prev, data]); // Adiciona ao estado local
    }
    return { data, error };
  };

  const updateAccount = async (id, updates) => {
    const { data, error } = await supabase
      .from('accounts')
      .update(updates)
      .eq('id', id)
      .eq('household_id', activeHouseholdId)
      .select()
      .single();

    if (!error) {
      setAccounts(prev => 
        prev.map(acc => (acc.id === id ? data : acc))
      );
    }
    return { data, error };
  };

  const deleteAccount = async (id) => {
    const { error } = await supabase
      .from('accounts')
      .delete()
      .eq('id', id)
      .eq('household_id', activeHouseholdId);

    if (!error) {
      setAccounts(prev => prev.filter(acc => acc.id !== id));
    }
    return { error };
  };

  return { 
    accounts, 
    loading, 
    addAccount,
    updateAccount,
    deleteAccount,
    refreshAccounts: loadAccounts 
  };
};