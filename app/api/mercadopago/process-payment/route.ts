// app/api/mercadopago/process-payment/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { products, produtos } from '@/lib/products';
import { enviarEmailPedidoCriado, enviarEmailConfirmacaoPedido, enviarEmailAdminNovoPedido } from '@/lib/email';
import { cotarMelhorEnvio, ErroFrete } from '@/lib/shipping';
import { temFreteGratisPorValor } from '@/lib/frete';
import { BRINDES_OPCOES, CUPOM_BRINDE, litrosDoItem, litrosDeBrinde } from '@/lib/promocoes';

const erro = (msg: string, status = 400, extra: Record<string, any> = {}) =>
  NextResponse.json({ error: msg, ...extra }, { status });

// Procura o item do carrinho no catálogo do servidor (fonte oficial de preço, peso e dimensões).
function acharNoCatalogo(catalogList: any[], clientItem: any): { prod: any; variant: any } | null {
  const ids = [clientItem.variantId, clientItem.id].filter(Boolean).map(String);

  for (const prod of catalogList) {
    if (!Array.isArray(prod?.variants)) continue;
    const variant = prod.variants.find((v: any) => ids.includes(String(v.id)));
    if (variant) return { prod, variant };
  }

  // Alternativa: produto + tamanho/variação
  const productId = String(clientItem.productId || '');
  const size = String(clientItem.size || clientItem.variacao || '');
  if (productId) {
    const prod = catalogList.find((p: any) => String(p?.id) === productId);
    const variant = prod?.variants?.find((v: any) => String(v.size) === size);
    if (prod && variant) return { prod, variant };
  }

  // Produto sem variações
  const prodDireto = catalogList.find(
    (p: any) => (ids.includes(String(p?.id)) || String(p?.id) === productId) && p?.price != null
  );
  if (prodDireto) return { prod: prodDireto, variant: null };

  return null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    if (!body) {
      return erro('Corpo da requisição inválido (JSON esperado)');
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
      brindeId,
      observacoes,
      shippingServiceId,
      address,
    } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return erro('Carrinho vazio ou formato inválido');
    }

    if (!userEmail || !userName || !address?.cep) {
      return erro('Dados do comprador (e-mail, nome) ou CEP do endereço são obrigatórios');
    }

    if (!paymentMethodId || paymentMethodId === 'cartao') {
      return erro('Método de pagamento inválido. Atualize a página e tente novamente.');
    }

    const cleanDocNumber = String(userCpf || '').replace(/\D/g, '');
    if (cleanDocNumber.length !== 11) {
      return erro('CPF inválido. Informe os 11 dígitos.');
    }

    if (!shippingServiceId) {
      return erro('Selecione uma opção de frete antes de finalizar.');
    }

    const catalogList = (products || produtos || []) as any[];

    // ---------- 1. REVALIDAÇÃO DE PREÇOS NO SERVIDOR (só catálogo oficial) ----------
    let subtotalOficial = 0;
    const validatedItems: any[] = [];
    const itensFrete: any[] = [];

    for (const clientItem of items) {
      const achado = acharNoCatalogo(catalogList, clientItem);
      if (!achado) {
        console.error('Item fora do catálogo:', clientItem?.id, clientItem?.name);
        return erro(`Produto não encontrado no catálogo: ${clientItem?.name || clientItem?.id}. Remova-o do carrinho.`);
      }

      const { prod, variant } = achado;
      const unitPrice = Number(variant?.price ?? prod?.price);
      if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
        return erro(`Preço inválido no catálogo para: ${prod?.name || prod?.nome}`);
      }

      const quantity = Math.min(999, Math.max(1, Math.floor(Number(clientItem.quantity || 1))));
      const realProductName = String(prod?.name || prod?.nome || clientItem.name || clientItem.nome || 'Produto BIOFLOW');
      const tamanho = String(variant?.size || clientItem.size || clientItem.variacao || 'Padrão');

      subtotalOficial += unitPrice * quantity;

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

      // Peso e dimensões: catálogo primeiro; o que veio do carrinho só como último recurso.
      itensFrete.push({
        id: String(clientItem.id || 'item'),
        nome: realProductName,
        price: unitPrice,
        quantity,
        weight: variant?.weight ?? prod?.weight ?? clientItem.weight,
        dimensions: variant?.dimensions ?? prod?.dimensions ?? clientItem.dimensions,
      });
    }

    subtotalOficial = Number(subtotalOficial.toFixed(2));

    // ---------- 2. CUPOM (obrigatório ser válido se foi informado) ----------
    let cupomId: string | undefined = undefined;
    let cupomCodigoFinal: string | null = null;
    let valorDesconto = 0;
    let ehFreteGratisCupom = false;

    if (cupomCodigo) {
      const cdgUpper = String(cupomCodigo).toUpperCase().trim();
      const cupom = await prisma.cupom.findUnique({ where: { codigo: cdgUpper } });

      const expirado = cupom?.dataExpiracao ? new Date() > cupom.dataExpiracao : false;
      const abaixoDoMinimo = cupom?.valorMinimo ? subtotalOficial < cupom.valorMinimo : false;
      const esgotado = cupom?.limiteTotal ? cupom.usoTotal >= cupom.limiteTotal : false;

      if (!cupom || !cupom.ativo || expirado || abaixoDoMinimo || esgotado) {
        return erro('O cupom informado não é mais válido para este pedido. Remova-o e tente novamente.');
      }

      cupomId = cupom.id;
      cupomCodigoFinal = cupom.codigo;

      const tipo = (cupom.tipo || '').toLowerCase();
      const ehPercentual = tipo === 'percentual' || tipo === 'porcentagem';
      ehFreteGratisCupom = tipo === 'frete_gratis' || cdgUpper === 'FRETEGRATIS';

      if (cdgUpper === CUPOM_BRINDE) {
        // BIOMAIS5 só dá brinde, nunca desconto em dinheiro
        valorDesconto = 0;
      } else {
        valorDesconto = ehPercentual ? (subtotalOficial * cupom.valor) / 100 : cupom.valor;
        if (ehFreteGratisCupom) valorDesconto = cupom.valor || 0;
      }
      valorDesconto = Number(Math.min(valorDesconto, subtotalOficial).toFixed(2));
    }

    // ---------- 3. BRINDE BIOMAIS5: +5L a cada 20L (calculado no servidor) ----------
    if (cupomCodigoFinal?.toUpperCase() === CUPOM_BRINDE) {
      const totalLitros = validatedItems.reduce((acc, it) => acc + litrosDoItem(it) * it.quantity, 0);
      const litrosBrinde = litrosDeBrinde(totalLitros);

      if (litrosBrinde > 0) {
        const brinde = BRINDES_OPCOES.find((b) => b.id === brindeId) || BRINDES_OPCOES[0];
        const nomeBrinde = `+${litrosBrinde}L ${brinde.nomeBase}`;
        validatedItems.push({
          id: `${brinde.id}-${litrosBrinde}l`,
          productId: brinde.id,
          nome: nomeBrinde,
          name: nomeBrinde,
          title: nomeBrinde,
          variacao: `+${litrosBrinde} LITROS BRINDE`,
          size: `+${litrosBrinde} LITROS BRINDE`,
          preco: 0,
          price: 0,
          unit_price: 0,
          quantity: 1,
        });
      }
    }

    // ---------- 4. FRETE: recotado no servidor, nunca vem do navegador ----------
    const cepDestino = String(address.cep || '').replace(/\D/g, '');
    let opcoesFrete: Awaited<ReturnType<typeof cotarMelhorEnvio>>['opcoes'];
    try {
      ({ opcoes: opcoesFrete } = await cotarMelhorEnvio(cepDestino, itensFrete));
    } catch (e: any) {
      if (e instanceof ErroFrete) return erro(e.message, e.status);
      throw e;
    }

    const opcaoSelecionada = opcoesFrete.find((o) => String(o.id) === String(shippingServiceId));
    if (!opcaoSelecionada) {
      return erro('A opção de frete escolhida não está mais disponível. Recalcule o frete.', 409);
    }

    // Frete grátis: cupom de frete grátis OU pedido a partir do mínimo (só na opção mais barata)
    const baseFreteGratis = Math.max(0, subtotalOficial - valorDesconto);
    const ehOpcaoMaisBarata = opcoesFrete[0]?.id === opcaoSelecionada.id;
    const freteGratis = ehFreteGratisCupom || (temFreteGratisPorValor(baseFreteGratis) && ehOpcaoMaisBarata);

    const valorFreteCobrado = freteGratis ? 0 : opcaoSelecionada.valor;
    const shippingServiceName = opcaoSelecionada.nome;

    const totalOficial = Math.max(0.01, Number((subtotalOficial - valorDesconto + valorFreteCobrado).toFixed(2)));

    // ---------- 5. VALIDAÇÃO DE USER_ID ----------
    let validUserId: string | null = null;
    if (userId) {
      try {
        const userExists = await prisma.user.findUnique({ where: { id: String(userId) } });
        if (userExists) validUserId = userExists.id;
      } catch (uErr) {
        console.warn('Aviso: Erro ao verificar userId:', uErr);
      }
    }

    // ---------- 6. CRIAÇÃO DO PEDIDO (se falhar, NÃO cobra o cliente) ----------
    let orderId: string;
    try {
      const order = await prisma.order.create({
        data: {
          userId: validUserId,
          customerName: userName,
          customerEmail: userEmail,
          customerPhone: userPhone || '',
          customerCpf: cleanDocNumber,
          shippingCep: address.cep || '',
          shippingStreet: address.rua || '',
          shippingNumber: address.numero || '',
          shippingComplement: address.complemento || '',
          shippingNeighborhood: address.bairro || '',
          shippingCity: address.cidade || '',
          shippingState: address.estado || '',
          shippingServiceName,
          shippingCost: valorFreteCobrado,
          items: validatedItems as any,
          subtotal: subtotalOficial,
          desconto: valorDesconto,
          total: totalOficial,
          cupomId,
          cupomCodigo: cupomCodigoFinal,
          status: 'Pendente',
        },
      });
      orderId = order.id;
    } catch (orderErr) {
      console.error('Erro ao salvar pedido no Prisma:', orderErr);
      return erro('Não foi possível registrar o pedido. Nenhuma cobrança foi feita. Tente novamente.', 500);
    }

    if (cupomId) {
      try {
        await prisma.cupom.update({ where: { id: cupomId }, data: { usoTotal: { increment: 1 } } });
      } catch (cErr) {
        console.warn('Aviso: Falha ao contar uso do cupom:', cErr);
      }
    }

    const mpToken = process.env.MP_ACCESS_TOKEN || process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!mpToken) {
      console.error('MP_ACCESS_TOKEN ausente nas variáveis de ambiente.');
      return erro('Pagamento indisponível no momento. Tente novamente mais tarde.', 500);
    }

    // ---------- 7. PAYLOAD DO MERCADO PAGO ----------
    const nameParts = String(userName).trim().split(' ');
    const firstName = nameParts[0] || 'Cliente';
    const lastName = nameParts.slice(1).join(' ') || 'BIOFLOW';

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
        identification: { type: 'CPF', number: cleanDocNumber },
      },
      additional_info: {
        // o brinde (preço 0) fica só no pedido, não vai ao Mercado Pago
        items: validatedItems
          .filter((item) => item.price > 0)
          .map((item) => ({
            id: item.id,
            title: item.title,
            description: `Variacao: ${item.variacao}`,
            quantity: item.quantity,
            unit_price: item.price,
          })),
        shipments: {
          receiver_address: {
            zip_code: cepDestino,
            street_name: address.rua || '',
            street_number: Number(address.numero) || 0,
            city_name: address.cidade || '',
            state_name: address.estado || '',
          },
        },
      },
    };

    // Aviso de pagamento (Pix aprovado depois): precisa de uma URL pública do seu site
    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '');
    if (siteUrl.startsWith('https://')) {
      paymentPayload.notification_url = `${siteUrl}/api/mercadopago/webhook`;
    }

    if (paymentMethodId !== 'pix') {
      if (!cardToken) {
        return erro('Token do cartão de crédito não informado.');
      }
      paymentPayload.token = cardToken;
      paymentPayload.installments = Number(installments) || 1;
      if (issuerId) paymentPayload.issuer_id = Number(issuerId);
    }

    const mpApiEndpoint = process.env.MP_PAYMENTS_URL || 'https://api.mercadopago.com/v1/payments';

    const mpRes = await fetch(mpApiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${mpToken}`,
        'X-Idempotency-Key': orderId,
      },
      body: JSON.stringify(paymentPayload),
    });

    const paymentData = await mpRes.json();

    if (!mpRes.ok) {
      console.error('Erro na API do Mercado Pago:', mpRes.status, paymentData);
      try {
        await prisma.order.updateMany({
          where: { id: orderId, status: { not: 'Aprovado' } },
          data: { status: 'Cancelado' },
        });
      } catch {}
      return NextResponse.json(
        {
          error: paymentData.message || paymentData.cause?.[0]?.description || 'Erro ao processar pagamento.',
          details: paymentData,
        },
        { status: mpRes.status }
      );
    }

    // ---------- 8. ATUALIZA STATUS (com trava para não enviar e-mail em duplicidade) ----------
    const statusMP: string = paymentData.status;
    let novoStatusBanco = 'Pendente';
    if (statusMP === 'approved') novoStatusBanco = 'Aprovado';
    else if (statusMP === 'rejected' || statusMP === 'cancelled') novoStatusBanco = 'Cancelado';

    let deveEnviarConfirmacao = false;
    try {
      const r = await prisma.order.updateMany({
        where: { id: orderId, status: { not: 'Aprovado' } },
        data: { mpPaymentId: String(paymentData.id), status: novoStatusBanco },
      });
      // Só quem mudou o pedido para "Aprovado" envia a confirmação (o webhook faz a mesma checagem)
      deveEnviarConfirmacao = statusMP === 'approved' && r.count === 1;
    } catch (uErr) {
      console.warn('Aviso: Falha ao atualizar pedido:', uErr);
    }

    if (statusMP === 'rejected' || statusMP === 'cancelled') {
      return NextResponse.json(
        {
          success: false,
          error: `Pagamento recusado (${paymentData.status_detail || 'sem detalhe'}). Confira os dados do cartão ou tente outro cartão ou o Pix.`,
          status: statusMP,
          statusDetail: paymentData.status_detail,
        },
        { status: 402 }
      );
    }

    const transactionData = paymentData.point_of_interaction?.transaction_data;
    const qrCode = transactionData?.qr_code;
    const qrCodeBase64 = transactionData?.qr_code_base64;

    // ---------- 9. E-MAILS (Resend, via lib/email) ----------
    try {
      const emailItems = validatedItems.map((it: any) => ({
        nome: it.nome || it.name || 'Produto Bioflow',
        quantidade: Number(it.quantity || 1),
        preco: Number(it.price || it.preco || 0),
        variacao: it.variacao || it.size || '',
      }));

      const enderecoFormatado = [
        `${address.rua || ''}, ${address.numero || ''}`,
        address.complemento ? `(${address.complemento})` : '',
        `${address.bairro || ''} - ${address.cidade || ''}/${address.estado || ''}`,
        `CEP: ${address.cep || ''}`,
      ]
        .filter(Boolean)
        .join(', ');

      const metodoLabel = paymentMethodId === 'pix' ? 'PIX' : 'Cartão de Crédito';
      const numeroPedido = orderId.slice(-6).toUpperCase();

      if (statusMP === 'approved') {
        if (deveEnviarConfirmacao) {
          await enviarEmailConfirmacaoPedido({
            emailCliente: userEmail,
            nomeCliente: userName || 'Cultivador',
            numeroPedido,
            itens: emailItems,
            valorTotal: totalOficial,
            metodoPagamento: metodoLabel,
            enderecoEntrega: enderecoFormatado,
          });
        }
      } else {
        await enviarEmailPedidoCriado({
          emailCliente: userEmail,
          nomeCliente: userName || 'Cultivador',
          numeroPedido,
          itens: emailItems,
          valorTotal: totalOficial,
          metodoPagamento: metodoLabel,
          codigoPix: qrCode || undefined,
          linkPagamento: transactionData?.ticket_url || undefined,
          enderecoEntrega: enderecoFormatado,
        });
      }

      await enviarEmailAdminNovoPedido({
        numeroPedido,
        nomeCliente: userName,
        emailCliente: userEmail,
        telefoneCliente: userPhone,
        cpfCliente: cleanDocNumber,
        itens: emailItems,
        valorTotal: totalOficial,
        metodoPagamento: metodoLabel,
        enderecoEntrega: enderecoFormatado,
        cupomCodigo: cupomCodigoFinal || undefined,
        observacoes: observacoes || undefined,
      });

      console.log(`📧 [Process Payment] E-mails disparados para ${userEmail} e Admin.`);
    } catch (emailErr) {
      console.error('❌ [Process Payment] Falha ao enviar e-mails:', emailErr);
    }

    return NextResponse.json({
      success: true,
      orderId,
      paymentId: paymentData.id,
      status: statusMP,
      statusDetail: paymentData.status_detail,
      isPix: paymentMethodId === 'pix',
      pix:
        paymentMethodId === 'pix'
          ? { qrCode, qrCodeBase64, ticketUrl: transactionData?.ticket_url }
          : undefined,
    });
  } catch (error: any) {
    console.error('Erro no processamento de pagamento:', error);
    return NextResponse.json(
      { error: `Erro interno no servidor: ${error?.message || 'Falha ao processar pagamento'}` },
      { status: 500 }
    );
  }
}
