'use client';

import React, { useState } from 'react';
import { HelpCircle, ChevronDown, Search } from 'lucide-react';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import TrustBar from '@/components/TrustBar';
import WhatsAppButton from '@/components/WhatsAppButton';

interface Pergunta {
  id: number;
  pergunta: string;
  resposta: string;
  categoria: 'produto' | 'nutriente' | 'cultivo' | 'entrega' | 'garantia';
}

const perguntas: Pergunta[] = [
  {
    id: 1,
    pergunta: 'Qual é a diferença entre Bio-Green e Bio-Potassium?',
    categoria: 'produto',
    resposta: 'Bio-Green é formulado para fase vegetativa (alto nitrogênio). Bio-Potassium é para floração (alto potássio e fósforo para densidade e terpenos).',
  },
  {
    id: 2,
    pergunta: 'Bio-EM1 é necessário?',
    categoria: 'produto',
    resposta: 'Sim, a microbiologia ativa solubiliza nutrientes no solo e acelera a absorção pelas raízes.',
  },
  {
    id: 3,
    pergunta: 'Qual é o prazo de entrega?',
    categoria: 'entrega',
    resposta: 'Dentro de SP: 2-3 dias. Outros estados: 5-10 dias (PAC) ou 2-3 dias (Sedex).',
  },
];

export default function FAQPage() {
  const [buscaTexto, setBuscaTexto] = useState('');
  const [abertasIds, setAbertasIds] = useState<number[]>([]);

  const toggleAberta = (id: number) => {
    setAbertasIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const perguntasFiltradas = perguntas.filter(p =>
    p.pergunta.toLowerCase().includes(buscaTexto.toLowerCase()) ||
    p.resposta.toLowerCase().includes(buscaTexto.toLowerCase())
  );

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: '#f7f3ed', minHeight: '100vh' }}>
      <SiteHeader />

      <div style={{ background: 'linear-gradient(135deg, #1a3d1a, #2d5a2d)', color: 'white', padding: '80px 24px 60px', textAlign: 'center', marginTop: 64 }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <HelpCircle size={28} color="#d4a843" />
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 900, color: 'white', margin: '0 0 12px' }}>
            Perguntas Frequentes
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)', margin: 0 }}>
            Tire suas dúvidas técnicas e comerciais sobre a BIOFLOW
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '60px 24px' }}>
        <div style={{ marginBottom: 30 }}>
          <input
            type="text"
            placeholder="Buscar dúvida..."
            value={buscaTexto}
            onChange={(e) => setBuscaTexto(e.target.value)}
            style={{ width: '100%', padding: '14px', borderRadius: 12, border: '1.5px solid #ece8e0', outline: 'none' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {perguntasFiltradas.map((p) => (
            <div key={p.id} style={{ background: 'white', borderRadius: 12, border: '1px solid #ece8e0', overflow: 'hidden' }}>
              <button
                onClick={() => toggleAberta(p.id)}
                style={{ width: '100%', padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', border: 'none', cursor: 'pointer', textAlign: 'left' }}
              >
                <span style={{ fontSize: 15, fontWeight: 800, color: '#1a3d1a' }}>{p.pergunta}</span>
                <ChevronDown size={18} style={{ transform: abertasIds.includes(p.id) ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>
              {abertasIds.includes(p.id) && (
                <div style={{ padding: '0 20px 20px', color: '#6b6355', fontSize: 13.5, lineHeight: 1.6 }}>
                  {p.resposta}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <TrustBar />
      <SiteFooter />
      <WhatsAppButton />
    </div>
  );
}