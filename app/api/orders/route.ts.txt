import { NextRequest, NextResponse } from 'next/server';
import { getUsuarioLogado } from '@/lib/auth';
import { mapOrderItems, serializeOrder } from '@/lib/orders';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const authUser = await getUsuarioLogado();
    if (!authUser) {
      return NextResponse.json({ error: 'Faça login para finalizar o pedido.' }, { status: 401 });
    }

    const body = await req.json();
    const { items, frete, cupom, endereco, telefone, cpf } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Carrinho vazio.' }, { status: 400 });
    }

    const mappedItems = mapOrderItems(items);
    const subtotal = Number(
      mappedItems
        .reduce((acc, it) => acc + it.preco * it.quantity, 0)
        .toFixed(2)
    );

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

    const freteNum = Number(frete) || 0;
    const total = Number(Math.max(0, subtotal - desconto + freteNum).toFixed(2));

    const order = await prisma.order.create({
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
        items: mappedItems,
        subtotal,
        desconto,
        total,
        cupomId,
        cupomCodigo,
        status: 'Pendente',
      },
    });

    if (cupomId) {
      await prisma.cupom.update({
        where: { id: cupomId },
        data: { usoTotal: { increment: 1 } },
      });
      await prisma.cupomUsado.create({
        data: { userId: authUser.id, cupomId },
      });
    }

    const serialized = serializeOrder(order);
    return NextResponse.json({
      ok: true,
      orderId: order.id,
      orderNumber: serialized.orderNumber,
      total,
    });
  } catch (e) {
    console.error('Erro ao criar pedido:', e);
    return NextResponse.json({ error: 'Erro ao criar pedido.' }, { status: 500 });
  }
}
