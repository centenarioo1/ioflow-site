// app/api/mercadopago/payment-status/[orderId]/route.ts
import { NextResponse } from 'next/server';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    // Garante compatibilidade com Next.js 15/16 desempacotando params com await
    const { orderId } = await params;
    const token = process.env.MP_ACCESS_TOKEN || process.env.MERCADOPAGO_ACCESS_TOKEN;

    if (!token) {
      return NextResponse.json({ error: 'Token do Mercado Pago não configurado.' }, { status: 500 });
    }

    // Consulta na API do Mercado Pago buscando pagamentos associados a esta referência externa (ID do Pedido)
    const urlBusca = `https://api.mercadopago.com/v1/payments/search?external_reference=${orderId}`;
    const mpResponse = await fetch(urlBusca, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!mpResponse.ok) {
      return NextResponse.json({ error: 'Erro ao consultar status no Mercado Pago.' }, { status: 500 });
    }

    const data = await mpResponse.json();
    const pagamentos = data.results || [];

    // Busca se existe algum pagamento PIX que ainda esteja "pendente" de aprovação
    const pixPendente = pagamentos.find(
      (p: any) => p.status === 'pending' && p.payment_method_id === 'pix'
    );

    if (pixPendente) {
      const transData = pixPendente.point_of_interaction?.transaction_data;
      return NextResponse.json({
        hasPix: true,
        qrCode: transData?.qr_code || null, // Código copia e cola
        qrCodeBase64: transData?.qr_code_base64 || null, // Imagem QR Code em Base64
        expirationDate: pixPendente.date_of_expiration || null,
      });
    }

    // Se não encontrou Pix ativo ou pendente
    return NextResponse.json({ hasPix: false });

  } catch (error: any) {
    console.error('❌ Erro na consulta de status Pix:', error);
    return NextResponse.json({ error: 'Erro interno no servidor.' }, { status: 500 });
  }
}