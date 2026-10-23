import { NextResponse } from 'next/server';
import { getUserIdFromCookies } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { serializeOrder } from '@/lib/orders';

export async function GET() {
  try {
    // Obtém o ID do usuário autenticado a partir do cookie assinado
    const userId = await getUserIdFromCookies();

    if (!userId) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    // Busca os pedidos do PostgreSQL vinculados a esse ID
    const dbOrders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    // Formata os itens JSON e metadados estruturados
    // @ts-ignore: Ignorando a tipagem estrita do Prisma neste map
    const formattedOrders = dbOrders.map((order: any) => serializeOrder(order));

    return NextResponse.json({ orders: formattedOrders });
  } catch (error) {
    console.error('Erro ao buscar pedidos do usuário:', error);
    return NextResponse.json({ error: 'Erro ao carregar pedidos.' }, { status: 500 });
  }
}