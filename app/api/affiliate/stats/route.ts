// app/api/affiliate/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUsuarioLogado } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Autenticação oficial do usuário logado
    const authUser = await getUsuarioLogado();
    if (!authUser) {
      return NextResponse.json({ error: 'Não autorizado. Faça login primeiro.' }, { status: 401 });
    }

    // 2. Busca o perfil atualizado do usuário no Supabase
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

    // 🔒 Trava de segurança: Apenas afiliados ativos (isAffiliate === true) ou Admin
    if (!user || (!user.isAffiliate && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Acesso restrito a afiliados ativados.' }, { status: 403 });
    }

    const cupomDoAfiliado = user.affiliateCoupon?.trim();

    // Se o afiliado não tiver cupom configurado, retorna lista vazia
    if (!cupomDoAfiliado) {
      return NextResponse.json({
        ok: true,
        afiliado: {
          nome: user.nome,
          cupom: 'NENHUM_CUPOM_CONFIGURADO',
          porcentagemComissao: user.comissaoPorcentagem || 20,
          totalPedidos: 0,
          pedidosAprovadosCount: 0,
          totalVendasBruto: 0,
          totalComissaoAcumulada: 0,
        },
        vendas: [],
      });
    }

    // 3. Busca no banco APENAS os pedidos que usaram estritamente o cupom do afiliado
    const orders = await prisma.order.findMany({
      where: {
        cupomCodigo: {
          equals: cupomDoAfiliado,
          mode: 'insensitive',
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // 4. Filtra estritamente apenas os pedidos confirmados/pagos COM O CUPOM EXATO do afiliado
    const pedidosValidos = orders.filter((o) => {
      const st = String(o.status || '').toLowerCase().trim();
      const usaCupomCorreto = String(o.cupomCodigo || '').trim().toLowerCase() === cupomDoAfiliado.toLowerCase();
      const statusAprovado = ['aprovado', 'enviado', 'entregue', 'pago', 'completed', 'approved'].includes(st);
      return usaCupomCorreto && statusAprovado;
    });

    const totalVendasBruto = pedidosValidos.reduce((sum, o) => sum + Number(o.subtotal || o.total || 0), 0);
    const taxaComissao = user.comissaoPorcentagem || 20;
    const totalComissaoAcumulada = totalVendasBruto * (taxaComissao / 100);

    const vendasFormatadas = pedidosValidos.map((o) => {
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
        cupomUsado: o.cupomCodigo || cupomDoAfiliado,
        porcentagemComissao: taxaComissao,
        valorComissao: valorComissaoCalculado,
      };
    });

    return NextResponse.json({
      ok: true,
      afiliado: {
        nome: user.nome,
        cupom: cupomDoAfiliado,
        porcentagemComissao: taxaComissao,
        totalPedidos: vendasFormatadas.length,
        pedidosAprovadosCount: vendasFormatadas.length,
        totalVendasBruto,
        totalComissaoAcumulada,
      },
      vendas: vendasFormatadas,
    });
  } catch (error: any) {
    console.error('❌ Erro na API do afiliado:', error);
    return NextResponse.json({ error: 'Erro ao carregar estatísticas do afiliado.', detalhe: error?.message }, { status: 500 });
  }
}