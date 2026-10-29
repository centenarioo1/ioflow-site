// app/api/mercadopago/create-preference/route.ts
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
    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://bioflow-site-bioflow1.vercel.app').replace(/\/$/, '');

    // 1. REVALIDAÇÃO DE PREÇOS, IMAGENS E DETALHES DOS PRODUTOS
    let subtotalOficial = 0;
    const validatedItems = [];

    for (const clientItem of items) {
      let realVariant = null;
      let realProductName = String(clientItem.name || clientItem.nome || 'Produto BIOFLOW');
      let realImage = clientItem.image || clientItem.imagem || clientItem.picture_url || '';
      let realDescription = clientItem.description || clientItem.descricao || '';

      // Busca produto e variante no catálogo oficial do servidor
      for (const prod of catalogList) {
        if (prod?.variants && Array.isArray(prod.variants)) {
          const found = prod.variants.find(
            (v: any) => String(v.id) === String(clientItem.id) || String(v.id) === String(clientItem.variantId)
          );
          if (found) {
            realVariant = found;
            realProductName = prod.name || prod.nome || realProductName;
            realDescription = prod.descricaoCurta || prod.description || prod.subtitulo || realDescription;
            const prodImg = prod.images?.[0] || prod.imagens?.[0];
            if (prodImg) {
              realImage = prodImg;
            }
            break;
          }
        }
      }

      // Cálculo e segurança de preço
      let rawPrice = realVariant ? Number(realVariant.price) : Number(clientItem.price ?? clientItem.preco ?? clientItem.unit_price ?? 0);
      if (isNaN(rawPrice) || rawPrice <= 0) { rawPrice = Number(clientItem.precoPromocional ?? 0); }
      const unitPrice = Math.max(0.01, rawPrice);
      const quantity = Math.max(1, Number(clientItem.quantity || 1));

      subtotalOficial += unitPrice * quantity;

      // Trata a URL da imagem para garantir formato público e absoluto (http/https) exigido pelo Mercado Pago
      let pictureUrl = '';
      if (realImage) {
        if (realImage.startsWith('http://') || realImage.startsWith('https://')) {
          pictureUrl = realImage;
        } else {
          pictureUrl = `${siteUrl}${realImage.startsWith('/') ? '' : '/'}${realImage}`;
        }
      }

      const tamanho = realVariant?.size || clientItem.size || clientItem.variacao || 'Padrão';
      const tituloCompleto = `${realProductName} - ${tamanho}`;
      const descricaoCurta = realDescription 
        ? `${realDescription.substring(0, 100)}` 
        : `Produto BIOFLOW Cultivo Orgânico - Embalagem ${tamanho}`;

      // Salva com TODAS as chaves cruzadas para compatibilidade universal no banco e dashboard
      validatedItems.push({
        id: String(clientItem.id || 'item'),
        productId: String(clientItem.productId || clientItem.id || 'item'),
        nome: realProductName,
        name: realProductName,
        title: tituloCompleto,
        variacao: tamanho,
        size: tamanho,
        preco: unitPrice,
        price: unitPrice,
        unit_price: unitPrice,
        description: descricaoCurta,
        quantity,
        currency_id: 'BRL',
        picture_url: pictureUrl,
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
        console.warn('Aviso: Falha ao validar cupom no banco, prosseguindo sem cupom:', cupomErr);
      }
    }

    const totalOficial = Math.max(0, subtotalOficial - valorDesconto + Number(shippingCost));

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
        console.warn('Aviso: Não foi possível verificar o userId no banco:', uErr);
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
      console.error('Erro ao salvar pedido no Prisma (usando ID temporário):', orderErr);
    }

    const token = process.env.MP_ACCESS_TOKEN || process.env.MERCADOPAGO_ACCESS_TOKEN;

    if (!token) {
      return NextResponse.json({
        success: true,
        orderId,
        initPoint: `${siteUrl}/dashboard?pedido=${orderId}`,
        message: 'Pedido registrado localmente (MP_ACCESS_TOKEN ausente nas variáveis de ambiente).'
      });
    }

    const isTestToken = token.startsWith('TEST-');

    // 5. ENVIO DOS ITENS DETALHADOS (COM MINIATURAS E DESCRIÇÃO) PARA O MERCADO PAGO
    const mpItems = validatedItems.map((item) => {
      const mpItem: any = {
        id: item.id,
        title: item.title,
        description: item.description,
        quantity: item.quantity,
        currency_id: 'BRL',
        unit_price: item.unit_price,
        category_id: 'others',
      };
      if (item.picture_url) {
        mpItem.picture_url = item.picture_url;
      }
      return mpItem;
    });

    if (Number(shippingCost) > 0) {
      mpItems.push({
        id: 'shipping-cost',
        title: `Frete - ${shippingServiceName}`,
        description: `Envio para o CEP ${address.cep}`,
        quantity: 1,
        currency_id: 'BRL',
        unit_price: Number(shippingCost),
        category_id: 'others',
      });
    }

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
          identification: userCpf ? {
            type: 'CPF',
            number: String(userCpf).replace(/\D/g, '')
          } : undefined,
        },
        external_reference: orderId,
        statement_descriptor: 'BIOFLOW',
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
      console.error('Erro na API do Mercado Pago:', preferenceRes.status, errorDetail);
      return NextResponse.json({
        success: true,
        orderId,
        initPoint: `${siteUrl}/dashboard?pedido=${orderId}`,
        warning: 'Não foi possível gerar link externo do Mercado Pago, direcionando ao dashboard.'
      });
    }

    const preferenceData = await preferenceRes.json();

    const redirectUrl = isTestToken
      ? (preferenceData.sandbox_init_point || preferenceData.init_point)
      : (preferenceData.init_point || preferenceData.sandbox_init_point);

    return NextResponse.json({
      success: true,
      orderId,
      initPoint: redirectUrl || `${siteUrl}/dashboard?pedido=${orderId}`,
    });

  } catch (error: any) {
    console.error('Erro crítico no processamento do checkout:', error);
    return NextResponse.json(
      { error: `Erro ao processar checkout: ${error?.message || 'Erro interno no servidor'}` },
      { status: 500 }
    );
  }
}