// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Aviso: Faltam as variáveis NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.');
}

// 🟢 CLIENTE DO NAVEGADOR: Usa o storage nativo (localStorage) para manter o PKCE intacto entre redirecionamentos
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { 
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
});

// Cliente auxiliar para o servidor
export function createAuthClient() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { 
      persistSession: false, 
      autoRefreshToken: false 
    },
  });
}