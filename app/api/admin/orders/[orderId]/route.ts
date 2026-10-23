import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: NextRequest, 
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 });
    }

    const { orderId } = await params;
    const body = await req.json();
    const { status, trackingCode } = body;

    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (trackingCode !== undefined) updateData.trackingCode = trackingCode;

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
    });

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error('Erro ao atualizar pedido dinâmico:', error);
    return NextResponse.json({ error: 'Erro ao atualizar dados.' }, { status: 500 });
  }
}