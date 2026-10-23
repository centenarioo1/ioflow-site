// app/guia-cultivo/page.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Droplet, Sun, Wind, Activity, Download, ShieldCheck, HelpCircle } from 'lucide-react';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

const TABELA_REGA = [
  { fase: 'Muda / Clone', semana: 'Semana 1', bioGrow: '1.0 ml/L', bioBloom: '-', bioRoot: '2.0 ml/L', calMag: '1.0 ml/L', ec: '0.6 - 0.8', ph: '5.8 - 6.2' },
  { fase: 'Vegetativo Inicial', semana: 'Semana 2', bioGrow: '2.0 ml/L', bioBloom: '-', bioRoot: '2.0 ml/L', calMag: '1.2 ml/L', ec: '1.0 - 1.2', ph: '5.8 - 6.2' },
  { fase: 'Vegetativo Pleno', semana: 'Semana 3-4', bioGrow: '3.5 ml/L', bioBloom: '-', bioRoot: '1.0 ml/L', calMag: '1.5 ml/L', ec: '1.4 - 1.6', ph: '6.0 - 6.3' },
  { fase: 'Transição Flora', semana: 'Semana 5', bioGrow: '2.0 ml/L', bioBloom: '2.0 ml/L', bioRoot: '0.5 ml/L', calMag: '1.5 ml/L', ec: '1.6 - 1.8', ph: '6.2 - 6.5' },
  { fase: 'Floração Plena', semana: 'Semana 6-8', bioGrow: '1.0 ml/L', bioBloom: '4.0 ml/L', bioRoot: '-', calMag: '1.5 ml/L', ec: '1.8 - 2.1', ph: '6.2 - 6.5' },
  { fase: 'Maturação / Flush', semana: 'Semana 9-10', bioGrow: '-', bioBloom: '-', bioRoot: '-', calMag: '-', ec: '0.2 - 0.4', ph: '6.0 - 6.5' },
];

export default function GuiaCultivoPage() {
  return (
    <div style={{ background: '#f8f6f0', minHeight: '100vh', paddingTop: 80, fontFamily: "'Inter', sans-serif" }}>
      <SiteHeader />

      <section style={{ background: '#0a1a0d', color: 'white', padding: '50px 20px', textAlign: 'center' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.15em', color: '#d4a843', textTransform: 'uppercase' }}>
            Manual Técnico BIOFLOW
          </span>
          <h1 style={{ fontSize: 36, fontWeight: 900, margin: '8px 0 14px' }}>
            Guia Completo & Tabela de Nutrição
          </h1>
          <p style={{ fontSize: 15, color: '#9ca3af', lineHeight: 1.6 }}>
            Consulte a dosagem recomendada por semana, parâmetros ideais de Condutividade Elétrica (EC) e potencial hidrogeniônico (pH).
          </p>
        </div>
      </section>

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 20px 80px' }}>
        
        {/* PARÂMETROS BÁSICOS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 36 }}>
          <div style={{ background: 'white', padding: 20, borderRadius: 16, border: '1px solid #e7e2d6' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#15803d', fontWeight: 800, marginBottom: 6 }}>
              <Activity size={20} /> Faixa de pH Ideal
            </div>
            <p style={{ fontSize: 20, fontWeight: 900, color: '#111827', margin: 0 }}>5.8 a 6.5</p>
            <p style={{ fontSize: 12, color: '#6b7280', margin: '4px 0 0' }}>Solo orgânico ou inerte quelatado</p>
          </div>

          <div style={{ background: 'white', padding: 20, borderRadius: 16, border: '1px solid #e7e2d6' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#0284c7', fontWeight: 800, marginBottom: 6 }}>
              <Droplet size={20} /> Frequência de Rega
            </div>
            <p style={{ fontSize: 20, fontWeight: 900, color: '#111827', margin: 0 }}>Intercalada (1x Sim, 1x Não)</p>
            <p style={{ fontSize: 12, color: '#6b7280', margin: '4px 0 0' }}>Alterne entre fertirrigação e água pura</p>
          </div>

          <div style={{ background: 'white', padding: 20, borderRadius: 16, border: '1px solid #e7e2d6' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#d4a843', fontWeight: 800, marginBottom: 6 }}>
              <Sun size={20} /> Temperatura da Solução
            </div>
            <p style={{ fontSize: 20, fontWeight: 900, color: '#111827', margin: 0 }}>20°C a 23°C</p>
            <p style={{ fontSize: 12, color: '#6b7280', margin: '4px 0 0' }}>Máxima oxigenação das raízes</p>
          </div>
        </div>

        {/* TABELA DE ALIMENTAÇÃO */}
        <div style={{ background: 'white', borderRadius: 20, border: '1px solid #e7e2d6', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', marginBottom: 40 }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 900, margin: 0 }}>Tabela Semanal de Diluição (ml/Litro)</h3>
              <p style={{ fontSize: 13, color: '#6b7280', margin: '4px 0 0' }}>Dosagens para 1 Litro de água filtrada ou desclorada</p>
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, background: 'rgba(34,197,94,0.1)', color: '#15803d', padding: '6px 12px', borderRadius: 8 }}>
              Ciclo Padrão de 10 Semanas
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#faf9f5', borderBottom: '1px solid #e7e2d6', color: '#4b5563', fontWeight: 800 }}>
                  <th style={{ padding: '14px 16px' }}>Fase / Período</th>
                  <th style={{ padding: '14px 16px' }}>Semana</th>
                  <th style={{ padding: '14px 16px', color: '#15803d' }}>Bio-Grow</th>
                  <th style={{ padding: '14px 16px', color: '#b45309' }}>Bio-Bloom</th>
                  <th style={{ padding: '14px 16px', color: '#047857' }}>Bio-Root</th>
                  <th style={{ padding: '14px 16px', color: '#0284c7' }}>Cal-Mag+</th>
                  <th style={{ padding: '14px 16px' }}>EC Alvo</th>
                  <th style={{ padding: '14px 16px' }}>pH Alvo</th>
                </tr>
              </thead>
              <tbody>
                {TABELA_REGA.map((linha, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: '#111827' }}>{linha.fase}</td>
                    <td style={{ padding: '14px 16px', color: '#6b7280' }}>{linha.semana}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 700 }}>{linha.bioGrow}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 700 }}>{linha.bioBloom}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 700 }}>{linha.bioRoot}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 700 }}>{linha.calMag}</td>
                    <td style={{ padding: '14px 16px', color: '#4b5563', fontWeight: 600 }}>{linha.ec}</td>
                    <td style={{ padding: '14px 16px', color: '#4b5563', fontWeight: 600 }}>{linha.ph}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* DICAS IMPORTANTES */}
        <div style={{ background: '#0a1a0d', color: 'white', borderRadius: 20, padding: 32 }}>
          <h3 style={{ fontSize: 20, fontWeight: 900, margin: '0 0 16px', color: '#d4a843' }}>Regras de Ouro BIOFLOW</h3>
          <ul style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, padding: 0, listStyle: 'none', margin: 0, fontSize: 13.5, color: '#e5e7eb', lineHeight: 1.6 }}>
            <li><strong>1. Ordem de Mistura:</strong> Primeiro dilua o Cal-Mag+, depois adicione a base (Grow ou Bloom) e por último aditivos e bioestimulantes.</li>
            <li><strong>2. Ajuste Final de pH:</strong> Meça e corrija o pH apenas após todos os fertilizantes terem sido completamente dissolvidos na água.</li>
            <li><strong>3. Menos é Mais:</strong> Se as folhas apresentarem coloração verde excessivamente escura com pontas curvadas em garra, reduza a dose em 25%.</li>
          </ul>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}