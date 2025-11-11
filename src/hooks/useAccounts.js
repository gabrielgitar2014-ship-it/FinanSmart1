import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

export const useAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const loadAccounts = async () => {
    if (!user) return;

    if (!isSupabaseConfigured()) {
      const mockAccounts = JSON.parse(localStorage.getItem(`accounts_${user.id}`) || '[]');
      setAccounts(mockAccounts);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error) {
      setAccounts(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadAccounts();
  }, [user]);

  const addAccount = async (account) => {
    if (!isSupabaseConfigured()) {
      const newAccount = { ...account, id: Date.now().toString(), user_id: user.id };
      const updated = [...accounts, newAccount];
      localStorage.setItem(`accounts_${user.id}`, JSON.stringify(updated));
      setAccounts(updated);
      return { data: newAccount, error: null };
    }

    const { data, error } = await supabase
      .from('accounts')
      .insert([{ ...account, user_id: user.id }])
      .select()
      .single();

    if (!error) {
      setAccounts([...accounts, data]);
    }
    return { data, error };
  };

  const updateAccount = async (id, updates) => {
    if (!isSupabaseConfigured()) {
      const updated = accounts.map(acc => acc.id === id ? { ...acc, ...updates } : acc);
      localStorage.setItem(`accounts_${user.id}`, JSON.stringify(updated));
      setAccounts(updated);
      return { error: null };
    }

    const { error } = await supabase
      .from('accounts')
      .update(updates)
      .eq('id', id);

    if (!error) {
      setAccounts(accounts.map(acc => acc.id === id ? { ...acc, ...updates } : acc));
    }
    return { error };
  };

  const deleteAccount = async (id) => {
    if (!isSupabaseConfigured()) {
      const updated = accounts.filter(acc => acc.id !== id);
      localStorage.setItem(`accounts_${user.id}`, JSON.stringify(updated));
      setAccounts(updated);
      return { error: null };
    }

    const { error } = await supabase
      .from('accounts')
      .delete()
      .eq('id', id);

    if (!error) {
      setAccounts(accounts.filter(acc => acc.id !== id));
    }
    return { error };
  };

  return { accounts, loading, addAccount, updateAccount, deleteAccount, refreshAccounts: loadAccounts };
};