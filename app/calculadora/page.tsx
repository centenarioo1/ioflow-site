// app/calculadora/page.tsx
import React from 'react';
import type { Metadata } from 'next';
import CalculadoraClient from './CalculadoraClient';

export const metadata: Metadata = {
  title: 'Calculadora Nutricional & Dosagens | BIOFLOW',
  description: 'Calcule a dosagem exata de Bio-Start, Bio-Green, Bio-Potassium e Bio-EM1 para cada semana do cultivo.',
};

export default function CalculadoraPage() {
  return <CalculadoraClient />;
}