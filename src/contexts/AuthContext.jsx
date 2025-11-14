import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

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
  const [profile, setProfile] = useState(null);
  const [households, setHouseholds] = useState([]);
  const [activeHousehold, setActiveHousehold] = useState(null);
  const [loading, setLoading] = useState(true);

  // Função para carregar dados mockados
  const loadMockData = () => {
    const mockUser = JSON.parse(localStorage.getItem('mock_user'));
    if (mockUser) {
      setUser(mockUser);
      // (Você precisará adicionar mocks para profile e households no seu Register.jsx)
      const mockProfile = JSON.parse(localStorage.getItem(`profile_${mockUser.id}`) || 'null');
      const mockHouseholds = JSON.parse(localStorage.getItem(`households_${mockUser.id}`) || '[]');
      const mockActiveHousehold = JSON.parse(localStorage.getItem(`activeHousehold_${mockUser.id}`) || 'null');

      setProfile(mockProfile);
      setHouseholds(mockHouseholds);
      setActiveHousehold(mockActiveHousehold || (mockHouseholds[0] || null));
    }
    setLoading(false);
  };

  // Função para carregar dados do Supabase
  const loadSupabaseData = (session) => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setLoading(true);
        if (!session) {
          setUser(null);
          setProfile(null);
          setHouseholds([]);
          setActiveHousehold(null);
          setLoading(false);
          return;
        }

        const authUser = session.user;
        setUser(authUser);

        // 1. Buscar o perfil
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();
        setProfile(userProfile);

        // 2. Buscar as famílias (households) das quais o usuário é membro
        //    Usamos 'households(*)' para pegar os dados da família (nome, etc.)
        const { data: memberEntries } = await supabase
          .from('household_members')
          .select('role, households(*)') // Pega o 'role' e os dados da família
          .eq('user_id', authUser.id);
        
        const userHouseholds = memberEntries ? memberEntries.map(entry => entry.households) : [];
        setHouseholds(userHouseholds);

        // 3. Definir a família (household) ativa
        // Tenta pegar a última salva no localStorage ou usa a primeira da lista
        const lastActiveHouseholdId = localStorage.getItem('activeHouseholdId');
        const active = userHouseholds.find(h => h.id === lastActiveHouseholdId) || userHouseholds[0] || null;
        
        setActiveHousehold(active);
        if (active) {
          localStorage.setItem('activeHouseholdId', active.id);
        }

        setLoading(false);
      }
    );

    // Carrega a sessão inicial
    if (!session) {
      setLoading(false);
    }

    return () => subscription.unsubscribe();
  };

  useEffect(() => {
    if (!isSupabaseConfigured) {
      loadMockData();
      return;
    }

    // Pega a sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      loadSupabaseData(session);
    });
    
  }, []);

  // Funções de Autenticação (não precisam mudar muito)
  // O registro de profile/household será feito na tela de Register,
  // chamando as Funções RPC (register_new_household) *depois* do signUp.
  const signUp = async (email, password) => {
    if (!isSupabaseConfigured) {
      // Lógica de mock (pode precisar ser atualizada)
      const mockUser = { id: Date.now().toString(), email };
      localStorage.setItem('mock_user', JSON.stringify(mockUser));
      setUser(mockUser);
      // Aqui você criaria e salvaria mocks de profile e household
      return { data: { user: mockUser }, error: null };
    }
    return await supabase.auth.signUp({ email, password });
  };

  const signIn = async (email, password) => {
    if (!isSupabaseConfigured) {
      // Lógica de mock (pode precisar ser atualizada)
      const mockUser = { id: Date.now().toString(), email };
      localStorage.setItem('mock_user', JSON.stringify(mockUser));
      setUser(mockUser);
      return { data: { user: mockUser }, error: null };
    }
    return await supabase.auth.signInWithPassword({ email, password });
  };

  const signOut = async () => {
    if (!isSupabaseConfigured) {
      localStorage.removeItem('mock_user');
      localStorage.removeItem('activeHouseholdId');
      // ... remover outros mocks
      setUser(null);
      setProfile(null);
      setHouseholds([]);
      setActiveHousehold(null);
      return { error: null };
    }
    localStorage.removeItem('activeHouseholdId');
    return await supabase.auth.signOut();
  };

  const resetPassword = async (email) => {
    if (!isSupabaseConfigured) {
      return { data: {}, error: null };
    }
    return await supabase.auth.resetPasswordForEmail(email);
  };

  // Nova função para trocar a família ativa
  const selectActiveHousehold = (household) => {
    if (household && household.id) {
      setActiveHousehold(household);
      localStorage.setItem('activeHouseholdId', household.id);
    }
  };

  const value = {
    user,
    profile,
    households,
    activeHousehold, // O objeto da família (ex: { id: '...', nome_familia: '...' })
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    selectActiveHousehold, // Exporta a nova função
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};