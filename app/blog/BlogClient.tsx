'use client';

import React, { useState } from 'react';
import { 
  Sprout, 
  Layers, 
  FlaskConical, 
  Droplets, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  BookOpen, 
  Activity, 
  AlertTriangle,
  Microscope,
  Cpu,
  ShieldCheck,
  Wheat,
  Feather
} from 'lucide-react';
import WhatsAppButton from '@/components/WhatsAppButton';

interface ArtigoSubstrato {
  id: string;
  categoria: 'inerte' | 'semi-inerte' | 'super-soil' | 'condicionadores';
  categoriaLabel: string;
  badgeCor: { bg: string; text: string; border: string };
  titulo: string;
  resumo: string;
  tempoLeitura: string;
  conteudo: {
    oQueE: string;
    composicaoExata: string;
    mecanicaSolo: string;
    pontosFortes: string[];
    pontosAtencao: string[];
    protocoloBioflow: {
      bioStart: string;
      bioGreen: string;
      bioPotassium: string;
      bioEM1: string;
      bioMelacoOuEmendas?: string;
    };
    tabelaParametros: {
      phIdeal: string;
      frequenciaRega: string;
      dosagemVeg: string;
      dosagemFlora: string;
      dificuldade: string;
    };
    dicaMestre: string;
  };
}

const artigosData: ArtigoSubstrato[] = [
  {
    id: 'coco-mix-inerte',
    categoria: 'inerte',
    categoriaLabel: '100% Inerte — BIOFLOW Coco Mix',
    badgeCor: { bg: 'rgba(59, 130, 246, 0.15)', text: '#60a5fa', border: 'rgba(59, 130, 246, 0.3)' },
    titulo: 'BIOFLOW Coco Mix (50% Fibra de Coco + 50% Bio-Perlita): Hidroponia Passiva & Alta Velocidade',
    resumo: 'Substrato inerte profissional lavado e com pH estabilizado (5,5 – 6,2). Proporciona aeração extrema e controle total da fertilização.',
    tempoLeitura: '7 min de leitura',
    conteudo: {
      oQueE: 'O BIOFLOW Coco Mix é formulado com 50% de Bio-Fibra (fibra de coco granulada lavada com baixa salinidade) e 50% de Bio-Perlita expandida grossa mineral. Um meio totalmente inerte, estéril e livre de pragas.',
      composicaoExata: '50% Fibra de Coco Granulada Lavada + 50% Bio-Perlita Grossa Expandida.',
      mecanicaSolo: 'Não retém nutrientes em excesso, permitindo que a solução nutritiva banhe as raízes entregando oxigênio e minerais quelados instantaneamente. A alta proporção de perlita impede qualquer risco de encharcamento ou asfixia radicular.',
      pontosFortes: [
        'Enraizamento ultrarrápido para clones, mudas e germinação.',
        'Desenvolvimento vegetativo acelerado com resposta em até 24h a cada fertirrigação.',
        'Fibra lavada e dessalinizada com pH estabilizado (5,5 a 6,2).',
        'Facilidade para flush e correção de condutividade elétrica.'
      ],
      pontosAtencao: [
        'Zero reserva mineral nativa: a planta depende da fertirrigação contínua.',
        'Requer regas frequentes (diárias ou a cada 2 dias) com escoamento leve.'
      ],
      protocoloBioflow: {
        bioStart: 'Para clones e mudas: 20 ml / 1L de água. Na fase vegetativa: 40 ml / 1L para manter raízes vigorosas.',
        bioGreen: 'Fase vegetativa: 40 ml / 1L de água (combinar com 20 ml de Bio-Start para biomassa e perfilhamento máximo).',
        bioPotassium: 'Fase de floração: 50 ml / 1L de água (combinar com 30 ml de Bio-Green para floração densa e aromática).',
        bioEM1: 'Inoculação microbiológica: 10 ml / 1L de água destilada/desclorada para criar microvida protetora nas fibras inertes.',
        bioMelacoOuEmendas: 'Bio-Melaço: 5 a 10 ml / 1L para nutrir a colônia do Bio-EM1.'
      },
      tabelaParametros: {
        phIdeal: '5.8 – 6.0 (Veg) | 6.0 – 6.2 (Flora)',
        frequenciaRega: 'Diária ou a cada 2 dias (regar quando o vaso estiver leve)',
        dosagemVeg: '40ml Bio-Green + 20ml Bio-Start / L',
        dosagemFlora: '50ml Bio-Potassium + 30ml Bio-Green / L',
        dificuldade: 'Intermediário / Avançado'
      },
      dicaMestre: 'Como a fibra de coco e a perlita são biologicamente virgens, aplique Bio-EM1 (10ml/L) logo na primeira rega. As bactérias benéficas e algas vão colonizar o meio e blindar as raízes contra patógenos oportunistas.'
    }
  },
  {
    id: 'biomix-semi-inerte',
    categoria: 'semi-inerte',
    categoriaLabel: 'Substrato Técnico — BIOFLOW BioMix',
    badgeCor: { bg: 'rgba(34, 197, 94, 0.15)', text: '#4ade80', border: 'rgba(34, 197, 94, 0.3)' },
    titulo: 'BIOFLOW BioMix (Turfa + Perlita + Casca de Arroz Carbonizada): Estrutura Perfeita',
    resumo: '50% Turfa de Sphagnum, 40% Bio-Perlita e 10% Bio-Arroz Carbon. Retenção ideal de água com aeração e sílica natural.',
    tempoLeitura: '8 min de leitura',
    conteudo: {
      oQueE: 'O Bio-Mix Bioflow é um substrato profissional desenvolvido para criar o equilíbrio exato entre a retenção hídrica da turfa de sphagnum, a porosidade da perlita e o aporte de sílica e drenagem da casca de arroz carbonizada.',
      composicaoExata: '50% Bio-Turfa (Turfa de Sphagnum) + 40% Bio-Perlita Grossa + 10% Bio-Arroz Carbon (Casca de Arroz Carbonizada).',
      mecanicaSolo: 'A turfa atua como reservatório de umidade mantendo o pH naturalmente equilibrado (5,5 a 6,0). A casca de arroz carbonizada fornece sílica natural que fortalece as paredes celulares dos caules e raízes, enquanto a perlita garante oxigênio constante.',
      pontosFortes: [
        'Excelente retenção sem risco de compactação ou apodrecimento de raízes.',
        'Presença de sílica orgânica nativa que aumenta a resistência contra calor e pragas.',
        'Pode ser usado puro ou enriquecido com 20% a 30% de Bio-Humus.',
        'Ideal para germinação de sementes, mudas, vasos domésticos e cultivos intensivos.'
      ],
      pontosAtencao: [
        'Em caso de adição de húmus, iniciar fertilizantes líquidos de forma gradual.',
        'Manter o ciclo de rega respeitando o tempo de secagem parcial do vaso.'
      ],
      protocoloBioflow: {
        bioStart: '20 ml / 1L de água na germinação/mudas. Na fase de crescimento ativo: 40 ml Bio-Start + 20 ml Bio-Green.',
        bioGreen: '40 ml / 1L de água nas semanas vegetativas para explosão de folhas e galhos firmes.',
        bioPotassium: '50 ml / 1L de água a partir dos primeiros botões florais até o amadurecimento dos frutos.',
        bioEM1: '10 ml / 1L de água semanalmente para quebrar matéria orgânica e aumentar a CTC.',
        bioMelacoOuEmendas: 'Adicione 20% a 30% de Bio-Humus na mistura inicial do vaso para enriquecimento natural.'
      },
      tabelaParametros: {
        phIdeal: '6.0 – 6.4 (Veg & Flora)',
        frequenciaRega: 'A cada 2 a 3 dias',
        dosagemVeg: '40ml Bio-Green + 20ml Bio-Start / L',
        dosagemFlora: '50ml Bio-Potassium + 30ml Bio-Green / L',
        dificuldade: 'Iniciante / Intermediário (Muito tolerante)'
      },
      dicaMestre: 'Se você busca o melhor dos dois mundos (praticidade e força orgânica), misture 70% de BioMix + 30% de Bio-Humus Bioflow no vaso. A planta terá um colchão biológico estável e responderá com vigor imediato à linha de fertirrigação.'
    }
  },
  {
    id: 'super-solo-bioflow',
    categoria: 'super-soil',
    categoriaLabel: 'Super Solo Completo — Living Soil',
    badgeCor: { bg: 'rgba(212, 168, 67, 0.15)', text: '#facc15', border: 'rgba(212, 168, 67, 0.3)' },
    titulo: 'Super Solo Vivo BIOFLOW: Bio-Humus, Bio-Aves, Bio-Mamona, Bio-Arroz & Melaço',
    resumo: 'Monte o solo vivo orgânico definitivo combinando as matérias-primas e emendas maturadas da linha BIOFLOW.',
    tempoLeitura: '10 min de leitura',
    conteudo: {
      oQueE: 'O Super Solo / Solo Vivo BIOFLOW é montado utilizando a base fofa do BioMix acrescida das emendas orgânicas de liberação gradual: Bio-Humus puro, Bio-Aves (esterco de aves curtido), Bio-Mamona (torta vegetal) e Bio-Arroz Carbon.',
      composicaoExata: 'Receita Recomendada para Vasos (10L a 20L): 60% BioMix + 20% Bio-Humus + 10% Bio-Aves (1 parte para 10 de substrato) + 5% a 10% Bio-Mamona + 5% Bio-Arroz Carbon extra.',
      mecanicaSolo: 'As emendas de liberação gradual fornecem nitrogênio orgânico vegetal (Mamona), nitrogênio rápido, cálcio e fósforo (Aves), ácidos húmicos/fúlvicos (Húmus) e sílica (Casca de Arroz). A vida do solo quebra os nutrientes continuamente sem gerar queima.',
      pontosFortes: [
        'Solo autossuficiente: a maior parte do ciclo é regada apenas com água desclorada e bioestimulantes.',
        'Explosão de terpenos, aromas e sabores puros de agricultura 100% biológica.',
        'Ação protetora natural contra nematoides graças à torta de mamona.',
        'Solo reutilizável por múltiplos ciclos com adubações de cobertura (Top Dressing).'
      ],
      pontosAtencao: [
        'Nunca use água com cloro da torneira sem descanso ou filtro (o cloro destrói as bactérias vivas).',
        'Necessita de vasos de pelo menos 15L a 30L para garantir volume biológico adequado.'
      ],
      protocoloBioflow: {
        bioStart: '20 ml / 1L em transplantes para rápida ancoragem e adaptação sem choque radicular.',
        bioGreen: 'Usar apenas em doses reduzidas se a planta apresentar alta demanda na fase vegetativa avançada.',
        bioPotassium: '50 ml / 1L a partir da 5ª semana de floração para dar peso e densidade final aos frutos e flores.',
        bioEM1: '10 ml / 1L a cada 7 a 10 dias para acelerar a compostagem interna e mineralização biológica.',
        bioMelacoOuEmendas: 'Bio-Melaço (5 a 10 ml / 1L) em todas as regas com Bio-EM1 como alimento energético da microbiota.'
      },
      tabelaParametros: {
        phIdeal: '6.2 – 6.8 (Água desclorada regulada)',
        frequenciaRega: 'Regas lentas mantendo o solo levemente úmido (nunca seco ou encharcado)',
        dosagemVeg: 'Bio-EM1 (10ml/L) + Bio-Melaço (5-10ml/L)',
        dosagemFlora: 'Bio-Potassium (50ml/L) no ápice floral',
        dificuldade: 'Iniciante para regas / Avançado na montagem'
      },
      dicaMestre: 'Regue o Super Solo com a dupla Bio-EM1 (10ml/L) + Bio-Melaço (5ml/L). Os açúcares e minerais do melaço alimentam os microrganismos eficientes do EM1, que por sua vez liberam o fósforo e o cálcio do Bio-Aves de forma instantânea para a planta.'
    }
  },
  {
    id: 'guia-condicionadores-individuais',
    categoria: 'condicionadores',
    categoriaLabel: 'Guia de Matérias-Primas',
    badgeCor: { bg: 'rgba(168, 85, 247, 0.15)', text: '#c084fc', border: 'rgba(168, 85, 247, 0.3)' },
    titulo: 'Condicionadores e Emendas BIOFLOW: A Ciência de Cada Ingrediente',
    resumo: 'Conheça o papel individual de cada componente: Bio-Turfa, Bio-Fibra, Bio-Perlita, Bio-Arroz Carbon, Bio-Humus, Bio-Aves e Bio-Mamona.',
    tempoLeitura: '6 min de leitura',
    conteudo: {
      oQueE: 'Para cultivadores que preferem customizar sua própria receita de solo, a BIOFLOW disponibiliza matérias-primas nobres puras e selecionadas.',
      composicaoExata: 'Bio-Turfa (Sphagnum puro), Bio-Fibra (Coco granulado lavado), Bio-Perlita (Rocha vulcânica expandida grossa), Bio-Arroz Carbon (Casca de arroz rica em sílica), Bio-Humus (100% vermicompostagem), Bio-Aves (Esterco curtido/estabilizado) e Bio-Mamona (Torta vegetal pura).',
      mecanicaSolo: 'Cada componente possui uma função mecânica ou biológica específica: a Perlita e o Arroz Carbon criam macroporos para o ar; a Turfa e a Fibra retêm água; o Húmus, Aves e Mamona constroem a fertilidade orgânica e a microbiota.',
      pontosFortes: [
        'Bio-Arroz Carbon: Fornece sílica solúvel (resistência a pragas e caules grossos) e aeração sem compactar.',
        'Bio-Perlita: Inerte, estéril, não altera pH e mantém o oxigênio nas raízes.',
        'Bio-Aves: Explosão de Nitrogênio, Fósforo e Cálcio orgânico totalmente curtido (sem risco de queima).',
        'Bio-Mamona: Nitrogênio vegetal sustentável e supressor biológico natural de nematoides.',
        'Bio-Melaço: Carbono solúvel, potássio, magnésio e energia líquida para a biologia do solo.'
      ],
      pontosAtencao: [
        'Siga as proporções corretas de adubação (Bio-Mamona de 5% a 10%; Bio-Aves 1:10) para manter o solo perfeitamente balanceado.'
      ],
      protocoloBioflow: {
        bioStart: 'Composição ativa: Melaço + Húmus + Extrato de Lentilha + Carvão Vegetal + Algas (20ml a 40ml/L).',
        bioGreen: 'Composição ativa: Extrato de Algas + Nitrogênio Biológico + Aminoácidos + Húmus + Ácidos Fúlvicos (40ml/L).',
        bioPotassium: 'Composição ativa: Potássio Biológico + Fósforo + Extrato de Fruta + Ácidos Húmicos + Minerais Quelados (50ml/L).',
        bioEM1: 'Composição ativa: Inoculante com microrganismos vivos ativados e catalisadores biológicos (10ml/L).',
        bioMelacoOuEmendas: 'Bio-Melaço: 100% cana-de-açúcar para biofertilizantes e rega (5 a 10ml/L).'
      },
      tabelaParametros: {
        phIdeal: '5.5 a 6.8 dependendo da mistura',
        frequenciaRega: 'Conforme retenção da mistura',
        dosagemVeg: 'Personalizada',
        dosagemFlora: 'Personalizada',
        dificuldade: 'Mestre do Cultivo'
      },
      dicaMestre: 'Na fase de preparação do solo, a combinação de 20% Bio-Humus + 5% Bio-Mamona + 10% Bio-Arroz Carbon sobre uma base de BioMix cria um substrato completo que suporta até 4 semanas de cultivo sem carências antes da primeira fertirrigação.'
    }
  }
];

export default function BlogSubstratosClient() {
  const [filtro, setFiltro] = useState<string>('todos');
  const [artigoSelecionado, setArtigoSelecionado] = useState<ArtigoSubstrato | null>(artigosData[0]);

  const artigosFiltrados = filtro === 'todos' 
    ? artigosData 
    : artigosData.filter(a => a.categoria === filtro);

  return (
    <div style={{ background: '#071007', color: '#f1f5f9', minHeight: '100vh', paddingTop: 100, paddingBottom: 100 }}>
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 20px' }}>
        
        {/* Header do Blog */}
        <div style={{ textAlign: 'center', marginBottom: 46 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 30, background: 'rgba(212, 168, 67, 0.1)', border: '1px solid rgba(212, 168, 67, 0.3)', marginBottom: 16 }}>
            <BookOpen size={16} color="#d4a843" />
            <span style={{ color: '#d4a843', fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Enciclopédia Oficial BIOFLOW
            </span>
          </div>
          <h1 style={{ fontSize: 'clamp(30px, 4.8vw, 46px)', fontWeight: 900, color: '#ffffff', lineHeight: 1.15 }}>
            Solos, Substratos & Nutrição Biológica
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 16, maxWidth: 720, margin: '14px auto 0', lineHeight: 1.6 }}>
            Aprenda a escolher e manejar o substrato ideal para o seu cultivo: do <strong>Coco Mix</strong> inerte ao <strong>BioMix</strong> e <strong>Super Solo Vivo</strong>, integrados aos fertilizantes e ativadores biológicos BIOFLOW.
          </p>
        </div>

        {/* Filtros */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 36 }}>
          {[
            { id: 'todos', label: 'Todos os Artigos' },
            { id: 'inerte', label: 'Inerte (Coco Mix 50/50)' },
            { id: 'semi-inerte', label: 'Técnico (BioMix 50/40/10)' },
            { id: 'super-soil', label: 'Super Solo Vivo (Living Soil)' },
            { id: 'condicionadores', label: 'Guia de Matérias-Primas' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setFiltro(tab.id);
                const first = tab.id === 'todos' ? artigosData[0] : artigosData.find(a => a.categoria === tab.id);
                if (first) setArtigoSelecionado(first);
              }}
              style={{
                padding: '9px 18px',
                borderRadius: 30,
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
                background: filtro === tab.id ? '#d4a843' : 'rgba(255,255,255,0.05)',
                color: filtro === tab.id ? '#071007' : 'rgba(255,255,255,0.85)',
                border: filtro === tab.id ? '1px solid #d4a843' : '1px solid rgba(255,255,255,0.1)',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tabela Comparativa dos Substratos BIOFLOW */}
        <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(212, 168, 67, 0.2)', borderRadius: 16, padding: 22, marginBottom: 44, overflowX: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <Activity size={20} color="#d4a843" />
            <h3 style={{ fontSize: 15, fontWeight: 800, margin: 0, color: '#fff' }}>
              Comparativo dos Substratos & Manejo Nutricional BIOFLOW
            </h3>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 640 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.12)', color: '#d4a843', textAlign: 'left' }}>
                <th style={{ padding: '10px 8px' }}>Substrato BIOFLOW</th>
                <th style={{ padding: '10px 8px' }}>Composição Real</th>
                <th style={{ padding: '10px 8px' }}>pH Recomendado</th>
                <th style={{ padding: '10px 8px' }}>Dosagem BIOFLOW Indicada</th>
                <th style={{ padding: '10px 8px' }}>Perfil de Manejo</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '12px 8px', fontWeight: 700, color: '#60a5fa' }}>Coco Mix</td>
                <td style={{ padding: '12px 8px' }}>50% Coco + 50% Bio-Perlita</td>
                <td style={{ padding: '12px 8px' }}>5.8 - 6.1</td>
                <td style={{ padding: '12px 8px' }}>40ml Bio-Green / 50ml Bio-Potassium</td>
                <td style={{ padding: '12px 8px' }}>Hidroponia passiva contínua</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '12px 8px', fontWeight: 700, color: '#4ade80' }}>BioMix</td>
                <td style={{ padding: '12px 8px' }}>50% Turfa + 40% Perlita + 10% Arroz Carbon</td>
                <td style={{ padding: '12px 8px' }}>6.0 - 6.4</td>
                <td style={{ padding: '12px 8px' }}>Combinar Bio-Start + Bio-Green + EM1</td>
                <td style={{ padding: '12px 8px' }}>Máxima aeração com retenção ideal</td>
              </tr>
              <tr>
                <td style={{ padding: '12px 8px', fontWeight: 700, color: '#facc15' }}>Super Solo Vivo</td>
                <td style={{ padding: '12px 8px' }}>BioMix + Bio-Humus + Bio-Aves + Bio-Mamona</td>
                <td style={{ padding: '12px 8px' }}>6.2 - 6.8</td>
                <td style={{ padding: '12px 8px' }}>Bio-EM1 (10ml) + Bio-Melaço (5-10ml)</td>
                <td style={{ padding: '12px 8px' }}>Solo vivo autossuficiente em vaso</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Layout do Artigo */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 26 }}>
          
          {/* Coluna Esquerda: Cards de Navegação */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {artigosFiltrados.map((artigo) => {
              const isSelected = artigoSelecionado?.id === artigo.id;
              return (
                <div
                  key={artigo.id}
                  onClick={() => setArtigoSelecionado(artigo)}
                  style={{
                    background: isSelected ? 'rgba(212, 168, 67, 0.09)' : 'rgba(255, 255, 255, 0.02)',
                    border: isSelected ? '2px solid #d4a843' : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 14,
                    padding: 20,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 12, background: artigo.badgeCor.bg, color: artigo.badgeCor.text, border: `1px solid ${artigo.badgeCor.border}` }}>
                      {artigo.categoriaLabel}
                    </span>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                      {artigo.tempoLeitura}
                    </span>
                  </div>

                  <h3 style={{ fontSize: 17, fontWeight: 800, color: '#ffffff', marginBottom: 8, lineHeight: 1.3 }}>
                    {artigo.titulo}
                  </h3>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.5, margin: 0 }}>
                    {artigo.resumo}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 14, color: '#d4a843', fontSize: 13, fontWeight: 700 }}>
                    <span>Ver protocolo e dosagens oficiais</span>
                    <ArrowRight size={14} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Coluna Direita: Detalhamento Completo */}
          {artigoSelecionado && (
            <div style={{ background: 'rgba(15, 28, 15, 0.85)', border: '1px solid rgba(212, 168, 67, 0.3)', borderRadius: 16, padding: '28px 24px', height: 'fit-content' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#d4a843', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', marginBottom: 8 }}>
                <Microscope size={16} /> Protocolo Técnico BIOFLOW
              </div>

              <h2 style={{ fontSize: 21, fontWeight: 900, color: '#ffffff', marginBottom: 12, lineHeight: 1.25 }}>
                {artigoSelecionado.titulo}
              </h2>

              {/* Informação de Composição Exata */}
              <div style={{ background: 'rgba(212, 168, 67, 0.08)', border: '1px solid rgba(212, 168, 67, 0.25)', borderRadius: 10, padding: '10px 14px', marginBottom: 18, fontSize: 12 }}>
                <strong style={{ color: '#facc15' }}>Fórmula / Composição: </strong>
                <span style={{ color: 'rgba(255,255,255,0.9)' }}>{artigoSelecionado.conteudo.composicaoExata}</span>
              </div>

              {/* Box de Parâmetros Rápidos */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10, background: 'rgba(0,0,0,0.45)', padding: 12, borderRadius: 10, marginBottom: 20, border: '1px solid rgba(255,255,255,0.06)' }}>
                <div>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', display: 'block' }}>Faixa de pH</span>
                  <strong style={{ fontSize: 13, color: '#4ade80' }}>{artigoSelecionado.conteudo.tabelaParametros.phIdeal}</strong>
                </div>
                <div>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', display: 'block' }}>Dose Vegetativo</span>
                  <strong style={{ fontSize: 12, color: '#60a5fa' }}>{artigoSelecionado.conteudo.tabelaParametros.dosagemVeg}</strong>
                </div>
                <div>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', display: 'block' }}>Dose Floração</span>
                  <strong style={{ fontSize: 12, color: '#facc15' }}>{artigoSelecionado.conteudo.tabelaParametros.dosagemFlora}</strong>
                </div>
                <div>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', display: 'block' }}>Manejo</span>
                  <strong style={{ fontSize: 12, color: '#c084fc' }}>{artigoSelecionado.conteudo.tabelaParametros.dificuldade}</strong>
                </div>
              </div>

              {/* Seções de Texto */}
              <div style={{ marginBottom: 18 }}>
                <h4 style={{ fontSize: 14, fontWeight: 800, color: '#d4a843', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Layers size={15} /> Dinâmica Radicular & Propriedades Físicas
                </h4>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, marginBottom: 8 }}>
                  {artigoSelecionado.conteudo.oQueE}
                </p>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 }}>
                  {artigoSelecionado.conteudo.mecanicaSolo}
                </p>
              </div>

              {/* Vantagens & Atenções */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 20 }}>
                <div style={{ background: 'rgba(34, 197, 94, 0.06)', padding: 12, borderRadius: 10, border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#4ade80', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <CheckCircle2 size={14} /> Vantagens Comprovadas
                  </span>
                  <ul style={{ margin: 0, paddingLeft: 14, fontSize: 12, color: 'rgba(255,255,255,0.75)', lineHeight: 1.45 }}>
                    {artigoSelecionado.conteudo.pontosFortes.map((ponto, i) => (
                      <li key={i} style={{ marginBottom: 4 }}>{ponto}</li>
                    ))}
                  </ul>
                </div>

                <div style={{ background: 'rgba(239, 68, 68, 0.06)', padding: 12, borderRadius: 10, border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#f87171', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <AlertTriangle size={14} /> Cuidados no Manejo
                  </span>
                  <ul style={{ margin: 0, paddingLeft: 14, fontSize: 12, color: 'rgba(255,255,255,0.75)', lineHeight: 1.45 }}>
                    {artigoSelecionado.conteudo.pontosAtencao.map((ponto, i) => (
                      <li key={i} style={{ marginBottom: 4 }}>{ponto}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Aplicação da Linha de Fertilizantes e Inoculantes BIOFLOW */}
              <div style={{ background: 'rgba(212, 168, 67, 0.05)', border: '1px solid rgba(212, 168, 67, 0.25)', borderRadius: 12, padding: 16, marginBottom: 18 }}>
                <h4 style={{ fontSize: 13, fontWeight: 800, color: '#facc15', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Sparkles size={15} /> Protocolo de Aplicação de Produtos BIOFLOW
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
                  <div style={{ borderLeft: '3px solid #60a5fa', paddingLeft: 10 }}>
                    <strong style={{ color: '#60a5fa' }}>Bio-Start® (Enraizamento & Clones):</strong> <span style={{ color: 'rgba(255,255,255,0.85)' }}>{artigoSelecionado.conteudo.protocoloBioflow.bioStart}</span>
                  </div>
                  <div style={{ borderLeft: '3px solid #4ade80', paddingLeft: 10 }}>
                    <strong style={{ color: '#4ade80' }}>Bio-Green® (Vegetação & Biomassa):</strong> <span style={{ color: 'rgba(255,255,255,0.85)' }}>{artigoSelecionado.conteudo.protocoloBioflow.bioGreen}</span>
                  </div>
                  <div style={{ borderLeft: '3px solid #facc15', paddingLeft: 10 }}>
                    <strong style={{ color: '#facc15' }}>Bio-Potassium® (Floração & Frutificação):</strong> <span style={{ color: 'rgba(255,255,255,0.85)' }}>{artigoSelecionado.conteudo.protocoloBioflow.bioPotassium}</span>
                  </div>
                  <div style={{ borderLeft: '3px solid #c084fc', paddingLeft: 10 }}>
                    <strong style={{ color: '#c084fc' }}>Bio-EM1 (Ativador Microbiológico):</strong> <span style={{ color: 'rgba(255,255,255,0.85)' }}>{artigoSelecionado.conteudo.protocoloBioflow.bioEM1}</span>
                  </div>
                  {artigoSelecionado.conteudo.protocoloBioflow.bioMelacoOuEmendas && (
                    <div style={{ borderLeft: '3px solid #fb923c', paddingLeft: 10 }}>
                      <strong style={{ color: '#fb923c' }}>Bio-Melaço / Emendas Orgânicas:</strong> <span style={{ color: 'rgba(255,255,255,0.85)' }}>{artigoSelecionado.conteudo.protocoloBioflow.bioMelacoOuEmendas}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Dica de Mestre */}
              <div style={{ padding: 12, borderRadius: 10, background: 'rgba(0,0,0,0.5)', border: '1px dashed rgba(212, 168, 67, 0.4)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <Cpu size={16} color="#d4a843" style={{ flexShrink: 0, marginTop: 2 }} />
                <p style={{ fontSize: 12, color: '#fef08a', margin: 0, lineHeight: 1.45 }}>
                  <strong>Dica de Mestre BIOFLOW:</strong> {artigoSelecionado.conteudo.dicaMestre}
                </p>
              </div>

            </div>
          )}

        </div>

      </div>

      <WhatsAppButton />
    </div>
  );
}