// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// 🟢 Salva o token PKCE em Cookies para o servidor ler durante o callback
const customCookieStorage = {
  getItem: (k: string) => {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(new RegExp('(^| )' + k + '=([^;]+)'));
    return match ? decodeURIComponent(match[6]) : null;
  },
  setItem: (k: string, v: string) => {
    if (typeof document === 'undefined') return;
    document.cookie = `${k}=${encodeURIComponent(v)}; path=/; max-age=86400; SameSite=Lax; Secure`;
  },
  removeItem: (k: string) => {
    if (typeof document === 'undefined') return;
    document.cookie = `${k}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax; Secure`;
  },
};

export const supabase = createClient(url, key, {
  auth: { 
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: customCookieStorage,
  },
});

export function createAuthClient() {
  return createClient(url, key, {
    auth: { 
      persistSession: false, 
      autoRefreshToken: false 
    },
  });
}