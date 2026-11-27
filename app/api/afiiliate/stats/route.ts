// app/api/affiliate/stats/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // 🟢 No Next.js 15, cookies() retorna uma Promise e exige o uso de await
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

    // 1. Buscar usuário no Supabase
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

    // 🔒 CHECAGEM ESTRITA: Apenas usuários com isAffiliate marcado como TRUE (ou ADMIN) possuem acesso
    if (!user || (!user.isAffiliate && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Acesso restrito. Perfil não ativado como afiliado.' }, { status: 403 });
    }

    const cupomCodigo = user.affiliateCoupon;

    // Se o afiliado não tiver cupom vinculado ainda, retorna resposta zerada segura
    if (!cupomCodigo) {
      return NextResponse.json({
        ok: true,
        afiliado: {
          nome: user.nome,
          cupom: 'SEM_CUPOM_VINCULADO',
          porcentagemComissao: user.comissaoPorcentagem || 20,
          totalPedidos: 0,
          pedidosAprovadosCount: 0,
          totalVendasBruto: 0,
          totalComissaoAcumulada: 0,
        },
        vendas: [],
      });
    }

    // 2. Buscar pedidos no banco filtrando estritamente pelo cupom do afiliado
    const orders = await prisma.order.findMany({
      where: {
        cupomCodigo: {
          equals: cupomCodigo,
          mode: 'insensitive',
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // 3. Filtrar pedidos que geram comissão (Aprovado, Enviado, Entregue)
    const pedidosValidos = orders.filter((o) => ['Aprovado', 'Enviado', 'Entregue'].includes(o.status));
    const totalVendasBruto = pedidosValidos.reduce((sum, o) => sum + (o.subtotal || o.total), 0);

    const taxaComissao = user.comissaoPorcentagem || 20;

    // Comissão acumulada calculada de forma segura
    const totalComissaoAcumulada = pedidosValidos.reduce((sum, o) => {
      const baseCalculo = o.subtotal || o.total;
      return sum + (baseCalculo * (taxaComissao / 100));
    }, 0);

    const vendasFormatadas = orders.map((o) => {
      const baseCalculo = o.subtotal || o.total;
      const valorComissaoCalculado = baseCalculo * (taxaComissao / 100);

      return {
        id: o.id,
        orderNumber: `BF-${String(o.id || '').slice(-8).toUpperCase()}`,
        data: o.createdAt,
        clienteNome: o.customerName,
        customerEmail: o.customerEmail,
        items: o.items,
        subtotal: o.subtotal,
        desconto: o.desconto,
        total: o.total,
        status: o.status,
        cupomUsado: o.cupomCodigo || cupomCodigo,
        porcentagemComissao: taxaComissao,
        valorComissao: valorComissaoCalculado,
      };
    });

    return NextResponse.json({
      ok: true,
      afiliado: {
        nome: user.nome,
        cupom: cupomCodigo,
        porcentagemComissao: taxaComissao,
        totalPedidos: orders.length,
        pedidosAprovadosCount: pedidosValidos.length,
        totalVendasBruto,
        totalComissaoAcumulada,
      },
      vendas: vendasFormatadas,
    });
  } catch (error: any) {
    console.error('❌ Erro ao buscar estatísticas de afiliado:', error);
    return NextResponse.json({ error: 'Erro de conexão ao carregar painel de afiliado.', detalhe: error?.message }, { status: 500 });
  }
}