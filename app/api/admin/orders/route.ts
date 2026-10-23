import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { serializeOrder } from '@/lib/orders';

// GET: Lista todos os pedidos cadastrados (Admin)
export async function GET() {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 });
    }

    const dbOrders = await prisma.order.findMany({
      include: {
        user: {
          select: { nome: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // CORREÇÃO: Adicionado (order: any) para resolver o erro de "implicit any"
    const formattedOrders = dbOrders.map((order: any) => serializeOrder(order));

    return NextResponse.json({ orders: formattedOrders });
  } catch (error) {
    console.error('Erro no painel admin:', error);
    return NextResponse.json({ error: 'Erro ao carregar pedidos.' }, { status: 500 });
  }
}

// PATCH: Suporta atualizações de status vindas de telas que mandam o body unificado
export async function PATCH(req: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 });
    }

    const { orderId, status } = await req.json();

    if (!orderId || !status) {
      return NextResponse.json({ error: 'ID do pedido e status são obrigatórios.' }, { status: 400 });
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { status }
    });

    return NextResponse.json({ success: true, order: updated });
  } catch (error) {
    console.error('Erro ao atualizar status do pedido (Admin):', error);
    return NextResponse.json({ error: 'Erro interno ao atualizar.' }, { status: 500 });
  }
}