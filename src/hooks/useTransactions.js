import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export const useTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const loadTransactions = async () => {
    if (!user) return;

    if (!isSupabaseConfigured()) {
      const mockTransactions = JSON.parse(localStorage.getItem(`transactions_${user.id}`) || '[]');
      setTransactions(mockTransactions);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('transactions')
      .select('*, accounts(*), categories(*)')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (!error) {
      setTransactions(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadTransactions();
  }, [user]);

  const addTransaction = async (transaction) => {
    if (!isSupabaseConfigured()) {
      const newTransaction = { ...transaction, id: Date.now().toString(), user_id: user.id };
      const updated = [newTransaction, ...transactions];
      localStorage.setItem(`transactions_${user.id}`, JSON.stringify(updated));
      setTransactions(updated);
      return { data: newTransaction, error: null };
    }

    const { data, error } = await supabase
      .from('transactions')
      .insert([{ ...transaction, user_id: user.id }])
      .select('*, accounts(*), categories(*)')
      .single();

    if (!error) {
      setTransactions([data, ...transactions]);
    }
    return { data, error };
  };

  const updateTransaction = async (id, updates) => {
    if (!isSupabaseConfigured()) {
      const updated = transactions.map(t => t.id === id ? { ...t, ...updates } : t);
      localStorage.setItem(`transactions_${user.id}`, JSON.stringify(updated));
      setTransactions(updated);
      return { error: null };
    }

    const { error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id);

    if (!error) {
      setTransactions(transactions.map(t => t.id === id ? { ...t, ...updates } : t));
    }
    return { error };
  };

  const deleteTransaction = async (id) => {
    if (!isSupabaseConfigured()) {
      const updated = transactions.filter(t => t.id !== id);
      localStorage.setItem(`transactions_${user.id}`, JSON.stringify(updated));
      setTransactions(updated);
      return { error: null };
    }

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (!error) {
      setTransactions(transactions.filter(t => t.id !== id));
    }
    return { error };
  };

  return { transactions, loading, addTransaction, updateTransaction, deleteTransaction, refreshTransactions: loadTransactions };
};