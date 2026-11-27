// app/api/affiliate/stats/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUsuarioLogado } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 🟢 1. Autenticação oficial usando a função nativa do projeto
    const authUser = await getUsuarioLogado();
    if (!authUser) {
      return NextResponse.json({ error: 'Não autorizado. Faça login primeiro.' }, { status: 401 });
    }

    // 🟢 2. Buscar usuário no Supabase
    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
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

    // 🔒 Checagem estrita de permissão
    if (!user || (!user.isAffiliate && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Acesso restrito a afiliados ativados.' }, { status: 403 });
    }

    const cupomCodigo = user.affiliateCoupon?.trim();

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

    // 🟢 3. Buscar pedidos filtrando estritamente pelo cupom (case-insensitive)
    const orders = await prisma.order.findMany({
      where: {
        cupomCodigo: {
          equals: cupomCodigo,
          mode: 'insensitive',
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // 🟢 4. Filtro flexível para aceitar qualquer variação de capitalização do status (Aprovado, aprovado, APROVADO, etc.)
    const pedidosValidos = orders.filter((o) => {
      const st = String(o.status || '').toLowerCase().trim();
      return ['aprovado', 'enviado', 'entregue', 'pago', 'completed', 'approved'].includes(st);
    });

    const totalVendasBruto = pedidosValidos.reduce((sum, o) => sum + Number(o.subtotal || o.total || 0), 0);
    const taxaComissao = user.comissaoPorcentagem || 20;
    const totalComissaoAcumulada = totalVendasBruto * (taxaComissao / 100);

    const vendasFormatadas = orders.map((o) => {
      const baseCalculo = Number(o.subtotal || o.total || 0);
      const valorComissaoCalculado = baseCalculo * (taxaComissao / 100);

      return {
        id: o.id,
        orderNumber: `BF-${String(o.id || '').slice(-8).toUpperCase()}`,
        data: o.createdAt,
        clienteNome: o.customerName || 'Cliente',
        customerEmail: o.customerEmail || '',
        items: o.items,
        subtotal: Number(o.subtotal || 0),
        desconto: Number(o.desconto || 0),
        total: Number(o.total || 0),
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
    return NextResponse.json({ error: 'Erro ao carregar estatísticas do afiliado.', detalhe: error?.message }, { status: 500 });
  }
}