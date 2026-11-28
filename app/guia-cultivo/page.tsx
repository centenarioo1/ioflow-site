// app/guia-cultivo/page.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Droplets, 
  Activity, 
  ShieldCheck, 
  Sprout, 
  Leaf, 
  Sparkles, 
  Layers, 
  HelpCircle,
  Zap,
  Info
} from 'lucide-react';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import WhatsAppButton from '@/components/WhatsAppButton';

type TipoSubstrato = 'inerte' | 'rico-humus' | 'super-solo';

interface LinhaNutricao {
  fase: string;
  semana: string;
  bioStart: string;
  bioGreen: string;
  bioBloom: string;
  bioEM1: string;
  bioMelaco: string;
  usCmAlvo: string;
  phAlvo: string;
  observacao: string;
}

const TABELAS_POR_SUBSTRATO: Record<TipoSubstrato, {
  nome: string;
  subtitulo: string;
  descricaoManejo: string;
  badge: { bg: string; color: string; border: string };
  linhas: LinhaNutricao[];
}> = {
  inerte: {
    nome: '1. Substrato Inerte / Hidroponia Passiva (Coco Mix 50/50)',
    subtitulo: '50% Fibra de Coco + 50% Perlita (Sem carga nutricional nativa)',
    descricaoManejo: 'Por ser 100% inerte, a planta depende integralmente da fertirrigação em todas as regas. As doses das bombonas entram em carga cheia para suprir o metabolismo acelerado.',
    badge: { bg: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', border: 'rgba(59, 130, 246, 0.3)' },
    linhas: [
      {
        fase: 'Muda / Enraizamento',
        semana: 'Semana 1',
        bioStart: '2.0 ml/L',
        bioGreen: '-',
        bioBloom: '-',
        bioEM1: '10 ml/L',
        bioMelaco: '5 ml/L',
        usCmAlvo: '600 - 800 µS/cm',
        phAlvo: '5.8 - 6.0',
        observacao: 'Inoculação microbiológica e arranque radicular inicial.'
      },
      {
        fase: 'Vegetativo Inicial',
        semana: 'Semana 2',
        bioStart: '2.0 ml/L',
        bioGreen: '2.0 ml/L',
        bioBloom: '-',
        bioEM1: '10 ml/L',
        bioMelaco: '5 ml/L',
        usCmAlvo: '1000 - 1200 µS/cm',
        phAlvo: '5.8 - 6.1',
        observacao: 'Desenvolvimento das primeiras folhas verdadeiras e estrutura.'
      },
      {
        fase: 'Vegetativo Pleno',
        semana: 'Semana 3-4',
        bioStart: '1.0 ml/L',
        bioGreen: '4.0 ml/L',
        bioBloom: '-',
        bioEM1: '10 ml/L',
        bioMelaco: '5 ml/L',
        usCmAlvo: '1200 - 1400 µS/cm',
        phAlvo: '6.0 - 6.2',
        observacao: 'Carga máxima de Nitrogênio e Magnésio para expansão foliar.'
      },
      {
        fase: 'Transição / Pré-Flora',
        semana: 'Semana 5',
        bioStart: '-',
        bioGreen: '2.0 ml/L',
        bioBloom: '2.0 ml/L',
        bioEM1: '10 ml/L',
        bioMelaco: '5 ml/L',
        usCmAlvo: '1400 - 1600 µS/cm',
        phAlvo: '6.0 - 6.3',
        observacao: 'Alongamento dos nós e preparação para a formação dos pistilos.'
      },
      {
        fase: 'Floração Plena',
        semana: 'Semana 6-8',
        bioStart: '-',
        bioGreen: '-',
        bioBloom: '4.0 - 5.0 ml/L',
        bioEM1: '10 ml/L',
        bioMelaco: '10 ml/L',
        usCmAlvo: '1800 - 2200 µS/cm',
        phAlvo: '6.2 - 6.5',
        observacao: 'Pico de Fósforo, Potássio e açúcares para engorda de flores.'
      },
      {
        fase: 'Maturação / Flush',
        semana: 'Semana 9-10',
        bioStart: '-',
        bioGreen: '-',
        bioBloom: '-',
        bioEM1: '5 ml/L',
        bioMelaco: '-',
        usCmAlvo: '200 - 400 µS/cm',
        phAlvo: '6.0 - 6.3',
        observacao: 'Lavagem suave com água pura e EM-1 para consumir reservas.'
      }
    ]
  },
  rico-humus: {
    nome: '2. Solo Rico em Húmus (BioMix + 20-30% Bio-Humus)',
    subtitulo: 'Turfa + Perlita + Casca de Arroz Carbonizada + Húmus de Minhoca',
    descricaoManejo: 'Substrato aerado com reservatório biológico e nutrição orgânica moderada. Exige adubação de manutenção regular com as bombonas líquidas para manter a microbiota ativa.',
    badge: { bg: 'rgba(34, 197, 94, 0.15)', color: '#16a34a', border: 'rgba(34, 197, 94, 0.3)' },
    linhas: [
      {
        fase: 'Muda / Enraizamento',
        semana: 'Semana 1',
        bioStart: '1.0 - 2.0 ml/L',
        bioGreen: '-',
        bioBloom: '-',
        bioEM1: '10 ml/L',
        bioMelaco: '5 ml/L',
        usCmAlvo: '500 - 700 µS/cm',
        phAlvo: '6.0 - 6.2',
        observacao: 'Ancoragem radicular favorecida pela acidez suave do húmus.'
      },
      {
        fase: 'Vegetativo Inicial',
        semana: 'Semana 2',
        bioStart: '1.0 ml/L',
        bioGreen: '1.5 ml/L',
        bioBloom: '-',
        bioEM1: '10 ml/L',
        bioMelaco: '5 ml/L',
        usCmAlvo: '800 - 1000 µS/cm',
        phAlvo: '6.0 - 6.3',
        observacao: 'Aproveitamento da carga orgânica do húmus com reforço do Veg.'
      },
      {
        fase: 'Vegetativo Pleno',
        semana: 'Semana 3-4',
        bioStart: '-',
        bioGreen: '3.0 ml/L',
        bioBloom: '-',
        bioEM1: '10 ml/L',
        bioMelaco: '5 ml/L',
        usCmAlvo: '1000 - 1200 µS/cm',
        phAlvo: '6.2 - 6.5',
        observacao: 'Manutenção do viço verde e galhamento resistente.'
      },
      {
        fase: 'Transição / Pré-Flora',
        semana: 'Semana 5',
        bioStart: '-',
        bioGreen: '1.5 ml/L',
        bioBloom: '2.0 ml/L',
        bioEM1: '10 ml/L',
        bioMelaco: '5 ml/L',
        usCmAlvo: '1300 - 1500 µS/cm',
        phAlvo: '6.2 - 6.5',
        observacao: 'Balanceamento de Nitrogênio e Potássio para estiramento.'
      },
      {
        fase: 'Floração Plena',
        semana: 'Semana 6-8',
        bioStart: '-',
        bioGreen: '-',
        bioBloom: '4.0 ml/L',
        bioEM1: '10 ml/L',
        bioMelaco: '10 ml/L',
        usCmAlvo: '1600 - 2000 µS/cm',
        phAlvo: '6.3 - 6.8',
        observacao: 'Aporte de Potássio, Fósforo e melaço para densidade e aroma.'
      },
      {
        fase: 'Maturação / Flush',
        semana: 'Semana 9-10',
        bioStart: '-',
        bioGreen: '-',
        bioBloom: '-',
        bioEM1: '5 ml/L',
        bioMelaco: '-',
        usCmAlvo: '300 - 500 µS/cm',
        phAlvo: '6.2 - 6.5',
        observacao: 'Regas finais só com água desclorada e EM-1 para limpeza.'
      }
    ]
  },
  'super-solo': {
    nome: '3. Super Solo Vivo / Living Soil (Emendas Orgânicas Maturadas)',
    subtitulo: 'BioMix + Bio-Humus + Bio-Aves + Bio-Mamona + Farinha de Algas + Leonardita',
    descricaoManejo: 'Solo carregado de nutrientes de liberação lenta. NA VEGETAÇÃO usa-se MENOS fertilizante líquido (apenas EM-1 + Melaço para ativar a biologia). NA FLORAÇÃO aplica-se a MESMA DOSE do Solo Rico, pois a demanda mineral dispara.',
    badge: { bg: 'rgba(212, 168, 67, 0.15)', color: '#d4a843', border: 'rgba(212, 168, 67, 0.3)' },
    linhas: [
      {
        fase: 'Muda / Enraizamento',
        semana: 'Semana 1',
        bioStart: '1.0 ml/L',
        bioGreen: '-',
        bioBloom: '-',
        bioEM1: '10 ml/L',
        bioMelaco: '5 ml/L',
        usCmAlvo: '300 - 500 µS/cm',
        phAlvo: '6.2 - 6.5',
        observacao: 'Proteção inicial para o transplante e estímulo microbiológico.'
      },
      {
        fase: 'Vegetativo Inicial',
        semana: 'Semana 2',
        bioStart: '-',
        bioGreen: 'MENOS (0 a 1.0 ml/L)',
        bioBloom: '-',
        bioEM1: '10 ml/L',
        bioMelaco: '5 ml/L',
        usCmAlvo: '400 - 600 µS/cm',
        phAlvo: '6.3 - 6.6',
        observacao: 'O solo já fornece Nitrogênio. Foco em EM-1 + Melaço.'
      },
      {
        fase: 'Vegetativo Pleno',
        semana: 'Semana 3-4',
        bioStart: '-',
        bioGreen: 'MENOS (1.0 ml/L só se pedir)',
        bioBloom: '-',
        bioEM1: '10 ml/L',
        bioMelaco: '5 ml/L',
        usCmAlvo: '500 - 700 µS/cm',
        phAlvo: '6.4 - 6.8',
        observacao: 'A matéria orgânica (Mamona/Aves) é mineralizada pelas bactérias.'
      },
      {
        fase: 'Transição / Pré-Flora',
        semana: 'Semana 5',
        bioStart: '-',
        bioGreen: '-',
        bioBloom: '2.0 ml/L',
        bioEM1: '10 ml/L',
        bioMelaco: '5 ml/L',
        usCmAlvo: '1200 - 1500 µS/cm',
        phAlvo: '6.4 - 6.8',
        observacao: 'Início do reforço de Potássio líquido para sustentação floral.'
      },
      {
        fase: 'Floração Plena',
        semana: 'Semana 6-8',
        bioStart: '-',
        bioGreen: '-',
        bioBloom: 'IGUAL (4.0 ml/L)',
        bioEM1: '10 ml/L',
        bioMelaco: '10 ml/L',
        usCmAlvo: '1600 - 2000 µS/cm',
        phAlvo: '6.5 - 6.8',
        observacao: 'DOSE IGUAL AO SOLO RICO: Demanda alta de Fósforo, Potássio e açúcares.'
      },
      {
        fase: 'Maturação / Flush',
        semana: 'Semana 9-10',
        bioStart: '-',
        bioGreen: '-',
        bioBloom: '-',
        bioEM1: '5 ml/L',
        bioMelaco: '-',
        usCmAlvo: '300 - 500 µS/cm',
        phAlvo: '6.3 - 6.8',
        observacao: 'Somente água desclorada para consumo dos açúcares residuais.'
      }
    ]
  }
};

export default function GuiaCultivoPage() {
  const [substratoAtivo, setSubstratoAtivo] = useState<TipoSubstrato>('inerte');

  const tabelaAtual = TABELAS_POR_SUBSTRATO[substratoAtivo];

  return (
    <div style={{ background: '#f8f6f0', minHeight: '100vh', paddingTop: 102, fontFamily: "'Inter', sans-serif" }}>
      <SiteHeader />

      {/* HERO SECTION */}
      <section style={{ background: 'linear-gradient(160deg, #07150a 0%, #0d2410 50%, #081a0b 100%)', color: 'white', padding: '50px 20px 40px', textAlign: 'center' }}>
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 14px', borderRadius: 999, background: 'rgba(212,168,67,0.15)', border: '1px solid rgba(212,168,67,0.3)', marginBottom: 14 }}>
            <Sparkles size={14} color="#d4a843" />
            <span style={{ fontSize: 11, fontWeight: 800, color: '#d4a843', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Manual Técnico de Fertirrigação & Condutividade (µS/cm)
            </span>
          </div>

          <h1 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 900, margin: '0 0 10px', lineHeight: 1.15 }}>
            Guia de Dosagem por Tipo de Substrato
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.78)', maxWidth: 740, margin: '0 auto', lineHeight: 1.6 }}>
            Consulte a tabela semanal calibrada em <strong>µS/cm (microsiemens/cm)</strong> para <strong>Substrato Inerte</strong>, <strong>Solo Rico em Húmus</strong> e <strong>Super Solo Vivo</strong>.
          </p>
        </div>
      </section>

      <main style={{ maxWidth: 1150, margin: '0 auto', padding: '36px 20px 80px' }}>
        
        {/* PARÂMETROS RÁPIDOS EM µS/cm */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 32 }}>
          <div style={{ background: 'white', padding: 20, borderRadius: 16, border: '1px solid #e7e2d6', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#16a34a', fontWeight: 800, fontSize: 12.5, marginBottom: 6 }}>
              <Sprout size={18} /> Início (Enraizamento / Mudas)
            </div>
            <p style={{ fontSize: 22, fontWeight: 900, color: '#0d2410', margin: 0 }}>600 – 800 µS/cm</p>
            <p style={{ fontSize: 11.5, color: '#6b7280', margin: '4px 0 0' }}>EC 0.6 a 0.8 | Solução leve para arranque radicular</p>
          </div>

          <div style={{ background: 'white', padding: 20, borderRadius: 16, border: '1px solid #e7e2d6', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#2563eb', fontWeight: 800, fontSize: 12.5, marginBottom: 6 }}>
              <Leaf size={18} /> Vegetativo Pleno
            </div>
            <p style={{ fontSize: 22, fontWeight: 900, color: '#0d2410', margin: 0 }}>1000 – 1400 µS/cm</p>
            <p style={{ fontSize: 11.5, color: '#6b7280', margin: '4px 0 0' }}>EC 1.0 a 1.4 | Expansão foliar e fotossíntese intensa</p>
          </div>

          <div style={{ background: 'white', padding: 20, borderRadius: 16, border: '1px solid #e7e2d6', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#d97706', fontWeight: 800, fontSize: 12.5, marginBottom: 6 }}>
              <Zap size={18} /> Floração Plena
            </div>
            <p style={{ fontSize: 22, fontWeight: 900, color: '#0d2410', margin: 0 }}>1600 – 2200 µS/cm</p>
            <p style={{ fontSize: 11.5, color: '#6b7280', margin: '4px 0 0' }}>EC 1.6 a 2.2 | Carga pesada de P, K e fito-hormônios</p>
          </div>
        </div>

        {/* SELETOR DAS 3 MODALIDADES DE SUBSTRATO */}
        <div style={{ background: 'white', borderRadius: 20, border: '1px solid #e7e2d6', padding: 20, marginBottom: 32, boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <span style={{ fontSize: 11, fontWeight: 900, color: '#16a34a', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Passo 1: Selecione o seu tipo de meio de cultivo
            </span>
            <h2 style={{ fontSize: 18, fontWeight: 900, color: '#0d2410', margin: '4px 0 0' }}>
              Qual substrato você está utilizando?
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
            {(['inerte', 'rico-humus', 'super-solo'] as TipoSubstrato[]).map((tipo) => {
              const info = TABELAS_POR_SUBSTRATO[tipo];
              const ativo = substratoAtivo === tipo;
              return (
                <button
                  key={tipo}
                  onClick={() => setSubstratoAtivo(tipo)}
                  style={{
                    padding: '14px 16px',
                    borderRadius: 14,
                    border: ativo ? `2px solid ${info.badge.color}` : '1px solid #e5e7eb',
                    background: ativo ? info.badge.bg : '#faf8f5',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <strong style={{ fontSize: 13.5, color: ativo ? '#0d2410' : '#374151', fontWeight: 800 }}>
                      {info.nome.split(' (')[0]}
                    </strong>
                    {ativo && <ShieldCheck size={16} color={info.badge.color} />}
                  </div>
                  <p style={{ fontSize: 11.5, color: '#6b7280', margin: 0, lineHeight: 1.35 }}>
                    {info.subtitulo}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* DETALHADO DO MANEJO & TABELA ATIVA */}
        <div style={{ background: 'white', borderRadius: 20, border: '1px solid #e7e2d6', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', marginBottom: 36 }}>
          
          <div style={{ padding: '24px 28px', borderBottom: '1px solid #f3f4f6', background: '#faf9f5' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 900, padding: '4px 12px', borderRadius: 999, background: tabelaAtual.badge.bg, color: tabelaAtual.badge.color, border: `1px solid ${tabelaAtual.badge.border}` }}>
                MODALIDADE ATIVA
              </span>
              <h3 style={{ fontSize: 18, fontWeight: 900, color: '#0d2410', margin: 0 }}>
                {tabelaAtual.nome}
              </h3>
            </div>
            <p style={{ fontSize: 13.5, color: '#4b5563', margin: 0, lineHeight: 1.55 }}>
              {tabelaAtual.descricaoManejo}
            </p>
          </div>

          {/* TABELA DE DILUIÇÃO */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 12.5 }}>
              <thead>
                <tr style={{ background: '#0d2410', color: '#ffffff', fontWeight: 800 }}>
                  <th style={{ padding: '14px 16px' }}>Fase</th>
                  <th style={{ padding: '14px 16px' }}>Semana</th>
                  <th style={{ padding: '14px 16px', color: '#4ade80' }}>Bio-Start®</th>
                  <th style={{ padding: '14px 16px', color: '#60a5fa' }}>Bio-Green®</th>
                  <th style={{ padding: '14px 16px', color: '#facc15' }}>Bio-Bloom®</th>
                  <th style={{ padding: '14px 16px', color: '#c084fc' }}>Bio-EM1</th>
                  <th style={{ padding: '14px 16px', color: '#fb923c' }}>Bio-Melaço</th>
                  <th style={{ padding: '14px 16px', color: '#38bdf8' }}>µS/cm Alvo</th>
                  <th style={{ padding: '14px 16px' }}>pH Alvo</th>
                </tr>
              </thead>
              <tbody>
                {tabelaAtual.linhas.map((linha, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f3f4f6', background: i % 2 === 0 ? '#ffffff' : '#faf8f5' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 800, color: '#0d2410' }}>{linha.fase}</td>
                    <td style={{ padding: '14px 16px', color: '#6b7280', fontWeight: 600 }}>{linha.semana}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: '#16a34a' }}>{linha.bioStart}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: '#2563eb' }}>{linha.bioGreen}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: '#b45309' }}>{linha.bioBloom}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: '#9333ea' }}>{linha.bioEM1}</td>
                    <td style={{ padding: '14px 16px', fontWeight 700, color: '#ea580c' }}>{linha.bioMelaco}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 900, color: '#0284c7', background: 'rgba(2,132,199,0.05)' }}>
                      {linha.usCmAlvo}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: '#374151' }}>{linha.phAlvo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ padding: '16px 24px', background: '#faf8f5', borderTop: '1px solid #e7e2d6', fontSize: 12, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Info size={16} color="#16a34a" />
            <span>
              <strong>Dica de Medição:</strong> Meça a condutividade da sua água base antes de adicionar os fertilizantes. Se a água da torneira tiver ~200 µS/cm, some esse valor à meta final.
            </span>
          </div>
        </div>

        {/* REGRAS TÉCNICAS E CONVERSÃO DE CONDUTIVIDADE */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
          
          <div style={{ background: '#0d2410', color: 'white', borderRadius: 20, padding: 28 }}>
            <h3 style={{ fontSize: 18, fontWeight: 900, margin: '0 0 14px', color: '#d4a843', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Zap size={18} /> Entendendo a Escala em µS/cm
            </h3>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: '#e5e7eb', lineHeight: 1.6 }}>
              <li style={{ marginBottom: 8 }}>
                <strong>1 mS/cm = 1.000 µS/cm:</strong> Se o seu condutivímetro lê em mS/cm (ex: 1.2 mS/cm), basta multiplicar por 1000 = 1200 µS/cm.
              </li>
              <li style={{ marginBottom: 8 }}>
                <strong>Substrato Inerte:</strong> A cada rega, Meça o runoff (água que escorre no prato). Se o runoff passar de 2400 µS/cm, faça uma rega leve com água pura.
              </li>
              <li>
                <strong>Super Solo Vivo:</strong> Como o solo já possui adubação de liberação lenta, o fertilizante líquido vegetativo entra em dose reduzida para não queimar as raízes. Na floração, porém, a rega com Bio-Bloom entra em carga cheia igual ao solo rico.
              </li>
            </ul>
          </div>

          <div style={{ background: 'white', borderRadius: 20, border: '1px solid #e7e2d6', padding: 28 }}>
            <h3 style={{ fontSize: 18, fontWeight: 900, margin: '0 0 14px', color: '#0d2410', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Droplets size={18} color="#16a34a" /> Boas Práticas de Fertirrigação
            </h3>
            <ol style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: '#374151', lineHeight: 1.6 }}>
              <li style={{ marginBottom: 8 }}>
                <strong>Ajuste de pH após mistura:</strong> Adicione primeiro todos os nutrientes e o Bio-EM1 na água. Meça e ajuste o pH por último (faixa de 5.8 a 6.5).
              </li>
              <li style={{ marginBottom: 8 }}>
                <strong>Água sem Cloro:</strong> O cloro da água da rede mata as bactérias benéficas do Bio-EM1. Deixe a água descansar aberta por 24h antes da preparação.
              </li>
              <li>
                <strong>Bio-Melaço como Alimento Microbiológico:</strong> O melaço fornece açúcares solúveis que multiplicam os microrganismos do EM-1, quelando minerais instantaneamente.
              </li>
            </ol>
          </div>

        </div>

      </main>

      <SiteFooter />
      <WhatsAppButton />
    </div>
  );
}
