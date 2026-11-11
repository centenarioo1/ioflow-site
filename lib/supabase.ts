// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// 🟢 Cookie Storage Adapter corrigido (alterado match[6] para match[2])
const customCookieStorage = {
  getItem: (k: string) => {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(new RegExp('(^| )' + k + '=([^;]+)'));
    // 🟢 CORRIGIDO: match[2] captura o valor do cookie. match[6] retornava undefined!
    return match ? decodeURIComponent(match[2]) : null;
  },
  setItem: (k: string, v: string) => {
    if (typeof document === 'undefined') return;
    const isProd = process.env.NODE_ENV === 'production';
    document.cookie = `${k}=${encodeURIComponent(v)}; path=/; max-age=86400; SameSite=Lax; ${isProd ? 'Secure;' : ''}`;
  },
  removeItem: (k: string) => {
    if (typeof document === 'undefined') return;
    document.cookie = `${k}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax;`;
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
