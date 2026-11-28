// app/guia-cultivo/page.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Droplet, 
  Sun, 
  Activity, 
  ShieldCheck, 
  Sparkles, 
  FlaskConical, 
  Microscope, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  Layers,
  Sprout,
  HelpCircle,
  BookOpen
} from 'lucide-react';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import CartDrawer from '@/components/CartDrawer';
import WhatsAppButton from '@/components/WhatsAppButton';

// 🧪 DADOS TÉCNICOS DE NUTRIÇÃO DOS 3 TIPOS DE SOLO BIOFLOW DA SHOPEE

interface LinhaTabela {
  fase: string;
  semana: string;
  bioStart: string;
  bioGreen: string;
  bioPotassium: string;
  bioEM1: string;
  bioMelaco: string;
  ecMicrosiemens: string;
  phTarget: string;
  observacao: string;
}

interface DadosSolo {
  id: 'fibra-perlita' | 'substrato-rico' | 'super-solo';
  nomeExato: string;
  badge: string;
  corBadge: { bg: string; text: string; border: string };
  resumoManejo: string;
  composicaoQuimicaFisica: string;
  mecanicaNutricional: string;
  regraFertirrigacao: string;
  tabela: LinhaTabela[];
}

const DADOS_SOLOS: Record<string, DadosSolo> = {
  'fibra-perlita': {
    id: 'fibra-perlita',
    nomeExato: 'Fibra de coco e Perlita (BIOFLOW Coco Mix 50/50)',
    badge: '100% Inerte — Hidroponia Passiva',
    corBadge: { bg: 'rgba(59, 130, 246, 0.15)', text: '#60a5fa', border: 'rgba(59, 130, 246, 0.3)' },
    composicaoQuimicaFisica: '50% Fibra de Coco Granulada Lavada e Dessalinizada + 50% Dióxido de Silício Poroso Mineral (Perlita Expandida Grossa). CE Residual < 200 µS/cm, pH 5.8 a 6.2.',
    resumoManejo: 'Meio 100% inerte sem retenção nutricional nativa. Exige fertirrigação líquida organomineral contínua desde a primeira semana de vida da muda ou clone.',
    mecanicaNutricional: 'A solução nutritiva oxigena e alimenta as raízes diretamente na zona de troca. Resposta metabólica ultrarrápida (24h) com facilidade total de flush e correção de CE.',
    regraFertirrigacao: 'Fertirrigação em todas as regas. Regar até obter 10% a 20% de runoff (escoamento) para evitar acúmulo de sais minerais.',
    tabela: [
      { fase: 'Muda / Clone', semana: 'Semana 1', bioStart: '15 ml/L', bioGreen: '-', bioPotassium: '-', bioEM1: '5 ml/L', bioMelaco: '5 ml/L', ecMicrosiemens: '600 - 800 µS/cm', phTarget: '5.8 - 6.0', observacao: 'Enraizamento acelerado e proteção microbiana' },
      { fase: 'Veg Inicial', semana: 'Semana 2', bioStart: '20 ml/L', bioGreen: '20 ml/L', bioPotassium: '-', bioEM1: '10 ml/L', bioMelaco: '5 ml/L', ecMicrosiemens: '1000 - 1200 µS/cm', phTarget: '5.8 - 6.1', observacao: 'Desenvolvimento do sistema radicular e foliar' },
      { fase: 'Veg Pleno', semana: 'Semana 3-4', bioStart: '10 ml/L', bioGreen: '40 ml/L', bioPotassium: '-', bioEM1: '10 ml/L', bioMelaco: '5 ml/L', ecMicrosiemens: '1200 - 1400 µS/cm', phTarget: '6.0 - 6.2', observacao: 'Acúmulo de biomassa e expansão de caules' },
      { fase: 'Transição Flora', semana: 'Semana 5', bioStart: '-', bioGreen: '20 ml/L', bioPotassium: '30 ml/L', bioEM1: '10 ml/L', bioMelaco: '5 ml/L', ecMicrosiemens: '1400 - 1600 µS/cm', phTarget: '6.1 - 6.3', observacao: 'Indução floral e estímulo dos sítios de floração' },
      { fase: 'Flora Plena / Engorda', semana: 'Semana 6-8', bioStart: '-', bioGreen: '10 ml/L', bioPotassium: '50 ml/L', bioEM1: '10 ml/L', bioMelaco: '10 ml/L', ecMicrosiemens: '1800 - 2200 µS/cm', phTarget: '6.2 - 6.5', observacao: 'Densidade floral, síntese de terpenos e massa' },
      { fase: 'Maturação / Flush', semana: 'Semana 9-10', bioStart: '-', bioGreen: '-', bioPotassium: '-', bioEM1: '-', bioMelaco: '-', ecMicrosiemens: '100 - 300 µS/cm', phTarget: '6.2 - 6.5', observacao: 'Lavagem de sais para sabor e aroma puríssimos' },
    ]
  },
  'substrato-rico': {
    id: 'substrato-rico',
    nomeExato: 'Substrato Rico (BIOFLOW Húmus Mix 40/30/10/20)',
    badge: 'Semi-Inerte Organomineral de Alta Performance',
    corBadge: { bg: 'rgba(34, 197, 94, 0.15)', text: '#4ade80', border: 'rgba(34, 197, 94, 0.3)' },
    composicaoQuimicaFisica: '40% Turfa de Sphagnum / Fibra de Coco + 30% Perlita Expandida + 10% Casca de Arroz Carbonizada (Dióxido de Silício SiO₂) + 20% Vermicomposto Purificado de Minhoca (Húmus Puro).',
    resumoManejo: 'Substrato estruturado com reserva biológica e orgânica inicial. Sustenta o desenvolvimento das mudas nas primeiras 2 a 3 semanas sem necessidade de fertilização pesada.',
    mecanicaNutricional: 'A fração de 20% de Bio-Humus garante ácidos húmicos e fúlvicos e alta CTC (Capacidade de Troca Catiônica). A casca de arroz carbonizada aporta silício amorfo para caules espessos.',
    regraFertirrigacao: 'Iniciar fertirrigação em doses moderadas a partir da 2ª/3ª semana. Intercalar 1 rega com nutrientes e 1 rega com água desclorada + Bio-EM1.',
    tabela: [
      { fase: 'Muda / Clone', semana: 'Semana 1', bioStart: '10 ml/L', bioGreen: '-', bioPotassium: '-', bioEM1: '5 ml/L', bioMelaco: '5 ml/L', ecMicrosiemens: '400 - 600 µS/cm', phTarget: '6.0 - 6.3', observacao: 'Ancoragem inicial; o solo supre a demanda base' },
      { fase: 'Veg Inicial', semana: 'Semana 2', bioStart: '15 ml/L', bioGreen: '15 ml/L', bioPotassium: '-', bioEM1: '10 ml/L', bioMelaco: '5 ml/L', ecMicrosiemens: '800 - 1000 µS/cm', phTarget: '6.0 - 6.3', observacao: 'Ativação da microbiota e nutrição equilibrada' },
      { fase: 'Veg Pleno', semana: 'Semana 3-4', bioStart: '10 ml/L', bioGreen: '30 ml/L', bioPotassium: '-', bioEM1: '10 ml/L', bioMelaco: '5 ml/L', ecMicrosiemens: '1000 - 1200 µS/cm', phTarget: '6.2 - 6.4', observacao: 'Crescimento vegetativo vigoroso e ramificação' },
      { fase: 'Transição Flora', semana: 'Semana 5', bioStart: '-', bioGreen: '15 ml/L', bioPotassium: '25 ml/L', bioEM1: '10 ml/L', bioMelaco: '5 ml/L', ecMicrosiemens: '1200 - 1500 µS/cm', phTarget: '6.2 - 6.5', observacao: 'Preparação dos meristemas florais' },
      { fase: 'Flora Plena / Engorda', semana: 'Semana 6-8', bioStart: '-', bioGreen: '10 ml/L', bioPotassium: '40 ml/L', bioEM1: '10 ml/L', bioMelaco: '10 ml/L', ecMicrosiemens: '1600 - 2000 µS/cm', phTarget: '6.3 - 6.6', observacao: 'Aporte concentrado de Potássio, Fósforo e carboidratos' },
      { fase: 'Maturação / Flush', semana: 'Semana 9-10', bioStart: '-', bioGreen: '-', bioPotassium: '-', bioEM1: '-', bioMelaco: '-', ecMicrosiemens: '100 - 300 µS/cm', phTarget: '6.2 - 6.5', observacao: 'Finalização e consumo das reservas foliares' },
    ]
  },
  'super-solo': {
    id: 'super-solo',
    nomeExato: 'Super Solo (BIOFLOW Super Solo Completo / Living Soil)',
    badge: '100% Orgânico Vivo — Liberação Gradual Lenta',
    corBadge: { bg: 'rgba(212, 168, 67, 0.15)', text: '#facc15', border: 'rgba(212, 168, 67, 0.3)' },
    composicaoQuimicaFisica: 'Base de Turfa + Fibra de Coco + Perlita + Casca de Arroz Carbonizada + Húmus de Minhoca + Matriz Avícola Compostada (Esterco de Galinha) + Torta Vegetal Proteica (Farelo de Mamona) + Carvão Vegetal Ativado (Biochar) / Bokashi.',
    resumoManejo: 'Solo vivo autossuficiente e altamente fertilizado. Na vegetação requer MENOS fertirrigação (apenas ativadores microbiológicos). Na floração exige adubação ativa equivalente ao Substrato Rico.',
    mecanicaNutricional: 'Na vegetação, a biota quebra o NPK orgânico da Mamona e Esterco. Na floração, a demanda exponencial de Fósforo e Potássio exige aplicação da bombona Bio-Potassium para manter a alta performance.',
    regraFertirrigacao: 'Vegetação: Apenas rega com água desclorada + Bio-EM1 + Bio-Melaço (CE baixa de 300 a 600 µS/cm). Floração: Aplicar Bio-Potassium (40 a 50 ml/L) para atingir 1600 a 2000 µS/cm.',
    tabela: [
      { fase: 'Muda / Clone', semana: 'Semana 1', bioStart: '-', bioGreen: '-', bioPotassium: '-', bioEM1: '5 ml/L', bioMelaco: '5 ml/L', ecMicrosiemens: '300 - 500 µS/cm', phTarget: '6.2 - 6.6', observacao: 'Apenas rega biológica; solo supre 100% dos nutrientes' },
      { fase: 'Veg Inicial', semana: 'Semana 2', bioStart: '10 ml/L (Opcional)', bioGreen: '-', bioPotassium: '-', bioEM1: '10 ml/L', bioMelaco: '5 ml/L', ecMicrosiemens: '400 - 600 µS/cm', phTarget: '6.2 - 6.6', observacao: 'Manutenção da microbiota viva e umidade' },
      { fase: 'Veg Pleno', semana: 'Semana 3-4', bioStart: '-', bioGreen: '-', bioPotassium: '-', bioEM1: '10 ml/L', bioMelaco: '5 - 10 ml/L', ecMicrosiemens: '400 - 600 µS/cm', phTarget: '6.3 - 6.7', observacao: 'Solo supre o crescimento vegetativo livre de carências' },
      { fase: 'Transição Flora', semana: 'Semana 5', bioStart: '-', bioGreen: '-', bioPotassium: '20 ml/L', bioEM1: '10 ml/L', bioMelaco: '10 ml/L', ecMicrosiemens: '1000 - 1400 µS/cm', phTarget: '6.4 - 6.7', observacao: 'Entrada de P e K líquido para sustentar o estirão' },
      { fase: 'Flora Plena / Engorda', semana: 'Semana 6-8', bioStart: '-', bioGreen: '-', bioPotassium: '40 - 50 ml/L', bioEM1: '10 ml/L', bioMelaco: '10 ml/L', ecMicrosiemens: '1600 - 2000 µS/cm', phTarget: '6.4 - 6.8', observacao: 'Fertirrigação concentrada igual ao Substrato Rico' },
      { fase: 'Maturação / Flush', semana: 'Semana 9-10', bioStart: '-', bioGreen: '-', bioPotassium: '-', bioEM1: '-', bioMelaco: '-', ecMicrosiemens: '100 - 300 µS/cm', phTarget: '6.3 - 6.6', observacao: 'Lavagem final apenas com água purificada' },
    ]
  }
};

export default function GuiaCultivoPage() {
  const [soloAtivo, setSoloAtivo] = useState<'fibra-perlita' | 'substrato-rico' | 'super-solo'>('fibra-perlita');
  const dados = DADOS_SOLOS[soloAtivo];

  return (
    <div style={{ background: '#f8f6f0', minHeight: '100vh', paddingTop: 102, fontFamily: "'Inter', sans-serif" }}>
      <SiteHeader />
      <CartDrawer />

      {/* HERO SECTION */}
      <section style={{ background: 'linear-gradient(160deg, #07150a 0%, #0d2410 45%, #133317 80%, #081a0b 100%)', color: 'white', padding: '50px 20px', textAlign: 'center' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(212,168,67,0.15)', border: '1px solid rgba(212,168,67,0.35)', color: '#d4a843', padding: '4px 14px', borderRadius: 999, fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
            <Microscope size={14} /> Manual Técnico de Nutrição Organomineral
          </div>

          <h1 style={{ fontSize: 'clamp(28px, 4.5vw, 42px)', fontWeight: 900, lineHeight: 1.15, margin: '0 0 12px', color: '#ffffff' }}>
            Guia de Cultivo & Tabelas de Fertirrigação
          </h1>

          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.75)', maxWidth: 750, margin: '0 auto', lineHeight: 1.6 }}>
            Selecione o seu meio de cultivo (<strong>Fibra de coco e Perlita</strong>, <strong>Substrato Rico</strong> ou <strong>Super Solo</strong>) e siga o protocolo semanal exato em microsiemens por centímetro (<strong>µS/cm</strong>) e pH.
          </p>
        </div>
      </section>

      <main style={{ maxWidth: 1150, margin: '0 auto', padding: '40px 20px 80px' }}>
        
        {/* PARÂMETROS GERAIS DE CONTROLE */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16, marginBottom: 36 }}>
          
          <div style={{ background: 'white', padding: 20, borderRadius: 16, border: '1px solid #e7e2d6', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#15803d', fontWeight: 800, marginBottom: 6 }}>
              <Activity size={20} /> Faixa de pH Recomendada
            </div>
            <p style={{ fontSize: 21, fontWeight: 900, color: '#111827', margin: 0 }}>5.8 a 6.8</p>
            <p style={{ fontSize: 12, color: '#6b7280', margin: '4px 0 0' }}>5.8-6.2 para Inerte | 6.2-6.8 para Solo Vivo</p>
          </div>

          <div style={{ background: 'white', padding: 20, borderRadius: 16, border: '1px solid #e7e2d6', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#0284c7', fontWeight: 800, marginBottom: 6 }}>
              <Droplet size={20} /> Condutividade Elétrica (µS/cm)
            </div>
            <p style={{ fontSize: 21, fontWeight: 900, color: '#111827', margin: 0 }}>400 a 2200 µS/cm</p>
            <p style={{ fontSize: 12, color: '#6b7280', margin: '4px 0 0' }}>Medição padrão em microsiemens por cm</p>
          </div>

          <div style={{ background: 'white', padding: 20, borderRadius: 16, border: '1px solid #e7e2d6', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#d4a843', fontWeight: 800, marginBottom: 6 }}>
              <Sun size={20} /> Temperatura da Solução
            </div>
            <p style={{ fontSize: 21, fontWeight: 900, color: '#111827', margin: 0 }}>20°C a 23°C</p>
            <p style={{ fontSize: 12, color: '#6b7280', margin: '4px 0 0' }}>Garante oxigenação máxima na irrigação</p>
          </div>

        </div>

        {/* SELETOR DOS 3 TIPOS DE SOLO BIOFLOW */}
        <div style={{ marginBottom: 28, textAlign: 'center' }}>
          <h2 style={{ fontSize: 20, fontWeight: 900, color: '#0d2410', marginBottom: 12 }}>
            Escolha o seu Substrato BIOFLOW®:
          </h2>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => setSoloAtivo('fibra-perlita')}
              style={{
                padding: '12px 22px',
                borderRadius: 12,
                border: soloAtivo === 'fibra-perlita' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                background: soloAtivo === 'fibra-perlita' ? '#eff6ff' : '#ffffff',
                color: soloAtivo === 'fibra-perlita' ? '#1d4ed8' : '#475569',
                fontWeight: 800,
                fontSize: 13.5,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: soloAtivo === 'fibra-perlita' ? '0 4px 12px rgba(37, 99, 235, 0.15)' : 'none',
              }}
            >
              🥥 Fibra de coco e Perlita (50/50 Inerte)
            </button>

            <button
              onClick={() => setSoloAtivo('substrato-rico')}
              style={{
                padding: '12px 22px',
                borderRadius: 12,
                border: soloAtivo === 'substrato-rico' ? '2px solid #16a34a' : '1px solid #cbd5e1',
                background: soloAtivo === 'substrato-rico' ? '#f0fdf4' : '#ffffff',
                color: soloAtivo === 'substrato-rico' ? '#15803d' : '#475569',
                fontWeight: 800,
                fontSize: 13.5,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: soloAtivo === 'substrato-rico' ? '0 4px 12px rgba(22, 163, 74, 0.15)' : 'none',
              }}
            >
              🌿 Substrato Rico (BioMix + 20% Húmus)
            </button>

            <button
              onClick={() => setSoloAtivo('super-solo')}
              style={{
                padding: '12px 22px',
                borderRadius: 12,
                border: soloAtivo === 'super-solo' ? '2px solid #ca8a04' : '1px solid #cbd5e1',
                background: soloAtivo === 'super-solo' ? '#fefce8' : '#ffffff',
                color: soloAtivo === 'super-solo' ? '#854d0e' : '#475569',
                fontWeight: 800,
                fontSize: 13.5,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: soloAtivo === 'super-solo' ? '0 4px 12px rgba(202, 138, 4, 0.15)' : 'none',
              }}
            >
              🪱 Super Solo (Living Soil Completo)
            </button>
          </div>
        </div>

        {/* DETALHAMENTO E REGRA TÉCNICA DO SOLO SELECIONADO */}
        <div style={{ background: 'white', borderRadius: 20, border: '1px solid #e7e2d6', padding: 28, marginBottom: 32, boxShadow: '0 4px 16px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
            <h3 style={{ fontSize: 20, fontWeight: 900, color: '#0d2410', margin: 0 }}>
              {dados.nomeExato}
            </h3>
            <span style={{ fontSize: 12, fontWeight: 800, padding: '5px 14px', borderRadius: 999, background: dados.corBadge.bg, color: dados.corBadge.text, border: `1px solid ${dados.corBadge.border}` }}>
              {dados.badge}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, fontSize: 13, color: '#374151', lineHeight: 1.5 }}>
            <div style={{ background: '#f9fafb', padding: 16, borderRadius: 12, border: '1px solid #f3f4f6' }}>
              <strong style={{ color: '#0d2410', display: 'block', marginBottom: 4, fontSize: 13.5 }}>🧪 Composição Físico-Química:</strong>
              {dados.composicaoQuimicaFisica}
            </div>

            <div style={{ background: '#f9fafb', padding: 16, borderRadius: 12, border: '1px solid #f3f4f6' }}>
              <strong style={{ color: '#0d2410', display: 'block', marginBottom: 4, fontSize: 13.5 }}>⚙️ Dinâmica Nutricional:</strong>
              {dados.mecanicaNutricional}
            </div>

            <div style={{ background: '#f9fafb', padding: 16, borderRadius: 12, border: '1px solid #f3f4f6' }}>
              <strong style={{ color: '#0d2410', display: 'block', marginBottom: 4, fontSize: 13.5 }}>💧 Regra de Irrigação:</strong>
              {dados.regraFertirrigacao}
            </div>
          </div>
        </div>

        {/* TABELA SEMANAL DE DILUIÇÃO EM ML/LITER E US/CM */}
        <div style={{ background: 'white', borderRadius: 20, border: '1px solid #e7e2d6', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', marginBottom: 40 }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 900, margin: 0, color: '#0d2410' }}>
                Tabela Semanal de Fertirrigação Organomineral (ml / Litro de Água)
              </h3>
              <p style={{ fontSize: 13, color: '#6b7280', margin: '4px 0 0' }}>
                Valores calculados para 1 Litro de água limpa e desclorada.
              </p>
            </div>
            <span style={{ fontSize: 12, fontWeight: 800, background: 'rgba(34,197,94,0.1)', color: '#15803d', padding: '6px 14px', borderRadius: 8 }}>
              Ciclo de 10 Semanas
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#faf9f5', borderBottom: '1px solid #e7e2d6', color: '#374151', fontWeight: 800 }}>
                  <th style={{ padding: '14px 16px' }}>Fase / Estágio</th>
                  <th style={{ padding: '14px 16px' }}>Semana</th>
                  <th style={{ padding: '14px 16px', color: '#047857' }}>Bio-Start®</th>
                  <th style={{ padding: '14px 16px', color: '#15803d' }}>Bio-Green®</th>
                  <th style={{ padding: '14px 16px', color: '#b45309' }}>Bio-Potassium®</th>
                  <th style={{ padding: '14px 16px', color: '#6b21a8' }}>Bio-EM1®</th>
                  <th style={{ padding: '14px 16px', color: '#ca8a04' }}>Bio-Melaço®</th>
                  <th style={{ padding: '14px 16px', color: '#0284c7' }}>EC Alvo (µS/cm)</th>
                  <th style={{ padding: '14px 16px' }}>pH Alvo</th>
                  <th style={{ padding: '14px 16px' }}>Objetivo do Manejo</th>
                </tr>
              </thead>
              <tbody>
                {dados.tabela.map((linha, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f3f4f6', background: i % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 800, color: '#0d2410' }}>{linha.fase}</td>
                    <td style={{ padding: '14px 16px', color: '#6b7280', fontWeight: 600 }}>{linha.semana}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 800, color: '#047857' }}>{linha.bioStart}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 800, color: '#15803d' }}>{linha.bioGreen}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 800, color: '#b45309' }}>{linha.bioPotassium}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 800, color: '#6b21a8' }}>{linha.bioEM1}</td>
                    <td style={{ padding: '14px 16px', fontWeight 800, color: '#ca8a04' }}>{linha.bioMelaco}</td>
                    <td style={{ padding: '14px 16px', color: '#0284c7', fontWeight 800 }}>{linha.ecMicrosiemens}</td>
                    <td style={{ padding: '14px 16px', color: '#374151', fontWeight 700 }}>{linha.phTarget}</td>
                    <td style={{ padding: '14px 16px', color: '#6b7280', fontSize: 12 }}>{linha.observacao}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* REGRA TÉCNICA DAS BOMBONAS BIOFLOW */}
        <div style={{ background: '#0d2410', color: 'white', borderRadius: 20, padding: 32, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: 20, fontWeight: 900, margin: '0 0 16px', color: '#d4a843', display: 'flex', alignItems: 'center', gap: 10 }}>
            <FlaskConical size={22} /> Formulação Científica das Bombonas BIOFLOW®
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, fontSize: 13.5, color: '#e5e7eb', lineHeight: 1.6 }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: 18, borderRadius: 14, border: '1px solid rgba(255,255,255,0.1)' }}>
              <strong style={{ color: '#4ade80', fontSize: 15, display: 'block', marginBottom: 6 }}>🌱 Bombona 1: Bio-Start® (Enraizamento)</strong>
              Consórcio Inoculante de Microrganismos Eficazes (EM-1) + Carbono Orgânico Solúvel (Melaço) + Vermicomposto Purificado + Ácidos Húmicos e Fúlvicos de Leonardita Australiana e Extrato de Algas Marinhas (<em>Solo Rico</em>) + Superfosfato Simples quelatado.
            </div>

            <div style={{ background: 'rgba(255,255,255,0.05)', padding: 18, borderRadius: 14, border: '1px solid rgba(255,255,255,0.1)' }}>
              <strong style={{ color: '#60a5fa', fontSize: 15, display: 'block', marginBottom: 6 }}>🍃 Bombona 2: Bio-Green® (Vegetação & Biomassa)</strong>
              Consórcio Inoculante de Microrganismos Eficazes (EM-1) + Carbono Orgânico Solúvel (Melaço) + Vermicomposto + Torta Vegetal Proteica de Mamona (Nitrogênio orgânico vegetal) + Sulfato de Magnésio e Enxofre (Sal de Epsom).
            </div>

            <div style={{ background: 'rgba(255,255,255,0.05)', padding: 18, borderRadius: 14, border: '1px solid rgba(255,255,255,0.1)' }}>
              <strong style={{ color: '#facc15', fontSize: 15, display: 'block', marginBottom: 6 }}>🌺 Bombona 3: Bio-Potassium® / Bio-Bloom (Floração)</strong>
              Consórcio Inoculante de Microrganismos Eficazes (EM-1) + Carbono Orgânico Solúvel (Melaço) + Fosfato Monopotássico (MKP) + Silicato e Potássio de Cinza de Madeira + Extrato Botânico de <em>Aloe barbadensis Miller</em> (Babosa / Acemanana).
            </div>
          </div>
        </div>

      </main>

      <SiteFooter />
      <WhatsAppButton />
    </div>
  );
}
