'use client';

import React, { useState } from 'react';
import { Mail, MapPin, Send, MessageCircle, CheckCircle2, Loader2 } from 'lucide-react';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

export default function ContatoPage() {
  const [enviado, setEnviado] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [form, setForm] = useState({ nome: '', email: '', mensagem: '' });
  const [erro, setErro] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCarregando(true);
    setErro('');

    try {
      const res = await fetch('/api/contato', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setEnviado(true);
      } else {
        setErro(data.error || 'Erro ao enviar mensagem.');
      }
    } catch {
      setErro('Erro de conexão ao enviar.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div style={{ background: '#f8f6f0', minHeight: '100vh', paddingTop: 80, fontFamily: "'Inter', sans-serif" }}>
      <SiteHeader />

      <section style={{ background: '#0a1a0d', color: 'white', padding: '50px 20px', textAlign: 'center' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.15em', color: '#d4a843', textTransform: 'uppercase' }}>
            Suporte Especializado
          </span>
          <h1 style={{ fontSize: 36, fontWeight: 900, margin: '8px 0 14px' }}>
            Fale com a Equipe BIOFLOW
          </h1>
          <p style={{ fontSize: 15, color: '#9ca3af', lineHeight: 1.6 }}>
            Dúvidas sobre dosagens ou acompanhamento de pedidos? Estamos à disposição.
          </p>
        </div>
      </section>

      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 20px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 32 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid #e7e2d6' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(34,197,94,0.1)', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MessageCircle size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: 15, fontWeight: 800, margin: 0 }}>WhatsApp Direto</h4>
                  <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>Atendimento rápido</p>
                </div>
              </div>
              <a
                href="https://wa.me/5517999999999?text=Olá!%20Gostaria%20de%20atendimento%20BIOFLOW."
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  background: '#15803d',
                  color: 'white',
                  padding: '9px 16px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 700,
                  textDecoration: 'none',
                  marginTop: 6
                }}
              >
                Chamar no WhatsApp
              </a>
            </div>

            <div style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid #e7e2d6' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <Mail size={18} color="#d4a843" />
                <div>
                  <h4 style={{ fontSize: 14, fontWeight: 800, margin: 0 }}>E-mail de Atendimento</h4>
                  <p style={{ fontSize: 13, color: '#4b5563', margin: '2px 0 0' }}>contato@biofloworganics.com.br</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <MapPin size={18} color="#d4a843" />
                <div>
                  <h4 style={{ fontSize: 14, fontWeight: 800, margin: 0 }}>Centro de Distribuição</h4>
                  <p style={{ fontSize: 13, color: '#4b5563', margin: '2px 0 0' }}>Envios para todo o Brasil</p>
                </div>
              </div>
            </div>
          </div>

          <div style={{ background: 'white', padding: 32, borderRadius: 20, border: '1px solid #e7e2d6' }}>
            {enviado ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <CheckCircle2 size={48} color="#15803d" style={{ margin: '0 auto 12px' }} />
                <h3 style={{ fontSize: 20, fontWeight: 900, color: '#111827' }}>Mensagem Enviada!</h3>
                <p style={{ color: '#6b6355', fontSize: 13.5, margin: '8px 0 0' }}>
                  Responderemos em até 24 horas úteis.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h3 style={{ fontSize: 18, fontWeight: 900, margin: '0 0 4px', color: '#111827' }}>Envie uma mensagem</h3>
                
                {erro && <p style={{ color: '#ef4444', fontSize: 12, fontWeight: 700 }}>{erro}</p>}

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#4b5563', marginBottom: 4 }}>Seu Nome</label>
                  <input
                    required
                    type="text"
                    value={form.nome}
                    onChange={(e) => setForm({ ...form, nome: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#4b5563', marginBottom: 4 }}>Seu E-mail</label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#4b5563', marginBottom: 4 }}>Mensagem</label>
                  <textarea
                    required
                    rows={4}
                    value={form.mensagem}
                    onChange={(e) => setForm({ ...form, mensagem: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, outline: 'none', resize: 'vertical' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={carregando}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    background: '#111827',
                    color: 'white',
                    border: 'none',
                    padding: '12px',
                    borderRadius: 10,
                    fontSize: 14,
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  {carregando ? <Loader2 size={16} className="animate-spin" /> : <><Send size={16} /> Enviar Mensagem</>}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}