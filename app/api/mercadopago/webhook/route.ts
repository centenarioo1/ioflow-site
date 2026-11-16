// app/api/mercadopago/webhook/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { enviarEmailConfirmacaoPedido, enviarEmailAdminNovoPedido } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const body = await req.json().catch(() => ({}));

    // O ID do pagamento pode vir no body ou na query string (?data.id=123)
    const paymentId = body?.data?.id || body?.id || url.searchParams.get('data.id') || url.searchParams.get('id');
    const type = body?.type || body?.action || url.searchParams.get('topic');

    if (!paymentId || (type && type !== 'payment' && !type.includes('payment'))) {
      return NextResponse.json({ message: 'Evento ignorado (não é notificação de pagamento)' }, { status: 200 });
    }

    const mpToken = process.env.MP_ACCESS_TOKEN || process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!mpToken) {
      return NextResponse.json({ error: 'Token Mercado Pago ausente' }, { status: 500 });
    }

    // 1. Consulta os detalhes oficiais do pagamento na API do Mercado Pago
    const mpRes = await fetch(`[suspicious link removed]{paymentId}`, {
      headers: { Authorization: `Bearer ${mpToken}` },
    });

    if (!mpRes.ok) {
      return NextResponse.json({ error: 'Falha ao buscar dados no Mercado Pago' }, { status: 500 });
    }

    const paymentData = await mpRes.json();
    const orderId = paymentData.external_reference;
    const statusMP = paymentData.status;

    if (!orderId) {
      return NextResponse.json({ message: 'Sem external_reference no pagamento' }, { status: 200 });
    }

    // 2. Busca o pedido no banco de dados Prisma
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return NextResponse.json({ message: 'Pedido não localizado no banco' }, { status: 200 });
    }

    let novoStatus = order.status;
    if (statusMP === 'approved') novoStatus = 'Aprovado';
    else if (statusMP === 'rejected') novoStatus = 'Cancelado';

    // 3. 🟢 SE O STATUS MUDOU PARA APROVADO: Atualiza o banco e envia os e-mails
    if (statusMP === 'approved' && order.status !== 'Aprovado' && order.status !== 'PAGO') {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'Aprovado',
          mpPaymentId: String(paymentId),
        },
      });

      const emailItems = (order.items as any[] || []).map((it: any) => ({
        nome: it.nome || it.name || 'Produto Bioflow',
        quantidade: Number(it.quantity || 1),
        preco: Number(it.preco || it.price || 0),
        variacao: it.variacao || it.size || '',
      }));

      const enderecoFormatado = [
        `${order.shippingStreet}, ${order.shippingNumber}`,
        order.shippingComplement ? `(${order.shippingComplement})` : '',
        `${order.shippingNeighborhood} - ${order.shippingCity}/${order.shippingState}`,
        `CEP: ${order.shippingCep}`,
      ].filter(Boolean).join(', ');

      // A) E-mail de confirmação para o Cliente
      if (order.customerEmail) {
        await enviarEmailConfirmacaoPedido({
          emailCliente: order.customerEmail,
          nomeCliente: order.customerName || 'Cultivador',
          numeroPedido: order.id.slice(-6).toUpperCase(),
          itens: emailItems,
          valorTotal: Number(order.total),
          metodoPagamento: 'Mercado Pago',
          enderecoEntrega: enderecoFormatado,
        });
      }

      // B) E-mail com alerta completo de venda para o ADMIN
      await enviarEmailAdminNovoPedido({
        numeroPedido: order.id.slice(-6).toUpperCase(),
        nomeCliente: order.customerName,
        emailCliente: order.customerEmail,
        telefoneCliente: order.customerPhone,
        cpfCliente: order.customerCpf,
        itens: emailItems,
        valorTotal: Number(order.total),
        metodoPagamento: 'Mercado Pago',
        enderecoEntrega: enderecoFormatado,
        cupomCodigo: order.cupomCodigo || undefined,
        observacoes: (order as any).observacoes || undefined,
      });

      console.log(`✅ [Webhook MP] Pedido #${orderId} APROVADO. Banco e E-mails sincronizados!`);
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('❌ [Webhook MP] Erro no processamento:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}