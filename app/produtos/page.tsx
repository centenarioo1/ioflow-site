// app/produtos/page.tsx
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ShoppingCart, Check, Search } from 'lucide-react';
import { products as fallbackProducts, categorias, Product, ProductVariant } from '@/lib/products';
import { useCartStore } from '@/store/useCartStore';
import { trackEvent } from '@/lib/analytics';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import CartDrawer from '@/components/CartDrawer';
import TrustBar from '@/components/TrustBar';
import WhatsAppButton from '@/components/WhatsAppButton';

export const dynamic = 'force-dynamic';

function formatarProdutoSupabase(p: any): Product {
  const sortedVariants = p.variants
    ? [...p.variants].sort((a: any, b: any) => {
        const wA = Number(a.weight || 0);
        const wB = Number(b.weight || 0);
        if (wA > 0 && wB > 0 && wA !== wB) return wA - wB;
        return Number(a.price || 0) - Number(b.price || 0);
      })
    : [];
  const disponiveis = sortedVariants.filter((v: any) => Number(v.stock) > 0);
  const base = disponiveis.length > 0 ? disponiveis : sortedVariants;
  const maisBarata = base.length > 0 ? base[0] : { price: 0, originalPrice: 0 };
  const estoqueTotal = sortedVariants.reduce((acc: number, v: any) => acc + (Number(v.stock) || 0), 0);

  const INFO_CATEGORIA_MAP: Record<string, { categoria: Product['categoria']; fase: string; acento: string }> = {
    substratos:      { categoria: 'substrato', fase: 'Substrato',           acento: '#22c55e' },
    condicionadores: { categoria: 'substrato', fase: 'Aeração & Drenagem',  acento: '#0ea5e9' },
    fertilizantes:   { categoria: 'nutriente', fase: 'Nutrição Líquida',    acento: '#d4a843' },
    adubos:          { categoria: 'emenda',    fase: 'Adubo Orgânico',      acento: '#b45309' },
    minerais:        { categoria: 'mineral',   fase: 'Insumo Mineral',      acento: '#a855f7' },
  };

  const info = INFO_CATEGORIA_MAP[p.category] || { categoria: 'substrato', fase: 'Produto', acento: '#22c55e' };

  return {
    id: String(p.id),
    name: p.name,
    nome: p.name,
    slug: p.slug,
    category: p.category,
    categoria: info.categoria,
    subtitulo: sortedVariants.map((v: any) => v.size).join(' · '),
    description: p.description || '',
    descricao: p.description || '',
    descricaoCurta: p.description || '',
    features: p.features || [],
    tags: [...(p.features || []), info.fase, p.category],
    images: p.images || [],
    imagens: p.images || [],
    variants: sortedVariants.map((v: any) => ({
      id: String(v.id || v.size),
      size: v.size,
      price: Number(v.price || 0),
      originalPrice: Number(v.originalPrice || 0),
      stock: Number(v.stock || 0),
      weight: Number(v.weight || 0),
      dimensions: v.dimensions || { height: v.height || 10, width: v.width || 20, length: v.length || 30 },
    })),
    preco: Number(maisBarata.price || 0),
    precoOriginal: Number(maisBarata.originalPrice || 0),
    fase: info.fase,
    acento: info.acento,
    estoque: estoqueTotal,
    emEstoque: estoqueTotal > 0,
  } as Product;
}

function CatalogoContent() {
  const searchParams = useSearchParams();
  const catUrl = searchParams.get('cat');

  const [listaProdutos, setListaProdutos] = useState<Product[]>(fallbackProducts as Product[]);
  const [categoriaAtiva, setCategoriaAtiva] = useState<string>(catUrl || 'todos');
  const [busca, setBusca] = useState('');
  const [adicionadoId, setAdicionadoId] = useState<string | null>(null);
  const [variantesSelecionadas, setVariantesSelecionadas] = useState<Record<string, string>>({});
  const { addToCart } = useCartStore();

  // 🟢 REGISTRA VISITA À PÁGINA DE PRODUTOS
  useEffect(() => {
    try {
      trackEvent('VISIT');
    } catch (err) {
      console.warn('Erro ao registrar visita:', err);
    }
  }, []);

  // 🟢 BUSCA PRODUTOS VIVOS DO SUPABASE
  useEffect(() => {
    async function carregarProdutosDoSupabase() {
      try {
        const res = await fetch('/api/admin/products', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (data.ok && Array.isArray(data.products) && data.products.length > 0) {
          const formatados = data.products.map(formatarProdutoSupabase);
          setListaProdutos(formatados);
        }
      } catch (err) {
        console.error('Erro ao conectar ao Supabase no catálogo:', err);
      }
    }
    carregarProdutosDoSupabase();
  }, []);

  useEffect(() => {
    if (catUrl) {
      setCategoriaAtiva(catUrl);
    }
  }, [catUrl]);

  const buscaLower = busca.toLowerCase();

  const produtosFiltrados = listaProdutos.filter((p) => {
    const matchCat = categoriaAtiva === 'todos' ? true : p.categoria === categoriaAtiva;
    const matchBusca =
      (p.nome || '').toLowerCase().includes(buscaLower) ||
      (p.descricaoCurta || '').toLowerCase().includes(buscaLower) ||
      (p.tags || []).some((t) => (t || '').toLowerCase().includes(buscaLower));
    return matchCat && matchBusca;
  });

  const getVarianteAtiva = (p: Product): ProductVariant => {
    const idSelecionado = variantesSelecionadas[p.id];
    const escolhida = p.variants?.find((v) => v.id === idSelecionado);
    if (escolhida) return escolhida;
    const primeiraDisponivel = p.variants?.find((v) => v.stock > 0);
    return primeiraDisponivel || (p.variants?.at(0) as ProductVariant);
  };

  const handleSelecionarVariante = (p: Product, varianteId: string) => {
    setVariantesSelecionadas((prev) => ({ ...prev, [p.id]: varianteId }));
    // 🟢 RASTREIA CLIQUE/SELEÇÃO DE VARIAÇÃO NO PRODUTO
    try {
      trackEvent('PRODUCT_CLICK', {
        productId: String(p.id),
        productName: p.nome,
      });
    } catch (err) {
      console.warn('Erro ao registrar clique de produto:', err);
    }
  };

  const handleCliqueCard = (p: Product) => {
    // 🟢 RASTREIA CLIQUE NO CARD/TÍTULO DO PRODUTO
    try {
      trackEvent('PRODUCT_CLICK', {
        productId: String(p.id),
        productName: p.nome,
      });
    } catch (err) {
      console.warn('Erro ao registrar clique de produto:', err);
    }
  };

  const handleComprar = (p: Product, variante: ProductVariant) => {
    if (!variante || variante.stock <= 0) return;

    addToCart({
      id: `${p.id}-${variante.id || variante.size}`,
      productId: String(p.id),
      variantId: String(variante.id || variante.size),
      name: p.nome,
      size: variante.size,
      price: variante.price,
      originalPrice: variante.originalPrice,
      quantity: 1,
      weight: variante.weight,
      dimensions: variante.dimensions,
      image: p.imagens?.at(0) || '',
    });

    setAdicionadoId(`${p.id}-${variante.id || variante.size}`);
    setTimeout(() => setAdicionadoId(null), 1400);
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px 80px' }}>
      {/* BARRA DE PESQUISA & ABAS */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ position: 'relative', maxWidth: 500, margin: '0 auto 24px' }}>
          <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9a8e78' }} />
          <input
            type="text"
            placeholder="Buscar por nome, fertilizante, perlita, húmus..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 14px 12px 42px',
              borderRadius: 12,
              border: '1.5px solid #ece8e0',
              background: '#ffffff',
              fontSize: 14,
              outline: 'none',
            }}
          />
        </div>

        {/* CATEGORIAS */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
          {categorias.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoriaAtiva(cat.id)}
              style={{
                padding: '8px 18px',
                borderRadius: 999,
                border: 'none',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: 13,
                background: categoriaAtiva === cat.id ? '#132e13' : '#ffffff',
                color: categoriaAtiva === cat.id ? '#ffffff' : '#6b6355',
                boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                transition: 'all 0.2s',
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* GRID DE PRODUTOS */}
      {produtosFiltrados.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#ffffff', borderRadius: 16 }}>
          <p style={{ fontSize: 16, fontWeight: 700, color: '#1a3d1a', margin: '0 0 6px' }}>Nenhum produto encontrado.</p>
          <p style={{ fontSize: 13, color: '#9a8e78', margin: 0 }}>Tente buscar outro termo ou selecione todas as categorias.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 18 }}>
          {produtosFiltrados.map((p) => {
            const variante = getVarianteAtiva(p);
            const isAdded = adicionadoId === `${p.id}-${variante?.id || variante?.size}`;
            const emEstoque = variante ? variante.stock > 0 : false;
            const desconto = variante && variante.originalPrice > variante.price
              ? Math.round((1 - variante.price / variante.originalPrice) * 100)
              : 0;

            return (
              <div
                key={p.id}
                style={{
                  background: '#ffffff',
                  borderRadius: 16,
                  border: '1px solid #ece8e0',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                }}
              >
                {/* 🟢 CARD COM RASTREAMENTO DE CLIQUE NO PRODUTO */}
                <div 
                  onClick={() => handleCliqueCard(p)} 
                  style={{ color: 'inherit', cursor: 'pointer' }}
                >
                  <div style={{ height: 160, background: '#f0ece4', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    <img
                      src={p.imagens?.at(0) || ''}
                      alt={p.nome}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    {p.fase && (
                      <span style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(13,36,16,0.85)', color: '#ffffff', fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 999 }}>
                        {p.fase}
                      </span>
                    )}
                    {desconto > 0 && emEstoque && (
                      <span style={{ position: 'absolute', top: 10, right: 10, background: '#d4a843', color: '#0d2410', fontSize: 10, fontWeight: 900, padding: '3px 8px', borderRadius: 999 }}>
                        -{desconto}%
                      </span>
                    )}
                  </div>

                  <div style={{ padding: '14px 16px 8px' }}>
                    <h3 style={{ fontSize: 15, fontWeight: 900, color: '#132e13', margin: '0 0 4px', lineHeight: 1.3 }}>
                      {p.nome}
                    </h3>
                    <p style={{ fontSize: 12, color: '#635b4d', lineHeight: 1.45, margin: 0, minHeight: 36, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {p.descricaoCurta || p.descricao}
                    </p>
                  </div>
                </div>

                {/* SELETOR DE VARIANTES COM RASTREAMENTO */}
                {p.variants && p.variants.length > 0 && (
                  <div style={{ padding: '4px 16px 8px' }}>
                    <span style={{ fontSize: 10, fontWeight: 800, color: '#9a8e78', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>
                      Escolha o tamanho:
                    </span>
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                      {p.variants.map((v) => {
                        const ativo = variante?.id === v.id;
                        const semEstoque = v.stock <= 0;
                        return (
                          <button
                            key={v.id || v.size}
                            type="button"
                            disabled={semEstoque}
                            onClick={() => handleSelecionarVariante(p, v.id)}
                            title={semEstoque ? 'Tamanho esgotado' : `Selecionar ${v.size}`}
                            style={{
                              padding: '4px 10px',
                              borderRadius: 6,
                              fontSize: 11,
                              fontWeight: 800,
                              cursor: semEstoque ? 'not-allowed' : 'pointer',
                              border: ativo ? '1.5px solid #15803d' : '1px solid #e5e0d3',
                              background: ativo ? '#15803d' : semEstoque ? '#f3f4f6' : '#faf8f5',
                              color: ativo ? '#ffffff' : semEstoque ? '#9ca3af' : '#4a4336',
                              textDecoration: semEstoque ? 'line-through' : 'none',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            {v.size}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div style={{ padding: '12px 16px 16px', borderTop: '1px solid #f8f6f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ fontSize: 10, color: '#9a8e78', display: 'block' }}>
                      {variante?.size ? `Embalagem ${variante.size}` : 'À vista'}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
                      <span style={{ fontSize: 18, fontWeight: 900, color: '#132e13' }}>
                        R$ {variante ? variante.price.toFixed(2).replace('.', ',') : '0,00'}
                      </span>
                      {desconto > 0 && variante && (
                        <span style={{ fontSize: 11, color: '#a89d89', textDecoration: 'line-through' }}>
                          R$ {variante.originalPrice.toFixed(2).replace('.', ',')}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleComprar(p, variante)}
                    disabled={!emEstoque}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '8px 14px',
                      borderRadius: 10,
                      border: 'none',
                      cursor: emEstoque ? 'pointer' : 'not-allowed',
                      fontWeight: 800,
                      fontSize: 12,
                      background: !emEstoque ? '#e5e7eb' : isAdded ? '#22c55e' : '#d4a843',
                      color: !emEstoque ? '#9ca3af' : isAdded ? '#ffffff' : '#132e13',
                      transition: 'all 0.2s',
                    }}
                  >
                    {!emEstoque
                      ? 'Esgotado'
                      : isAdded
                        ? <><Check size={14} /> Adicionado</>
                        : <><ShoppingCart size={14} /> Comprar</>}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function ProdutosPage() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: '#f7f3ed', minHeight: '100vh', paddingTop: 102 }}>
      <SiteHeader />
      <CartDrawer />

      {/* HERO */}
      <div style={{ background: 'linear-gradient(135deg, #07150a 0%, #0d2410 100%)', color: 'white', padding: '60px 20px 40px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 'clamp(26px, 4vw, 36px)', fontWeight: 900, margin: '0 0 8px' }}>
          Catálogo Oficial BIOFLOW®
        </h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', margin: 0 }}>
          Nutrientes líquidos, substratos aerados e adubos orgânicos fracionados.
        </p>
      </div>

      <Suspense fallback={<div style={{ textAlign: 'center', padding: 40 }}>Carregando produtos...</div>}>
        <CatalogoContent />
      </Suspense>

      <TrustBar />
      <SiteFooter />
      <WhatsAppButton />
    </div>
  );
}