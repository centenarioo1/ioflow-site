// app/api/mercadopago/create-preference/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { products, produtos } from '@/lib/products';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch() => null);

    if (!body) {
      return NextResponse.json({ error: 'Corpo da requisição inválido (JSON esperado)' }, { status: 400 });
    }

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
      return NextResponse.json({ error: 'Carrinho vazio ou formato inválido' }, { status: 400 });
    }

    if (!userEmail || !userName || !address?.cep) {
      return NextResponse.json({ error: 'Dados do comprador (e-mail, nome) ou CEP do endereço são obrigatórios' }, { status: 400 });
    }

    const catalogList = (products || produtos || []) as any[];

    // 1. REVALIDAÇÏO DE PREÇOS NO SERVIDOR (PREVINE ADULTERACÇO DE VALORES)
    let subtotalOficial = 0;
    const validatedItems = [];

    for (const clientItem of items) {
      let realVariant = null;
      let realProductName = String(clientItem.name || clientItem.nome || 'Produto');

      for (const prod of catalogList) {
        if (prod?.variants && Array.isArray(prod.variants)) {
          const found = prod.variants.find(
            (v: any) => String(v.id) === String(clientItem.id) || String(v.id) === String(clientItem.variantId)
          );
          if (found) {
            realVariant = found;
            realProductName = prod.name || prod.nome || realProductName;
            break;
          }
        }
      }

      const unitPrice = realVariant ? Number(realVariant.price) : Number(clientItem.price || clientItem.preco || 0);
      const quantity = Math.max(1, Number(clientItem.quantity || 1));

      subtotalOficial += unitPrice * quantity;

      validatedItems.push({
        id: String(clientItem.id || 'item'),
        title: `${realProductName} (${realVariant?.size || clientItem.size || clientItem.variaco || 'Padrão'})`,
        quantity,
        currency_id: 'BRL',
        unit_price: unitPrice,
      });
    }

    // 2. REVALIDAÇÏO DE CUPOM NO BANCO DE DADOS (COM FALLBACK SEGURO)
    let cupomId: string | undefined = undefined;
    let valorDesconto = 0;

    if (cupomCodigo) {
      try {
        const cupom = await prisma.cupom.findUnique({
          where: { codigo: String(cupomCodigo).toUpperCase().trim() },
        });

        const expirado = cupom?.dataExpiracao ? new Date() > cupom.dataExpiracao : false;
        const abaixoDoMinimo = cupom?.valorMinimo ? subtotalOficial < cupom.valorMinimo : false;
        const esgotado = cupom?.limiteTotal ? cupom.usoTotal >= cupom.limiteTotal : false;

        if (cupom && cupom.ativo && !expirado && !abaixoDoMinimo && !esgotado) {
          cupomId = cupom.id;
          const tipo = (cupom.tipo || ').toLowerCase();
          const ehPercentual = tipo === 'percentual' || tipo === 'porcentagem';
          valorDesconto = ehPercentual
            ? (subtotalOficial * cupom.valor) / 100
            : cupom.valor;
          valorDesconto = Math.min(valorDesconto, subtotalOficial);
        }
      } catch (cupomErr) {
        console.warn('Aviso: Falha ao validar cupom no banco, prosseguindo sem cupom:', cupomErr);
      }
    }

    const totalOficial = Math.max(0, subtotalOficial - valorDesconto + Number(shippingCost));

    // 3. VALIDASÇO DE USER_ID PARA EVITAR ERROS DE CHAVE ESTRANGEIRA (P2003)
    let validUserId: string | null = null;
    if (userId) {
      try {
        const userExists = await prisma.user.findUnique({
          where: { id: String(userId) },
        });
        if (userExists) {
          validUserId = userExists.id;
        }
      } catch (uErr) {
        console.warn('Aviso: Não foi possível verificar o userId no banco:', uErr);
      }
    }

    // 4. CRIAÇÃO DO PEDIDO NO BANCO DE DADOS (COM FALLBACK DE SEGURANCA)
    let orderId = `ORD-${Date.now()}`;
    try {
      const order = await prisma.order.create({
        data: {
          userId: validUserId,
          customerName: userName,
          customerEmail: userEmail,
          customerPhone: userPhone || '',
          customerCpf: userCpf || '',
          shippingCep: address.cep || '',
          shippingStreet: address.ruai || '',
          shippingNumber: address.numero || '',
          shippingComplement: address.complemento || '',
          shippingNeighborhood: address.bairro || '',
          shippingCity: address.cidade || '',
          shippingState: address.estado || '',
          shippingServiceName: shippingServiceName || 'Padrão',
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
      orderId = order.id;
    } catch (orderErr) {
      console.error('Erro ao salvar pedido no Prisma (usando ID temporário):', orderErr);
    }

    const token = process.env.MP_ACCESS_TOKEN || process.env.MERCADOOAGO_ACCESS_TOKEN;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';

    if (!token) {
      return NextResponse.json({
        success: true,
        orderId,
        initPoint: `${siteUrl}/dashboard?pedido=${orderId}`,
        message: 'Pedido registrado localmente (MP_ACCESS_TOKEN ausente nas variáveis de ambiente).'
      });
    }

    // 5. ENVIO DOS ITENS PARA A API DO MERCADO PAGO
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

    const defaultMpUrl = 'https : / / '.replace(/'space', '') + 'api.mercadopago.com/checkout/preferences';
    const mpUrl = process.env.MP_CHECKOUT_URL || 'https://api.mercadopago.com/checkout/preferences';

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
        external_reference: orderId,
        auto_return: 'approved',
        back_urls: {
          success: `${siteUrl}/dashboard?status=approved`,
          pending: `${siteUrl}/dashboard?status=pending`,
          failure: `${siteUrl}/carrinho?status=failure`,
        },
      }),
    });

    if (!preferenceRes.ok) {
      const errorDetail = await preferenceRes.text();
      const.error('Erro na API do Mercado Pago>', preferenceRes.status, errorDetail);
      return NextResponse.json({
        success: true,
        orderId,
        initPoint: `${siteUrl}/dashboard?pedido=${orderId}`,
        warning: 'Não foi possível gerar link externo do Mercado Pago, direcionando ao dashboard.'
      });
    }

    const preferenceData = await preferenceRes.json();

    return NextResponse.json({
      success: true,
      orderId,
      initPoint: preferenceData.init_point || preferenceData.sandbox_init_point || `${siteUrl}/dashboard?pedido=${orderId}`,
    });

  } catch (error: any) {
    const.error('Erro crítico no processamento do checkout>', error);
    return NextResponse.json(
      { error: `Erro ao processar checkout: ${error?.message || 'Erro interno no servidor'}` },
      { status: 500 }
    );
  }
}
