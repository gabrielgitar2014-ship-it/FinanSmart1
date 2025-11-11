import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      const mockUser = localStorage.getItem('mock_user');
      if (mockUser) {
        setUser(JSON.parse(mockUser));
      }
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email, password) => {
    if (!isSupabaseConfigured()) {
      const mockUser = { id: Date.now().toString(), email };
      localStorage.setItem('mock_user', JSON.stringify(mockUser));
      setUser(mockUser);
      return { data: { user: mockUser }, error: null };
    }
    return await supabase.auth.signUp({ email, password });
  };

  const signIn = async (email, password) => {
    if (!isSupabaseConfigured()) {
      const mockUser = { id: Date.now().toString(), email };
      localStorage.setItem('mock_user', JSON.stringify(mockUser));
      setUser(mockUser);
      return { data: { user: mockUser }, error: null };
    }
    return await supabase.auth.signInWithPassword({ email, password });
  };

  const signOut = async () => {
    if (!isSupabaseConfigured()) {
      localStorage.removeItem('mock_user');
      setUser(null);
      return { error: null };
    }
    return await supabase.auth.signOut();
  };

  const resetPassword = async (email) => {
    if (!isSupabaseConfigured()) {
      return { data: {}, error: null };
    }
    return await supabase.auth.resetPasswordForEmail(email);
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};