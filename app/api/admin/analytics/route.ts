// app/api/admin/analytics/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUsuarioLogado } from '@/lib/auth';
import { products, produtos } from '@/lib/products';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // 🔒 Trava Estrita de Acesso Admin
    const authUser = await getUsuarioLogado();
    if (!authUser) {
      return NextResponse.json({ error: 'Não autorizado. Faça login primeiro.' }, { status: 401 });
    }

    const adminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
    const isAdmin = authUser.role === 'ADMIN' || (adminEmail && authUser.email?.toLowerCase() === adminEmail);

    if (!isAdmin) {
      return NextResponse.json({ error: 'Acesso negado. Rota restrita ao administrador.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const periodo = searchParams.get('periodo') || 'hoje';

    const agora = new Date();
    let dataInicio = new Date();

    if (periodo === 'hoje') {
      dataInicio.setHours(0, 0, 0, 0);
    } else if (periodo === 'semana') {
      dataInicio.setDate(agora.getDate() - 7);
      dataInicio.setHours(0, 0, 0, 0);
    } else if (periodo === 'mes') {
      dataInicio.setDate(agora.getDate() - 30);
      dataInicio.setHours(0, 0, 0, 0);
    }

    // 1. Busca eventos na tabela AnalyticsEvent
    const eventos = await prisma.analyticsEvent.findMany({
      where: {
        createdAt: {
          gte: dataInicio,
        },
      },
    });

    // 2. Calcula métricas gerais
    const visitasTotais = eventos.filter(e => e.type === 'VISIT').length;
    const cliquesTotaisProdutos = eventos.filter(e => e.type === 'PRODUCT_CLICK').length;
    const adicionadosTotaisCarrinho = eventos.filter(e => e.type === 'ADD_TO_CART').length;

    // 3. Agrupa métricas por produto
    const catalogo = (products || produtos || []) as any[];
    const produtoMap: Record<string, { id: string; nome: string; cliques: number; adicionadosCarrinho: number }> = {};

    for (const prod of catalogo) {
      const prodId = String(prod.id);
      const prodNome = String(prod.name || prod.nome || 'Produto Bioflow');
      produtoMap[prodId] = {
        id: prodId,
        nome: prodNome,
        cliques: 0,
        adicionadosCarrinho: 0,
      };
    }

    for (const evento of eventos) {
      if (!evento.productId) continue;
      const pId = String(evento.productId);

      if (!produtoMap[pId]) {
        produtoMap[pId] = {
          id: pId,
          nome: evento.productName || `Produto (${pId})`,
          cliques: 0,
          adicionadosCarrinho: 0,
        };
      }

      if (evento.type === 'PRODUCT_CLICK') {
        produtoMap[pId].cliques += 1;
      } else if (evento.type === 'ADD_TO_CART') {
        produtoMap[pId].adicionadosCarrinho += 1;
      }
    }

    const listaProdutos = Object.values(produtoMap)
      .map(p => {
        const taxaConversaoCarrinho = p.cliques > 0 
          ? Number(((p.adicionadosCarrinho / p.cliques) * 100).toFixed(1)) 
          : 0;
        return {
          ...p,
          taxaConversaoCarrinho,
        };
      })
      .sort((a, b) => b.cliques - a.cliques || b.adicionadosCarrinho - a.adicionadosCarrinho);

    return NextResponse.json({
      success: true,
      periodo,
      resumo: {
        visitasTotais,
        cliquesTotaisProdutos,
        adicionadosTotaisCarrinho,
        taxaConversaoGeral: visitasTotais > 0 
          ? Number(((adicionadosTotaisCarrinho / visitasTotais) * 100).toFixed(1)) 
          : 0,
      },
      produtos: listaProdutos,
    });
  } catch (error: any) {
    console.error('❌ Erro ao buscar métricas de analytics:', error);
    return NextResponse.json({ error: 'Erro interno ao carregar relatório.' }, { status: 500 });
  }
}
