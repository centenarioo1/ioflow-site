// app/api/mercadopago/process-payment/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { products, produtos } from '@/lib/products';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    if (!body) {
      return NextResponse.json({ error: 'Corpo da requisição inválido (JSON esperado)' }, { status: 400 });
    }

    const {
      items,
      paymentMethodId,
      token: cardToken,
      installments = 1,
      issuerId,
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

    if (!paymentMethodId) {
      return NextResponse.json({ error: 'Método de pagamento (paymentMethodId) é obrigatório' }, { status: 400 });
    }

    const catalogList = (products || produtos || []) as any[];

    // 1. REVALIDAÇÃO DE PREÇOS NO SERVIDOR
    let subtotalOficial = 0;
    const validatedItems = [];

    for (const clientItem of items) {
      let realVariant = null;
      let realProductName = String(clientItem.name || clientItem.nome || 'Produto BIOFLOW');

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

      let rawPrice = realVariant ? Number(realVariant.price) : Number(clientItem.price ?? clientItem.preco ?? clientItem.unit_price ?? 0);
      if (isNaN(rawPrice) || rawPrice <= 0) { rawPrice = Number(clientItem.precoPromocional ?? 0); }
      const unitPrice = Math.max(0.01, rawPrice);
      const quantity = Math.max(1, Number(clientItem.quantity || 1));

      subtotalOficial += unitPrice * quantity;

      const tamanho = realVariant?.size || clientItem.size || clientItem.variacao || 'Padrão';

      validatedItems.push({
        id: String(clientItem.id || 'item'),
        productId: String(clientItem.productId || clientItem.id || 'item'),
        nome: realProductName,
        name: realProductName,
        title: `${realProductName} (${tamanho})`,
        variacao: tamanho,
        size: tamanho,
        preco: unitPrice,
        price: unitPrice,
        unit_price: unitPrice,
        quantity,
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
      } catch (cupomErr) {
        console.warn('Aviso: Falha ao validar cupom no banco:', cupomErr);
      }
    }

    const totalOficial = Math.max(0.01, Number((subtotalOficial - valorDesconto + Number(shippingCost)).toFixed(2)));

    // 3. VALIDAÇÃO DE USER_ID
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
        console.warn('Aviso: Erro ao verificar userId:', uErr);
      }
    }

    // 4. CRIAÇÃO DO PEDIDO NO BANCO DE DADOS
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
          shippingStreet: address.rua || '',
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
      console.error('Erro ao salvar pedido no Prisma:', orderErr);
    }

    const mpToken = process.env.MP_ACCESS_TOKEN || process.env.MERCADOPAGO_ACCESS_TOKEN;

    if (!mpToken) {
      return NextResponse.json({
        success: true,
        orderId,
        message: 'Pedido registrado localmente (MP_ACCESS_TOKEN ausente nas variáveis de ambiente).'
      });
    }

    // 5. MONTAGEM DO PAYLOAD DIRETO PARA O MERCADO PAGO
    const nameParts = userName.trim().split(' ');
    const firstName = nameParts[0] || 'Cliente';
    const lastName = nameParts.slice(1).join(' ') || 'BIOFLOW';
    const cleanDocNumber = String(userCpf || '').replace(/\D/g, '');

    const paymentPayload: Record<string, any> = {
      transaction_amount: totalOficial,
      description: `Pedido ${orderId} - BIOFLOW`,
      payment_method_id: paymentMethodId,
      external_reference: orderId,
      statement_descriptor: 'BIOFLOW',
      payer: {
        email: userEmail,
        first_name: firstName,
        last_name: lastName,
        identification: cleanDocNumber ? {
          type: 'CPF',
          number: cleanDocNumber
        } : undefined,
      },
      additional_info: {
        items: validatedItems.map(item => ({
          id: item.id,
          title: item.title,
          description: `Variacao: ${item.variacao}`,
          quantity: item.quantity,
          unit_price: item.price,
        })),
        shipments: {
          receiver_address: {
            zip_code: String(address.cep || '').replace(/\D/g, ''),
            street_name: address.rua || '',
            street_number: Number(address.numero) || 0,
            city_name: address.cidade || '',
            state_name: address.estado || '',
          }
        }
      }
    };

    if (paymentMethodId !== 'pix') {
      if (!cardToken) {
        return NextResponse.json({ error: 'Token do cartão de crédito não informado.' }, { status: 400 });
      }
      paymentPayload.token = cardToken;
      paymentPayload.installments = Number(installments) || 1;
      if (issuerId) {
        paymentPayload.issuer_id = Number(issuerId);
      }
    }

    // URL configurável via variável de ambiente MP_PAYMENTS_URL
    const mpApiEndpoint = process.env.MP_PAYMENTS_URL || 'https://api.mercadopago.com/checkout/preferences';

    const mpRes = await fetch(mpApiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mpToken}`,
        'X-Idempotency-Key': orderId,
      },
      body: JSON.stringify(paymentPayload),
    });

    const paymentData = await mpRes.json();

    if (!mpRes.ok) {
      console.error('Erro na API do Mercado Pago:', mpRes.status, paymentData);
      return NextResponse.json({
        error: paymentData.message || paymentData.cause?.[0]?.description || 'Erro ao processar pagamento.',
        details: paymentData
      }, { status: mpRes.status });
    }

    // 6. ATUALIZAÇÃO DO STATUS DO PEDIDO NO BANCO
    const statusMP = paymentData.status;
    let novoStatusBanco = 'Pendente';

    if (statusMP === 'approved') {
      novoStatusBanco = 'Aprovado';
    } else if (statusMP === 'rejected') {
      novoStatusBanco = 'Cancelado';
    }

    try {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          mpPaymentId: String(paymentData.id),
          status: novoStatusBanco,
        },
      });
    } catch (uErr) {
      console.warn('Aviso: Falha ao atualizar pedido:', uErr);
    }

    const transactionData = paymentData.point_of_interaction?.transaction_data;
    const qrCode = transactionData?.qr_code;
    const qrCodeBase64 = transactionData?.qr_code_base64;

    return NextResponse.json({
      success: true,
      orderId,
      paymentId: paymentData.id,
      status: statusMP,
      statusDetail: paymentData.status_detail,
      isPix: paymentMethodId === 'pix',
      pix: paymentMethodId === 'pix' ? {
        qrCode,
        qrCodeBase64,
        ticketUrl: transactionData?.ticket_url,
      } : undefined,
    });

  } catch (error: any) {
    console.error('Erro no processamento de pagamento:', error);
    return NextResponse.json(
      { error: `Erro interno no servidor: ${error?.message || 'Falha ao processar pagamento'}` },
      { status: 500 }
    );
  }
}
