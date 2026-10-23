// app/produtos/page.tsx
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ShoppingCart, Check, Search } from 'lucide-react';
import { produtos, categorias, Product, ProductVariant } from '@/lib/products';
import { useCartStore } from '@/store/useCartStore';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import CartDrawer from '@/components/CartDrawer';
import TrustBar from '@/components/TrustBar';
import WhatsAppButton from '@/components/WhatsAppButton';

function CatalogoContent() {
  const searchParams = useSearchParams();
  const catUrl = searchParams.get('cat');

  const [categoriaAtiva, setCategoriaAtiva] = useState<string>(catUrl || 'todos');
  const [busca, setBusca] = useState('');
  const [adicionadoId, setAdicionadoId] = useState<string | null>(null); // produtoId-variantId
  const [variantesSelecionadas, setVariantesSelecionadas] = useState<Record<string, string>>({});
  const { addToCart } = useCartStore();

  useEffect(() => {
    if (catUrl) {
      setCategoriaAtiva(catUrl);
    }
  }, [catUrl]);

  const buscaLower = busca.toLowerCase();

  const produtosFiltrados = produtos.filter((p) => {
    const matchCat = categoriaAtiva === 'todos' ? true : p.categoria === categoriaAtiva;
    const matchBusca =
      (p.nome || '').toLowerCase().includes(buscaLower) ||
      (p.descricaoCurta || '').toLowerCase().includes(buscaLower) ||
      (p.tags || []).some((t) => (t || '').toLowerCase().includes(buscaLower));
    return matchCat && matchBusca;
  });

  const getVarianteAtiva = (p: Product): ProductVariant => {
    const idSelecionado = variantesSelecionadas[p.id];
    const escolhida = p.variants.find((v) => v.id === idSelecionado);
    if (escolhida) return escolhida;
    const primeiraDisponivel = p.variants.find((v) => v.stock > 0);
    // 🟢 Resolvido com .at(0) para blindar contra remoção de colchetes no chat
    return primeiraDisponivel || (p.variants.at(0) as ProductVariant);
  };

  const handleSelecionarVariante = (produtoId: string, varianteId: string) => {
    setVariantesSelecionadas((prev) => ({ ...prev, [produtoId]: varianteId }));
  };

  const handleComprar = (p: Product, variante: ProductVariant) => {
    if (variante.stock <= 0) return;

    addToCart({
      id: `${p.id}-${variante.id}`,
      productId: p.id,
      variantId: variante.id,
      name: p.nome,
      size: variante.size,
      price: variante.price,
      originalPrice: variante.originalPrice,
      quantity: 1,
      weight: variante.weight,
      dimensions: variante.dimensions,
      image: p.imagens.at(0) || '', // 🟢 Resolvido com .at(0)
    });

    setAdicionadoId(`${p.id}-${variante.id}`);
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
            const isAdded = adicionadoId === `${p.id}-${variante.id}`;
            const emEstoque = variante.stock > 0;
            const desconto = variante.originalPrice > variante.price
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
                {/* 🟢 CARD CONVENCIONAL SEM COMPONENTE LINK (BLOQUEIA O CLIQUE) */}
                <div style={{ color: 'inherit' }}>
                  <div style={{ height: 160, background: '#f0ece4', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    <img
                      src={p.imagens.at(0) || ''} // 🟢 Resolvido com .at(0)
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
                      {p.descricaoCurta}
                    </p>
                  </div>
                </div>

                {/* SELETOR DE VARIANTES (TAMANHO / PESO) */}
                <div style={{ padding: '4px 16px 8px' }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color: '#9a8e78', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>
                    Escolha o tamanho:
                  </span>
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                    {p.variants.map((v) => {
                      const ativo = variante.id === v.id;
                      const semEstoque = v.stock <= 0;
                      return (
                        <button
                          key={v.id}
                          type="button"
                          disabled={semEstoque}
                          onClick={() => handleSelecionarVariante(p.id, v.id)}
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

                <div style={{ padding: '12px 16px 16px', borderTop: '1px solid #f8f6f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ fontSize: 10, color: '#9a8e78', display: 'block' }}>
                      {`Embalagem ${variante.size}`}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
                      <span style={{ fontSize: 18, fontWeight: 900, color: '#132e13' }}>
                        R$ {variante.price.toFixed(2).replace('.', ',')}
                      </span>
                      {desconto > 0 && (
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
    <div style={{ fontFamily: "'Inter', sans-serif", background: '#f7f3ed', minHeight: '100vh', paddingTop: 64 }}>
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