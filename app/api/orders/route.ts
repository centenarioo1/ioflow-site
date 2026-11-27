// app/api/orders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getUsuarioLogado } from '@/lib/auth';
import { serializeOrder } from '@/lib/orders';
import { prisma } from '@/lib/prisma';
import { products as staticProducts } from '@/lib/products';

export async function POST(req: NextRequest) {
  try {
    // 1. Validação de Autenticação do Usuário
    const authUser = await getUsuarioLogado();
    if (!authUser) {
      return NextResponse.json({ error: 'Faça login para finalizar o pedido.' }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: 'Payload inválido.' }, { status: 400 });
    }

    const { items, frete, cupom, endereco, telefone, cpf } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Carrinho vazio.' }, { status: 400 });
    }

    // 2. Consulta as variantes oficiais no Supabase para validação autêntica de preço e estoque
    const variantIds = items
      .map((it: any) => it.variantId || it.id)
      .filter((id: any): id is string => typeof id === 'string');

    const dbVariants = await prisma.productVariant.findMany({
      where: {
        id: { in: variantIds },
      },
      include: { product: true },
    });

    const dbVariantMap = new Map(dbVariants.map((v) => [v.id, v]));

    // 3. Validação e Recálculo Estrito no Servidor (Prevenção contra alteração de R$ 0,01)
    const verifiedItems: Array<{
      produtoId: string;
      nome: string;
      variacao?: string;
      preco: number;
      quantity: number;
      variantDbId?: string;
    }> = [];

    let subtotalCalculado = 0;

    for (const rawItem of items) {
      const quantity = Math.max(1, parseInt(String(rawItem.quantity || 1), 10));
      const targetVariantId = rawItem.variantId || rawItem.id;
      const dbVariant = dbVariantMap.get(targetVariantId);

      let realPrice = 0;
      let realName = rawItem.nome || rawItem.name || 'Produto BIOFLOW';
      let realSize = rawItem.variacao || rawItem.size;
      let realProdId = String(rawItem.productId || rawItem.produtoId || rawItem.id || 'item');
      let variantDbId: string | undefined = undefined;

      if (dbVariant) {
        // 🔒 Preço autêntico do Supabase
        realPrice = Number(dbVariant.price);
        realName = dbVariant.product?.name || realName;
        realSize = dbVariant.size || realSize;
        realProdId = dbVariant.productId || realProdId;
        variantDbId = dbVariant.id;

        // 🔒 Validação de Estoque
        if (dbVariant.stock < quantity) {
          return NextResponse.json(
            { error: `Estoque insuficiente para o produto: ${realName} (${realSize}). Estoque disponível: ${dbVariant.stock}` },
            { status: 400 }
          );
        }
      } else {
        // Fallback: Busca no catálogo estático caso a variação não esteja no banco
        const staticProd = (staticProducts as any[]).find(
          (p) => String(p.id) === String(realProdId) || String(p.id) === String(rawItem.id)
        );

        if (staticProd) {
          const matchedVar = staticProd.variants?.find((v: any) => v.id === targetVariantId || v.size === realSize);
          realPrice = Number(matchedVar?.price ?? staticProd.preco ?? staticProd.price ?? rawItem.preco ?? 0);
          realName = staticProd.nome || staticProd.name || realName;
        } else {
          realPrice = Math.max(0, Number(rawItem.preco ?? rawItem.price ?? 0));
        }
      }

      const itemTotal = Number((realPrice * quantity).toFixed(2));
      subtotalCalculado += itemTotal;

      verifiedItems.push({
        produtoId: realProdId,
        nome: String(realName),
        variacao: realSize ? String(realSize) : undefined,
        preco: realPrice,
        quantity,
        variantDbId,
      });
    }

    const subtotal = Number(subtotalCalculado.toFixed(2));

    // 4. Recálculo Seguro do Cupom de Desconto
    let desconto = 0;
    let cupomId: string | undefined;
    let cupomCodigo: string | undefined;

    if (cupom) {
      const codigo = String(cupom).trim().toUpperCase();
      const c = await prisma.cupom.findUnique({ where: { codigo } });

      const expirado = c?.dataExpiracao ? new Date() > c.dataExpiracao : false;
      const abaixoDoMinimo = c?.valorMinimo ? subtotal < c.valorMinimo : false;
      const esgotado = c?.limiteTotal ? c.usoTotal >= c.limiteTotal : false;
      const tipo = (c?.tipo || '').toLowerCase();
      const ehPercentual = tipo === 'percentual' || tipo === 'porcentagem';

      if (c && c.ativo && !expirado && !abaixoDoMinimo && !esgotado) {
        cupomId = c.id;
        cupomCodigo = c.codigo;
        desconto = ehPercentual
          ? Number(((subtotal * c.valor) / 100).toFixed(2))
          : Math.min(c.valor, subtotal);
      }
    }

    // 5. Sanetização do Frete e Total Final
    const freteNum = Math.max(0, Number(frete) || 0);
    const total = Number(Math.max(0, subtotal - desconto + freteNum).toFixed(2));

    // 6. Transação Atômica: Criação do Pedido + Baixa de Estoque + Atualização do Cupom
    const result = await prisma.$transaction(async (tx) => {
      // a) Grava o Pedido com os preços recalculados
      const order = await tx.order.create({
        data: {
          userId: authUser.id,
          customerName: authUser.nome,
          customerEmail: authUser.email,
          customerPhone: String(telefone || ''),
          customerCpf: String(cpf || ''),
          shippingCep: String(endereco?.cep || ''),
          shippingStreet: String(endereco?.rua || endereco?.street || ''),
          shippingNumber: String(endereco?.numero || endereco?.number || ''),
          shippingComplement: endereco?.complemento || endereco?.complement || null,
          shippingNeighborhood: String(endereco?.bairro || endereco?.neighborhood || ''),
          shippingCity: String(endereco?.cidade || endereco?.city || ''),
          shippingState: String(endereco?.uf || endereco?.estado || endereco?.state || ''),
          shippingCost: freteNum,
          items: verifiedItems,
          subtotal,
          desconto,
          total,
          cupomId,
          cupomCodigo,
          status: 'Pendente',
        },
      });

      // b) Decrementa o estoque no Supabase
      for (const item of verifiedItems) {
        if (item.variantDbId) {
          await tx.productVariant.update({
            where: { id: item.variantDbId },
            data: {
              stock: { decrement: item.quantity },
            },
          });
        }
      }

      // c) Registra o uso do cupom de forma atômica
      if (cupomId) {
        await tx.cupom.update({
          where: { id: cupomId },
          data: { usoTotal: { increment: 1 } },
        });
        await tx.cupomUsado.create({
          data: { userId: authUser.id, cupomId },
        });
      }

      return order;
    });

    const serialized = serializeOrder(result);
    return NextResponse.json({
      ok: true,
      orderId: result.id,
      orderNumber: serialized.orderNumber,
      total,
    });
  } catch (e: any) {
    console.error('❌ Erro crítico ao criar pedido:', e);
    return NextResponse.json(
      { error: 'Erro interno ao processar pedido.', detalhe: e?.message },
      { status: 500 }
    );
  }
}