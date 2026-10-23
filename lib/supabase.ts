// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Faltam as variáveis NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no arquivo .env.local'
  );
}

// 🚨 CLIENTE EXCLUSIVO DO NAVEGADOR (Com suporte obrigatório a PKCE)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { 
    persistSession: true,      // Fundamental para salvar o veroficador de código no navegador
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'           // Força o uso do fluxo PKCE (envia o ?code=... na query para o Next.js)
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