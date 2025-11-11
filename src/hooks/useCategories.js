import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const loadCategories = async () => {
    if (!user) return;

    if (!isSupabaseConfigured()) {
      const mockCategories = JSON.parse(localStorage.getItem(`categories_${user.id}`) || '[]');
      if (mockCategories.length === 0) {
        const defaultCategories = [
          { id: '1', name: 'Alimentação', color: '#10b981', user_id: user.id },
          { id: '2', name: 'Transporte', color: '#3b82f6', user_id: user.id },
          { id: '3', name: 'Lazer', color: '#8b5cf6', user_id: user.id },
          { id: '4', name: 'Salário', color: '#22c55e', user_id: user.id },
        ];
        localStorage.setItem(`categories_${user.id}`, JSON.stringify(defaultCategories));
        setCategories(defaultCategories);
      } else {
        setCategories(mockCategories);
      }
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error) {
      setCategories(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCategories();
  }, [user]);

  const addCategory = async (category) => {
    if (!isSupabaseConfigured()) {
      const newCategory = { ...category, id: Date.now().toString(), user_id: user.id };
      const updated = [...categories, newCategory];
      localStorage.setItem(`categories_${user.id}`, JSON.stringify(updated));
      setCategories(updated);
      return { data: newCategory, error: null };
    }

    const { data, error } = await supabase
      .from('categories')
      .insert([{ ...category, user_id: user.id }])
      .select()
      .single();

    if (!error) {
      setCategories([...categories, data]);
    }
    return { data, error };
  };

  const updateCategory = async (id, updates) => {
    if (!isSupabaseConfigured()) {
      const updated = categories.map(cat => cat.id === id ? { ...cat, ...updates } : cat);
      localStorage.setItem(`categories_${user.id}`, JSON.stringify(updated));
      setCategories(updated);
      return { error: null };
    }

    const { error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id);

    if (!error) {
      setCategories(categories.map(cat => cat.id === id ? { ...cat, ...updates } : cat));
    }
    return { error };
  };

  const deleteCategory = async (id) => {
    if (!isSupabaseConfigured()) {
      const updated = categories.filter(cat => cat.id !== id);
      localStorage.setItem(`categories_${user.id}`, JSON.stringify(updated));
      setCategories(updated);
      return { error: null };
    }

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (!error) {
      setCategories(categories.filter(cat => cat.id !== id));
    }
    return { error };
  };

  return { categories, loading, addCategory, updateCategory, deleteCategory, refreshCategories: loadCategories };
};