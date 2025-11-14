// src/lib/supabaseClient.js

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 👇 ADICIONE ESTA LINHA 👇
// Isso cria e exporta o boolean que o seu AuthContext está tentando importar.
// O '!!' transforma o valor (que é uma string ou undefined) em true/false.
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey)

// Validação
if (!isSupabaseConfigured) {
  console.error("Erro: VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não estão definidas no arquivo .env");
  // Você pode lançar um erro aqui se preferir
  // throw new Error("Erro: VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não estão definidas no arquivo .env");
}

// Cria e exporta o cliente
// Exportamos 'null' se não estiver configurado para evitar que o app quebre na inicialização
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null