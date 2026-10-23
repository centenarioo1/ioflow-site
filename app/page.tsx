// app/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShoppingCart, 
  Droplets, 
  Leaf, 
  ChevronRight, 
  ChevronDown, 
  ImageIcon, 
  Check, 
  ShieldCheck, 
  Truck, 
  CreditCard, 
  Sparkles, 
  Star, 
  ArrowRight, 
  ZoomIn, 
  X, 
  UserCheck 
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { products as produtos } from '@/lib/products';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import TrustBar from '@/components/TrustBar';
import WhatsAppButton from '@/components/WhatsAppButton';

type Produto = {
  categoria: string;
  [key: string]: any; // Permite outras propriedades (id, nome, etc)
};

const nutrientes = (produtos as Produto[]).filter((p) => p.categoria === 'nutriente');
const solos = (produtos as Produto[]).filter((p) => p.categoria === 'solo' || p.categoria === 'substrato');
const emendas = (produtos as Produto[]).filter((p) => p.categoria === 'emenda');

const faqItems = [
  { 
    pergunta: 'Os produtos funcionam em hidroponia?', 
    resposta: 'Sim. Todos os nutrientes BIOFLOW são 100% solúveis e compatíveis com sistemas hidropônicos e semi-hidropônicos. Para resultado sensorial superior, recomendamos 10% de Bio-Humus no meio inerte (perlita ou fibra de coco).' 
  },
  { 
    pergunta: 'O que é a tecnologia Organomineral?', 
    resposta: 'É a união de microbiologia viva ativa com minerais de alta biodisponibilidade. Une o vigor e velocidade do cultivo mineral com o sabor, terpenos e saúde de solo do 100% orgânico.' 
  },
  { 
    pergunta: 'Posso utilizar em cultivos orgânicos certificados?', 
    resposta: 'Sim. Nossas formulações priorizam fontes limpas, sem resíduos químicos sintéticos agressivos, preservando a vida do solo.' 
  },
  { 
    pergunta: 'Por onde começar se eu for cultivador iniciante?', 
    resposta: 'A combinação de Bio-Mix (ou Coco Mix) com Bio-Start para enraizamento imediato entrega vigor visível nos primeiros 14 dias.' 
  },
  { 
    pergunta: 'Qual a diferença entre o BioMix e o Coco Mix?', 
    resposta: 'BioMix (Turfa + Perlita + Casca de Arroz) retém mais umidade com ótima aeração. Coco Mix (Fibra de Coco + Perlita) é 100% inerte para controle total de fertirrigação.' 
  }
];

function ImagemProduto({ src, alt, categoria }: { src: string; alt: string; categoria?: string }) {
  const [erro, setErro] = useState(false);
  const isNutriente = categoria === 'nutriente';

  if (erro || !src) {
    return (
      <div style={{ width: '100%', height: isNutriente ? 175 : 150, background: 'linear-gradient(135deg, #ede8df 0%, #e2dcce 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, color: '#9e927c' }}>
        <ImageIcon size={24} />
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.04em' }}>BIOFLOW LABS</span>
      </div>
    );
  }

  if (isNutriente) {
    return (
      <div style={{ width: '100%', height: 175, background: '#fcfbf9', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px', overflow: 'hidden' }}>
        <img src={src} alt={alt} onError={() => setErro(true)} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.05))' }} />
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: 150, overflow: 'hidden', background: '#e2dcce' }}>
      <img src={src} alt={alt} onError={() => setErro(true)} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
    </div>
  );
}

function PrintReview({ src, index, autor, tag, depoimento, onImageClick }: { src: string; index: number; autor: string; tag: string; depoimento: string; onImageClick: (src: string) => void; }) {
  const [erro, setErro] = useState(false);

  if (erro) {
    return (
      <div style={{ borderRadius: 12, padding: '14px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 130 }}>
        <div>
          <div style={{ display: 'flex', gap: 2, marginBottom: 6 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={12} fill="#d4a843" color="#d4a843" />
            ))}
          </div>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', lineHeight: 1.45, fontStyle: 'italic', margin: 0 }}>
            "{depoimento}"
          </p>
        </div>
        <div style={{ marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <strong style={{ fontSize: 11.5, color: '#fff' }}>{autor}</strong>
          <span style={{ fontSize: 10, color: '#4ade80', fontWeight: 700 }}>{tag}</span>
        </div>
      </div>
    );
  }

  return (
    <div onClick={() => onImageClick(src)} className="review-card-item" style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.2)', cursor: 'pointer', position: 'relative' }} title="Clique para visualizar em tela cheia">
      <img src={src} alt={`Avaliação ${index} - ${autor}`} onError={() => setErro(true)} style={{ width: '100%', display: 'block', objectFit: 'cover', transition: 'transform 0.25s ease' }} />
      <div className="review-overlay">
        <ZoomIn size={18} color="#ffffff" />
        <span>Ampliar</span>
      </div>
    </div>
  );
}

function WaveDivider({ flip = false, topColor, bottomColor }: { flip?: boolean; topColor: string; bottomColor: string }) {
  return (
    <div style={{ position: 'relative', width: '100%', overflow: 'hidden', lineHeight: 0, height: 26, background: bottomColor }}>
      <svg viewBox="0 0 1200 60" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ position: 'absolute', bottom: 0, width: '100%', height: 26, transform: flip ? 'scaleY(-1)' : 'none' }}>
        <path d="M0,30 C200,60 400,0 600,30 C800,60 1000,0 1200,30 L1200,60 L0,60 Z" fill={topColor} />
      </svg>
    </div>
  );
}

function ProdutoCard({ p }: { p: typeof produtos[number] }) {
  const { addToCart } = useCartStore();
  const [adicionado, setAdicionado] = useState(false);
  
  // 🟢 ESTADO PARA CONTROLAR EXPANSÃO DA DESCRIÇÃO
  const [expandido, setExpandido] = useState(false);

  const [selectedVariant, setSelectedVariant] = useState(() => {
    const disponiveis = p.variants?.filter((v) => v.stock > 0);
    return (disponiveis && disponiveis.length > 0) ? disponiveis.at(0) : (p.variants ? p.variants.at(0) : undefined);
  });

  const precoAtual = selectedVariant ? selectedVariant.price : p.preco;
  const precoOriginalAtual = selectedVariant ? selectedVariant.originalPrice : p.precoOriginal;
  const emEstoque = selectedVariant ? selectedVariant.stock > 0 : p.emEstoque;
  const desconto = precoOriginalAtual > precoAtual ? Math.round((1 - precoAtual / precoOriginalAtual) * 100) : 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!emEstoque) return;

    addToCart({
      id: `${p.id}-${selectedVariant?.id || selectedVariant?.size || 'default'}`,
      productId: p.id,
      variantId: selectedVariant?.id,
      name: p.nome,
      size: selectedVariant?.size || p.subtitulo || 'Padrão',
      price: precoAtual,
      originalPrice: precoOriginalAtual,
      quantity: 1,
      weight: selectedVariant?.weight || 1000,
      image: p.imagens.at(0) || '',
    });

    setAdicionado(true);
    setTimeout(() => setAdicionado(false), 1400);
  };

  return (
    <div className="card-produto">
      <div style={{ color: 'inherit', display: 'block' }}>
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          <ImagemProduto src={p.imagens.at(0) || ''} alt={p.nome} categoria={p.categoria} />
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'linear-gradient(to top, rgba(0,0,0,0.15) 0%, transparent 40%)' }} />

          {p.fase && (
            <span className="fase-badge" style={{ position: 'absolute', top: 8, left: 8 }}>
              {p.fase}
            </span>
          )}

          {desconto > 0 && emEstoque && (
            <span style={{ position: 'absolute', top: 8, right: 8, background: '#d4a843', color: '#0d2410', fontSize: 9.5, fontWeight: 900, padding: '2px 7px', borderRadius: 999 }}>
              -{desconto}%
            </span>
          )}

          {!emEstoque && (
            <span style={{ position: 'absolute', top: 8, right: 8, background: '#6b7280', color: 'white', fontSize: 9, fontWeight: 800, padding: '2px 7px', borderRadius: 999 }}>
              Esgotado
            </span>
          )}

          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: p.acento || '#22c55e' }} />
        </div>

        {/* 🟢 BLOCO DA DESCRIÇÃO COM CLIQUE EXPANSÍVEL */}
        <div style={{ padding: '12px 14px 4px' }}>
          <h3 style={{ fontSize: 14.5, fontWeight: 900, color: '#132e13', margin: '0 0 4px', lineHeight: 1.25, letterSpacing: '-0.01em' }}>
            {p.nome}
          </h3>
          <p
            onClick={() => setExpandido(!expandido)}
            title={expandido ? 'Clique para recolher' : 'Clique para ver a descrição completa'}
            style={{
              fontSize: 11.5,
              color: '#635b4d',
              lineHeight: 1.4,
              margin: '0 0 4px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              ...(expandido
                ? { display: 'block', overflow: 'visible' }
                : { display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }),
            }}
          >
            {expandido ? (p.descricao || p.descricaoCurta) : p.descricaoCurta}
          </p>
          <button
            type="button"
            onClick={() => setExpandido(!expandido)}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              fontSize: 10,
              fontWeight: 800,
              color: '#15803d',
              cursor: 'pointer',
              marginBottom: 8,
              display: 'inline-block',
            }}
          >
            {expandido ? '▲ Ver menos' : '▼ Ler descrição completa'}
          </button>
        </div>
      </div>

      {p.variants && p.variants.length > 1 && (
        <div style={{ padding: '0 14px 6px' }}>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {p.variants.map((v) => {
              const ativo = selectedVariant?.size === v.size;
              const semEstoque = v.stock <= 0;
              return (
                <button
                  key={v.id || v.size}
                  type="button"
                  disabled={semEstoque}
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedVariant(v);
                  }}
                  style={{
                    padding: '3px 8px',
                    borderRadius: 6,
                    fontSize: 10.5,
                    fontWeight: 800,
                    cursor: semEstoque ? 'not-allowed' : 'pointer',
                    border: ativo ? '1.5px solid #15803d' : '1px solid #e5e0d3',
                    background: ativo ? '#15803d' : semEstoque ? '#f3f4f6' : '#faf8f5',
                    color: ativo ? '#ffffff' : semEstoque ? '#9ca3af' : '#4a4336',
                    textDecoration: semEstoque ? 'line-through' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                  title={semEstoque ? 'Tamanho esgotado' : `Selecionar ${v.size}`}
                >
                  {v.size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ padding: '8px 14px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', paddingTop: 8, borderTop: '1px solid #f0ece4', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: 9.5, color: '#8c806d', display: 'block', fontWeight: 600 }}>
              {selectedVariant?.size ? `Embalagem ${selectedVariant.size}` : 'À vista'}
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span style={{ fontSize: 15.5, fontWeight: 900, color: '#132e13' }}>
                R$ {precoAtual.toFixed(2).replace('.', ',')}
              </span>
              {desconto > 0 && (
                <span style={{ fontSize: 10, color: '#a89d89', textDecoration: 'line-through' }}>
                  R$ {precoOriginalAtual.toFixed(2).replace('.', ',')}
                </span>
              )}
            </div>
          </div>

          <button 
            onClick={handleAdd} 
            disabled={!emEstoque}
            aria-label={`Comprar ${p.nome}`}
            className={`btn-card-comprar ${adicionado ? 'is-added' : ''}`}
            style={{ opacity: emEstoque ? 1 : 0.5, cursor: emEstoque ? 'pointer' : 'not-allowed' }}
          >
            {!emEstoque ? (
              'Esgotado'
            ) : adicionado ? (
              <>
                <Check size={13} /> Adicionado
              </>
            ) : (
              <>
                <ShoppingCart size={13} /> Comprar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [faqAberto, setFaqAberto] = useState<number | null>(null);
  const [cultivoAtivo, setCultivoAtivo] = useState<'solo' | 'hidroponia'>('solo');
  const [imagemModal, setImagemModal] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setImagemModal(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const depoimentosMock = [
    { autor: 'Carlos M. - Cultivo Indoor', tag: 'Cliente Verificado', texto: 'A aeração do BioMix com Bio-Start colonizou o vaso em 10 dias. O salto em densidade floral é nítido.' },
    { autor: 'Fernanda V. - Hortaliças Gourmet', tag: 'Produtora Comercial', texto: 'Nutrientes Bioflow com 10% Bio-Humus aumentaram expressivamente os terpenos e aromas.' },
    { autor: 'Guilherme S. - Hidroponia Passiva', tag: 'Cliente Verificado', texto: 'Coco Mix 50/50 tem condutividade limpa. Resposta imediata na copa das plantas em 24h.' },
  ];

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", background: '#f7f3ed', minHeight: '100vh', color: '#1a1a1a' }}>
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        
        .btn-primary { 
          background: #d4a843; 
          color: #0d2410; 
          font-weight: 800; 
          border-radius: 9px; 
          transition: all 0.2s ease; 
        }
        .btn-primary:hover { 
          background: #e6bc5a; 
          transform: translateY(-1px); 
          box-shadow: 0 6px 16px rgba(212,168,67,0.3); 
        }
        
        .btn-card-comprar {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 8px 15px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          font-weight: 800;
          font-size: 11.5px;
          background: #f97316;
          color: #ffffff;
          box-shadow: 0 2px 6px rgba(249, 115, 22, 0.25);
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .btn-card-comprar:hover {
          background: #16a34a !important;
          color: #ffffff !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(22, 163, 74, 0.35);
        }
        .btn-card-comprar.is-added {
          background: #16a34a !important;
          color: #ffffff !important;
        }

        .btn-ghost { 
          background: rgba(255,255,255,0.08); 
          border: 1px solid rgba(255,255,255,0.2); 
          color: white; 
          font-weight: 700; 
          border-radius: 9px; 
          transition: all 0.2s ease; 
        }
        .btn-ghost:hover { 
          background: rgba(255,255,255,0.15); 
          transform: translateY(-1px);
        }
        .card-produto { 
          background: #ffffff; 
          border-radius: 14px; 
          overflow: hidden; 
          border: 1px solid rgba(0,0,0,0.06); 
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); 
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .card-produto:hover { 
          transform: translateY(-3px); 
          box-shadow: 0 10px 24px rgba(0,0,0,0.07); 
        }
        .fase-badge { 
          font-size: 8.5px; 
          font-weight: 800; 
          letter-spacing: 0.06em; 
          text-transform: uppercase; 
          padding: 3px 7px; 
          border-radius: 999px; 
          background: rgba(13, 36, 16, 0.75); 
          color: #ffffff; 
          backdrop-filter: blur(4px); 
          border: 1px solid rgba(255,255,255,0.12);
        }
        .tag-componente { 
          font-size: 11px; 
          font-weight: 700; 
          background: #ede8df; 
          color: #463c2c; 
          padding: 4px 10px; 
          border-radius: 999px; 
          border: 1px solid rgba(0,0,0,0.04);
        }
        .selo { 
          display: inline-flex; 
          align-items: center; 
          gap: 6px; 
          background: rgba(212,168,67,0.15); 
          border: 1px solid rgba(212,168,67,0.35); 
          color: #d4a843; 
          font-size: 10px; 
          font-weight: 800; 
          letter-spacing: 0.06em; 
          text-transform: uppercase; 
          padding: 4px 12px; 
          border-radius: 999px; 
        }
        .section-label { 
          font-size: 10.5px; 
          font-weight: 900; 
          letter-spacing: 0.1em; 
          text-transform: uppercase; 
          color: #d4a843; 
        }
        .compare-card { 
          border-radius: 14px; 
          padding: 18px 20px; 
          transition: all 0.2s ease; 
        }
        .acento-bar { 
          height: 3px; 
          border-radius: 999px; 
          margin-bottom: 12px; 
        }

        .review-card-item {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .review-card-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.3);
        }
        .review-overlay {
          position: absolute;
          inset: 0;
          background: rgba(7, 16, 7, 0.55);
          opacity: 0;
          transition: opacity 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          color: #ffffff;
          font-size: 12px;
          font-weight: 800;
          backdrop-filter: blur(2px);
        }
        .review-card-item:hover .review-overlay {
          opacity: 1;
        }
        .review-card-item:hover img {
          transform: scale(1.03);
        }
      `}</style>

  {/* HEADER */}
  <SiteHeader />

  {/* HERO SECTION */}
  <section style={{
    background: 'linear-gradient(160deg, #07150a 0%, #0d2410 45%, #133317 80%, #081a0b 100%)',
    position: 'relative', 
    overflow: 'hidden', 
    padding: '56px 18px 36px',
    marginTop: 64
  }}>
    <div style={{ maxWidth: 840, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 10, width: '100%' }}>
      
      <div className="selo" style={{ marginBottom: 14 }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#d4a843' }} />
        Nutrição Organomineral de Precisão
      </div>

      <h1 style={{ fontSize: 'clamp(26px, 4.2vw, 44px)', fontWeight: 900, lineHeight: 1.12, color: '#ffffff', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
        Cultivo com rigor técnico.
      </h1>
      <h2 style={{ fontSize: 'clamp(24px, 4.2vw, 44px)', fontWeight: 900, lineHeight: 1.15, background: 'linear-gradient(90deg, #4ade80 0%, #d4a843 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '0 0 14px', letterSpacing: '-0.02em' }}>
        Resultados visíveis no peso e aroma.
      </h2>

      <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.72)', maxWidth: 540, margin: '0 auto 20px', lineHeight: 1.5 }}>
        Biologia ativa com EM1 integrado e minerais biodisponíveis. Substratos com aeração calibrada e linha líquida balanceada para cada fase.
      </p>

      <div style={{ display: 'inline-flex', background: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: 3, marginBottom: 14, border: '1px solid rgba(255,255,255,0.1)' }}>
        {(['solo', 'hidroponia'] as const).map((tipo) => (
          <button 
            key={tipo} 
            onClick={() => setCultivoAtivo(tipo)} 
            style={{
              padding: '6px 16px', 
              borderRadius: 8, 
              border: 'none', 
              cursor: 'pointer', 
              fontWeight: 800, 
              fontSize: 11.5,
              display: 'flex', 
              alignItems: 'center', 
              gap: 6, 
              background: cultivoAtivo === tipo ? (tipo === 'solo' ? '#22c55e' : '#3b82f6') : 'transparent',
              color: cultivoAtivo === tipo ? '#07150a' : 'rgba(255,255,255,0.65)',
            }}
          >
            {tipo === 'solo' ? <Leaf size={12} /> : <Droplets size={12} />}
            {tipo === 'solo' ? 'Solo Orgânico' : 'Hidroponia & Clones'}
          </button>
        ))}
      </div>

      <div style={{
        maxWidth: 500, 
        margin: '0 auto 20px',
        background: cultivoAtivo === 'solo' ? 'rgba(34,197,94,0.08)' : 'rgba(59,130,246,0.08)',
        border: `1px solid ${cultivoAtivo === 'solo' ? 'rgba(34,197,94,0.25)' : 'rgba(59,130,246,0.25)'}`,
        borderRadius: 10, 
        padding: '10px 14px', 
        textAlign: 'left',
      }}>
        {cultivoAtivo === 'solo' ? (
          <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: 11.5, lineHeight: 1.45, margin: 0 }}>
            🌱 <strong>Solo Orgânico:</strong> Use base <strong>Bio-Mix</strong> com 20-30% de <strong>Bio-Humus</strong>. Aplique Bio-Start e Bio-Green por rega.
          </p>
        ) : (
          <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: 11.5, lineHeight: 1.45, margin: 0 }}>
            💧 <strong>Hidroponia:</strong> Use <strong>Coco Mix (50/50)</strong> inerte para fertirrigação frequente com resposta imediata.
          </p>
        )}
      </div>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
        <a href="#nutrientes" className="btn-primary" style={{ padding: '10px 22px', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
          Ver Catálogo <ArrowRight size={14} />
        </a>
        <Link href="/dashboard" className="btn-ghost" style={{ padding: '10px 20px', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none', borderColor: '#d4a843', color: '#d4a843' }}>
          <UserCheck size={15} /> Minha Conta / Pedidos
        </Link>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 18, flexWrap: 'wrap' }}>
        {[
          { icon: ShieldCheck, texto: 'Compra Segura' },
          { icon: Truck, texto: 'Envio Brasil' },
          { icon: CreditCard, texto: 'Pix c/ Desconto e Cartão 12x' },
        ].map(({ icon: Icon, texto }, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Icon size={13} color="#d4a843" />
            <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>{texto}</span>
          </div>
        ))}
      </div>

    </div>
  </section>

  <TrustBar />
  <WaveDivider topColor="#0d2410" bottomColor="#f7f3ed" />

  {/* COMPARAÇÃO */}
  <section id="como-funciona" style={{ padding: '42px 18px', background: '#f7f3ed' }}>
    <div style={{ maxWidth: 1040, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 30 }}>
        <div className="section-label" style={{ marginBottom: 6 }}>Diferencial Tecnológico</div>
        <h2 style={{ fontSize: 'clamp(20px, 3.5vw, 30px)', fontWeight: 900, color: '#132e13', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
          Organomineral vs. Alternativas Comuns
        </h2>
        <p style={{ color: '#6d6251', maxWidth: 460, margin: '0 auto', lineHeight: 1.5, fontSize: 12.5 }}>
          Nutrição de precisão com ativação da microbiologia do solo.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
        <div className="compare-card" style={{ background: '#ffffff', border: '1px solid #eae5db' }}>
          <div className="acento-bar" style={{ background: '#ef4444' }} />
          <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#991b1b', marginBottom: 4 }}>
            Químico Sintético Puro
          </div>
          <p style={{ fontSize: 13.5, fontWeight: 800, color: '#1f2937', marginBottom: 12, lineHeight: 1.3 }}>
            Rápido, porém agressivo às raízes.
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 7 }}>
            {[
              'Saliniza e acidifica o solo',
              'Elimina microbiota benéfica',
              'Flores e frutos com menos terpenos',
              'Exige lavagens frequentes (flush)'
            ].map((item, j) => (
              <li key={j} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: '#4b5563' }}>
                <span style={{ color: '#ef4444', fontWeight: 900, fontSize: 12 }}>✕</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="compare-card" style={{ 
          background: '#0d2410', 
          border: '1.5px solid #22c55e', 
          boxShadow: '0 8px 24px rgba(13,36,16,0.18)',
          position: 'relative'
        }}>
          <span style={{ position: 'absolute', top: -9, right: 14, background: '#22c55e', color: '#07150a', fontSize: 9, fontWeight: 900, padding: '2px 8px', borderRadius: 999, textTransform: 'uppercase' }}>
            Recomendado
          </span>
          <div className="acento-bar" style={{ background: '#22c55e' }} />
          <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#d4a843', marginBottom: 4 }}>
            BIOFLOW Organomineral
          </div>
          <p style={{ fontSize: 13.5, fontWeight: 800, color: '#ffffff', marginBottom: 12, lineHeight: 1.3 }}>
            Microbiota viva + minerais quelados.
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 7 }}>
            {[
              'Nutrição imediata sem queimar raízes',
              'Aumenta resinas, brix e aromas',
              'Ideal para solo vivo e hidroponia',
              'Sem acúmulo de sais tóxicos'
            ].map((item, j) => (
              <li key={j} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: 'rgba(255,255,255,0.9)' }}>
                <span style={{ color: '#4ade80', fontWeight: 900, fontSize: 12 }}>✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="compare-card" style={{ background: '#ffffff', border: '1px solid #eae5db' }}>
          <div className="acento-bar" style={{ background: '#f59e0b' }} />
          <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#b45309', marginBottom: 4 }}>
            Orgânico Convencional
          </div>
          <p style={{ fontSize: 13.5, fontWeight: 800, color: '#1f2937', marginBottom: 12, lineHeight: 1.3 }}>
            Seguro, porém de absorção lenta.
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 7 }}>
            {[
              'Liberação lenta dependente do clima',
              'Dificuldade em gotejo e rega automática',
              'Risco de deficiências no pico de flora',
              'Menor previsibilidade de dosagem'
            ].map((item, j) => (
              <li key={j} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: '#4b5563' }}>
                <span style={{ color: '#f59e0b', fontWeight: 900, fontSize: 12 }}>–</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  </section>

  <WaveDivider topColor="#f7f3ed" bottomColor="#ffffff" />

  {/* NUTRIENTES */}
  <section id="nutrientes" style={{ padding: '42px 18px', background: '#ffffff' }}>
    <div style={{ maxWidth: 1040, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div className="section-label" style={{ marginBottom: 6 }}>Fertirrigação & Estimulantes</div>
        <h2 style={{ fontSize: 'clamp(20px, 3.5vw, 30px)', fontWeight: 900, color: '#132e13', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
          Linha Líquida por Fase
        </h2>
        <p style={{ color: '#6d6251', maxWidth: 440, margin: '0 auto', lineHeight: 1.5, fontSize: 12.5 }}>
          Bioestimulantes concentrados para enraizamento, biomassa e floração.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
        {nutrientes.map((p) => (
          <ProdutoCard key={p.id} p={p} />
        ))}
      </div>

      <div style={{ 
        marginTop: 26, 
        background: 'linear-gradient(135deg, #0d2410 0%, #173d1c 100%)', 
        borderRadius: 14, 
        padding: '18px 22px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        gap: 14, 
        flexWrap: 'wrap'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
            <Sparkles size={14} color="#d4a843" />
            <span style={{ color: '#d4a843', fontWeight: 800, fontSize: 10.5, textTransform: 'uppercase' }}>Tríade Nutricional</span>
          </div>
          <h3 style={{ fontWeight: 900, color: '#ffffff', fontSize: 15, margin: '0 0 2px' }}>
            Programa Nutricional BIOFLOW Completo
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11.5, margin: 0 }}>
            Bio-Start® + Bio-Green® + Bio-Potassium® com EM1 ativado na formulação.
          </p>
        </div>
        
        <Link 
          href="/carrinho" 
          className="btn-primary" 
          style={{ padding: '8px 16px', fontSize: 12, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}
        >
          Ver Carrinho <ChevronRight size={14} />
        </Link>
      </div>
    </div>
  </section>

  <WaveDivider topColor="#ffffff" bottomColor="#f7f3ed" />

  {/* SUBSTRATOS */}
  <section id="solos" style={{ padding: '42px 18px', background: '#f7f3ed' }}>
    <div style={{ maxWidth: 1040, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 18 }}>
        <div className="section-label" style={{ marginBottom: 6 }}>Física do Solo & Substratos</div>
        <h2 style={{ fontSize: 'clamp(20px, 3.5vw, 30px)', fontWeight: 900, color: '#132e13', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
          Substratos Prontos & Condicionadores
        </h2>
        <p style={{ color: '#6d6251', maxWidth: 460, margin: '0 auto', lineHeight: 1.5, fontSize: 12.5 }}>
          Equilíbrio preciso entre aeração, retenção de água e aporte de sílica natural.
        </p>
      </div>

      <div style={{ 
        background: 'rgba(59,130,246,0.08)', 
        border: '1px solid rgba(59,130,246,0.2)', 
        borderRadius: 10, 
        padding: '10px 14px', 
        margin: '14px 0 20px', 
        display: 'flex', 
        alignItems: 'center', 
        gap: 10 
      }}>
        <Droplets size={16} color="#3b82f6" style={{ flexShrink: 0 }} />
        <p style={{ fontSize: 12, color: '#1e3a8a', margin: 0, lineHeight: 1.45 }}>
          <strong>Hidroponia Semi-Orgânica:</strong> Use 90% inerte (Coco Mix ou Perlita + Casca) com <strong>10% de Bio-Humus</strong>.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
        {solos.concat(emendas).map((p) => (
          <ProdutoCard key={p.id} p={p} />
        ))}
      </div>

      <div style={{ marginTop: 22, background: '#ffffff', borderRadius: 12, padding: '14px 18px', border: '1px solid #eae5db' }}>
        <p style={{ fontWeight: 800, color: '#382f23', marginBottom: 8, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Componentes puros disponíveis:
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {[
            'Bio-Turfa Sphagnum',
            'Bio-Arroz Carbon',
            'Bio-Humus Puro',
            'Bio-Aves Esterco',
            'Bio-Mamona Torta',
            'Bio-Melaço de Cana',
            'Bio-Perlita Expandida',
            'Fibra de Coco Lavada'
          ].map((c, i) => (
            <span key={i} className="tag-componente">{c}</span>
          ))}
        </div>
      </div>
    </div>
  </section>

  <WaveDivider topColor="#f7f3ed" bottomColor="#0d2410" />

  {/* AVALIAÇÕES */}
  <section id="resultados" style={{ padding: '42px 18px', background: '#0d2410' }}>
    <div style={{ maxWidth: 1040, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 26 }}>
        <div className="section-label" style={{ marginBottom: 6 }}>Depoimentos Reais</div>
        <h2 style={{ fontSize: 'clamp(20px, 3.5vw, 30px)', fontWeight: 900, color: '#ffffff', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
          Resultados no Cultivo
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12.5, margin: '0 auto', maxWidth: 440 }}>
          Clique em qualquer imagem para ampliar os relatos e colheitas da comunidade.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
        {depoimentosMock.map((item, i) => (
          <PrintReview 
            key={i} 
            src={`/imgs/reviews/review-${i + 1}.jpg`} 
            index={i + 1}
            autor={item.autor}
            tag={item.tag}
            depoimento={item.texto}
            onImageClick={(src) => setImagemModal(src)}
          />
        ))}
      </div>
    </div>
  </section>

  {/* MODAL LIGHTBOX */}
  {imagemModal && (
    <div 
      onClick={() => setImagemModal(null)}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(0, 0, 0, 0.88)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          maxWidth: '92vw',
          maxHeight: '88vh',
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          background: '#0d2410',
        }}
      >
        <button
          onClick={() => setImagemModal(null)}
          aria-label="Fechar visualização"
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            background: 'rgba(0, 0, 0, 0.65)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#ffffff',
            width: 36,
            height: 36,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10,
          }}
        >
          <X size={20} />
        </button>
        <img 
          src={imagemModal} 
          alt="Avaliação ampliada" 
          style={{ maxWidth: '100%', maxHeight: '82vh', objectFit: 'contain', display: 'block' }}
        />
      </div>
    </div>
  )}

  <WaveDivider topColor="#0d2410" bottomColor="#ffffff" />

  {/* FAQ */}
  <section style={{ padding: '42px 18px', background: '#ffffff' }}>
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div className="section-label" style={{ marginBottom: 6 }}>Dúvidas</div>
        <h2 style={{ fontSize: 'clamp(20px, 3.5vw, 28px)', fontWeight: 900, color: '#132e13', margin: 0, letterSpacing: '-0.02em' }}>
          Perguntas Frequentes
        </h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {faqItems.map((item, i) => {
          const isOpen = faqAberto === i;
          return (
            <div 
              key={i} 
              style={{ 
                border: `1px solid ${isOpen ? '#22c55e' : '#eae5db'}`, 
                borderRadius: 10, 
                overflow: 'hidden', 
                background: isOpen ? '#f9fdfa' : '#ffffff',
              }}
            >
              <button 
                onClick={() => setFaqAberto(isOpen ? null : i)} 
                aria-expanded={isOpen}
                style={{ 
                  width: '100%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  padding: '12px 16px', 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer', 
                  textAlign: 'left' 
                }}
              >
                <span style={{ fontWeight: 800, color: '#132e13', paddingRight: 10, fontSize: 13 }}>
                  {item.pergunta}
                </span>
                <ChevronDown 
                  size={16} 
                  color={isOpen ? '#22c55e' : '#9a8e78'} 
                  style={{ 
                    flexShrink: 0, 
                    transition: 'transform 0.2s ease', 
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' 
                  }} 
                />
              </button>

              {isOpen && (
                <div style={{ padding: '0 16px 12px', fontSize: 12, color: '#5f5444', lineHeight: 1.55, borderTop: '1px solid #f0ece4', paddingTop: 10 }}>
                  {item.resposta}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  </section>

  {/* FOOTER */}
  <SiteFooter />
  <WhatsAppButton />

</div>
  );
}