// app/api/affiliate/stats/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // 🟢 No Next.js 15, cookies() é assíncrono (Promise) e exige 'await'
    const cookieStore = await cookies();
    const userSession = cookieStore.get('user_session')?.value;
    
    if (!userSession) {
      return NextResponse.json({ error: 'Não autorizado. Faça login primeiro.' }, { status: 401 });
    }

    let userId = '';
    try {
      userId = JSON.parse(userSession).id;
    } catch {
      userId = userSession;
    }

    // 1. Buscar usuário e checar permissão de Afiliado
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        isAffiliate: true,
        affiliateCoupon: true,
        comissaoPorcentagem: true,
      },
    });

    if (!user || (!user.isAffiliate && user.role !== 'AFFILIATE' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Acesso restrito a afiliados.' }, { status: 403 });
    }

    const cupomCodigo = user.affiliateCoupon;

    // 2. Buscar pedidos vinculados ao ID do Afiliado OU ao cupom dele
    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { afiliadoId: user.id },
          ...(cupomCodigo ? [{ cupomCodigo: { equals: cupomCodigo, mode: 'insensitive' as const } }] : []),
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    // 3. Filtrar pedidos que geram comissão (Aprovado, Enviado, Entregue)
    const pedidosValidos = orders.filter((o) => ['Aprovado', 'Enviado', 'Entregue'].includes(o.status));
    const totalVendasBruto = pedidosValidos.reduce((sum, o) => sum + (o.subtotal || o.total), 0);
    
    // Comissão acumulada
    const totalComissaoAcumulada = pedidosValidos.reduce((sum, o) => {
      if (o.valorComissao && o.valorComissao > 0) return sum + o.valorComissao;
      const taxa = o.porcentagemComissao || user.comissaoPorcentagem || 10;
      const baseCalculo = o.subtotal || o.total;
      return sum + (baseCalculo * (taxa / 100));
    }, 0);

    const vendasFormatadas = orders.map((o) => {
      const taxa = o.porcentagemComissao || user.comissaoPorcentagem || 10;
      const baseCalculo = o.subtotal || o.total;
      const valorComissaoCalculado = (o.valorComissao && o.valorComissao > 0)
        ? o.valorComissao 
        : (baseCalculo * (taxa / 100));

      return {
        id: o.id,
        orderNumber: o.id.slice(-6).toUpperCase(),
        data: o.createdAt,
        clienteNome: o.customerName,
        customerEmail: o.customerEmail,
        items: o.items,
        subtotal: o.subtotal,
        desconto: o.desconto,
        total: o.total,
        status: o.status,
        cupomUsado: o.cupomCodigo || cupomCodigo || 'N/A',
        porcentagemComissao: taxa,
        valorComissao: valorComissaoCalculado,
      };
    });

    return NextResponse.json({
      ok: true,
      afiliado: {
        nome: user.nome,
        cupom: cupomCodigo || 'SEM_CUPOM',
        porcentagemComissao: user.comissaoPorcentagem,
        totalPedidos: orders.length,
        pedidosAprovadosCount: pedidosValidos.length,
        totalVendasBruto,
        totalComissaoAcumulada,
      },
      vendas: vendasFormatadas,
    });
  } catch (error: any) {
    console.error('Erro ao buscar estatísticas de afiliado:', error);
    return NextResponse.json({ error: 'Erro de conexão ao carregar painel de afiliado.' }, { status: 500 });
  }
}
