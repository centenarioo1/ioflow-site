// app/calculadora/CalculadoraClient.tsx
'use client';

import React, { useState } from 'react';
import { 
  Droplets, 
  Calendar, 
  Sparkles, 
  AlertCircle,
  CheckCircle2,
  FlaskConical,
  Layers,
  Cpu,
  BookOpen,
  ArrowRight,
  Info
} from 'lucide-react';
import WhatsAppButton from '@/components/WhatsAppButton';

type TipoSubstrato = 'inerte' | 'semi-inerte' | 'super-soil';

interface SubstratoInfo {
  id: TipoSubstrato;
  nome: string;
  badge: string;
  phVeg: string;
  phFlora: string;
  frequenciaRega: string;
  multiplicadorDose: number;
  descricaoManejo: string;
}

const substratosData: Record<TipoSubstrato, SubstratoInfo> = {
  inerte: {
    id: 'inerte',
    nome: '100% Inerte (Coco Mix / Perlita)',
    badge: 'Hidroponia Passiva',
    phVeg: '5.8 – 6.0',
    phFlora: '6.0 – 6.2',
    frequenciaRega: 'Diária ou a cada 2 dias (com 10-20% de runoff)',
    multiplicadorDose: 1.0,
    descricaoManejo: 'Zero reservas nativas. A nutrição e o controle de pH dependem 100% da sua calda nutritiva em todas as regas.',
  },
  'semi-inerte': {
    id: 'semi-inerte',
    nome: 'Semi-Inerte (BioMix / Turfa + Perlita + Húmus)',
    badge: 'Equilíbrio & Tolerância',
    phVeg: '6.0 – 6.2',
    phFlora: '6.2 – 6.4',
    frequenciaRega: 'A cada 2 a 3 dias (regar quando o vaso estiver 50% mais leve)',
    multiplicadorDose: 0.8,
    descricaoManejo: 'O húmus fornece tamponamento e nutrientes iniciais. Doses equilibradas para não saturar a matéria orgânica.',
  },
  'super-soil': {
    id: 'super-soil',
    nome: 'Super Solo Vivo (Living Soil Orgânico)',
    badge: 'Ecossistema em Vaso',
    phVeg: '6.2 – 6.5',
    phFlora: '6.4 – 6.8',
    frequenciaRega: 'Regas lentas mantendo o solo levemente úmido (nunca encharcado)',
    multiplicadorDose: 0.5,
    descricaoManejo: 'O solo já contém Bio-Aves, Bio-Mamona e Bio-Humus. Foco em Bio-Start no início, Bio-Melaço e Bio-Potassium no pico de engorda.',
  },
};

interface SemanaConfig {
  id: string;
  nome: string;
  fase: 'Muda' | 'Vegetativo' | 'Floração' | 'Flush';
  descricao: string;
  dosesBasePorLitro: {
    bioStart: number;
    bioGreen: number;
    bioPotassium: number;
    bioMelaco?: number;
  };
  ecMS: string;
  ecPPM: string;
  observacao?: string;
}

const cronogramaCultivo: SemanaConfig[] = [
  {
    id: 'sem-1',
    nome: 'Semana 1 - Germinação & Muda',
    fase: 'Muda',
    descricao: 'Desenvolvimento radicular primário e aclimatação da plântula.',
    dosesBasePorLitro: { bioStart: 2.0, bioGreen: 0.5, bioPotassium: 0, bioMelaco: 0.5 },
    ecMS: '0.4 - 0.6',
    ecPPM: '200 - 300',
    observacao: 'Regas leves ao redor do caule sem encharcar o substrato.',
  },
  {
    id: 'sem-2',
    nome: 'Semana 2 - Vegetativo Inicial',
    fase: 'Vegetativo',
    descricao: 'Primeiro par de folhas verdadeiras e expansão da massa radicular.',
    dosesBasePorLitro: { bioStart: 2.0, bioGreen: 1.5, bioPotassium: 0, bioMelaco: 0.5 },
    ecMS: '0.8 - 1.0',
    ecPPM: '400 - 500',
  },
  {
    id: 'sem-3',
    nome: 'Semana 3 - Vegetativo Pleno',
    fase: 'Vegetativo',
    descricao: 'Rápido ganho de nós e folhagem densa. Alta demanda por Nitrogênio biológico.',
    dosesBasePorLitro: { bioStart: 1.0, bioGreen: 3.0, bioPotassium: 0.5, bioMelaco: 1.0 },
    ecMS: '1.2 - 1.4',
    ecPPM: '600 - 700',
  },
  {
    id: 'sem-4',
    nome: 'Semana 4 - Vegetativo Avançado',
    fase: 'Vegetativo',
    descricao: 'Preparação estrutural dos caules e ramificações laterais para suportar as flores.',
    dosesBasePorLitro: { bioStart: 0.5, bioGreen: 3.5, bioPotassium: 1.0, bioMelaco: 1.0 },
    ecMS: '1.4 - 1.6',
    ecPPM: '700 - 800',
  },
  {
    id: 'sem-5',
    nome: 'Semana 5 - Transição & Pré-Floração',
    fase: 'Floração',
    descricao: 'Alongamento (stretch) e aparecimento dos primeiros cálices florais.',
    dosesBasePorLitro: { bioStart: 0, bioGreen: 2.5, bioPotassium: 2.0, bioMelaco: 1.0 },
    ecMS: '1.5 - 1.7',
    ecPPM: '750 - 850',
  },
  {
    id: 'sem-6',
    nome: 'Semana 6 - Floração Inicial (Botões)',
    fase: 'Floração',
    descricao: 'Formação consistente dos buds e redução da exigência de Nitrogênio.',
    dosesBasePorLitro: { bioStart: 0, bioGreen: 1.5, bioPotassium: 3.0, bioMelaco: 1.0 },
    ecMS: '1.6 - 1.8',
    ecPPM: '800 - 900',
  },
  {
    id: 'sem-7',
    nome: 'Semana 7 - Pico Floral & Tricomas',
    fase: 'Floração',
    descricao: 'Máxima síntese de resina, terpenos e alta demanda por Fósforo e Potássio.',
    dosesBasePorLitro: { bioStart: 0, bioGreen: 0.5, bioPotassium: 4.0, bioMelaco: 1.5 },
    ecMS: '1.8 - 2.0',
    ecPPM: '900 - 1000',
  },
  {
    id: 'sem-8',
    nome: 'Semana 8 - Densidade & Engorda',
    fase: 'Floração',
    descricao: 'Endurecimento e ganho de massa seca das inflorescências.',
    dosesBasePorLitro: { bioStart: 0, bioGreen: 0, bioPotassium: 3.5, bioMelaco: 1.0 },
    ecMS: '1.6 - 1.8',
    ecPPM: '800 - 900',
  },
  {
    id: 'sem-9',
    nome: 'Semana 9 - Maturação Final',
    fase: 'Floração',
    descricao: 'Transição dos tricomas para o ponto ideal de colheita.',
    dosesBasePorLitro: { bioStart: 0, bioGreen: 0, bioPotassium: 1.5, bioMelaco: 0.5 },
    ecMS: '1.0 - 1.2',
    ecPPM: '500 - 600',
  },
  {
    id: 'sem-10',
    nome: 'Semana 10 - Flush / Lavagem',
    fase: 'Flush',
    descricao: 'Consumo de reservas internas para aromas limpos, queima perfeita e sabor refinado.',
    dosesBasePorLitro: { bioStart: 0, bioGreen: 0, bioPotassium: 0, bioMelaco: 0 },
    ecMS: '0.1 - 0.3',
    ecPPM: '50 - 150',
    observacao: 'Utilize apenas água pura desclorada para a lavagem do substrato.',
  },
];

export default function CalculadoraClient() {
  const [substratoId, setSubstratoId] = useState<TipoSubstrato>('inerte');
  const [semanaId, setSemanaId] = useState<string>('sem-3');
  const [volumeAgua, setVolumeAgua] = useState<number>(5);

  const substratoAtual = substratosData[substratoId];
  const semanaAtual = cronogramaCultivo.find((s) => s.id === semanaId) || cronogramaCultivo[0];
  const safeVolume = volumeAgua > 0 ? volumeAgua : 1;

  // Ajuste fino por tipo de substrato
  const mult = semanaAtual.fase === 'Flush' ? 0 : substratoAtual.multiplicadorDose;

  // No Super Solo, bioGreen não é necessário na maioria das fases a menos que indicado
  const superSoilFactorGreen = substratoId === 'super-soil' ? 0.3 : 1.0;

  const doseBioStartPorLitro = semanaAtual.dosesBasePorLitro.bioStart * (substratoId === 'super-soil' ? 0.5 : mult);
  const doseBioGreenPorLitro = semanaAtual.dosesBasePorLitro.bioGreen * mult * superSoilFactorGreen;
  const doseBioPotassiumPorLitro = semanaAtual.dosesBasePorLitro.bioPotassium * mult;
  const doseBioMelacoPorLitro = (semanaAtual.dosesBasePorLitro.bioMelaco || 0) * (substratoId === 'super-soil' ? 1.2 : mult);

  const totalBioStart = (doseBioStartPorLitro * safeVolume).toFixed(1);
  const totalBioGreen = (doseBioGreenPorLitro * safeVolume).toFixed(1);
  const totalBioPotassium = (doseBioPotassiumPorLitro * safeVolume).toFixed(1);
  const totalBioMelaco = (doseBioMelacoPorLitro * safeVolume).toFixed(1);

  const phRecomendado = semanaAtual.fase === 'Floração' ? substratoAtual.phFlora : substratoAtual.phVeg;

  const getBadgeCor = (fase: SemanaConfig['fase']) => {
    switch (fase) {
      case 'Muda': return { bg: 'rgba(59, 130, 246, 0.15)', text: '#60a5fa', border: 'rgba(59, 130, 246, 0.3)' };
      case 'Vegetativo': return { bg: 'rgba(34, 197, 94, 0.15)', text: '#4ade80', border: 'rgba(34, 197, 94, 0.3)' };
      case 'Floração': return { bg: 'rgba(212, 168, 67, 0.15)', text: '#facc15', border: 'rgba(212, 168, 67, 0.3)' };
      case 'Flush': return { bg: 'rgba(168, 85, 247, 0.15)', text: '#c084fc', border: 'rgba(168, 85, 247, 0.3)' };
    }
  };

  const badgeStyle = getBadgeCor(semanaAtual.fase);

  return (
    <div style={{ background: '#071007', color: '#f1f5f9', minHeight: '100vh', paddingTop: 100, paddingBottom: 100 }}>
      <div style={{ maxWidth: 1140, margin: '0 auto', padding: '0 20px' }}>
        
        {/* Header Oficial do Blog */}
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 30, background: 'rgba(212, 168, 67, 0.1)', border: '1px solid rgba(212, 168, 67, 0.3)', marginBottom: 16 }}>
            <Cpu size={16} color="#d4a843" />
            <span style={{ color: '#d4a843', fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Calculadora Nutricional BIOFLOW
            </span>
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 4.6vw, 44px)', fontWeight: 900, color: '#ffffff', lineHeight: 1.15 }}>
            Prescrição Nutricional por Substrato & Ciclo
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, maxWidth: 720, margin: '14px auto 0', lineHeight: 1.6 }}>
            Fórmulas enriquecidas com <strong>EM1 Ativado Integrado</strong> na composição líquida. Selecione seu substrato e o volume da calda para o cálculo exato.
          </p>
        </div>

        {/* 1. SELEÇÃO DE SUBSTRATOS (Cards Rápidos) */}
        <div style={{ marginBottom: 26 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 800, color: '#d4a843', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <Layers size={16} /> 1. Escolha o Seu Tipo de Substrato:
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
            {(Object.keys(substratosData) as TipoSubstrato[]).map((key) => {
              const sub = substratosData[key];
              const isSelected = substratoId === key;
              return (
                <div
                  key={key}
                  onClick={() => setSubstratoId(key)}
                  style={{
                    background: isSelected ? 'rgba(212, 168, 67, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                    border: isSelected ? '2px solid #d4a843' : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 14,
                    padding: '16px 18px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 8, background: isSelected ? '#d4a843' : 'rgba(255,255,255,0.06)', color: isSelected ? '#071007' : '#fff' }}>
                      {sub.badge}
                    </span>
                  </div>
                  <h4 style={{ fontSize: 15, fontWeight: 800, color: '#fff', margin: '4px 0 6px' }}>
                    {sub.nome}
                  </h4>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', margin: 0, lineHeight: 1.4 }}>
                    {sub.descricaoManejo}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. CARD PRINCIPAL DA CALCULADORA */}
        <div style={{ background: 'rgba(15, 28, 15, 0.85)', border: '1px solid rgba(212, 168, 67, 0.3)', borderRadius: 16, padding: '30px 24px', marginBottom: 36, backdropFilter: 'blur(10px)' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 24 }}>
            
            {/* Seletor da Semana */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 800, color: '#d4a843', marginBottom: 8, textTransform: 'uppercase' }}>
                <Calendar size={16} /> 2. Estágio Atual do Ciclo:
              </label>
              <select
                value={semanaId}
                onChange={(e) => setSemanaId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 10,
                  background: 'rgba(7, 16, 7, 0.95)',
                  border: '1px solid rgba(212, 168, 67, 0.4)',
                  color: '#fff',
                  fontSize: 14,
                  fontWeight: 700,
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                {cronogramaCultivo.map((s) => (
                  <option key={s.id} value={s.id} style={{ background: '#0a170a', color: '#fff' }}>
                    {s.nome} ({s.fase})
                  </option>
                ))}
              </select>
            </div>

            {/* Volume de Água */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 800, color: '#d4a843', marginBottom: 8, textTransform: 'uppercase' }}>
                <Droplets size={16} /> 3. Volume da Calda de Rega (Litros):
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={volumeAgua || ''}
                  onChange={(e) => setVolumeAgua(e.target.value === '' ? 0 : Number(e.target.value))}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    borderRadius: 10,
                    background: 'rgba(0, 0, 0, 0.45)',
                    border: '1px solid rgba(212, 168, 67, 0.3)',
                    color: '#fff',
                    fontSize: 16,
                    fontWeight: 700,
                    outline: 'none',
                  }}
                />
                {[2, 5, 10, 20].map((vol) => (
                  <button
                    key={vol}
                    type="button"
                    onClick={() => setVolumeAgua(vol)}
                    style={{
                      padding: '0 12px',
                      background: volumeAgua === vol ? '#d4a843' : 'rgba(255,255,255,0.06)',
                      color: volumeAgua === vol ? '#071007' : '#fff',
                      border: volumeAgua === vol ? '1px solid #d4a843' : '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 10,
                      fontSize: 12,
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    {vol}L
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Banner de Parâmetros Adaptados ao Substrato Selecionado */}
          <div style={{ background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 16, marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 800, padding: '3px 12px', borderRadius: 20, background: badgeStyle.bg, color: badgeStyle.text, border: `1px solid ${badgeStyle.border}` }}>
                {semanaAtual.fase}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#facc15', background: 'rgba(212,168,67,0.1)', padding: '4px 10px', borderRadius: 6, border: '1px solid rgba(212,168,67,0.25)' }}>
                <FlaskConical size={14} />
                <span><strong>pH Ideal ({substratoAtual.nome.split(' ')[0]}):</strong> {phRecomendado}</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, marginBottom: 10 }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', display: 'block' }}>Eletrocondutividade Recomendada</span>
                <strong style={{ fontSize: 13, color: '#4ade80' }}>{semanaAtual.ecMS} mS/cm</strong>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', display: 'block' }}>Frequência de Rega Sugerida</span>
                <strong style={{ fontSize: 12, color: '#60a5fa' }}>{substratoAtual.frequenciaRega}</strong>
              </div>
            </div>

            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', margin: 0, lineHeight: 1.45 }}>
              <strong>Objetivo da Semana:</strong> {semanaAtual.descricao}
            </p>
          </div>

          {/* Cards de Dosagem da Tríade BIOFLOW + Melaço */}
          <div style={{ marginBottom: 14 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: '#fff', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={17} color="#d4a843" /> Dosagem Recomendada para {safeVolume} Litros de Água:
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
              
              {/* Bio-Start */}
              <div style={{ background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: 12, padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: '#60a5fa', fontWeight: 800 }}>Bio-Start®</span>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>Enraizador</span>
                </div>
                <div style={{ fontSize: 26, fontWeight: 900, color: '#fff', marginTop: 4 }}>
                  {totalBioStart} <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>ml</span>
                </div>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', display: 'block', marginTop: 2 }}>
                  ({doseBioStartPorLitro.toFixed(1)} ml por litro)
                </span>
              </div>

              {/* Bio-Green */}
              <div style={{ background: 'rgba(34, 197, 94, 0.08)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: 12, padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: '#4ade80', fontWeight: 800 }}>Bio-Green®</span>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>Crescimento</span>
                </div>
                <div style={{ fontSize: 26, fontWeight: 900, color: '#fff', marginTop: 4 }}>
                  {totalBioGreen} <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>ml</span>
                </div>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', display: 'block', marginTop: 2 }}>
                  ({doseBioGreenPorLitro.toFixed(1)} ml por litro)
                </span>
              </div>

              {/* Bio-Potassium */}
              <div style={{ background: 'rgba(212, 168, 67, 0.09)', border: '1px solid rgba(212, 168, 67, 0.35)', borderRadius: 12, padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: '#facc15', fontWeight: 800 }}>Bio-Potassium®</span>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>Floração</span>
                </div>
                <div style={{ fontSize: 26, fontWeight: 900, color: '#fff', marginTop: 4 }}>
                  {totalBioPotassium} <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>ml</span>
                </div>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', display: 'block', marginTop: 2 }}>
                  ({doseBioPotassiumPorLitro.toFixed(1)} ml por litro)
                </span>
              </div>

              {/* Bio-Melaço */}
              <div style={{ background: 'rgba(251, 146, 60, 0.08)', border: '1px solid rgba(251, 146, 60, 0.3)', borderRadius: 12, padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: '#fb923c', fontWeight: 800 }}>Bio-Melaço</span>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>Energia Bio</span>
                </div>
                <div style={{ fontSize: 26, fontWeight: 900, color: '#fff', marginTop: 4 }}>
                  {totalBioMelaco} <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>ml</span>
                </div>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', display: 'block', marginTop: 2 }}>
                  ({doseBioMelacoPorLitro.toFixed(1)} ml por litro)
                </span>
              </div>

            </div>
          </div>

          {/* Aviso sobre EM1 Integrado */}
          <div style={{ marginTop: 18, padding: '10px 14px', background: 'rgba(168, 85, 247, 0.08)', border: '1px solid rgba(168, 85, 247, 0.25)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#d8b4fe' }}>
            <Info size={16} style={{ flexShrink: 0 }} />
            <span><strong>Fórmula com Biologia Ativa:</strong> Todos os fertilizantes líquidos BIOFLOW já contêm o consórcio de microrganismos <strong>EM1 ativado</strong> em sua composição. Não é necessária a adição de EM1 separado.</span>
          </div>

          {/* Observações da semana */}
          {semanaAtual.observacao && (
            <div style={{ marginTop: 14, padding: '10px 14px', background: 'rgba(212, 168, 67, 0.1)', borderLeft: '4px solid #d4a843', borderRadius: '0 8px 8px 0', display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#fef08a' }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{semanaAtual.observacao}</span>
            </div>
          )}

          {/* Dicas de Manejo */}
          <div style={{ marginTop: 24, paddingTop: 18, borderTop: '1px solid rgba(255,255,255,0.08)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
              <CheckCircle2 size={15} color="#22c55e" style={{ flexShrink: 0, marginTop: 2 }} />
              <span>Agite bem todos os frascos antes de diluir na água.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
              <CheckCircle2 size={15} color="#22c55e" style={{ flexShrink: 0, marginTop: 2 }} />
              <span>Faça a aferição e ajuste do pH após a diluição de todos os produtos.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
              <CheckCircle2 size={15} color="#22c55e" style={{ flexShrink: 0, marginTop: 2 }} />
              <span>Use sempre água descansada por 24h para evaporar o cloro.</span>
            </div>
          </div>

        </div>

        {/* Rodapé Direcionando ao Blog */}
        <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(212, 168, 67, 0.25)', borderRadius: 16, padding: '22px 26px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 18 }}>
          <div>
            <h4 style={{ fontSize: 15, fontWeight: 900, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <BookOpen size={17} color="#d4a843" /> Quer entender a física e biologia do seu substrato?
            </h4>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', margin: '4px 0 0' }}>
              Leia o artigo completo sobre retenção hídrica, sílica, compostagem e microbiologia do solo.
            </p>
          </div>
          <a
            href="/blog"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 20px',
              borderRadius: 30,
              background: '#d4a843',
              color: '#071007',
              fontSize: 13,
              fontWeight: 800,
              textDecoration: 'none',
              transition: 'all 0.2s',
            }}
          >
            <span>Ver Enciclopédia de Cultivo</span>
            <ArrowRight size={15} />
          </a>
        </div>

      </div>

      <WhatsAppButton />
    </div>
  );
}