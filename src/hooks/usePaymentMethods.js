import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

// Este hook busca MÉTODOS DE PAGAMENTO (cartões, etc.)
// Ele pode opcionalmente ser filtrado por uma account_id
export const usePaymentMethods = (accountId = null) => {
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { activeHousehold } = useAuth(); 
  const activeHouseholdId = activeHousehold?.id;

  const loadMethods = async () => {
    if (!activeHouseholdId) {
      setLoading(false);
      return; 
    }
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    let query = supabase
      .from('payment_methods')
      .select('*') 
      .eq('household_id', activeHouseholdId);

    // Se um accountId for fornecido, filtra por ele
    if (accountId) {
      query = query.eq('account_id', accountId);
    }

    query = query.order('nome', { ascending: true });

    const { data, error } = await query;

    if (!error) {
      setMethods(data || []);
    } else {
      console.error("Erro ao carregar métodos de pagamento:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadMethods();
  }, [activeHouseholdId, accountId]); 

  const addPaymentMethod = async (methodData) => {
    if (!activeHouseholdId) return { error: new Error("Nenhuma família ativa.") };
    if (!methodData.account_id) return { error: new Error("ID da conta é obrigatório.") };

    const { data, error } = await supabase
      .from('payment_methods')
      .insert([
        { 
          ...methodData, 
          household_id: activeHouseholdId 
        }
      ])
      .select()
      .single();

    if (!error) {
      setMethods(prev => [...prev, data]);
    }
    return { data, error };
  };

  // Funções update e delete (podem ser adicionadas depois)

  return { 
    methods, 
    loading, 
    addPaymentMethod,
    refreshMethods: loadMethods 
  };
};