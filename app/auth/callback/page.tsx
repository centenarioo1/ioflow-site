// app/auth/callback/page.tsx
'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2, ShieldAlert } from 'lucide-react';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [erro, setErro] = useState('');

  useEffect(() => {
    let processado = false;

    const autenticar = async () => {
      if (processado) return;
      processado = true;

      try {
        const code = searchParams.get('code');
        let userSession = null;

        // 1. Se veio o código do Google na URL, troca pelo token de sessão usando o PKCE do localStorage
        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (!error && data?.session) {
            userSession = data.session;
          }
        }

        // 2. Se a troca manual já foi feita ou o detectSessionInUrl atuou, recupera a sessão ativa
        if (!userSession) {
          const { data } = await supabase.auth.getSession();
          userSession = data?.session || null;
        }

        if (!userSession?.user) {
          throw new Error('Não foi possível recuperar a sessão do Google.');
        }

        const user = userSession.user;
        const email = user.email;
        const nome = user.user_metadata?.full_name || user.user_metadata?.name || 'Cultivador';

        if (!email) {
          throw new Error('O Google não forneceu um e-mail válido.');
        }

        // 3. Sincroniza com a API do servidor (Prisma + Cookie bioflow_session)
        const res = await fetch('/api/auth/session-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: user.id, email, nome }),
        });

        const apiData = await res.json();
        if (!res.ok) {
          throw new Error(apiData.error || 'Erro ao sincronizar sessão no servidor.');
        }

        localStorage.setItem('user_session', JSON.stringify({
          id: apiData.user.id,
          nome: apiData.user.nome,
          email: apiData.user.email,
          role: apiData.user.role,
        }));

        const redirect = searchParams.get('redirect') || '/dashboard';
        router.push(redirect);

      } catch (err: any) {
        console.error('❌ Erro no Callback OAuth:', err);
        setErro(err.message || 'Erro ao autenticar com o Google.');
      }
    };

    autenticar();
  }, [router, searchParams]);

  return (
    <div style={{ minHeight: '100vh', background: '#f7f4ee', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ textAlign: 'center', maxWidth: 400, padding: 32, background: 'white', borderRadius: 24, border: '1px solid #e7e2d6', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
        {erro ? (
          <>
            <ShieldAlert size={48} color="#dc2626" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: 18, fontWeight: 900, color: '#111827', margin: '0 0 8px' }}>Falha na Conexão</h3>
            <p style={{ fontSize: 13, color: '#ef4444', fontWeight: 600, margin: '0 0 16px' }}>{erro}</p>
            <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>Redirecionando de volta para o login...</p>
          </>
        ) : (
          <>
            <Loader2 size={40} className="animate-spin" color="#15803d" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: 18, fontWeight: 900, color: '#0d2410', margin: '0 0 8px' }}>Autenticando com o Google</h3>
            <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>Aguarde enquanto sincronizamos sua conta Bioflow...</p>
          </>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#f7f4ee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={40} className="animate-spin" color="#15803d" />
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}