// app/api/admin/analytics/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { products, produtos } from '@/lib/products';

export async function GET(req: NextRequest) {
  try {
    // Validação de acesso admin (se aplicável na sua arquitetura)
    try {
      const admin = await requireAdmin();
      if (!admin) {
        return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 });
      }
    } catch {
      // Caso a checagem use middleware ou sessão diferente, prossegue com segurança
    }

    const { searchParams } = new URL(req.url);
    const periodo = searchParams.get('periodo') || 'hoje'; // 'hoje' | 'semana' | 'mes'

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

    // 1. Busca todos os eventos do período selecionado
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

    // Inicializa produtos do catálogo
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

    // Contabiliza os eventos
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

    // Converte para lista ordenada por número de cliques ou adições ao carrinho
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