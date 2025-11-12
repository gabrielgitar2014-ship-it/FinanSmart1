import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { useMonth } from '../contexts/MonthContext'; 

// 👇 SUBSTITUA ESTE VALOR PELO ID DA CATEGORIA 'SALDO INICIAL' QUE VOCÊ CRIOU! 👇
const INITIAL_BALANCE_CATEGORY_ID = "00000000-0000-0000-0000-000000000000"; 

export const useAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { activeHousehold, user } = useAuth(); 
  const activeHouseholdId = activeHousehold?.id;
  
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

    const { data, error } = await supabase
      .from('accounts') 
      .select('*') 
      .eq('household_id', activeHouseholdId)
      .order('nome', { ascending: true }); 

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
    if (!activeHouseholdId || !user) return { error: new Error("Usuário ou família não carregados.") };

    // 1. Inserir a nova conta na tabela 'accounts'
    const { data: newAccount, error: accountError } = await supabase
      .from('accounts')
      .insert([
        { 
          ...accountData, 
          household_id: activeHouseholdId 
        }
      ])
      .select()
      .single();

    if (accountError) return { error: accountError };
    
    // 2. CRIAR TRANSAÇÃO DE SALDO INICIAL (CORREÇÃO DO DASHBOARD)
    if (newAccount && newAccount.saldo_inicial > 0) {
        
        if (INITIAL_BALANCE_CATEGORY_ID === "00000000-0000-0000-0000-000000000000") {
             return { error: new Error("ERRO DE CONFIGURAÇÃO: Por favor, crie a Categoria 'Saldo Inicial' no Supabase e cole o ID correto.") };
        }

        // A transação é ligada à Conta (accounts.id) através da coluna 'payment_method_id' 
        const paymentMethodId = newAccount.id; 

        const { error: transactionError } = await supabase
            .from('transactions')
            .insert({
                household_id: activeHouseholdId,
                user_id: user.id,
                payment_method_id: paymentMethodId, // Liga a transação à nova conta (que agirá como método de pagamento)
                category_id: INITIAL_BALANCE_CATEGORY_ID, 
                descricao: `Saldo Inicial da Conta: ${newAccount.nome}`,
                valor: newAccount.saldo_inicial,
                data: new Date().toISOString().split("T")[0],
                tipo: 'income',
                is_recorrente: false,
            });

        if (transactionError) return { error: transactionError };
    }


    // 3. Atualizar o estado local e retornar sucesso
    setAccounts(prev => [...prev, newAccount]);
    return { data: newAccount, error: null };
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
