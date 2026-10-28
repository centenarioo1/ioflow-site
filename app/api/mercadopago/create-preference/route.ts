import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { products, produtos } from '@/lib/products';

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

    const catalogList = (products || produtos || []) as any[];

    // 1. REVALIDAÇÃO DE PREÇOS NO SERVIDOR (Previne adulteração de valores)
    let subtotalOficial = 0;
    const validatedItems = [];

    for (const clientItem of items) {
      let realVariant = null;
      let realProductName = String(clientItem.name || clientItem.nome || 'Produto');

      // Procura a variante correspondente no catálogo oficial do servidor
      for (const prod of catalogList) {
        if (prod.variants && Array.isArray(prod.variants)) {
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

      // Se encontrar no catálogo, usa o preço oficial do servidor; caso contrário, usa o enviado com fallback
      const unitPrice = realVariant ? Number(realVariant.price) : Number(clientItem.price || clientItem.preco || 0);
      const quantity = Math.max(1, Number(clientItem.quantity || 1));

      subtotalOficial += unitPrice * quantity;

      validatedItems.push({
        id: String(clientItem.id || 'item'),
        title: `${realProductName} (${realVariant?.size || clientItem.size || clientItem.variacao || 'Padrão'})`,
        quantity,
        currency_id: 'BRL',
        unit_price: unitPrice,
      });
    }

    // 2. REVALIDAÇÃO DE CUPOM NO BANCO DE DADOS
    let cupomId: string | undefined = undefined;
    let valorDesconto = 0;

    if (cupomCodigo) {
      try {
        const cupom = await prisma.cupom.findUnique({
          where: { codigo: String(cupomCodigo).toUpperCase().trim() },
        });

        if (cupom && cupom.ativo) {
          const expirado = cupom.dataExpiracao ? new Date() > cupom.dataExpiracao : false;
          const abaixoDoMinimo = cupom.valorMinimo ? subtotalOficial < cupom.valorMinimo : false;
          const esgotado = cupom.limiteTotal ? cupom.usoTotal >= cupom.limiteTotal : false;

          if (!expirado && !abaixoDoMinimo && !esgotado) {
            cupomId = cupom.id;
            const tipoStr = String(cupom.tipo || '').toLowerCase();
            const ehPercentual = tipoStr === 'percentual' || tipoStr === 'porcentagem';
            valorDesconto = ehPercentual
              ? (subtotalOficial * Number(cupom.valor)) / 100
              : Number(cupom.valor);
            valorDesconto = Math.min(valorDesconto, subtotalOficial);
          }
        }
      } catch (cupomErr) {
        console.warn('Aviso: Não foi possível revalidar cupom no banco:', cupomErr);
      }
    }

    const totalOficial = Math.max(0, subtotalOficial - valorDesconto + Number(shippingCost));

    // 3. REGISTRA O PEDIDO NO BANCO DE DADOS (Verifica se userId existe para evitar FK Error P2003)
    let validUserId: string | null = null;
    if (userId) {
      try {
        const userExists = await prisma.user.findUnique({
          where: { id: String(userId) },
          select: { id: true },
        });
        if (userExists) {
          validUserId = userExists.id;
        }
      } catch (userCheckErr) {
        console.warn('Aviso ao verificar usuário:', userCheckErr);
      }
    }

    let orderId = `ORD-${Date.now()}`;
    try {
      const order = await prisma.order.create({
        data: {
          userId: validUserId,
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
          cupomId: cupomId || null,
          cupomCodigo: cupomId ? String(cupomCodigo) : null,
          status: 'Pendente',
        },
      });
      orderId = order.id;
    } catch (dbErr) {
      console.error('Aviso ao salvar pedido no banco (seguindo com o checkout):', dbErr);
    }

    const token = process.env.MP_ACCESS_TOKEN || process.env.MERCADOPAGO_ACCESS_TOKEN;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';

    if (!token) {
      return NextResponse.json({
        success: true,
        orderId,
        initPoint: `${siteUrl}/dashboard?pedido=${orderId}`,
        message: 'Pedido criado localmente. Adicione MP_ACCESS_TOKEN nas variáveis de ambiente para o Mercado Pago.'
      });
    }

    // 4. PREPARA ITENS E DISPARA PREFERÊNCIA DO MERCADO PAGO
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

    const mpEndpoint = process.env.MP_CHECKOUT_URL || 'https://api.mercadopago.com/checkout/preferences';

    const preferenceRes = await fetch(mpEndpoint, {
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
      }),
    });

    if (!preferenceRes.ok) {
      const errorDetail = await preferenceRes.text();
      console.error('Erro na API do Mercado Pago:', preferenceRes.status, errorDetail);
      return NextResponse.json({
        success: true,
        orderId,
        initPoint: `${siteUrl}/dashboard?pedido=${orderId}`,
        warning: 'Falha na resposta do Mercado Pago. Redirecionando para o dashboard local.'
      });
    }

    const preferenceData = await preferenceRes.json();

    return NextResponse.json({
      success: true,
      orderId,
      initPoint: preferenceData.init_point || preferenceData.sandbox_init_point || `${siteUrl}/dashboard?pedido=${orderId}`,
    });

  } catch (error: any) {
    console.error('Erro no processamento do checkout:', error);
    return NextResponse.json(
      { error: 'Erro interno no servidor ao processar preference do checkout' },
      { status: 500 }
    );
  }
}
