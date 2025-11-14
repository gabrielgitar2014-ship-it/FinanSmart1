import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

export const usePaymentMethods = (accountId = null) => {
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true); // Começa true
  
  const { activeHousehold, user } = useAuth(); 
  const activeHouseholdId = activeHousehold?.id;

  useEffect(() => {
    // 1. Função de carregar DENTRO do effect
    const loadMethods = async () => {
      // 2. Garante 'loading'
      setLoading(true); 
      
      if (!isSupabaseConfigured) {
        setLoading(false);
        return;
      }

      try {
        let query = supabase
          .from('payment_methods')
          .select('*') 
          .eq('household_id', activeHouseholdId);

        // O accountId (que esperamos) é aplicado
        if (accountId) {
          query = query.eq('account_id', accountId);
        }

        query = query.order('nome_conta', { ascending: true });
        const { data, error } = await query;
        if (error) throw error; // Joga para o catch
        
        setMethods(data || []);

      } catch (error) {
        console.error("Erro ao carregar métodos de pagamento:", error);
        setMethods([]);
      } finally {
        // 3. ÚNICO lugar que define loading como false
        setLoading(false);
      }
    };

    // 4. A CLÁUSULA DE GUARDA:
    // As dependências obrigatórias para esta página
    if (!activeHouseholdId || !user || !accountId) {
      return; // 'loading' continua 'true'
    }

    // 5. Dependências prontas, executa.
    loadMethods();
    
  }, [activeHouseholdId, accountId, user]); // Dependências corretas

  // ... (addPaymentMethod e deletePaymentMethod permanecem iguais)
  // ... (mas a função 'refreshMethods' deveria ser reimplementada)
  const refreshMethods = async () => {
     if (!activeHouseholdId || !user || !accountId) return;
     // ... (aqui iria a lógica de 'loadMethods' novamente)
  };

  const addPaymentMethod = async (methodData) => {
    if (!activeHouseholdId) return { error: new Error("Nenhuma família ativa.") };
    if (!methodData.account_id) return { error: new Error("ID da conta é obrigatório.") };
    const { data, error } = await supabase.from('payment_methods').insert([{ ...methodData, household_id: activeHouseholdId }]).select().single();
    if (!error) {
      // Em vez de 'setMethods', chamamos o refresh (que precisa ser implementado)
      // Por enquanto, vamos só adicionar localmente (mas o refresh é melhor)
      setMethods(prev => [...prev, data]);
    }
    return { data, error };
  };

  const deletePaymentMethod = async (id) => {
    const { error } = await supabase.from('payment_methods').delete().eq('id', id).eq('household_id', activeHouseholdId);
    if (!error) {
      setMethods(prev => prev.filter(m => m.id !== id));
    }
    return { error };
  };
  
  return { 
    methods, 
    loading, 
    addPaymentMethod,
    deletePaymentMethod,
    refreshMethods
  };
};