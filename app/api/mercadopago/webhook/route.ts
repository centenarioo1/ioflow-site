// app/api/mercadopago/webhook/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const body = await req.json().catch(() => ({}));
    
    // O MP pode enviar pelo body ou query params
    const paymentId = body.data?.id || url.searchParams.get('data.id') || url.searchParams.get('id');
    const type = body.type || url.searchParams.get('type') || url.searchParams.get('topic');

    if (type === 'payment' && paymentId) {
      const token = process.env.MP_ACCESS_TOKEN || process.env.MERCADOPAGO_ACCESS_TOKEN;

      const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (mpRes.ok) {
        const paymentData = await mpRes.json();
        const orderId = paymentData.external_reference;

        if (orderId) {
          let orderStatus = 'Pendente';
          if (paymentData.status === 'approved') orderStatus = 'Aprovado';
          else if (paymentData.status === 'rejected') orderStatus = 'Cancelado';
          else if (paymentData.status === 'refunded') orderStatus = 'Reembolsado';

          await prisma.order.update({
            where: { id: orderId },
            data: {
              status: orderStatus,
              mpPaymentId: String(paymentId),
              paymentMethod: paymentData.payment_type_id || paymentData.payment_method_id,
            },
          });
        }
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err: any) {
    console.error('Erro no Webhook:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}