import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

// Este hook gerencia a tabela 'accounts' (Contas principais: Itaú, Caixa, etc.)
export const useAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { activeHousehold, user } = useAuth(); // Adiciona 'user'
  const activeHouseholdId = activeHousehold?.id;

  // useCallback garante que a função 'loadAccounts' não seja recriada
  // a menos que suas dependências (como 'activeHouseholdId') mudem.
  const loadAccounts = useCallback(async () => {
    // Cláusula de guarda: Só executa se tudo estiver pronto.
    if (!activeHouseholdId || !user) {
      setLoading(false);
      return; 
    }
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    setLoading(true); // Define o loading ANTES da chamada
    
    try {
      // Busca da nova tabela 'accounts'
      const { data, error } = await supabase
        .from('accounts') 
        .select('*') 
        .eq('household_id', activeHouseholdId)
        .order('nome', { ascending: true }); 

      if (error) throw error; // Joga para o catch

      setAccounts(data || []);
      
    } catch (error) {
      console.error("Erro ao carregar contas (accounts):", error.message);
      setAccounts([]); // Reseta em caso de erro
    } finally {
      setLoading(false); // Garante que o loading para
    }
  }, [activeHouseholdId, user]); // Dependências da função

  
  // Efeito que roda a função 'loadAccounts'
  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]); // A dependência é a própria função 'loadAccounts'


  // Função de ATUALIZAR (usada pelo AddAccountModal no modo 'Editar')
  const updateAccount = async (id, updates) => {
    const { data, error } = await supabase
      .from('accounts')
      .update(updates)
      .eq('id', id)
      .eq('household_id', activeHouseholdId)
      .select()
      .single();
      
    if (!error) {
      // Atualiza o estado local para reatividade imediata
      setAccounts(prev => prev.map(acc => (acc.id === id ? data : acc)));
    }
    return { data, error };
  };

  // Função de EXCLUIR (usada pelo AlertDialog na página Accounts)
  const deleteAccount = async (id) => {
    // Graças ao 'ON DELETE CASCADE', apagar a conta
    // apaga todos os payment_methods e transactions associados.
    const { error } = await supabase
      .from('accounts')
      .delete()
      .eq('id', id)
      .eq('household_id', activeHouseholdId);
      
    if (!error) {
      // Atualiza o estado local para reatividade imediata
      setAccounts(prev => prev.filter(acc => acc.id !== id));
    }
    return { error };
  };

  return { 
    accounts, 
    loading, 
    updateAccount,       // Para o modo 'Editar'
    deleteAccount,       // Para o 'AlertDialog'
    refreshAccounts: loadAccounts // Para o modo 'Criar'
  };
};