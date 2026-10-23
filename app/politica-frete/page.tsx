import type { Metadata } from 'next';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

export const metadata: Metadata = {
  title: "Política de Frete e Entrega | BIOFLOW",
  description: "Informações sobre prazos, modalidades de envio e rastreamento.",
};

export default function PoliticaFrete() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: '#f7f3ed', minHeight: '100vh', paddingTop: 90, paddingBottom: 60 }}>
      <SiteHeader />
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '0 24px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: '#1a3d1a', marginBottom: 24 }}>Frete e Entrega</h1>
        <div style={{ background: 'white', borderRadius: 16, padding: 28, border: '1px solid #ece8e0', fontSize: 14, color: '#4a4536', lineHeight: 1.8 }}>
          <p><strong>Cobertura:</strong> entregamos para todo o território nacional via transportadoras integradas e Correios.</p>
          <p><strong>Modalidades:</strong> PAC, SEDEX e Jadlog calculados diretamente no checkout através do CEP.</p>
          <p><strong>Prazo de postagem:</strong> pedidos são postados em até 2 dias úteis após a confirmação do pagamento pelo Mercado Pago.</p>
          <p><strong>Rastreio:</strong> você recebe o código de rastreamento por e-mail e no painel da sua conta assim que for postado.</p>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}