// components/SiteFooter.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Mail, MapPin, Instagram, Facebook } from 'lucide-react';

export default function SiteFooter() {
  return (
    <footer style={{ background: '#050e06', color: 'rgba(255,255,255,0.7)', borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: 13, fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 20px 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 32, marginBottom: 40 }}>
          
          {/* COLUNA 1: SOBRE A MARCA */}
          <div>
            <Link href="/" style={{ textDecoration: 'none', color: '#fff', display: 'inline-block', marginBottom: 12 }}>
              <span style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.03em', color: '#4ade80' }}>
                BIOFLOW<span style={{ color: '#d4a843' }}>.</span>
              </span>
            </Link>
            <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, margin: '0 0 16px' }}>
              Nutrição organomineral de precisão e biologia ativa para horticultura intensiva, solo vivo e hidroponia.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={{ color: '#d4a843', background: 'rgba(255,255,255,0.05)', padding: 8, borderRadius: 8, display: 'flex' }}>
                <Instagram size={16} />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" style={{ color: '#d4a843', background: 'rgba(255,255,255,0.05)', padding: 8, borderRadius: 8, display: 'flex' }}>
                <Facebook size={16} />
              </a>
            </div>
          </div>

          {/* COLUNA 2: NAVEGAÇÃO RÁPIDA (REMOVIDOS COMBOS E CALCULADORA LED) */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: 14, fontWeight: 800, marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Navegação
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <li>
                <Link href="/produtos" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>
                  Catálogo de Produtos
                </Link>
              </li>
              <li>
                <Link href="/calculadora" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>
                  Calculadora Nutricional
                </Link>
              </li>
              <li>
                <Link href="/blog" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>
                  Blog & Enciclopédia
                </Link>
              </li>
              <li>
                <Link href="/comunidade" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>
                  Fórum da Comunidade
                </Link>
              </li>
              <li>
                <Link href="/sobre" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>
                  Sobre a BIOFLOW
                </Link>
              </li>
            </ul>
          </div>

          {/* COLUNA 3: INSTITUCIONAL & SUPORTE */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: 14, fontWeight: 800, marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Atendimento & Políticas
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <li>
                <Link href="/contato" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>
                  Fale Conosco
                </Link>
              </li>
              <li>
                <Link href="/politica-frete" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>
                  Política de Frete e Entrega
                </Link>
              </li>
              <li>
                <Link href="/politica-troca" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>
                  Trocas e Devoluções
                </Link>
              </li>
              <li>
                <Link href="/politica-privacidade" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>
                  Privacidade e Segurança (LGPD)
                </Link>
              </li>
            </ul>
          </div>

          {/* COLUNA 4: CONTATO DIRETO */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: 14, fontWeight: 800, marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Contato
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12.5 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Mail size={15} color="#d4a843" />
                <span>contato@biofloworganics.com.br</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <MapPin size={15} color="#d4a843" />
                <span>Envios para todo o Brasil</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <ShieldCheck size={15} color="#4ade80" />
                <span style={{ color: '#4ade80', fontWeight: 700 }}>Pagamento Seguro via Mercado Pago</span>
              </div>
            </div>
          </div>

        </div>

        {/* DIREITOS AUTORAIS */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, fontSize: 11.5, color: 'rgba(255,255,255,0.4)' }}>
          <p style={{ margin: 0 }}>
            © {new Date().getFullYear()} BIOFLOW® Nutrição Organomineral. Todos os direitos reservados.
          </p>
          <p style={{ margin: 0 }}>
            Desenvolvido para alta performance no cultivo.
          </p>
        </div>

      </div>
    </footer>
  );
}