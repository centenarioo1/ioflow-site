// app/guia-cultivo/page.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Droplet, Sun, Wind, Activity, Download, ShieldCheck, HelpCircle, 
  Sprout, Layers, FlaskConical, Sparkles, CheckCircle2, AlertTriangle, 
  ArrowRight, BookOpen, Microscope 
} from 'lucide-react';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import TrustBar from '@/components/TrustBar';
import WhatsAppButton from '@/components/WhatsAppButton';

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

const TABELAS_POR_SOLO: Record<string, {
  nomeSolo: string;
  subtitulo: string;
  badgeCor: { bg: string; text: string; border: string };
  mecanicaNutricional: string;
  recomendacaoRega: string;
  linhas: LinhaTabela[];
}> = {
  inerte: {
    nomeSolo: '1. Fibra de Coco e Perlita (50% / 50% — Inerte)',
    subtitulo: 'Hidroponia Passiva Contínua — Resposta Instantânea sem Reserva Nutritiva Nascida no Solo',
    badgeCor: { bg: 'rgba(59, 130, 246, 0.15)', text: '#2563eb', border: '#93c5fd' },
    mecanicaNutricional: 'CE residual < 200 µS/cm. A fibra lavada e a perlita vulcânica não possuem nutrientes nativos. A planta depende 100% da solução organomineral fornecida em todas as regas.',
    recomendacaoRega: 'Fertirrigação em todas as regas. Mantenha 10% a 15% de escoamento (run-off) para renovação iônica do vaso.',
    linhas: [
      { fase: 'Muda / Clone', semana: 'Semana 1', bioStart: '20 ml/L', bioGreen: '-', bioPotassium: '-', bioEM1: '10 ml/L', bioMelaco: '5 ml/L', ecMicrosiemens: '600 - 800 µS/cm', phTarget: '5.8 - 6.0', observacao: 'Inoculação microbiológica e enraizamento inicial' },
      { fase: 'Vegetativo Inicial', semana: 'Semana 2', bioStart: '20 ml/L', bioGreen: '30 ml/L', bioPotassium: '-', bioEM1: '10 ml/L', bioMelaco: '5 ml/L', ecMicrosiemens: '1000 - 1200 µS/cm', phTarget: '5.8 - 6.0', observacao: 'Desenvolvimento do sistema radicular e biomassa' },
      { fase: 'Vegetativo Pleno', semana: 'Semana 3-4', bioStart: '10 ml/L', bioGreen: '40 ml/L', bioPotassium: '-', bioEM1: '10 ml/L', bioMelaco: '5 - 10 ml/L', ecMicrosiemens: '1200 - 1400 µS/cm', phTarget: '5.8 - 6.1', observacao: 'Perfilhamento vigoroso e caules reforçados' },
      { fase: 'Transição Flora', semana: 'Semana 5', bioStart: '-', bioGreen: '20 ml/L', bioPotassium: '30 ml/L', bioEM1: '10 ml/L', bioMelaco: '10 ml/L', ecMicrosiemens: '1400 - 1600 µS/cm', phTarget: '6.0 - 6.2', observacao: 'Estímulo à pré-floração e diferenciação de cálices' },
      { fase: 'Floração Plena', semana: 'Semana 6-8', bioStart: '-', bioGreen: '10 ml/L', bioPotassium: '50 ml/L', bioEM1: '10 ml/L', bioMelaco: '10 ml/L', ecMicrosiemens: '1800 - 2200 µS/cm', phTarget: '6.2 - 6.5', observacao: 'Máxima densidade floral, síntese de terpenos e resina' },
      { fase: 'Maturação / Flush', semana: 'Semana 9-10', bioStart: '-', bioGreen: '-', bioPotassium: '-', bioEM1: '-', bioMelaco: '-', ecMicrosiemens: '100 - 300 µS/cm', phTarget: '6.0 - 6.5', observacao: 'Lavagem de sais com água desclorada pura' },
    ]
  },
  'rico-humus': {
    nomeSolo: '2. Substrato Rico (BioMix 40/30/10 + 20% Bio-Humus)',
    subtitulo: 'Turfa + Perlita + Casca de Arroz Carbonizada + Vermicomposto Puro de Minhoca',
    badgeCor: { bg: 'rgba(34, 197, 94, 0.15)', text: '#16a34a', border: '#86efac' },
    mecanicaNutricional: 'CE inicial ~ 800 - 1000 µS/cm. O Bio-Humus fornece ácidos húmicos/fúlvicos e Cátions solúveis. A fertirrigação complementa e mantém o fluxo constante.',
    recomendacaoRega: 'Intercalada (1x solução organomineral, 1x água pura desclorada com Bio-Melaço).',
    linhas: [
      { fase: 'Muda / Clone', semana: 'Semana 1', bioStart: '15 ml/L', bioGreen: '-', bioPotassium: '-', bioEM1: '10 ml/L', bioMelaco: '5 ml/L', ecMicrosiemens: '500 - 700 µS/cm', phTarget: '6.0 - 6.2', observacao: 'Ancoragem suave sem risco de estresse osmótico' },
      { fase: 'Vegetativo Inicial', semana: 'Semana 2', bioStart: '15 ml/L', bioGreen: '20 ml/L', bioPotassium: '-', bioEM1: '10 ml/L', bioMelaco: '5 ml/L', ecMicrosiemens: '800 - 1000 µS/cm', phTarget: '6.0 - 6.3', observacao: 'Ativação microbiológica da zona radicular' },
      { fase: 'Vegetativo Pleno', semana: 'Semana 3-4', bioStart: '10 ml/L', bioGreen: '30 ml/L', bioPotassium: '-', bioEM1: '10 ml/L', bioMelaco: '5 ml/L', ecMicrosiemens: '1000 - 1200 µS/cm', phTarget: '6.0 - 6.4', observacao: 'Desenvolvimento foliar equilibrado e caules espessos' },
      { fase: 'Transição Flora', semana: 'Semana 5', bioStart: '-', bioGreen: '15 ml/L', bioPotassium: '25 ml/L', bioEM1: '10 ml/L', bioMelaco: '10 ml/L', ecMicrosiemens: '1200 - 1500 µS/cm', phTarget: '6.2 - 6.5', observacao: 'Indução floral com suporte de fósforo e potássio' },
      { fase: 'Floração Plena', semana: 'Semana 6-8', bioStart: '-', bioGreen: '10 ml/L', bioPotassium: '40 ml/L', bioEM1: '10 ml/L', bioMelaco: '10 ml/L', ecMicrosiemens: '1600 - 2000 µS/cm', phTarget: '6.3 - 6.6', observacao: 'Engorda de frutos/flores e aroma intenso' },
      { fase: 'Maturação / Flush', semana: 'Semana 9-10', bioStart: '-', bioGreen: '-', bioPotassium: '-', bioEM1: '-', bioMelaco: '-', ecMicrosiemens: '100 - 300 µS/cm', phTarget: '6.2 - 6.6', observacao: 'Flush final para ressaltar pureza do sabor' },
    ]
  },
  'super-solo': {
    nomeSolo: '3. Super Solo Completo (Living Soil Orgânico Biomassa)',
    subtitulo: 'Enriquecido com Esterco de Aves, Torta de Mamona, Biochar e Minerais Naturais',
    badgeCor: { bg: 'rgba(212, 168, 67, 0.15)', text: '#ca8a04', border: '#fde047' },
    mecanicaNutricional: 'CE nativa elevada (> 1500 µS/cm em matéria seca). Na vegetação necessita de MENOS adubação líquida. Na floração exige adubação com Bio-Potassium para suprir o alto consumo de P/K.',
    recomendacaoRega: 'Vegetativo: regar predominantemente com água pura + Bio-EM1 (10ml/L) + Bio-Melaço (5ml/L). Floração: aplicar Bio-Potassium.',
    linhas: [
      { fase: 'Muda / Clone', semana: 'Semana 1', bioStart: '10 ml/L', bioGreen: '-', bioPotassium: '-', bioEM1: '10 ml/L', bioMelaco: '5 ml/L', ecMicrosiemens: '300 - 500 µS/cm', phTarget: '6.2 - 6.5', observacao: 'Apenas inóculo biológico; o solo atua como matriz' },
      { fase: 'Vegetativo Inicial', semana: 'Semana 2', bioStart: '-', bioGreen: '-', bioPotassium: '-', bioEM1: '10 ml/L', bioMelaco: '5 ml/L', ecMicrosiemens: '300 - 500 µS/cm', phTarget: '6.2 - 6.5', observacao: 'Ativação das bactérias para quebra do N-orgânico' },
      { fase: 'Vegetativo Pleno', semana: 'Semana 3-4', bioStart: '-', bioGreen: '10 ml/L (opcional)', bioPotassium: '-', bioEM1: '10 ml/L', bioMelaco: '5 - 10 ml/L', ecMicrosiemens: '400 - 600 µS/cm', phTarget: '6.3 - 6.6', observacao: 'Nutrição 100% sustentada pelas emendas do solo' },
      { fase: 'Transição Flora', semana: 'Semana 5', bioStart: '-', bioGreen: '-', bioPotassium: '20 ml/L', bioEM1: '10 ml/L', bioMelaco: '10 ml/L', ecMicrosiemens: '1000 - 1400 µS/cm', phTarget: '6.3 - 6.7', observacao: 'Aporte inicial de potássio líquido para floração' },
      { fase: 'Floração Plena', semana: 'Semana 6-8', bioStart: '-', bioGreen: '-', bioPotassium: '40 - 50 ml/L', bioEM1: '10 ml/L', bioMelaco: '10 ml/L', ecMicrosiemens: '1600 - 2000 µS/cm', phTarget: '6.4 - 6.8', observacao: 'Aceleração da engorda com potássio e carboidratos' },
      { fase: 'Maturação / Flush', semana: 'Semana 9-10', bioStart: '-', bioGreen: '-', bioPotassium: '-', bioEM1: '-', bioMelaco: '-', ecMicrosiemens: '100 - 300 µS/cm', phTarget: '6.3 - 6.7', observacao: 'Consumo final das reservas de matéria orgânica' },
    ]
  }
};

export default function GuiaCultivoPage() {
  const [soloAtivo, setSoloAtivo] = useState<'inerte' | 'rico-humus' | 'super-solo'>('inerte');
  const dados = TABELAS_POR_SOLO[soloAtivo];

  return (
    <div style={{ background: '#f8f6f0', minHeight: '100vh', paddingTop: 102, fontFamily: "'Inter', sans-serif" }}>
      <SiteHeader />

      {/* BANNER PRINCIPAL */}
      <section style={{ background: 'linear-gradient(135deg, #07150a 0%, #0d2410 100%)', color: 'white', padding: '50px 20px', textAlign: 'center' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(212, 168, 67, 0.15)', border: '1px solid rgba(212, 168, 67, 0.35)', color: '#d4a843', padding: '6px 16px', borderRadius: 999, fontSize: 11.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
            <Microscope size={15} /> Tabela de Manejo & Dosagem Oficial BIOFLOW®
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 900, margin: '0 0 12px', lineHeight: 1.15 }}>
            Guia Nutricional por Tipo de Substrato
          </h1>
          <p style={{ fontSize: 14.5, color: 'rgba(255,255,255,0.8)', maxWidth: 700, margin: '0 auto', lineHeight: 1.6 }}>
            Consulte a programação semanal de fertirrigação personalizada para o seu solo com metas precisas em <strong>Microsiemens por Centímetro (µS/cm)</strong> e potencial hidrogeniônico (pH).
          </p>
        </div>
      </section>

      <main style={{ maxWidth: 1150, margin: '0 auto', padding: '40px 20px 80px' }}>
        
        {/* PARÂMETROS GERAIS DE CONTROLE */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 36 }}>
          <div style={{ background: 'white', padding: 20, borderRadius: 16, border: '1px solid #e7e2d6' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#15803d', fontWeight: 800, marginBottom: 6 }}>
              <Activity size={20} /> Faixa de pH Ideal
            </div>
            <p style={{ fontSize: 20, fontWeight: 900, color: '#111827', margin: 0 }}>5.8 a 6.8</p>
            <p style={{ fontSize: 12, color: '#6b7280', margin: '4px 0 0' }}>Estabilidade para absorção de micronutrientes</p>
          </div>

          <div style={{ background: 'white', padding: 20, borderRadius: 16, border: '1px solid #e7e2d6' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#0284c7', fontWeight: 800, marginBottom: 6 }}>
              <Droplet size={20} /> Unidade de Medida
            </div>
            <p style={{ fontSize: 20, fontWeight 900, color: '#111827', margin: 0 }}>µS/cm (Microsiemens)</p>
            <p style={{ fontSize: 12, color: '#6b7280', margin: '4px 0 0' }}>1.000 µS/cm = 1.0 mS/cm (ou ~ 500 PPM)</p>
          </div>

          <div style={{ background: 'white', padding: 20, borderRadius: 16, border: '1px solid #e7e2d6' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#d4a843', fontWeight: 800, marginBottom: 6 }}>
              <Sun size={20} /> Oxigênio & Temperatura
            </div>
            <p style={{ fontSize: 20, fontWeight: 900, color: '#111827', margin: 0 }}>20°C a 22°C</p>
            <p style={{ fontSize: 12, color: '#6b7280', margin: '4px 0 0' }}>Evita degradação dos microrganismos vivos</p>
          </div>
        </div>

        {/* SELETOR DOS 3 SOLOS DA SHOPEE */}
        <div style={{ marginBottom: 28, textAlign: 'center' }}>
          <span style={{ fontSize: 12, fontWeight: 800, color: '#854d0e', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 12 }}>
            Selecione o seu Substrato BIOFLOW® para carregar a Tabela Exata:
          </span>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { id: 'inerte', label: '🥥 Fibra de Coco e Perlita (50/50 Inerte)' },
              { id: 'rico-humus', label: '🪴 Substrato Rico em Húmus (BioMix + 20% Húmus)' },
              { id: 'super-solo', label: '⚡ Super Solo Completo (Living Soil)' },
            ].map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSoloAtivo(s.id as any)}
                style={{
                  padding: '12px 20px',
                  borderRadius: 12,
                  border: soloAtivo === s.id ? '2px solid #15803d' : '1px solid #e7e2d6',
                  background: soloAtivo === s.id ? '#15803d' : '#ffffff',
                  color: soloAtivo === s.id ? '#ffffff' : '#374151',
                  fontWeight: 800,
                  fontSize: 13.5,
                  cursor: 'pointer',
                  boxShadow: soloAtivo === s.id ? '0 4px 12px rgba(21, 128, 61, 0.25)' : 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* CABEÇALHO DO SOLO SELECIONADO */}
        <div style={{ background: '#ffffff', border: '1px solid #e7e2d6', borderRadius: 20, padding: 24, marginBottom: 24, boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: '#0d2410', margin: 0 }}>
              {dados.nomeSolo}
            </h2>
            <span style={{ fontSize: 12, fontWeight: 800, padding: '4px 12px', borderRadius: 999, background: dados.badgeCor.bg, color: dados.badgeCor.text, border: `1px solid ${dados.badgeCor.border}` }}>
              Manejo Específico
            </span>
          </div>
          <p style={{ fontSize: 13.5, color: '#4b5563', margin: '0 0 12px', lineHeight: 1.5 }}>
            {dados.subtitulo}
          </p>
          <div style={{ background: '#fcfbf9', borderLeft: '4px solid #15803d', padding: '10px 14px', borderRadius: 6, fontSize: 12.5, color: '#374151', marginBottom: 8 }}>
            <strong>Dinâmica de Solo:</strong> {dados.mecanicaNutricional}
          </div>
          <div style={{ background: '#fefce8', borderLeft: '4px solid #ca8a04', padding: '10px 14px', borderRadius: 6, fontSize: 12.5, color: '#854d0e' }}>
            <strong>Recomendação de Rega:</strong> {dados.recomendacaoRega}
          </div>
        </div>

        {/* TABELA DE ALIMENTAÇÃO DA OPÇÃO SELECIONADA */}
        <div style={{ background: 'white', borderRadius: 20, border: '1px solid #e7e2d6', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', marginBottom: 40 }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid #f3f4f6', background: '#faf9f5' }}>
            <h3 style={{ fontSize: 16, fontWeight: 900, margin: 0, color: '#0d2410' }}>
              Tabela de Diluição Semanal (ml por Litro de Água Desclorada)
            </h3>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 12.5 }}>
              <thead>
                <tr style={{ background: '#f3efe6', borderBottom: '1px solid #e7e2d6', color: '#132e13', fontWeight: 800 }}>
                  <th style={{ padding: '14px 16px' }}>Fase / Ciclo</th>
                  <th style={{ padding: '14px 16px' }}>Semana</th>
                  <th style={{ padding: '14px 16px', color: '#15803d' }}>Bio-Start®</th>
                  <th style={{ padding: '14px 16px', color: '#16a34a' }}>Bio-Green®</th>
                  <th style={{ padding: '14px 16px', color: '#b45309' }}>Bio-Potassium®</th>
                  <th style={{ padding: '14px 16px', color: '#6b21a8' }}>Bio-EM1®</th>
                  <th style={{ padding: '14px 16px', color: '#ca8a04' }}>Bio-Melaço®</th>
                  <th style={{ padding: '14px 16px', color: '#0284c7' }}>Condutividade (µS/cm)</th>
                  <th style={{ padding: '14px 16px' }}>pH Alvo</th>
                  <th style={{ padding: '14px 16px' }}>Observação do Manejo</th>
                </tr>
              </thead>
              <tbody>
                {dados.linhas.map((linha, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f3f4f6', background: i % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 800, color: '#111827' }}>{linha.fase}</td>
                    <td style={{ padding: '14px 16px', color: '#6b7280', fontWeight: 600 }}>{linha.semana}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 800, color: '#15803d' }}>{linha.bioStart}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 800, color: '#15803d' }}>{linha.bioGreen}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 800, color: '#b45309' }}>{linha.bioPotassium}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 800, color: '#6b21a8' }}>{linha.bioEM1}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 800, color: '#ca8a04' }}>{linha.bioMelaco}</td>
                    <td style={{ padding: '14px 16px', color: '#0284c7', fontWeight: 800 }}>{linha.ecMicrosiemens}</td>
                    <td style={{ padding: '14px 16px', color: '#374151', fontWeight: 700 }}>{linha.phTarget}</td>
                    <td style={{ padding: '14px 16px', color: '#6b7280', fontSize: 12 }}>{linha.observacao}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* DICAS E REGRAS TÉCNICAS */}
        <div style={{ background: '#0d2410', color: 'white', borderRadius: 20, padding: 32 }}>
          <h3 style={{ fontSize: 20, fontWeight: 900, margin: '0 0 16px', color: '#d4a843', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Sparkles size={22} /> Diretrizes do Protocolo Tecnológico BIOFLOW®
          </h3>
          <ul style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, padding: 0, listStyle: 'none', margin: 0, fontSize: 13, color: '#e5e7eb', lineHeight: 1.6 }}>
            <li style={{ background: 'rgba(255,255,255,0.05)', padding: 16, borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)' }}>
              <strong style={{ color: '#4ade80', display: 'block', marginBottom: 4 }}>1. Água sem Cloro:</strong>
              O cloro da água de torneira destrói o consórcio vivo do Bio-EM1®. Utilize água de poço, filtro de carvão ativado ou deixe a água descansar por 24 horas.
            </li>
            <li style={{ background: 'rgba(255,255,255,0.05)', padding: 16, borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)' }}>
              <strong style={{ color: '#4ade80', display: 'block', marginBottom: 4 }}>2. Ordem de Mistura das Bombonas:</strong>
              Adicione primeiro o Bio-EM1® e o Bio-Melaço® em água. Em seguida, incorpore a base líquida (Bio-Start, Bio-Green ou Bio-Potassium) e meça o pH por último.
            </li>
            <li style={{ background: 'rgba(255,255,255,0.05)', padding: 16, borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)' }}>
              <strong style={{ color: '#4ade80', display: 'block', marginBottom: 4 }}>3. Leitura de Condutividade (µS/cm):</strong>
              Medidores comuns exibem os valores em µS/cm. Se o seu medidor for em mS/cm, basta dividir por 1.000 (ex: 1.400 µS/cm = 1.4 mS/cm).
            </li>
          </ul>
        </div>
      </main>

      <TrustBar />
      <SiteFooter />
      <WhatsAppButton />
    </div>
  );
}
