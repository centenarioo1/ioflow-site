// app/kits-personalizados/page.tsx
'use client';

import React, { useState } from 'react';
import { Package, CheckCircle, ShoppingCart, Sparkles, Check } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import SiteHeader from '../../components/SiteHeader';
import SiteFooter from '../../components/SiteFooter';
import TrustBar from '../../components/TrustBar';
import WhatsAppButton from '../../components/WhatsAppButton';

const kitsPreDefinidos = [
  {
    id: 'kit-starter-solovivo',
    nome: 'Combo Starter Solo Vivo (20L Completo)',
    descricao: 'Ideal para encher 2 vasos de 10L. Substrato inerte + matéria orgânica rica + alimento de micróbios.',
    itens: ['BioMix Substrato (20L)', 'Bio-Humus Puro (2 kg)', 'Bio-Mamona Torta (1 kg)', 'Bio-Arroz Carbon (5L)', 'Bio-Melaço de Cana (1L)'],
    precoOriginal: 156.50,
    preco: 129.90,
    destaque: true,
  },
  {
    id: 'kit-nutricao-master',
    nome: 'Pack Nutrição Líquida Master (4 Frascos)',
    descricao: 'Nutrição completa para todas as fases do cultivo: enraizamento, vega, floração e biologia viva.',
    itens: ['Bio-Start® (500ml)', 'Bio-Green® (500ml)', 'Bio-Potassium® (500ml)', 'Bio-EM1® Microbiologia (1L)'],
    precoOriginal: 142.60,
    preco: 119.90,
    destaque: false,
  },
  {
    id: 'kit-trio-emendas',
    nome: 'Trio Emendas Orgânicas (Pack Fracionado)',
    descricao: 'Pack compacto em pouch com peso otimizado para frete econômico. Ideal para recarga e Top-Dress.',
    itens: ['Bio-Mamona (1 kg)', 'Bio-Aves Esterco (1 kg)', 'Bio-Humus Selecionado (2 kg)'],
    precoOriginal: 64.70,
    preco: 54.90,
    destaque: false,
  },
  {
    id: 'kit-aeracao-extrema',
    nome: 'Combo Aeração Extrema & Drenagem',
    descricao: 'Para quem monta seu próprio solo leve ou cultiva sementes automáticas que exigem alta drenagem.',
    itens: ['BioMix Base (10L)', 'Bio-Perlita Grossa (10L)', 'Bio-Arroz Carbon (10L)'],
    precoOriginal: 82.70,
    preco: 69.90,
    destaque: false,
  },
];

export default function KitsPersonalizadosPage() {
  const { addToCart } = useCartStore();
  const [adicionadoId, setAdicionadoId] = useState<string | null>(null);

  const handleComprarKit = (kit: typeof kitsPreDefinidos[0]) => {
    addToCart({
      id: kit.id,
      name: kit.nome,
      price: kit.preco,
      quantity: 1,
    });
    setAdicionadoId(kit.id);
    setTimeout(() => setAdicionadoId(null), 1800);
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: '#f7f3ed', minHeight: '100vh' }}>
      <SiteHeader />

      {/* HERO */}
      <div style={{ background: 'linear-gradient(135deg, #0d2410, #1b4520)', color: 'white', padding: '80px 24px 50px', textAlign: 'center', marginTop: 64 }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(212,168,67,0.2)', padding: '6px 14px', borderRadius: 999, color: '#d4a843', fontWeight: 800, fontSize: 12, marginBottom: 14 }}>
            <Sparkles size={16} /> ECONOMIZE COM NOSSOS COMBOS
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 900, color: 'white', margin: '0 0 10px', letterSpacing: '-0.02em' }}>
            Kits & Combos BIOFLOW®
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.75)', margin: 0 }}>
            Proporções balanceadas por agrônomos com fracionados ideais e descontos exclusivos.
          </p>
        </div>
      </div>

      {/* GRID DE KITS */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '50px 24px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          {kitsPreDefinidos.map((kit) => {
            const isAdded = adicionadoId === kit.id;

            return (
              <div
                key={kit.id}
                style={{
                  background: kit.destaque ? 'linear-gradient(145deg, #133317 0%, #0a1f0d 100%)' : '#ffffff',
                  color: kit.destaque ? '#ffffff' : '#1a1a1a',
                  borderRadius: 18,
                  padding: 28,
                  border: kit.destaque ? '2px solid #22c55e' : '1px solid #ece8e0',
                  boxShadow: kit.destaque ? '0 12px 30px rgba(19, 51, 23, 0.25)' : '0 4px 12px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative',
                }}
              >
                {kit.destaque && (
                  <span style={{
                    position: 'absolute',
                    top: -12,
                    right: 20,
                    background: '#22c55e',
                    color: '#07150a',
                    fontSize: 10,
                    fontWeight: 900,
                    padding: '4px 12px',
                    borderRadius: 999,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>
                    ⭐ Mais Vendido
                  </span>
                )}

                <div>
                  <h3 style={{ fontSize: 19, fontWeight: 900, margin: '0 0 8px', color: kit.destaque ? '#ffffff' : '#132e13' }}>
                    {kit.nome}
                  </h3>
                  <p style={{ fontSize: 12.5, color: kit.destaque ? 'rgba(255,255,255,0.7)' : '#6b6355', lineHeight: 1.5, margin: '0 0 20px' }}>
                    {kit.descricao}
                  </p>

                  {/* ITENS INCLUSOS */}
                  <div style={{
                    background: kit.destaque ? 'rgba(255,255,255,0.05)' : '#f8f6f0',
                    borderRadius: 12,
                    padding: 14,
                    marginBottom: 20,
                  }}>
                    <p style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: kit.destaque ? '#d4a843' : '#8c806d', margin: '0 0 8px' }}>
                      Itens inclusos no kit:
                    </p>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {kit.itens.map((item, i) => (
                        <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: kit.destaque ? '#e2e8f0' : '#4a4536' }}>
                          <CheckCircle size={14} color={kit.destaque ? '#4ade80' : '#22c55e'} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* PREÇO E BOTÃO */}
                <div>
                  <div style={{ marginBottom: 14 }}>
                    <span style={{ fontSize: 12, color: kit.destaque ? 'rgba(255,255,255,0.45)' : '#9a8e78', textDecoration: 'line-through', marginRight: 6 }}>
                      R$ {kit.precoOriginal.toFixed(2).replace('.', ',')}
                    </span>
                    <div style={{ fontSize: 28, fontWeight: 900, color: kit.destaque ? '#d4a843' : '#132e13' }}>
                      R$ {kit.preco.toFixed(2).replace('.', ',')}
                    </div>
                  </div>

                  <button
                    onClick={() => handleComprarKit(kit)}
                    style={{
                      width: '100%',
                      padding: '13px',
                      borderRadius: 12,
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: 800,
                      fontSize: 13.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      background: isAdded ? '#22c55e' : (kit.destaque ? '#d4a843' : '#132e13'),
                      color: isAdded ? '#ffffff' : (kit.destaque ? '#0d2410' : '#ffffff'),
                      transition: 'all 0.2s',
                    }}
                  >
                    {isAdded ? (
                      <>
                        <Check size={16} /> Adicionado ao Carrinho!
                      </>
                    ) : (
                      <>
                        <ShoppingCart size={16} /> Comprar Combo
                      </>
                    )}
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      <TrustBar />
      <SiteFooter />
      <WhatsAppButton />
    </div>
  );
}