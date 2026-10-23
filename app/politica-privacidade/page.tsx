import type { Metadata } from 'next';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

export const metadata: Metadata = {
  title: "Política de Privacidade | BIOFLOW",
  description: "Como tratamos e protegemos seus dados pessoais de acordo com a LGPD.",
};

export default function PoliticaPrivacidade() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: '#f7f3ed', minHeight: '100vh', paddingTop: 90, paddingBottom: 60 }}>
      <SiteHeader />
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '0 24px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: '#1a3d1a', marginBottom: 24 }}>Política de Privacidade</h1>
        <div style={{ background: 'white', borderRadius: 16, padding: 28, border: '1px solid #ece8e0', fontSize: 14, color: '#4a4536', lineHeight: 1.8 }}>
          <p>Seus dados pessoais (nome, CPF, e-mail e endereço) são utilizados exclusivamente para processar seu pedido, emissão de nota fiscal e entrega.</p>
          <p>Não comercializamos seus dados com terceiros. Apenas compartilhamos o estritamente necessário com a transportadora e o processador de pagamento (Mercado Pago).</p>
          <p>Seus dados são armazenados com segurança e você pode solicitar a alteração ou exclusão a qualquer momento conforme as diretrizes da LGPD.</p>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}