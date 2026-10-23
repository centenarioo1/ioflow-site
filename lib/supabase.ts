// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

// Usa um fallback de URL com formato válido para evitar que a biblioteca @supabase/supabase-js
// lance um erro 'Invalid URL' durante a avaliação do módulo (module evaluation) no build da Vercel.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '[suspicious link removed]';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn(
    'Aviso: Faltam as variáveis NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no ambiente.'
  );
}

// 🚨 CLIENTE EXCLUSIVO DO NAVEGADOR (Com suporte obrigatório a PKCE)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { 
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
});

// Cliente limpo para operações do Servidor (Node/NextJS APIs)
export function createAuthClient() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { 
      persistSession: false, 
      autoRefreshToken: false 
    },
  });
}