// app/api/mercadopago/create-preference/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CartItem } from '@/store/useCartStore';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      items,
      userId,
      userEmail,
      userName,
      userPhone,
      userCpf,
      cupomCodigo,
      shippingCost = 0,
      shippingServiceName = 'Padrão',
      address,
    } = body as {
      items: CartItem[];
      userId?: string;
      userEmail: string;
      userName: string;
      userPhone: string;
      userCpf: string;
      cupomCodigo?: string;
      shippingCost: number;
      shippingServiceName: string;
      address: {
        cep: string;
        rua: string;
        numero: string;
        complemento?: string;
        bairro: string;
        cidade: string;
        estado: string;
      };
    };

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Carrinho vazio' }, { status: 400 });
    }

    const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

    // Validação de Cupom (mesma regra do /api/validate-coupon)
    let cupomId: string | undefined = undefined;
    let valorDesconto = 0;

    if (cupomCodigo) {
      const cupom = await prisma.cupom.findUnique({
        where: { codigo: cupomCodigo.toUpperCase().trim() },
      });

      const expirado = cupom?.dataExpiracao ? new Date() > cupom.dataExpiracao : false;
      const abaixoDoMinimo = cupom?.valorMinimo ? subtotal < cupom.valorMinimo : false;
      const esgotado = cupom?.limiteTotal ? cupom.usoTotal >= cupom.limiteTotal : false;

      if (cupom && cupom.ativo && !expirado && !abaixoDoMinimo && !esgotado) {
        cupomId = cupom.id;
        const tipo = (cupom.tipo || '').toLowerCase();
        const ehPercentual = tipo === 'percentual' || tipo === 'porcentagem';
        valorDesconto = ehPercentual
          ? (subtotal * cupom.valor) / 100
          : cupom.valor;
        valorDesconto = Math.min(valorDesconto, subtotal);
      }
    }

    const total = Math.max(0, subtotal - valorDesconto + Number(shippingCost));

    // 1. Cria o Pedido no Banco de Dados [1]
    const order = await prisma.order.create({
      data: {
        userId: userId || null,
        customerName: userName,
        customerEmail: userEmail,
        customerPhone: userPhone,
        customerCpf: userCpf,
        shippingCep: address.cep,
        shippingStreet: address.rua,
        shippingNumber: address.numero,
        shippingComplement: address.complemento || '',
        shippingNeighborhood: address.bairro,
        shippingCity: address.cidade,
        shippingState: address.estado,
        shippingServiceName,
        shippingCost: Number(shippingCost),
        items: items as any,
        subtotal,
        desconto: valorDesconto,
        total,
        cupomId,
        cupomCodigo: cupomId ? cupomCodigo : null,
        status: 'Pendente',
      },
    });

    const token = process.env.MP_ACCESS_TOKEN || process.env.MERCADOPAGO_ACCESS_TOKEN;
    
    // 🌐 Higienizador e sensor de URL local/produção [1]
    let siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    
    if (!siteUrl.startsWith('http://') && !siteUrl.startsWith('https://')) {
      siteUrl = `https://${siteUrl}`;
    }
    siteUrl = siteUrl.replace(/\/$/, '');

    // Verifica se estamos rodando em ambiente local
    const isLocalhost = siteUrl.includes('localhost') || siteUrl.includes('127.0.0.1');

    console.log(`🔵 [Mercado Pago] URL detectada: ${siteUrl} | Modo Local: ${isLocalhost}`);

    // 2. Prepara Itens para a API do Mercado Pago [1]
    const mpItems = items.map((item) => ({
      id: item.id,
      title: `${item.name} (${item.size || 'Padrão'})`,
      quantity: Number(item.quantity),
      currency_id: 'BRL',
      unit_price: Number(item.price),
    }));

    if (shippingCost > 0) {
      mpItems.push({
        id: 'shipping-cost',
        title: `Frete - ${shippingServiceName}`,
        quantity: 1,
        currency_id: 'BRL',
        unit_price: Number(shippingCost),
      });
    }

    if (valorDesconto > 0) {
      mpItems.push({
        id: 'coupon-discount',
        title: `Desconto - Cupom ${cupomCodigo?.toUpperCase()}`,
        quantity: 1,
        currency_id: 'BRL',
        unit_price: -Number(valorDesconto.toFixed(2)),
      });
    }

    // 3. Monta o payload seguro e adaptável [1]
    const preferencePayload: any = {
      items: mpItems,
      payer: {
        name: userName,
        email: userEmail,
        identification: {
          type: 'CPF',
          number: userCpf.replace(/\D/g, ''),
        },
      },
      external_reference: order.id,
      back_urls: {
        success: `${siteUrl}/checkout/sucesso?orderId=${order.id}`,
        pending: `${siteUrl}/checkout/pendente?orderId=${order.id}`,
        failure: `${siteUrl}/checkout/falha?orderId=${order.id}`,
      },
      statement_descriptor: 'BIOFLOW',
    };

    // Só habilita o auto_return e webhook se a URL de retorno for HTTPS válida (Produção) [1]
    if (!isLocalhost && siteUrl.startsWith('https://')) {
      preferencePayload.auto_return = 'approved';
      preferencePayload.notification_url = `${siteUrl}/api/mercadopago/webhook`;
    } else {
      console.log('⚠️ [Mercado Pago] auto_return e webhook omitidos localmente para evitar erro 400.');
    }

    // Cria a preferência no Mercado Pago [1]
    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(preferencePayload),
    });

    const mpData = await mpResponse.json();

    if (!mpResponse.ok) {
      console.error('❌ Erro retornado pelo Mercado Pago:', mpData);
      return NextResponse.json({ error: 'Erro ao gerar link no Mercado Pago' }, { status: 500 });
    }

    // Atualiza o pedido com o Preference ID [1]
    await prisma.order.update({
      where: { id: order.id },
      data: { mpPreferenceId: mpData.id },
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      initPoint: mpData.init_point,
    });

  } catch (error: any) {
    console.error('Erro create-preference:', error);
    return NextResponse.json({ error: error.message || 'Erro interno' }, { status: 500 });
  }
}