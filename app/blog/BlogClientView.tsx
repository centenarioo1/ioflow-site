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
  Cpu
} from 'lucide-react';
import WhatsAppButton from '@/components/WhatsAppButton';

interface ArtigoSubstrato {
  id: string;
  categoria: 'inerte' | 'semi-inerte' | 'completo' | 'guia';
  categoriaLabel: string;
  badgeCor: { bg: string; text: string; border: string };
  titulo: string;
  resumo: string;
  tempoLeitura: string;
  conteudo: {
    oQueE: string;
    mecanicaSolo: string;
    pontosFortes: string[];
    pontosAtencao: string[];
    estrategiaBioflow: {
      bioStart: string;
      bioGreen: string;
      bioPotassium: string;
      bioEM1: string;
    };
    tabelaParametros: {
      phIdeal: string;
      frequenciaRega: string;
      ecFaseVeg: string;
      ecFaseFlora: string;
      dificuldade: string;
    };
    dicaMestre: string;
  };
}

const artigosData: ArtigoSubstrato[] = [
  {
    id: 'solo-inerte-coco-perlita',
    categoria: 'inerte',
    categoriaLabel: 'Substrato 100% Inerte',
    badgeCor: { bg: 'rgba(59, 130, 246, 0.15)', text: '#60a5fa', border: 'rgba(59, 130, 246, 0.3)' },
    titulo: 'Fibra de Coco + Perlita: A Máxima Velocidade da Hidroponia Passiva',
    resumo: 'Sem nutrientes nativos, o controle nutricional é 100% seu. Altíssima aeração radicular e absorção iônica instantânea.',
    tempoLeitura: '7 min de leitura',
    conteudo: {
      oQueE: 'O substrato inerte (comumente 70% fibra/pó de coco lavado e 30% perlita expandida) não possui nenhuma reserva de macro ou micronutrientes. Ele atua unicamente como suporte mecânico e reservatório oxigenado para as raízes.',
      mecanicaSolo: 'Por ser inerte e não reter minerais em excesso, a troca catiônica (CTC) depende do manejo. A água escorre com extrema facilidade enquanto os microporos da fibra de coco retêm a calda nutritiva, permitindo que as raízes respirem oxigênio molecular constantemente enquanto bebem a solução.',
      pontosFortes: [
        'Crescimento vegetativo até 40% mais rápido do que solos orgânicos densos.',
        'Zero risco de carregar pragas de solo ou patógenos de compostagem não estabilizada.',
        'Controle milimétrico do EC (eletrocondutividade) e pH em cada rega.',
        'Facilidade para corrigir excessos nutritivos através de simples rega de lavagem.'
      ],
      pontosAtencao: [
        'A planta depende 100% da sua fertirrigação — esquecer de alimentar gera carências em 24h a 48h.',
        'O pH da calda precisa ser regulado estritamente entre 5.8 e 6.1.',
        'Exige medição frequente de EC para evitar acúmulo de sais secos no fundo do vaso.'
      ],
      estrategiaBioflow: {
        bioStart: 'Indispensável desde o dia 1 após a germinação (1.0 a 2.0 ml/L) para expandir rapidamente a rede radicular no meio inerte.',
        bioGreen: 'Usado como fonte primária constante de Nitrogênio e micronutrientes do início ao fim da fase vegetativa (1.5 a 3.0 ml/L).',
        bioPotassium: 'Introduzido na pré-floração e escalonado até o pico floral (2.0 a 3.5 ml/L) para inflar a estrutura celular dos botões.',
        bioEM1: 'Fundamental! Como o coco é um meio biológico virgem, o Bio-EM1 inocula bactérias benéficas que colonizam a rizosfera, impedindo o surgimento de Pythium e Fusarium.'
      },
      tabelaParametros: {
        phIdeal: '5.8 – 6.0 (Veg) | 6.0 – 6.2 (Flora)',
        frequenciaRega: 'Diária ou a cada 2 dias (com 10-20% de escoamento/runoff)',
        ecFaseVeg: '1.0 – 1.5 mS/cm',
        ecFaseFlora: '1.6 – 2.0 mS/cm',
        dificuldade: 'Intermediário / Avançado'
      },
      dicaMestre: 'Em coco/perlita, nunca regue com água pura desprovida de microrganismos ou sais mínimos, pois isso causa choque osmótico nas raízes. Sempre adicione no mínimo Bio-EM1 e uma dose baixa de Bio-Start em todas as regas.'
    }
  },
  {
    id: 'solo-semi-inerte-humus',
    categoria: 'semi-inerte',
    categoriaLabel: 'Solo Semi-Inerte com Húmus',
    badgeCor: { bg: 'rgba(34, 197, 94, 0.15)', text: '#4ade80', border: 'rgba(34, 197, 94, 0.3)' },
    titulo: 'Turfa + Perlita + Húmus de Minhoca: O Equilíbrio Perfeito de Tolerância e Potência',
    resumo: 'O preferido dos cultivadores práticos: a leveza da turfa combinada com o tampão biológico e ácidos fúlvicos do húmus.',
    tempoLeitura: '8 min de leitura',
    conteudo: {
      oQueE: 'Uma combinação equilibrada (geralmente 40% turfa de Sphagnum, 30% perlita e 30% húmus de minhoca puro e filtrado). Oferece uma cama fofa, rica em ácidos húmicos e uma carga nutritiva suave inicial.',
      mecanicaSolo: 'O húmus confere capacidade de troca catiônica (CTC) média e atua como uma esponja tampão que suaviza flutuações de pH. As primeiras 2 a 3 semanas de vida da muda são alimentadas pela digestão lenta do húmus, exigindo suplementação mineral/orgânica líquida gradual a partir daí.',
      pontosFortes: [
        'Margem de erro alta: se você errar o pH por 0.3 pontos, a microbiota do húmus tampona sem queimar as raízes.',
        'Retenção de umidade equilibrada (regas a cada 2 a 4 dias).',
        'Presença nativa de microrganismos que trabalham em simbiose com biofertilizantes.',
        'Sabor e perfil de terpenos refinados graças aos compostos orgânicos nativos.'
      ],
      pontosAtencao: [
        'Se o húmus for de baixa qualidade, pode compactar o fundo do vaso com o passar das semanas.',
        'A fertilização líquida não deve ser iniciada em doses máximas nas primeiras 2 semanas para evitar sobrecarga.'
      ],
      estrategiaBioflow: {
        bioStart: 'Aplicar 1.0 ml/L na 1ª semana para acelerar a fusão microrrizas-húmus-raízes.',
        bioGreen: 'Entrar na 2ª ou 3ª semana com metade da dose recomendada e subir para dose cheia conforme a planta consome a reserva de N do húmus.',
        bioPotassium: 'Entrada padrão na virada de fotoperíodo (semana 5 em diante), fornecendo o P e K concentrados que o húmus sozinho não consegue suprir para altas densidades florais.',
        bioEM1: 'O Bio-EM1 aqui atua como um multiplicador: ele fermenta e quebra os ácidos húmicos residuais, disponibilizando nutrientes bloqueados no solo com velocidade recorde.'
      },
      tabelaParametros: {
        phIdeal: '6.0 – 6.4 (Veg & Flora)',
        frequenciaRega: 'A cada 2 a 3 dias (regar quando o vaso estiver 50% mais leve)',
        ecFaseVeg: '0.8 – 1.3 mS/cm',
        ecFaseFlora: '1.4 – 1.8 mS/cm',
        dificuldade: 'Iniciante / Intermediário'
      },
      dicaMestre: 'Aguarde o vaso ficar leve antes de regar novamente. Raízes em substratos de turfa e húmus precisam do ciclo de secagem moderada para buscar oxigênio e disparar novas ramificações capilares.'
    }
  },
  {
    id: 'super-solo-organico-completo',
    categoria: 'completo',
    categoriaLabel: 'Super Solo / Living Soil',
    badgeCor: { bg: 'rgba(212, 168, 67, 0.15)', text: '#facc15', border: 'rgba(212, 168, 67, 0.3)' },
    titulo: 'Super Solo Vivo (Living Soil): Ecossistema Fechado e Explosão de Terpenos',
    resumo: 'Emendas orgânicas pré-misturadas, biochar, pós de rocha e vida bacteriana contínua. A natureza alimentando a planta.',
    tempoLeitura: '10 min de leitura',
    conteudo: {
      oQueE: 'Um substrato vivo e enriquecido (No-Till / Super Soil) carregado de emendas de liberação lenta: farinha de ossos, torta de mamona/neem, biochar ativado, pó de basalto, bokashi e composto vegetal maturadíssimo.',
      mecanicaSolo: 'No Super Solo, você não alimenta a planta diretamente: você alimenta a teia microbiológica (Soil Food Web). Fungos e bactérias quebram minerais insolúveis em formas quelatadas que os pelos radiculares absorvem conforme a demanda fisiológica, sem necessidade de lavagem de raízes agressiva no final.',
      pontosFortes: [
        'Complexidade organoléptica incomparável: aromas mais intensos, perfis terpênicos complexos e queima 100% branca e suave.',
        'Praticidade: na maior parte do ciclo rega-se apenas com água declorada e aditivos biológicos.',
        'Sustentabilidade: solo reutilizável por anos através de adubações de cobertura (Top Dressing).'
      ],
      pontosAtencao: [
        'Requer vasos grandes (mínimo de 15L a 30L por planta) para abrigar volume biológico suficiente.',
        'Se faltar nutriente no meio da floração, a quebra de adubos sólidos leva dias para surtir efeito — é onde os líquidos Bioflow entram como resgate emergencial.'
      ],
      estrategiaBioflow: {
        bioStart: 'Utilize 0.5 a 1.0 ml/L em transplantes para acelerar a pega das mudas sem estresse térmico ou radicular.',
        bioGreen: 'Geralmente dispensado no início; use em doses baixas (0.5 a 1.0 ml/L) caso perceba descoloração foliar na 4ª semana.',
        bioPotassium: 'Crucial nas semanas 6 a 8! Plantas de alta produtividade demandam mais Potássio biodisponível do que a decomposição natural do solo pode gerar no pico.',
        bioEM1: 'O coração do Living Soil! Aplicar semanalmente (1.0 ml/L) mantém as bactérias láticas, leveduras e actinomicetos no ápice da decomposição e proteção das raízes.'
      },
      tabelaParametros: {
        phIdeal: '6.2 – 6.8 (Água regulada com desclorador)',
        frequenciaRega: 'Regas lentas mantendo o substrato sempre levemente úmido (nunca seco esturricado)',
        ecFaseVeg: 'Não se mede no runoff (foco na vida biológica)',
        ecFaseFlora: 'Apenas controle de água',
        dificuldade: 'Iniciante para rega / Avançado para montagem do solo'
      },
      dicaMestre: 'Nunca aplique água tratada com cloro diretamente no Super Solo, pois o cloro esteriliza os microrganismos vivos benéficos. Use sempre água descansada ou filtrada e reforce com Bio-EM1 para restaurar a colônia.'
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
      <div style={{ maxWidth: 1140, margin: '0 auto', padding: '0 20px' }}>
        
        {/* Header do Blog */}
        <div style={{ textAlign: 'center', marginBottom: 50 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 30, background: 'rgba(212, 168, 67, 0.1)', border: '1px solid rgba(212, 168, 67, 0.3)', marginBottom: 16 }}>
            <BookOpen size={16} color="#d4a843" />
            <span style={{ color: '#d4a843', fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Enciclopédia de Cultivo BIOFLOW
            </span>
          </div>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 900, color: '#ffffff', lineHeight: 1.15 }}>
            Guia Completo de Solos & Substratos
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 16, maxWidth: 680, margin: '14px auto 0', lineHeight: 1.6 }}>
            Entenda a ciência do meio de cultivo: do inerte à base de fibra de coco ao Super Solo vivo, e aprenda a extrair o potencial máximo de cada linha de fertilização.
          </p>
        </div>

        {/* Filtros de Categoria */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 40 }}>
          {[
            { id: 'todos', label: 'Todos os Substratos' },
            { id: 'inerte', label: '100% Inerte (Coco/Perlita)' },
            { id: 'semi-inerte', label: 'Semi-Inerte (Húmus/Turfa)' },
            { id: 'completo', label: 'Super Solo Vivo' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFiltro(tab.id)}
              style={{
                padding: '10px 18px',
                borderRadius: 30,
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
                background: filtro === tab.id ? '#d4a843' : 'rgba(255,255,255,0.05)',
                color: filtro === tab.id ? '#071007' : 'rgba(255,255,255,0.8)',
                border: filtro === tab.id ? '1px solid #d4a843' : '1px solid rgba(255,255,255,0.1)',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Matriz Comparativa Resumida */}
        <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(212, 168, 67, 0.2)', borderRadius: 16, padding: 24, marginBottom: 50, overflowX: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <Activity size={20} color="#d4a843" />
            <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: '#fff' }}>
              Comparativo Rápido de Meios de Cultivo
            </h3>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 600 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#d4a843', textAlign: 'left' }}>
                <th style={{ padding: '10px 8px' }}>Substrato</th>
                <th style={{ padding: '10px 8px' }}>pH Alvo</th>
                <th style={{ padding: '10px 8px' }}>Velocidade de Ganho</th>
                <th style={{ padding: '10px 8px' }}>Papel dos Nutrientes BIOFLOW</th>
                <th style={{ padding: '10px 8px' }}>Complexidade de Manejo</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '12px 8px', fontWeight: 700, color: '#60a5fa' }}>Coco + Perlita (Inerte)</td>
                <td style={{ padding: '12px 8px' }}>5.8 - 6.1</td>
                <td style={{ padding: '12px 8px', color: '#4ade80' }}>Altíssima (Hidro)</td>
                <td style={{ padding: '12px 8px' }}>Alimentação 100% contínua via rega</td>
                <td style={{ padding: '12px 8px' }}>Exige medições de EC diárias</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '12px 8px', fontWeight: 700, color: '#4ade80' }}>Turfa + Húmus (Semi-Inerte)</td>
                <td style={{ padding: '12px 8px' }}>6.0 - 6.4</td>
                <td style={{ padding: '12px 8px' }}>Alta / Moderada</td>
                <td style={{ padding: '12px 8px' }}>Suplementação gradual e constante</td>
                <td style={{ padding: '12px 8px', color: '#4ade80' }}>Muito equilibrado e tolerante</td>
              </tr>
              <tr>
                <td style={{ padding: '12px 8px', fontWeight: 700, color: '#facc15' }}>Super Solo Vivo (Living Soil)</td>
                <td style={{ padding: '12px 8px' }}>6.2 - 6.8</td>
                <td style={{ padding: '12px 8px' }}>Natural / Orgânica</td>
                <td style={{ padding: '12px 8px' }}>Foco em Bio-EM1 e Bio-Potassium no pico</td>
                <td style={{ padding: '12px 8px' }}>Rega com água pura desclorada</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Layout do Artigo Detalhado + Seletor */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 30 }}>
          
          {/* Coluna Esquerda: Lista de Artigos */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {artigosFiltrados.map((artigo) => {
              const isSelected = artigoSelecionado?.id === artigo.id;
              return (
                <div
                  key={artigo.id}
                  onClick={() => setArtigoSelecionado(artigo)}
                  style={{
                    background: isSelected ? 'rgba(212, 168, 67, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                    border: isSelected ? '2px solid #d4a843' : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 14,
                    padding: 24,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 12, background: artigo.badgeCor.bg, color: artigo.badgeCor.text, border: `1px solid ${artigo.badgeCor.border}` }}>
                      {artigo.categoriaLabel}
                    </span>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                      {artigo.tempoLeitura}
                    </span>
                  </div>

                  <h3 style={{ fontSize: 18, fontWeight: 800, color: '#ffffff', marginBottom: 8, lineHeight: 1.3 }}>
                    {artigo.titulo}
                  </h3>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5, margin: 0 }}>
                    {artigo.resumo}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 16, color: '#d4a843', fontSize: 13, fontWeight: 700 }}>
                    <span>Ver protocolo técnico completo</span>
                    <ArrowRight size={14} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Coluna Direita: Detalhamento do Substrato Selecionado */}
          {artigoSelecionado && (
            <div style={{ background: 'rgba(15, 28, 15, 0.8)', border: '1px solid rgba(212, 168, 67, 0.3)', borderRadius: 16, padding: '32px 28px', height: 'fit-content' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#d4a843', fontSize: 13, fontWeight: 800, textTransform: 'uppercase', marginBottom: 10 }}>
                <Microscope size={16} /> Guia Científico & Prático
              </div>

              <h2 style={{ fontSize: 22, fontWeight: 900, color: '#ffffff', marginBottom: 16, lineHeight: 1.25 }}>
                {artigoSelecionado.titulo}
              </h2>

              {/* Box de Parâmetros Rápidos */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10, background: 'rgba(0,0,0,0.4)', padding: 14, borderRadius: 10, marginBottom: 24, border: '1px solid rgba(255,255,255,0.06)' }}>
                <div>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', display: 'block' }}>Faixa de pH</span>
                  <strong style={{ fontSize: 13, color: '#4ade80' }}>{artigoSelecionado.conteudo.tabelaParametros.phIdeal}</strong>
                </div>
                <div>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', display: 'block' }}>EC Vegetativo</span>
                  <strong style={{ fontSize: 13, color: '#60a5fa' }}>{artigoSelecionado.conteudo.tabelaParametros.ecFaseVeg}</strong>
                </div>
                <div>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', display: 'block' }}>EC Floração</span>
                  <strong style={{ fontSize: 13, color: '#facc15' }}>{artigoSelecionado.conteudo.tabelaParametros.ecFaseFlora}</strong>
                </div>
                <div>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', display: 'block' }}>Dificuldade</span>
                  <strong style={{ fontSize: 13, color: '#c084fc' }}>{artigoSelecionado.conteudo.tabelaParametros.dificuldade}</strong>
                </div>
              </div>

              {/* Seções de Conteúdo */}
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ fontSize: 14, fontWeight: 800, color: '#d4a843', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Layers size={15} /> O Que É e Como Funciona a Dinâmica Radicular
                </h4>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.6 }}>
                  {artigoSelecionado.conteudo.oQueE}
                </p>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.6 }}>
                  {artigoSelecionado.conteudo.mecanicaSolo}
                </p>
              </div>

              {/* Vantagens & Atenções */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
                <div style={{ background: 'rgba(34, 197, 94, 0.05)', padding: 14, borderRadius: 10, border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#4ade80', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <CheckCircle2 size={14} /> Vantagens Reais
                  </span>
                  <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
                    {artigoSelecionado.conteudo.pontosFortes.map((ponto, i) => (
                      <li key={i} style={{ marginBottom: 4 }}>{ponto}</li>
                    ))}
                  </ul>
                </div>

                <div style={{ background: 'rgba(239, 68, 68, 0.05)', padding: 14, borderRadius: 10, border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#f87171', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <AlertTriangle size={14} /> Pontos de Atenção
                  </span>
                  <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
                    {artigoSelecionado.conteudo.pontosAtencao.map((ponto, i) => (
                      <li key={i} style={{ marginBottom: 4 }}>{ponto}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Como Usar a Linha BIOFLOW no Substrato */}
              <div style={{ background: 'rgba(212, 168, 67, 0.05)', border: '1px solid rgba(212, 168, 67, 0.25)', borderRadius: 12, padding: 18, marginBottom: 20 }}>
                <h4 style={{ fontSize: 14, fontWeight: 800, color: '#facc15', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Sparkles size={16} /> Aplicação Personalizada dos Fertilizantes BIOFLOW
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12 }}>
                  <div style={{ borderLeft: '3px solid #60a5fa', paddingLeft: 10 }}>
                    <strong style={{ color: '#60a5fa' }}>Bio-Start (Enraizador):</strong> <span style={{ color: 'rgba(255,255,255,0.8)' }}>{artigoSelecionado.conteudo.estrategiaBioflow.bioStart}</span>
                  </div>
                  <div style={{ borderLeft: '3px solid #4ade80', paddingLeft: 10 }}>
                    <strong style={{ color: '#4ade80' }}>Bio-Green (Crescimento):</strong> <span style={{ color: 'rgba(255,255,255,0.8)' }}>{artigoSelecionado.conteudo.estrategiaBioflow.bioGreen}</span>
                  </div>
                  <div style={{ borderLeft: '3px solid #facc15', paddingLeft: 10 }}>
                    <strong style={{ color: '#facc15' }}>Bio-Potassium (Floração):</strong> <span style={{ color: 'rgba(255,255,255,0.8)' }}>{artigoSelecionado.conteudo.estrategiaBioflow.bioPotassium}</span>
                  </div>
                  <div style={{ borderLeft: '3px solid #c084fc', paddingLeft: 10 }}>
                    <strong style={{ color: '#c084fc' }}>Bio-EM1 (Microrganismos):</strong> <span style={{ color: 'rgba(255,255,255,0.8)' }}>{artigoSelecionado.conteudo.estrategiaBioflow.bioEM1}</span>
                  </div>
                </div>
              </div>

              {/* Dica de Ouro */}
              <div style={{ padding: 14, borderRadius: 10, background: 'rgba(0,0,0,0.5)', border: '1px dashed rgba(212, 168, 67, 0.4)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <Cpu size={18} color="#d4a843" style={{ flexShrink: 0, marginTop: 2 }} />
                <p style={{ fontSize: 12, color: '#fef08a', margin: 0, lineHeight: 1.5 }}>
                  <strong>Dica do Especialista BIOFLOW:</strong> {artigoSelecionado.conteudo.dicaMestre}
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