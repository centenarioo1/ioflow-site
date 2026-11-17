// app/api/mercadopago/webhook/route.ts
// Recebe o aviso do Mercado Pago quando um pagamento muda de status (principalmente Pix aprovado),
// atualiza o pedido e envia o e-mail de confirmação UMA única vez.
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { enviarEmailConfirmacaoPedido } from '@/lib/email';

export const dynamic = 'force-dynamic';

// Se MP_WEBHOOK_SECRET estiver definido (painel do Mercado Pago > Webhooks), valida a assinatura.
function assinaturaValida(req: Request, dataId: string): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) return true; // sem segredo: a segurança vem de consultar o pagamento direto na API do MP

  const xSignature = req.headers.get('x-signature') || '';
  const xRequestId = req.headers.get('x-request-id') || '';

  const partes: Record<string, string> = {};
  for (const p of xSignature.split(',')) {
    const [k, v] = p.trim().split('=');
    if (k && v) partes[k] = v;
  }
  if (!partes.ts || !partes.v1) return false;

  const manifest = `id:${dataId.toLowerCase()};request-id:${xRequestId};ts:${partes.ts};`;
  const esperado = crypto.createHmac('sha256', secret).update(manifest).digest('hex');

  const a = Buffer.from(esperado);
  const b = Buffer.from(partes.v1);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const body = await req.json().catch(() => ({}));

    const tipo = url.searchParams.get('type') || body?.type || body?.topic;
    const dataId = String(url.searchParams.get('data.id') || body?.data?.id || '');

    // Ignora tudo que não for aviso de pagamento
    if (tipo !== 'payment' || !dataId) {
      return NextResponse.json({ ok: true });
    }

    if (!assinaturaValida(req, dataId)) {
      console.warn('[Webhook MP] Assinatura inválida');
      return NextResponse.json({ error: 'Assinatura inválida' }, { status: 401 });
    }

    const mpToken = process.env.MP_ACCESS_TOKEN || process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!mpToken) {
      console.error('[Webhook MP] MP_ACCESS_TOKEN ausente');
      return NextResponse.json({ error: 'Configuração ausente' }, { status: 500 });
    }

    // Nunca confia no corpo do aviso: consulta o pagamento direto no Mercado Pago
    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${encodeURIComponent(dataId)}`, {
      headers: { Authorization: `Bearer ${mpToken}` },
      cache: 'no-store',
    });

    if (!mpRes.ok) {
      console.error('[Webhook MP] Falha ao consultar pagamento', dataId, mpRes.status);
      return NextResponse.json({ error: 'Falha ao consultar pagamento' }, { status: 500 }); // MP tenta de novo
    }

    const payment = await mpRes.json();
    const orderId = String(payment.external_reference || '');
    if (!orderId) return NextResponse.json({ ok: true });

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      console.warn('[Webhook MP] Pedido não encontrado:', orderId);
      return NextResponse.json({ ok: true });
    }

    const statusMP: string = payment.status;
    let novoStatus = 'Pendente';
    if (statusMP === 'approved') novoStatus = 'Aprovado';
    else if (statusMP === 'rejected' || statusMP === 'cancelled') novoStatus = 'Cancelado';

    // Segurança: só aprova se o valor pago bate com o total do pedido
    if (novoStatus === 'Aprovado' && Math.abs(Number(payment.transaction_amount) - Number(order.total)) > 0.01) {
      console.error('[Webhook MP] Valor divergente', orderId, payment.transaction_amount, order.total);
      return NextResponse.json({ ok: true });
    }

    // Troca atômica: só quem muda o pedido para "Aprovado" envia o e-mail (evita e-mail duplicado)
    const r = await prisma.order.updateMany({
      where: { id: orderId, status: { not: 'Aprovado' } },
      data: { mpPaymentId: String(payment.id), status: novoStatus },
    });

    if (novoStatus === 'Aprovado' && r.count === 1) {
      try {
        const itensPedido: any[] = Array.isArray(order.items) ? (order.items as any[]) : [];
        const emailItems = itensPedido.map((it: any) => ({
          nome: it.nome || it.name || 'Produto Bioflow',
          quantidade: Number(it.quantity || 1),
          preco: Number(it.price || it.preco || 0),
          variacao: it.variacao || it.size || '',
        }));

        const enderecoFormatado = [
          `${order.shippingStreet || ''}, ${order.shippingNumber || ''}`,
          order.shippingComplement ? `(${order.shippingComplement})` : '',
          `${order.shippingNeighborhood || ''} - ${order.shippingCity || ''}/${order.shippingState || ''}`,
          `CEP: ${order.shippingCep || ''}`,
        ]
          .filter(Boolean)
          .join(', ');

        await enviarEmailConfirmacaoPedido({
          emailCliente: order.customerEmail,
          nomeCliente: order.customerName || 'Cultivador',
          numeroPedido: order.id.slice(-6).toUpperCase(),
          itens: emailItems,
          valorTotal: Number(order.total),
          metodoPagamento: payment.payment_method_id === 'pix' ? 'PIX' : 'Cartão de Crédito',
          enderecoEntrega: enderecoFormatado,
        });
        console.log(`📧 [Webhook MP] Confirmação enviada para ${order.customerEmail}`);
      } catch (emailErr) {
        console.error('❌ [Webhook MP] Falha ao enviar e-mail de confirmação:', emailErr);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[Webhook MP] Erro:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
