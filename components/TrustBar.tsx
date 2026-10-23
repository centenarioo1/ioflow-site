'use client';

import React from 'react';
import { ShieldCheck, Truck, FlaskConical, Sprout } from 'lucide-react';

export default function TrustBar() {
  const itens = [
    { icon: Sprout, texto: '100% Organomineral & Biológico' },
    { icon: FlaskConical, texto: 'pH e Salinidade Estabilizados' },
    { icon: ShieldCheck, texto: 'Livre de Pragas e Patógenos' },
    { icon: Truck, texto: 'Envio Seguro para Todo Brasil' },
  ];

  return (
    <div
      style={{
        background: 'linear-gradient(90deg, #061106, #0e220e, #061106)',
        padding: '12px 20px',
        borderTop: '1px solid rgba(212, 168, 67, 0.2)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-around',
          gap: 20,
          flexWrap: 'wrap',
        }}
      >
        {itens.map(({ icon: Icon, texto }, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon size={16} color="#d4a843" />
            <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.85)', letterSpacing: '0.02em' }}>
              {texto}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}