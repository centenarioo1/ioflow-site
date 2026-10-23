'use client';

import React, { useState, useMemo } from 'react';
import { Lightbulb, Users, Info } from 'lucide-react';
import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import TrustBar from '@/components/TrustBar';
import WhatsAppButton from '@/components/WhatsAppButton';

export default function CalculadoraLED() {
  const [tipoCalculo, setTipoCalculo] = useState<'led' | 'espacamento'>('led');
  const [area, setArea] = useState(1);
  const [profundidade, setProfundidade] = useState('vegetativa');

  const calcLED = useMemo(() => {
    const m2 = area;
    const minWatts = Math.round(m2 * 30);
    const maxWatts = Math.round(m2 * 50);
    const otimalWatts = Math.round(m2 * 40);

    return { minWatts, maxWatts, otimalWatts };
  }, [area]);

  const calcEspacamento = useMemo(() => {
    const m2 = area;
    const compacto = Math.ceil(m2 * 9);
    const normal = Math.ceil(m2 * 6);
    const espacado = Math.ceil(m2 * 4);

    const dist_compacta = Math.round(Math.sqrt((m2 * 10000) / compacto));
    const dist_normal = Math.round(Math.sqrt((m2 * 10000) / normal));
    const dist_espacada = Math.round(Math.sqrt((m2 * 10000) / espacado));

    return {
      compacto: { plantas: compacto, distancia: dist_compacta, rendimento: 'Maior quantidade, flores menores' },
      normal: { plantas: normal, distancia: dist_normal, rendimento: 'Equilibrado' },
      espacado: { plantas: espacado, distancia: dist_espacada, rendimento: 'Menos plantas, flores maiores' },
    };
  }, [area]);

  const calcDensidade = useMemo(() => {
    const watts_necessarios = calcLED.otimalWatts;
    const rendimento_estimado = watts_necessarios * 0.6;
    return { watts: watts_necessarios, rendimento: rendimento_estimado };
  }, [calcLED]);

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: '#f7f3ed', minHeight: '100vh' }}>
      <SiteHeader />

      <div style={{ background: 'linear-gradient(135deg, #0a1f10, #1a3d1a)', color: 'white', padding: '80px 24px 60px', textAlign: 'center', marginTop: 64 }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <Lightbulb size={28} color="#d4a843" />
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 900, color: 'white', margin: '0 0 12px', letterSpacing: '-0.02em' }}>
            Calculadora LED & Espaçamento
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)', margin: 0 }}>
            Dimensione sua tenda e iluminação perfeitamente
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '60px 24px' }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 40, background: 'white', padding: 4, borderRadius: 14, width: 'fit-content' }}>
          {[
            { val: 'led', label: 'Calcular LED' },
            { val: 'espacamento', label: 'Espaçamento de Plantas' },
          ].map((tab) => (
            <button
              key={tab.val}
              onClick={() => setTipoCalculo(tab.val as any)}
              style={{
                padding: '10px 20px',
                borderRadius: 12,
                border: 'none',
                cursor: 'pointer',
                fontWeight: 700,
                background: tipoCalculo === tab.val ? '#d4a843' : 'transparent',
                color: tipoCalculo === tab.val ? '#1a1a1a' : '#9a8e78',
                transition: 'all 0.2s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {tipoCalculo === 'led' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 40 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 900, color: '#1a3d1a', margin: '0 0 24px' }}>Dimensões da Tenda</h2>

              <div style={{ marginBottom: 28 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 800, color: '#1a3d1a', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                  Área em Metro Quadrado (m²): {area.toFixed(2)}
                </label>
                <input
                  type="range"
                  min="0.25"
                  max="5"
                  step="0.25"
                  value={area}
                  onChange={(e) => setArea(Number(e.target.value))}
                  style={{ width: '100%', height: 6, borderRadius: 3, background: '#ece8e0', outline: 'none', cursor: 'pointer' }}
                />
              </div>

              <div style={{ marginBottom: 28 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 800, color: '#1a3d1a', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
                  Estágio de Cultivo
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { val: 'germinacao', label: 'Germinação (20-30W)' },
                    { val: 'vegetativa', label: 'Vegetativa (30-40W)' },
                    { val: 'floracao', label: 'Floração (40-50W)' },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      onClick={() => setProfundidade(opt.val)}
                      style={{
                        padding: 12,
                        borderRadius: 10,
                        border: profundidade === opt.val ? '2px solid #d4a843' : '1.5px solid #ece8e0',
                        background: profundidade === opt.val ? '#f0ece4' : 'white',
                        cursor: 'pointer',
                        fontWeight: 600,
                        color: '#1a3d1a',
                        fontSize: 13,
                        textAlign: 'left',
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ background: '#f7f3ed', borderRadius: 12, padding: 16, display: 'flex', gap: 10 }}>
                <Info size={16} color="#d4a843" style={{ flexShrink: 0, marginTop: 1 }} />
                <div style={{ fontSize: 12, color: '#5a4e38', lineHeight: 1.6 }}>
                  <strong>Regra Prática:</strong> 30-50W por m² (quanto maior a potência, mais denso o cultivo e maior a colheita).
                </div>
              </div>
            </div>

            <div>
              <h2 style={{ fontSize: 18, fontWeight: 900, color: '#1a3d1a', margin: '0 0 24px' }}>Recomendação de LED</h2>

              <div style={{ background: 'white', borderRadius: 14, padding: 20, border: '1px solid #ece8e0', marginBottom: 16 }}>
                <p style={{ fontSize: 12, color: '#9a8e78', textTransform: 'uppercase', fontWeight: 700, margin: '0 0 12px' }}>Potência Recomendada</p>
                <div style={{ fontSize: 32, fontWeight: 900, color: '#15803d', margin: '0 0 8px' }}>{calcLED.otimalWatts}W</div>
                <p style={{ fontSize: 12, color: '#6b6355', margin: 0 }}>Faixa ideal: {calcLED.minWatts}W a {calcLED.maxWatts}W</p>
              </div>

              <div style={{ background: 'white', borderRadius: 14, padding: 16, border: '2px solid #22c55e' }}>
                <p style={{ fontSize: 12, color: '#166534', fontWeight: 800, textTransform: 'uppercase', margin: '0 0 8px' }}>Rendimento Estimado</p>
                <div style={{ fontSize: 24, fontWeight: 900, color: '#22c55e', margin: '0 0 4px' }}>~{Math.round(calcDensidade.rendimento)}g</div>
                <p style={{ fontSize: 11, color: '#6b6355', margin: 0 }}>Por ciclo completo em ambiente calibrado.</p>
              </div>
            </div>
          </div>
        )}

        {tipoCalculo === 'espacamento' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 40 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 900, color: '#1a3d1a', margin: '0 0 24px' }}>Dimensões da Tenda</h2>
              <div style={{ marginBottom: 28 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 800, color: '#1a3d1a', textTransform: 'uppercase', marginBottom: 8 }}>
                  Área em m²: {area.toFixed(2)}
                </label>
                <input
                  type="range"
                  min="0.25"
                  max="5"
                  step="0.25"
                  value={area}
                  onChange={(e) => setArea(Number(e.target.value))}
                  style={{ width: '100%', height: 6, borderRadius: 3, background: '#ece8e0', outline: 'none', cursor: 'pointer' }}
                />
              </div>
            </div>

            <div>
              <h2 style={{ fontSize: 18, fontWeight: 900, color: '#1a3d1a', margin: '0 0 24px' }}>Recomendações</h2>
              {[
                { tipo: 'compacto', titulo: 'Compacto (Alta Densidade)', desc: 'Mais plantas, flores médias' },
                { tipo: 'normal', titulo: 'Normal (Equilibrado)', desc: 'Ideal para iniciantes' },
                { tipo: 'espacado', titulo: 'Espaçado (Flores Maiores)', desc: 'Menos plantas, máxima aeração' },
              ].map((conf) => {
                const data = calcEspacamento[conf.tipo as keyof typeof calcEspacamento];
                return (
                  <div key={conf.tipo} style={{ background: 'white', borderRadius: 14, padding: 16, border: '1px solid #ece8e0', marginBottom: 14 }}>
                    <h4 style={{ fontSize: 14, fontWeight: 900, color: '#1a3d1a', margin: '0 0 6px' }}>{conf.titulo}</h4>
                    <p style={{ fontSize: 12, color: '#9a8e78', margin: '0 0 12px' }}>{conf.desc}</p>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <div style={{ background: '#f0ece4', borderRadius: 8, padding: 10 }}>
                        <p style={{ fontSize: 11, color: '#9a8e78', fontWeight: 600, margin: '0 0 4px', textTransform: 'uppercase' }}>Plantas</p>
                        <p style={{ fontSize: 20, fontWeight: 900, color: '#d4a843', margin: 0 }}>{data.plantas}</p>
                      </div>
                      <div style={{ background: '#f0ece4', borderRadius: 8, padding: 10 }}>
                        <p style={{ fontSize: 11, color: '#9a8e78', fontWeight: 600, margin: '0 0 4px', textTransform: 'uppercase' }}>Distância</p>
                        <p style={{ fontSize: 16, fontWeight: 900, color: '#d4a843', margin: 0 }}>{data.distancia} cm</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <TrustBar />
      <SiteFooter />
      <WhatsAppButton />
    </div>
  );
}