// app/admin/metricas/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  MousePointer, 
  ShoppingBag, 
  TrendingUp, 
  Calendar, 
  RefreshCw, 
  Search,
  ArrowUpDown,
  Filter
} from 'lucide-react';

interface ProdutoMetrica {
  id: string;
  nome: string;
  cliques: number;
  adicionadosCarrinho: number;
  taxaConversaoCarrinho: number;
}

interface ResumoMetricas {
  visitasTotais: number;
  cliquesTotaisProdutos: number;
  adicionadosTotaisCarrinho: number;
  taxaConversaoGeral: number;
}

export default function AdminAnalyticsPage() {
  const [periodo, setPeriodo] = useState<'hoje' | 'semana' | 'mes'>('hoje');
  const [loading, setLoading] = useState(true);
  const [resumo, setResumo] = useState<ResumoMetricas>({
    visitasTotais: 0,
    cliquesTotaisProdutos: 0,
    adicionadosTotaisCarrinho: 0,
    taxaConversaoGeral: 0,
  });
  const [produtos, setProdutos] = useState<ProdutoMetrica[]>([]);
  const [busca, setBusca] = useState('');

  const carregarMetricas = async (p: 'hoje' | 'semana' | 'mes') => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/analytics?periodo=${p}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setResumo(data.resumo);
          setProdutos(data.produtos);
        }
      }
    } catch (err) {
      console.error('Erro ao carregar analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarMetricas(periodo);
  }, [periodo]);

  const produtosFiltrados = produtos.filter(prod => 
    prod.nome.toLowerCase().includes(busca.toLowerCase()) || 
    prod.id.includes(busca)
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#0f172a', padding: '30px 24px', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        
        {/* Cabeçalho */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <TrendingUp color="#16a34a" size={28} /> Painel de Desempenho & Métricas estilo Shopee
            </h1>
            <p style={{ fontSize: 13.5, color: '#64748b', margin: 0 }}>
              Acompanhe o tráfego do site, engajamento por produto e intenção de compra em tempo real.
            </p>
          </div>

          {/* Seletor de Período */}
          <div style={{ display: 'flex', alignItems: 'center', background: 'white', border: '1px solid #e2e8f0', borderRadius: 12, padding: 4, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <button
              onClick={() => setPeriodo('hoje')}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: 'none',
                background: periodo === 'hoje' ? '#16a34a' : 'transparent',
                color: periodo === 'hoje' ? 'white' : '#64748b',
                fontWeight: 800,
                fontSize: 13,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              📅 Hoje
            </button>
            <button
              onClick={() => setPeriodo('semana')}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: 'none',
                background: periodo === 'semana' ? '#16a34a' : 'transparent',
                color: periodo === 'semana' ? 'white' : '#64748b',
                fontWeight: 800,
                fontSize: 13,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              🗓️ Esta Semana
            </button>
            <button
              onClick={() => setPeriodo('mes')}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: 'none',
                background: periodo === 'mes' ? '#16a34a' : 'transparent',
                color: periodo === 'mes' ? 'white' : '#64748b',
                fontWeight: 800,
                fontSize: 13,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              📊 Este Mês
            </button>
          </div>
        </div>

        {/* CARDS DE DASHBOARD RESUMO */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 32 }}>
          
          {/* Card Visitas */}
          <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 16, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#64748b' }}>Visitas ao Site</span>
              <div style={{ background: '#f0fdf4', padding: 8, borderRadius: 10 }}>
                <Eye size={20} color="#16a34a" />
              </div>
            </div>
            <div style={{ fontSize: 26, fontWeight: 900, color: '#0f172a' }}>
              {loading ? '...' : resumo.visitasTotais.toLocaleString('pt-BR')}
            </div>
            <span style={{ fontSize: 11.5, color: '#16a34a', fontWeight: 700, marginTop: 4, display: 'block' }}>
              Acessos de visitantes únicos
            </span>
          </div>

          {/* Card Cliques em Produtos */}
          <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 16, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#64748b' }}>Visualizações de Produtos</span>
              <div style={{ background: '#eff6ff', padding: 8, borderRadius: 10 }}>
                <MousePointer size={20} color="#2563eb" />
              </div>
            </div>
            <div style={{ fontSize: 26, fontWeight: 900, color: '#0f172a' }}>
              {loading ? '...' : resumo.cliquesTotaisProdutos.toLocaleString('pt-BR')}
            </div>
            <span style={{ fontSize: 11.5, color: '#2563eb', fontWeight: 700, marginTop: 4, display: 'block' }}>
              Cliques em páginas de produtos
            </span>
          </div>

          {/* Card Adicionados ao Carrinho */}
          <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 16, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#64748b' }}>Adicionados ao Carrinho</span>
              <div style={{ background: '#fffbeb', padding: 8, borderRadius: 10 }}>
                <ShoppingBag size={20} color="#d97706" />
              </div>
            </div>
            <div style={{ fontSize: 26, fontWeight: 900, color: '#0f172a' }}>
              {loading ? '...' : resumo.adicionadosTotaisCarrinho.toLocaleString('pt-BR')}
            </div>
            <span style={{ fontSize: 11.5, color: '#d97706', fontWeight: 700, marginTop: 4, display: 'block' }}>
              Intenção clara de compra
            </span>
          </div>

          {/* Card Taxa de Conversão */}
          <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 16, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#64748b' }}>Retenção Visita ➔ Carrinho</span>
              <div style={{ background: '#f3e8ff', padding: 8, borderRadius: 10 }}>
                <TrendingUp size={20} color="#9333ea" />
              </div>
            </div>
            <div style={{ fontSize: 26, fontWeight: 900, color: '#0f172a' }}>
              {loading ? '...' : `${resumo.taxaConversaoGeral}%`}
            </div>
            <span style={{ fontSize: 11.5, color: '#9333ea', fontWeight: 700, marginTop: 4, display: 'block' }}>
              Visitantes que adicionaram itens
            </span>
          </div>

        </div>

        {/* TABELA DE PRODUTOS estilo Shopee */}
        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 20, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <h2 style={{ fontSize: 16, fontWeight: 900, color: '#0f172a', margin: 0 }}>
              Ranking de Desempenho por Produto ({produtosFiltrados.length})
            </h2>

            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ position: 'relative' }}>
                <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: 12, top: 11 }} />
                <input 
                  type="text" 
                  placeholder="Buscar produto por nome ou ID..." 
                  value={busca}
                  onChange={e => setBusca(e.target.value)}
                  style={{ padding: '8px 12px 8px 36px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 13, outline: 'none', width: 260 }}
                />
              </div>

              <button 
                onClick={() => carregarMetricas(periodo)} 
                style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: 10, padding: '8px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 13 }}
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Atualizar
              </button>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 800 }}>Produto</th>
                  <th style={{ padding: '12px 16px', fontWeight: 800, textAlign: 'center' }}>Cliques (Visualizações)</th>
                  <th style={{ padding: '12px 16px', fontWeight: 800, textAlign: 'center' }}>Adicionados ao Carrinho</th>
                  <th style={{ padding: '12px 16px', fontWeight: 800, textAlign: 'center' }}>Taxa de Retenção (%)</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: 40, color: '#94a3b8', fontWeight: 600 }}>
                      Carregando métricas do banco de dados...
                    </td>
                  </tr>
                ) : produtosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: 40, color: '#94a3b8', fontWeight: 600 }}>
                      Nenhum produto com acessos gravados neste período.
                    </td>
                  </tr>
                ) : (
                  produtosFiltrados.map((item, idx) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? 'white' : '#fafafa' }}>
                      
                      {/* Nome do Produto */}
                      <td style={{ padding: '14px 16px', fontWeight: 800, color: '#0f172a' }}>
                        {item.nome}
                        <span style={{ display: 'block', fontSize: 11, color: '#94a3b8', fontWeight: 500, marginTop: 2 }}>
                          ID: {item.id}
                        </span>
                      </td>

                      {/* Cliques */}
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '4px 12px', borderRadius: 999, fontWeight: 800, fontSize: 13 }}>
                          {item.cliques}
                        </span>
                      </td>

                      {/* Adicionados ao Carrinho */}
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <span style={{ background: '#fef3c7', color: '#b45309', padding: '4px 12px', borderRadius: 999, fontWeight: 800, fontSize: 13 }}>
                          {item.adicionadosCarrinho}
                        </span>
                      </td>

                      {/* Taxa de Retenção com Barra Visual */}
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                          <div style={{ width: 80, height: 8, background: '#e2e8f0', borderRadius: 999, overflow: 'hidden' }}>
                            <div 
                              style={{ 
                                width: `${Math.min(100, item.taxaConversaoCarrinho)}%`, 
                                height: '100%', 
                                background: item.taxaConversaoCarrinho > 20 ? '#16a34a' : (item.taxaConversaoCarrinho > 5 ? '#eab308' : '#64748b'),
                                borderRadius: 999 
                              }} 
                            />
                          </div>
                          <span style={{ fontWeight: 800, color: '#0f172a', width: 45 }}>
                            {item.taxaConversaoCarrinho}%
                          </span>
                        </div>
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>

      </div>
    </div>
  );
}