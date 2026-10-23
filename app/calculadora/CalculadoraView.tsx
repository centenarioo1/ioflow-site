'use client';

import React, { useState } from 'react';

export default function CalculadoraView() {
  const [litros, setLitros] = useState<number>(5);
  const [fase, setFase] = useState<'vegetativo' | 'floracao'>('vegetativo');

  const doseGreen = fase === 'vegetativo' ? litros * 2 : litros * 0.5;
  const dosePotassium = fase === 'floracao' ? litros * 2.5 : litros * 0.5;

  return (
    <div style={{ padding: '100px 20px', maxWidth: 600, margin: '0 auto', color: '#fff' }}>
      <h1>Calculadora de Dosagem BIOFLOW</h1>
      <div style={{ margin: '20px 0' }}>
        <label>Volume de rega (Litros): </label>
        <input 
          type="number" 
          value={litros} 
          onChange={(e) => setLitros(Math.max(1, Number(e.target.value)))}
          style={{ padding: 8, borderRadius: 6, marginLeft: 8 }}
        />
      </div>
      <div>
        <button onClick={() => setFase('vegetativo')} style={{ padding: '8px 16px', marginRight: 8 }}>Vegetativo</button>
        <button onClick={() => setFase('floracao')} style={{ padding: '8px 16px' }}>Floração</button>
      </div>
      <div style={{ marginTop: 24, padding: 16, background: 'rgba(255,255,255,0.05)', borderRadius: 8 }}>
        <p>Bio-Green: <strong>{doseGreen} ml</strong></p>
        <p>Bio-Potassium: <strong>{dosePotassium} ml</strong></p>
      </div>
    </div>
  );
}