// app/api/mercadopago/create-preference/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import catalogoBase from '@/lib/products';

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
    } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Carrinho vazio ou inválido' }, { status: 400 });
    }

    if (!userEmail || !userName || !address?.cep) {
      return NextResponse.json({ error: 'Dados do comprador ou endereço incompletos' }, { status: 400 });
    }

    // 1. REVALIDAÇÃO DE PREÇOS NO SERVIDOR (Previne adulteração de valores)
    let subtotalOficial = 0;
    const validatedItems = [];

    for (const clientItem of items) {
      let realVariant = null;
      let realProductName = String(clientItem.name || 'Produto');

      // Procura a variante correspondente no catálogo oficial do servidor
      for (const prod of catalogoBase) {
        const found = prod.variants.find(
          (v) => String(v.id) === String(clientItem.id) || String(v.id) === String(clientItem.variantId)
        );
        if (found) {
          realVariant = found;
          realProductName = prod.name;
          break;
        }
      }

      // Se encontrar no catálogo, usa o preço oficial do servidor; caso contrário, usa o enviado com fallback
      const unitPrice = realVariant ? realVariant.price : Number(clientItem.price || 0);
      const quantity = Math.max(1, Number(clientItem.quantity || 1));

      subtotalOficial += unitPrice * quantity;

      validatedItems.push({
        id: String(clientItem.id || 'item'),
        title: `${realProductName} (${realVariant?.size || clientItem.size || 'Padrão'})`,
        quantity,
        currency_id: 'BRL',
        unit_price: unitPrice,
      });
    }

    // 2. REVALIDAÇÃO DE CUPOM NO BANCO DE DADOS
    let cupomId: string | undefined = undefined;
    let valorDesconto = 0;

    if (cupomCodigo) {
      const cupom = await prisma.cupom.findUnique({
        where: { codigo: String(cupomCodigo).toUpperCase().trim() },
      });

      const expirado = cupom?.dataExpiracao ? new Date() > cupom.dataExpiracao : false;
      const abaixoDoMinimo = cupom?.valorMinimo ? subtotalOficial < cupom.valorMinimo : false;
      const esgotado = cupom?.limiteTotal ? cupom.usoTotal >= cupom.limiteTotal : false;

      if (cupom && cupom.ativo && !expirado && !abaixoDoMinimo && !esgotado) {
        cupomId = cupom.id;
        const tipo = (cupom.tipo || '').toLowerCase();
        const ehPercentual = tipo === 'percentual' || tipo === 'porcentagem';
        valorDesconto = ehPercentual
          ? (subtotalOficial * cupom.valor) / 100
          : cupom.valor;
        valorDesconto = Math.min(valorDesconto, subtotalOficial);
      }
    }

    const totalOficial = Math.max(0, subtotalOficial - valorDesconto + Number(shippingCost));

    // 3. REGISTRA O PEDIDO NO BANCO DE DADOS COM VALORES REVALIDADOS
    const order = await prisma.order.create({
      data: {
        userId: userId || null,
        customerName: userName,
        customerEmail: userEmail,
        customerPhone: userPhone || '',
        customerCpf: userCpf || '',
        shippingCep: address.cep,
        shippingStreet: address.rua || '',
        shippingNumber: address.numero || '',
        shippingComplement: address.complemento || '',
        shippingNeighborhood: address.bairro || '',
        shippingCity: address.cidade || '',
        shippingState: address.estado || '',
        shippingServiceName,
        shippingCost: Number(shippingCost),
        items: validatedItems as any,
        subtotal: subtotalOficial,
        desconto: valorDesconto,
        total: totalOficial,
        cupomId,
        cupomCodigo: cupomId ? String(cupomCodigo) : null,
        status: 'Pendente',
      },
    });

    const token = process.env.MP_ACCESS_TOKEN || process.env.MERCADOPAGO_ACCESS_TOKEN;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';

    if (!token) {
      return NextResponse.json({
        success: true,
        orderId: order.id,
        initPoint: `${siteUrl}/dashboard?pedido=${order.id}`,
        message: 'Pedido criado com sucesso. Modo Sandbox/Offline ativo.'
      });
    }

    // 4. ENVIA OS ITENS REVALIDADOS PARA O MERCADO PAGO
    const mpItems = validatedItems.map((item) => ({
      id: item.id,
      title: item.title,
      quantity: item.quantity,
      currency_id: 'BRL',
      unit_price: item.unit_price,
    }));

    if (Number(shippingCost) > 0) {
      mpItems.push({
        id: 'shipping-cost',
        title: `Frete - ${shippingServiceName}`,
        quantity: 1,
        currency_id: 'BRL',
        unit_price: Number(shippingCost),
      });
    }

    const mpUrl = process.env.MP_CHECKOUT_URL || '';

    const preferenceRes = await fetch(mpUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        items: mpItems,
        payer: {
          name: userName,
          email: userEmail,
        },
        external_reference: order.id,
        auto_return: 'approved',
      }),
    });

    if (!preferenceRes.ok) {
      const errorDetail = await preferenceRes.text();
      console.error('Erro na API do Mercado Pago:', preferenceRes.status, errorDetail);
      return NextResponse.json({
        success: true,
        orderId: order.id,
        initPoint: `${siteUrl}/dashboard?pedido=${order.id}`,
        warning: 'Não foi possível gerar link externo, redirecionando para o dashboard local'
      });
    }

    const preferenceData = await preferenceRes.json();

    return NextResponse.json({
      success: true,
      orderId: order.id,
      initPoint: preferenceData.init_point || preferenceData.sandbox_init_point,
    });

  } catch (error: any) {
    console.error('Erro no processamento do checkout:', error);
    return NextResponse.json(
      { error: 'Erro interno no servidor ao processar preference do checkout' },
      { status: 500 }
    );
  }
}
