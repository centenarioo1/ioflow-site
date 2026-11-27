// app/api/analytics/track/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || !body.type) {
      return NextResponse.json({ error: 'Tipo de evento inválido.' }, { status: 400 });
    }

    const { type, productId, productName, sessionId } = body;

    await prisma.analyticsEvent.create({
      data: {
        type: String(type).toUpperCase(), // 'VISIT' | 'PRODUCT_CLICK' | 'ADD_TO_CART'
        productId: productId ? String(productId) : null,
        productName: productName ? String(productName) : null,
        sessionId: sessionId ? String(sessionId) : null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.warn('⚠️ Erro ao registrar evento de analytics:', error);
    return NextResponse.json({ error: 'Falha ao registrar métrica.' }, { status: 500 });
  }
}