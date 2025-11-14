import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { activeHousehold } = useAuth();
  const activeHouseholdId = activeHousehold?.id;

  const loadCategories = async () => {
    if (!activeHouseholdId) {
      setLoading(false);
      return; 
    }

    if (!isSupabaseConfigured) {
      const mockCategories = JSON.parse(localStorage.getItem(`categories_${activeHouseholdId}`) || '[]');
      if (mockCategories.length === 0) {
        const defaultCategories = [
          { id: '1', name: 'Alimentação', color: '#10b981', household_id: activeHouseholdId },
          { id: '2', name: 'Transporte', color: '#3b82f6', household_id: activeHouseholdId },
        ];
        localStorage.setItem(`categories_${activeHouseholdId}`, JSON.stringify(defaultCategories));
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
      .eq('household_id', activeHouseholdId)
      // 👇 LINHA REMOVIDA DAQUI 👇
      // .order('created_at', { ascending: false });

    if (!error) {
      setCategories(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCategories();
  }, [activeHouseholdId]);

  const addCategory = async (category) => {
    if (!activeHouseholdId) return { error: new Error("Nenhuma família ativa.") };

    if (!isSupabaseConfigured) {
      const newCategory = { ...category, id: Date.now().toString(), household_id: activeHouseholdId };
      const updated = [...categories, newCategory];
      localStorage.setItem(`categories_${activeHouseholdId}`, JSON.stringify(updated));
      setCategories(updated);
      return { data: newCategory, error: null };
    }

    const { data, error } = await supabase
      .from('categories')
      .insert([{ ...category, household_id: activeHouseholdId }]) 
      .select()
      .single();

    if (!error) {
      // Recarrega os dados
      await loadCategories();
    }
    return { data, error };
  };

  const updateCategory = async (id, updates) => {
    if (!activeHouseholdId) return { error: new Error("Nenhuma família ativa.") };

    if (!isSupabaseConfigured) {
      const updated = categories.map(cat => cat.id === id ? { ...cat, ...updates } : cat);
      localStorage.setItem(`categories_${activeHouseholdId}`, JSON.stringify(updated));
      setCategories(updated);
      return { error: null };
    }

    const { error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .eq('household_id', activeHouseholdId);

    if (!error) {
      setCategories(categories.map(cat => cat.id === id ? { ...cat, ...updates } : cat));
    }
    return { error };
  };

  const deleteCategory = async (id) => {
    if (!activeHouseholdId) return { error: new Error("Nenhuma família ativa.") };

    if (!isSupabaseConfigured) {
      const updated = categories.filter(cat => cat.id !== id);
      localStorage.setItem(`categories_${activeHouseholdId}`, JSON.stringify(updated));
      setCategories(updated);
      return { error: null };
    }

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
      .eq('household_id', activeHouseholdId);

    if (!error) {
      setCategories(categories.filter(cat => cat.id !== id));
    }
    return { error };
  };

  return { categories, loading, addCategory, updateCategory, deleteCategory, refreshCategories: loadCategories };
};