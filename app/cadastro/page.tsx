'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, User, Mail, Lock, Phone, CreditCard, ShieldAlert, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function CadastroPage() {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cpf, setCpf] = useState('');

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setSucesso(false);

    // Validações básicas locais
    if (!nome.trim() || !email.trim() || !senha.trim()) {
      setErro('Por favor, preencha todos os campos obrigatórios (*).');
      return;
    }

    if (senha.length < 6) {
      setErro('A senha deve conter no mínimo 6 caracteres.');
      return;
    }

    if (senha !== confirmarSenha) {
      setErro('As senhas digitadas não são iguais.');
      return;
    }

    setLoading(true);
    try {
      // 🚨 Chamada segura: envia apenas as propriedades oficiais que existem na tabela User
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: nome,
          email: email,
          senha: senha
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao realizar cadastro.');
      }

      // Sincroniza dados complementares no localStorage para preenchimento futuro no carrinho
      const sessaoSugerida = {
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        telefone: telefone.trim(),
        cpf: cpf.replace(/\D/g, '')
      };
      localStorage.setItem('cadastro_temporario', JSON.stringify(sessaoSugerida));

      setSucesso(true);
      
      // Limpa formulário
      setNome('');
      setEmail('');
      setSenha('');
      setConfirmarSenha('');
      setTelefone('');
      setCpf('');

      setTimeout(() => {
        router.push('/login');
      }, 2000);

    } catch (err: any) {
      setErro(err.message || 'Erro de conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f7f4ee', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: "'Inter', sans-serif" }}>
      <div style={{ width: '100%', maxWidth: 450, background: 'white', borderRadius: 24, border: '1px solid #e7e2d6', padding: 32, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <Link href="/" style={{ textDecoration: 'none', color: '#0d2410', fontWeight: 900, fontSize: 24 }}>
            BIOFLOW<span style={{ color: '#d4a843' }}>.</span>
          </Link>
          <p style={{ fontSize: 13, color: '#6b7280', marginTop: 6 }}>Crie sua conta para acompanhar seus pedidos de adubo</p>
        </div>

        {erro && (
          <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '12px 14px', borderRadius: 12, fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <ShieldAlert size={16} />
            {erro}
          </div>
        )}

        {sucesso && (
          <div style={{ background: '#dcfce7', border: '1px solid #86efac', color: '#166534', padding: '12px 14px', borderRadius: 12, fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <CheckCircle2 size={16} />
            Conta criada com sucesso! Redirecionando para o login...
          </div>
        )}

        <form onSubmit={handleCadastro} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#4b5563', display: 'block', marginBottom: 6 }}>Nome Completo *</label>
            <div style={{ position: 'relative' }}>
              <User size={16} color="#9ca3af" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                placeholder="Ex: João da Silva"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                style={{ width: '100%', padding: '10px 10px 10px 38px', borderRadius: 10, border: '1px solid #d1d5db', fontSize: 13, outline: 'none' }}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#4b5563', display: 'block', marginBottom: 6 }}>Endereço de E-mail *</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="#9ca3af" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="email" 
                placeholder="Ex: joao@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', padding: '10px 10px 10px 38px', borderRadius: 10, border: '1px solid #d1d5db', fontSize: 13, outline: 'none' }}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#4b5563', display: 'block', marginBottom: 6 }}>Celular / WhatsApp</label>
              <div style={{ position: 'relative' }}>
                <Phone size={14} color="#9ca3af" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="text" 
                  placeholder="(11) 99999-9999"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  style={{ width: '100%', padding: '10px 10px 10px 34px', borderRadius: 10, border: '1px solid #d1d5db', fontSize: 13, outline: 'none' }}
                />
              </div>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#4b5563', display: 'block', marginBottom: 6 }}>CPF</label>
              <div style={{ position: 'relative' }}>
                <CreditCard size={14} color="#9ca3af" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="text" 
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  style={{ width: '100%', padding: '10px 10px 10px 34px', borderRadius: 10, border: '1px solid #d1d5db', fontSize: 13, outline: 'none' }}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#4b5563', display: 'block', marginBottom: 6 }}>Senha *</label>
              <div style={{ position: 'relative' }}>
                <Lock size={14} color="#9ca3af" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="password" 
                  placeholder="Mín. 6 dígitos"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  style={{ width: '100%', padding: '10px 10px 10px 34px', borderRadius: 10, border: '1px solid #d1d5db', fontSize: 13, outline: 'none' }}
                  required
                />
              </div>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#4b5563', display: 'block', marginBottom: 6 }}>Confirmar Senha *</label>
              <div style={{ position: 'relative' }}>
                <Lock size={14} color="#9ca3af" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="password" 
                  placeholder="Repita a senha"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  style={{ width: '100%', padding: '10px 10px 10px 34px', borderRadius: 10, border: '1px solid #d1d5db', fontSize: 13, outline: 'none' }}
                  required
                />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ width: '100%', background: '#15803d', color: 'white', border: 'none', borderRadius: 12, padding: '12px 0', fontSize: 13.5, fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 12px rgba(21, 128, 61, 0.15)', marginTop: 8 }}
          >
            {loading ? <><Loader2 size={16} className="animate-spin" /> Criando conta...</> : 'Criar minha Conta'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13 }}>
          <span style={{ color: '#6b7280' }}>Já possui uma conta? </span>
          <Link href="/login" style={{ color: '#15803d', fontWeight: 700, textDecoration: 'none' }}>
            Acessar Login
          </Link>
        </div>

      </div>

      <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#4b5563', textDecoration: 'none', fontSize: 13, fontWeight: 700, marginTop: 20 }}>
        <ArrowLeft size={16} /> Voltar para o início
      </Link>
    </div>
  );
}