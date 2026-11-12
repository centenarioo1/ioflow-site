// app/api/mercadopago/payment-status/[orderId]/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { enviarEmailConfirmacaoPedido } from '@/lib/email';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const token = process.env.MP_ACCESS_TOKEN || process.env.MERCADOPAGO_ACCESS_TOKEN;

    if (!token) {
      return NextResponse.json({ error: 'Token do Mercado Pago não configurado.' }, { status: 500 });
    }

    // 1. Consulta pagamentos no Mercado Pago vinculados à referência externa (ID do Pedido)
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

    // 2. 🟢 CHECAGEM DE PAGAMENTO APROVADO
    const pagamentoAprovado = pagamentos.find((p: any) => p.status === 'approved');

    if (pagamentoAprovado) {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
      });

      if (order) {
        // Se o pedido ainda não estava marcado como PAGO, atualiza no banco e dispara o e-mail
        if (order.status !== 'PAGO') {
          await prisma.order.update({
            where: { id: orderId },
            data: { status: 'PAGO' },
          });

          if (order.customerEmail) {
            const rawItems = (order.items as any) || [];
            const emailItems = rawItems.map((it: any) => ({
              nome: it.nome || it.title || it.name || 'Produto Bioflow',
              quantidade: Number(it.quantity || it.quantidade || 1),
              preco: Number(it.preco || it.price || 0),
            }));

            const enderecoFormatado = [
              `${order.shippingStreet || ''}, ${order.shippingNumber || ''}`,
              order.shippingComplement ? `(${order.shippingComplement})` : '',
              `${order.shippingNeighborhood || ''} - ${order.shippingCity || ''}/${order.shippingState || ''}`,
              `CEP: ${order.shippingCep || ''}`
            ].filter(Boolean).join(', ');

            // Dispara o e-mail via Resend
            await enviarEmailConfirmacaoPedido({
              emailCliente: order.customerEmail,
              nomeCliente: order.customerName || 'Cultivador',
              numeroPedido: order.id.slice(-6).toUpperCase(),
              itens: emailItems,
              valorTotal: Number(order.total),
              metodoPagamento: 'Mercado Pago (PIX / Cartão)',
              enderecoEntrega: enderecoFormatado,
            });

            console.log(`📧 [Payment Status] Pedido ${orderId} aprovado e e-mail enviado com sucesso!`);
          }
        }
      }

      return NextResponse.json({ status: 'approved', hasPix: false });
    }

    // 3. BUSCA PIX PENDENTE (Se ainda não foi pago)
    const pixPendente = pagamentos.find(
      (p: any) => p.status === 'pending' && p.payment_method_id === 'pix'
    );

    if (pixPendente) {
      const transData = pixPendente.point_of_interaction?.transaction_data;
      return NextResponse.json({
        status: 'pending',
        hasPix: true,
        qrCode: transData?.qr_code || null,
        qrCodeBase64: transData?.qr_code_base64 || null,
        expirationDate: pixPendente.date_of_expiration || null,
      });
    }

    return NextResponse.json({ status: 'pending', hasPix: false });

  } catch (error: any) {
    console.error('❌ Erro na consulta de status Pix:', error);
    return NextResponse.json({ error: 'Erro interno no servidor.' }, { status: 500 });
  }
}