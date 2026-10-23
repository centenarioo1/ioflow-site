// components/SiteHeader.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ShoppingBag, 
  Menu, 
  X, 
  User, 
  ChevronDown, 
  Droplets, 
  Layers, 
  Sparkles,
  Calculator, 
  BookOpen, 
  Users 
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';

export default function SiteHeader() {
  const [menuMobileAberto, setMenuMobileAberto] = useState(false);
  const [produtosHover, setProdutosHover] = useState(false);
  const [produtosMobileAberto, setProdutosMobileAberto] = useState(false);

  const items = useCartStore((state) => state.items);
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: 64,
      background: 'rgba(7, 21, 10, 0.95)',
      backdropFilter: 'blur(10px)',
      zIndex: 1000,
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 20px',
    }}>
      <div style={{
        maxWidth: 1100,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        
        {/* LOGO */}
        <Link href="/" style={{ textDecoration: 'none', color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 21, fontWeight: 900, letterSpacing: '-0.03em', color: '#4ade80' }}>
            BIOFLOW<span style={{ color: '#d4a843' }}>.</span>
          </span>
        </Link>

        {/* NAVEGAÇÃO DESKTOP */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 22 }} className="hidden-mobile">
          
          {/* ITEM COM ROLLOVER (DROPDOWN) DE PRODUTOS */}
          <div 
            style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center' }}
            onMouseEnter={() => setProdutosHover(true)}
            onMouseLeave={() => setProdutosHover(false)}
          >
            <button
              type="button"
              style={{
                background: 'none',
                border: 'none',
                color: produtosHover ? '#4ade80' : 'rgba(255,255,255,0.85)',
                fontSize: 13.5,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '8px 0',
                transition: 'color 0.2s ease',
              }}
            >
              Produtos
              <ChevronDown 
                size={14} 
                style={{ 
                  transform: produtosHover ? 'rotate(180deg)' : 'rotate(0deg)', 
                  transition: 'transform 0.2s ease' 
                }} 
              />
            </button>

            {/* CAIXA SUSPENSA DO ROLLOVER */}
            {produtosHover && (
              <div 
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: -10,
                  width: 250,
                  background: '#0a1d0e',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: 12,
                  boxShadow: '0 12px 30px rgba(0, 0, 0, 0.5)',
                  padding: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  animation: 'fadeInDown 0.18s ease-out'
                }}
              >
                {/* ✅ CORRIGIDO: abre o catálogo com o filtro de nutrientes aplicado */}
                <Link 
                  href="/produtos?cat=nutriente" 
                  className="dropdown-item"
                  onClick={() => setProdutosHover(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '9px 12px',
                    borderRadius: 8,
                    textDecoration: 'none',
                    color: '#ffffff',
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  <div style={{ background: 'rgba(34, 197, 94, 0.15)', padding: 6, borderRadius: 6, display: 'flex' }}>
                    <Droplets size={16} color="#4ade80" />
                  </div>
                  <div>
                    <div style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>Nutrientes Líquidos</div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10.5 }}>Fertirrigação e bioestimulantes</div>
                  </div>
                </Link>

                {/* ✅ CORRIGIDO: filtro de substratos (antes apontava para /#solos) */}
                <Link 
                  href="/produtos?cat=substrato" 
                  className="dropdown-item"
                  onClick={() => setProdutosHover(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '9px 12px',
                    borderRadius: 8,
                    textDecoration: 'none',
                    color: '#ffffff',
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  <div style={{ background: 'rgba(212, 168, 67, 0.15)', padding: 6, borderRadius: 6, display: 'flex' }}>
                    <Layers size={16} color="#d4a843" />
                  </div>
                  <div>
                    <div style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>Substratos & Aeração</div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10.5 }}>BioMix, Coco Mix e Aerados</div>
                  </div>
                </Link>

                {/* ✅ CORRIGIDO: filtro de adubos/emendas (antes duplicava /#solos) */}
                <Link 
                  href="/produtos?cat=emenda" 
                  className="dropdown-item"
                  onClick={() => setProdutosHover(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '9px 12px',
                    borderRadius: 8,
                    textDecoration: 'none',
                    color: '#ffffff',
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  <div style={{ background: 'rgba(59, 130, 246, 0.15)', padding: 6, borderRadius: 6, display: 'flex' }}>
                    <Sparkles size={16} color="#60a5fa" />
                  </div>
                  <div>
                    <div style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>Adubos Orgânicos</div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10.5 }}>Bio-Humus, Torta, Esterco</div>
                  </div>
                </Link>
              </div>
            )}
          </div>

          {/* CALCULADORA */}
          <Link 
            href="/calculadora" 
            style={{ 
              textDecoration: 'none', 
              color: 'rgba(255,255,255,0.85)', 
              fontSize: 13.5, 
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 5
            }}
          >
            <Calculator size={15} color="#22c55e" />
            Calculadora
          </Link>

          {/* BLOG */}
          <Link 
            href="/blog" 
            style={{ 
              textDecoration: 'none', 
              color: 'rgba(255,255,255,0.85)', 
              fontSize: 13.5, 
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 5
            }}
          >
            <BookOpen size={15} color="#22c55e" />
            Blog
          </Link>

          {/* COMUNIDADE */}
          <Link 
            href="/comunidade" 
            style={{ 
              textDecoration: 'none', 
              color: 'rgba(255,255,255,0.85)', 
              fontSize: 13.5, 
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 5
            }}
          >
            <Users size={15} color="#22c55e" />
            Comunidade
          </Link>

          {/* MINHA CONTA / PEDIDOS (DASHBOARD) */}
          <Link 
            href="/dashboard" 
            style={{ 
              textDecoration: 'none', 
              color: '#d4a843', 
              fontSize: 13.5, 
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              background: 'rgba(212, 168, 67, 0.1)',
              padding: '6px 12px',
              borderRadius: 8,
              border: '1px solid rgba(212, 168, 67, 0.25)'
            }}
          >
            <User size={15} />
            Minha Conta / Pedidos
          </Link>

        </nav>

        {/* CARRINHO E BOTÃO MENU MOBILE */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link 
            href="/carrinho" 
            style={{ 
              textDecoration: 'none', 
              background: '#22c55e', 
              color: '#07150a', 
              padding: '7px 14px', 
              borderRadius: 8, 
              display: 'flex', 
              alignItems: 'center', 
              gap: 6, 
              fontWeight: 800, 
              fontSize: 12.5 
            }}
          >
            <ShoppingBag size={16} />
            <span>Carrinho ({totalItems})</span>
          </Link>

          <button 
            onClick={() => setMenuMobileAberto(!menuMobileAberto)} 
            aria-label="Abrir Menu"
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: '#fff', 
              cursor: 'pointer', 
              display: 'none' 
            }} 
            className="show-mobile"
          >
            {menuMobileAberto ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* MENU MOBILE EXPANSÍVEL */}
      {menuMobileAberto && (
        <div style={{
          position: 'absolute',
          top: 64,
          left: 0,
          right: 0,
          background: '#07150a',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          {/* Submenu de Produtos no Mobile */}
          <div>
            <button
              onClick={() => setProdutosMobileAberto(!produtosMobileAberto)}
              style={{
                background: 'none',
                border: 'none',
                color: '#fff',
                fontSize: 15,
                fontWeight: 700,
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                padding: 0
              }}
            >
              <span>Produtos</span>
              <ChevronDown size={18} style={{ transform: produtosMobileAberto ? 'rotate(180deg)' : 'none' }} />
            </button>
            {produtosMobileAberto && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingLeft: 14, marginTop: 10 }}>
                {/* ✅ CORRIGIDO: links mobile apontam para os filtros reais do catálogo */}
                <Link href="/produtos?cat=nutriente" onClick={() => setMenuMobileAberto(false)} style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: 13.5 }}>
                  • Nutrientes Líquidos
                </Link>
                <Link href="/produtos?cat=substrato" onClick={() => setMenuMobileAberto(false)} style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: 13.5 }}>
                  • Substratos & Aeração
                </Link>
                <Link href="/produtos?cat=emenda" onClick={() => setMenuMobileAberto(false)} style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: 13.5 }}>
                  • Adubos Orgânicos
                </Link>
              </div>
            )}
          </div>

          <Link href="/calculadora" onClick={() => setMenuMobileAberto(false)} style={{ color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 15, display: 'flex', gap: 8, alignItems: 'center' }}>
            <Calculator size={18} color="#22c55e" /> Calculadora
          </Link>
          
          <Link href="/blog" onClick={() => setMenuMobileAberto(false)} style={{ color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 15, display: 'flex', gap: 8, alignItems: 'center' }}>
            <BookOpen size={18} color="#22c55e" /> Blog
          </Link>

          <Link href="/comunidade" onClick={() => setMenuMobileAberto(false)} style={{ color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 15, display: 'flex', gap: 8, alignItems: 'center' }}>
            <Users size={18} color="#22c55e" /> Comunidade
          </Link>

          <Link href="/dashboard" onClick={() => setMenuMobileAberto(false)} style={{ color: '#d4a843', textDecoration: 'none', fontWeight: 800, fontSize: 15, display: 'flex', gap: 8, alignItems: 'center' }}>
            <User size={18} /> Minha Conta / Pedidos
          </Link>
        </div>
      )}

      {/* ESTILOS DE RESPONSIVIDADE E HOVER */}
      <style>{`
        .dropdown-item {
          transition: background 0.15s ease;
        }
        .dropdown-item:hover {
          background: rgba(255, 255, 255, 0.08);
        }
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @media (max-width: 860px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: block !important; }
        }
      `}</style>
    </header>
  );
}