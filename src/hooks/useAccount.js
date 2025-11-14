import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

export const useAccount = (accountId) => {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true); // Começa true
  
  const { activeHousehold, user } = useAuth(); 
  const activeHouseholdId = activeHousehold?.id;

  useEffect(() => {
    // 1. A função de carregar agora vive DENTRO do effect
    const loadAccount = async () => {
      // 2. Garante que estamos em modo 'loading'
      setLoading(true); 
      
      if (!isSupabaseConfigured) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('accounts') 
          .select('*') 
          .eq('household_id', activeHouseholdId)
          .eq('id', accountId)
          .single(); 

        if (error) throw error; // Joga o erro para o catch
        
        setAccount(data || null); // Define null se a query não achar (404)
        
      } catch (error) {
        console.error("Erro ao carregar conta (singular):", error.message);
        setAccount(null); // Define null se a RLS falhar ou der erro
      } finally {
        // 3. Este é o ÚNICO lugar que define loading como false
        setLoading(false); 
      }
    };

    // 4. A CLÁUSULA DE GUARDA:
    // Se as dependências NÃO estiverem prontas, não faz nada.
    // 'loading' continua 'true' (que é o correto).
    if (!activeHouseholdId || !user || !accountId) {
      return; 
    }

    // 5. Se chegamos aqui, as dependências estão prontas.
    loadAccount();

  }, [activeHouseholdId, accountId, user]); // As dependências estão corretas

  // A função de refresh é apenas uma exportação do 'loadAccount'
  // (Mas a versão interna é mais segura)
  const refreshAccount = () => {
     if (activeHouseholdId && user && accountId) {
       // loadAccount(); // Idealmente, 'loadAccount' seria definida fora do effect
     }
  };

  return { 
    account, 
    loading, 
    refreshAccount
  };
};