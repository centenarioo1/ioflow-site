// app/sobre/page.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Leaf, Award, HeartHandshake, Zap, CheckCircle } from 'lucide-react';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

export default function SobrePage() {
  return (
    <div style={{ background: '#f8f6f0', minHeight: '100vh', paddingTop: 80, fontFamily: "'Inter', sans-serif" }}>
      <SiteHeader />

      {/* HERO SOBRE */}
      <section style={{ background: 'linear-gradient(135deg, #071408 0%, #123317 100%)', color: 'white', padding: '60px 20px', textAlign: 'center' }}>
        <div style={{ maxWidth: 840, margin: '0 auto' }}>
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.15em', color: '#d4a843', textTransform: 'uppercase' }}>
            Nossa História & Propósito
          </span>
          <h1 style={{ fontSize: 38, fontWeight: 900, margin: '12px 0 16px', letterSpacing: '-0.02em' }}>
            Nutrição de Precisão com Respeito à Natureza
          </h1>
          <p style={{ fontSize: 16, color: '#d1d5db', lineHeight: 1.7 }}>
            A BIOFLOW nasceu da união entre engenharia agronômica de ponta e a paixão pelo cultivo consciente. Criamos formulações organominerais que combinam a velocidade dos minerais puros com a riqueza microbiológica dos extratos biológicos.
          </p>
        </div>
      </section>

      {/* PILARES */}
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '60px 20px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 50 }}>
          
          <div style={{ background: 'white', padding: 32, borderRadius: 20, border: '1px solid #e7e2d6' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(21,128,61,0.1)', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Leaf size={24} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 900, margin: '0 0 10px', color: '#111827' }}>Origem Sustentável</h3>
            <p style={{ fontSize: 13.5, color: '#4b5563', lineHeight: 1.6, margin: 0 }}>
              Nossos extratos fúlvicos e algas são colhidos de fontes renováveis com certificação de boas práticas agrícolas e zero metais pesados.
            </p>
          </div>

          <div style={{ background: 'white', padding: 32, borderRadius: 20, border: '1px solid #e7e2d6' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(212,168,67,0.1)', color: '#d4a843', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Award size={24} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 900, margin: '0 0 10px', color: '#111827' }}>Quelatização Avançada</h3>
            <p style={{ fontSize: 13.5, color: '#4b5563', lineHeight: 1.6, margin: 0 }}>
              Garantimos absorção imediata pelas raízes mesmo sob variações de pH e condições climáticas desafiadoras.
            </p>
          </div>

          <div style={{ background: 'white', padding: 32, borderRadius: 20, border: '1px solid #e7e2d6' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(2,132,199,0.1)', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <ShieldCheck size={24} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 900, margin: '0 0 10px', color: '#111827' }}>Pureza e Terpenos</h3>
            <p style={{ fontSize: 13.5, color: '#4b5563', lineHeight: 1.6, margin: 0 }}>
              Sem resíduos químicos amargos na colheita. Suas flores expressam aroma, densidade e sabor 100% autênticos.
            </p>
          </div>

        </div>

        {/* CTA FINAL */}
        <div style={{ background: '#111827', borderRadius: 20, padding: '40px 32px', color: 'white', textAlign: 'center' }}>
          <h2 style={{ fontSize: 24, fontWeight: 900, margin: '0 0 12px' }}>Pronto para transformar a qualidade do seu cultivo?</h2>
          <p style={{ fontSize: 14, color: '#9ca3af', maxWidth: 500, margin: '0 auto 24px' }}>
            Explore nossos produtos ou tire dúvidas diretamente com nossa equipe agronômica no WhatsApp.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/produtos"
              style={{
                background: '#d4a843',
                color: '#0a1a0d',
                padding: '12px 24px',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 800,
                textDecoration: 'none'
              }}
            >
              Ver Linha Completa
            </Link>
            <Link
              href="/contato"
              style={{
                background: 'rgba(255,255,255,0.1)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.2)',
                padding: '12px 24px',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 700,
                textDecoration: 'none'
              }}
            >
              Falar Conosco
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}