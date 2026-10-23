import type { Metadata } from 'next';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

export const metadata: Metadata = {
  title: "Política de Troca e Devolução | BIOFLOW",
  description: "Garantia e processo de troca ou devolução de produtos BIOFLOW.",
};

export default function PoliticaTroca() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: '#f7f3ed', minHeight: '100vh', paddingTop: 90, paddingBottom: 60 }}>
      <SiteHeader />
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '0 24px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: '#1a3d1a', marginBottom: 24 }}>Política de Troca e Devolução</h1>
        <div style={{ background: 'white', borderRadius: 16, padding: 28, border: '1px solid #ece8e0', fontSize: 14, color: '#4a4536', lineHeight: 1.8 }}>
          <p><strong>Prazo de Arrependimento:</strong> até 7 dias corridos após o recebimento, conforme o art. 49 do Código de Defesa do Consumidor.</p>
          <p><strong>Condições:</strong> o produto deve estar lacrado, na embalagem original e sem indícios de uso.</p>
          <p><strong>Avarias no Transporte:</strong> caso receba algum frasco danificado, tire uma foto e nos envie pelo WhatsApp em até 48 horas para envio imediato de reposição sem custos.</p>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}