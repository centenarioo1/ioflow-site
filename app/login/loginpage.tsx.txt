'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Mail, Lock, ShieldAlert, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '/dashboard';

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    const session = localStorage.getItem('user_session');
    if (session) {
      try {
        const user = JSON.parse(session);
        if (redirectTarget.toLowerCase().includes('admin') && user.role !== 'ADMIN') {
          router.push('/dashboard?erro=sem-permissao');
          return;
        }
        router.push(redirectTarget);
      } catch (e) {
        localStorage.removeItem('user_session');
      }
    }
  }, [router, redirectTarget]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    if (!email.trim() || !senha.trim()) {
      setErro('Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: senha }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'E-mail ou senha incorretos.');

      localStorage.setItem('user_session', JSON.stringify({
        id: data.user.id,
        nome: data.user.nome || data.user.name,
        email: data.user.email,
        role: data.user.role || 'USER',
        telefone: data.user.phone || '',
        cpf: data.user.cpf || ''
      }));

      if (redirectTarget.toLowerCase().includes('admin') && data.user.role !== 'ADMIN') {
        router.push('/dashboard?erro=sem-permissao');
      } else {
        router.push(redirectTarget);
      }

    } catch (err: any) {
      setErro(err.message || 'Erro ao conectar ao servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginGoogle = async () => {
    setErro('');
    setLoadingGoogle(true);
    try {
      // 🌐 FORÇA O REDIRECIONAMENTO COM CÓDIGO (PKCE)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectTarget)}`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setErro(err.message || 'Erro ao conectar com o Google.');
      setLoadingGoogle(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f7f4ee', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: "'Inter', sans-serif" }}>
      <div style={{ width: '100%', maxWidth: 420, background: 'white', borderRadius: 24, border: '1px solid #e7e2d6', padding: 32, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Link href="/" style={{ textDecoration: 'none', color: '#0d2410', fontWeight: 900, fontSize: 24 }}>
            BIOFLOW<span style={{ color: '#d4a843' }}>.</span>
          </Link>
          <p style={{ fontSize: 13, color: '#6b7280', marginTop: 6 }}>Entre para gerenciar seus cultivos</p>
        </div>

        {erro && (
          <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '12px 14px', borderRadius: 12, fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <ShieldAlert size={16} /> {erro}
          </div>
        )}

        {searchParams.get('erro') === 'sem-permissao' && (
          <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', color: '#b45309', padding: '12px 14px', borderRadius: 12, fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <ShieldAlert size={16} /> Sua conta não tem autorização para acessar o painel de admin.
          </div>
        )}

        {searchParams.get('erro') === 'oauth-failed' && (
          <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '12px 14px', borderRadius: 12, fontSize: 12.5, fontWeight: 700, display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <ShieldAlert size={16} /> Falha no login social com o Google.
            </div>
            {searchParams.get('reason') && (
              <span style={{ fontSize: 11, fontWeight: 500, opacity: 0.9 }}>Motivo: {searchParams.get('reason')}</span>
            )}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#4b5563', display: 'block', marginBottom: 6 }}>E-mail</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="#9ca3af" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="email" 
                placeholder="Ex: seuemail@bioflow.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', padding: '12px 12px 12px 38px', borderRadius: 10, border: '1px solid #d1d5db', fontSize: 13.5, outline: 'none' }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#4b5563', display: 'block', marginBottom: 6 }}>Senha</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="#9ca3af" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="password" 
                placeholder="Digite sua senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                style={{ width: '100%', padding: '12px 12px 12px 38px', borderRadius: 10, border: '1px solid #d1d5db', fontSize: 13.5, outline: 'none' }}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ width: '100%', background: '#15803d', color: 'white', border: 'none', borderRadius: 12, padding: '14px 0', fontSize: 14, fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            {loading ? <><Loader2 size={16} className="animate-spin" /> Entrando...</> : 'Entrar'}
          </button>
        </form>

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '20px 0' }}>
          <div style={{ position: 'absolute', width: '100%', height: '1px', background: '#e5e7eb' }} />
          <span style={{ position: 'relative', background: 'white', padding: '0 10px', fontSize: 11, color: '#9ca3af', fontWeight: 700 }}>OU ENTAR COM</span>
        </div>

        {/* BOTÃO GOOGLE OAUTH */}
        <button 
          onClick={handleLoginGoogle}
          disabled={loadingGoogle}
          style={{ width: '100%', background: 'white', border: '1px solid #d1d5db', borderRadius: 12, padding: '12px 0', fontSize: 13.5, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: '#374151' }}
        >
          {loadingGoogle ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
              </svg>
              Google
            </>
          )}
        </button>

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 13 }}>
          <span style={{ color: '#6b7280' }}>Novo por aqui? </span>
          <Link href="/cadastro" style={{ color: '#15803d', fontWeight: 700, textDecoration: 'none' }}>
            Criar conta
          </Link>
        </div>

      </div>

      <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#4b5563', textDecoration: 'none', fontSize: 13, fontWeight: 700, marginTop: 20 }}>
        <ArrowLeft size={16} /> Voltar para o início
      </Link>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#f7f4ee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader2 size={40} className="animate-spin" color="#15803d" /></div>}>
      <LoginContent />
    </Suspense>
  );
}