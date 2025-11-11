// src/lib/supabaseClient.js

import { createClient } from '@supabase/supabase-js'

// 1. Pega as variáveis do .env (injetadas pelo Vite)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 2. Validação (opcional, mas recomendado)
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Erro: VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não estão definidas no arquivo .env");
}

// 3. Cria e exporta o cliente
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
