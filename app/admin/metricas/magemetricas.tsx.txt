// app/admin/metricas/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Eye, 
  MousePointer, 
  ShoppingBag, 
  TrendingUp, 
  Calendar, 
  RefreshCw, 
  Search,
  ShieldCheck,
  LogOut,
  ListOrdered,
  Layers,
  Plus,
  AlertTriangle
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
  const router = useRouter();
  const [periodo, setPeriodo] = useState<'hoje' | 'semana' | 'mes'>('hoje');
  const [loading, setLoading] = useState(true);
  const [acessoNegado, setAcessoNegado] = useState(false);
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
    setAcessoNegado(false);
    try {
      const res = await fetch(`/api/admin/analytics?periodo=${p}`);
      if (res.status === 401 || res.status === 403) {
        setAcessoNegado(true);
        setTimeout(() => {
          router.push('/login?redirect=/admin/metricas');
        }, 2000);
        return;
      }
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setResumo(data.resumo);
          setProdutos(data.produtos);
        } else {
          setAcessoNegado(true);
        }
      } else {
        setAcessoNegado(true);
      }
    } catch (err) {
      console.error('Erro ao carregar analytics:', err);
      setAcessoNegado(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarMetricas(periodo);
  }, [periodo]);

  const sair = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    localStorage.removeItem('user_session');
    router.push('/login');
  };

  const produtosFiltrados = produtos.filter(prod => 
    prod.nome.toLowerCase().includes(busca.toLowerCase()) || 
    prod.id.includes(busca)
  );

  if (acessoNegado) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: "'Inter', sans-serif" }}>
        <div style={{ background: 'white', border: '1px solid #fca5a5', borderRadius: 20, padding: 32, maxWidth: 450, textAlign: 'center', boxShadow: '0 4px 20px rgba(239, 68, 68, 0.1)' }}>
          <AlertTriangle size={48} color="#dc2626" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: 20, fontWeight: 900, color: '#991b1b', marginBottom: 8 }}>Acesso Restrito ao Administrador</h2>
          <p style={{ fontSize: 13.5, color: '#4b5563', lineHeight: 1.5, marginBottom: 20 }}>
            Sua conta atual não possui privilégios de administrador para visualizar o painel de métricas.
          </p>
          <p style={{ fontSize: 12, color: '#9ca3af' }}>Redirecionando para o login...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#0f172a', fontFamily: "'Inter', sans-serif" }}>
      
      {/* Topo Admin */}
      <header style={{ background: '#0d2410', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ShieldCheck size={20} color="#d4a843" />
          <span style={{ color: 'white', fontWeight: 900, fontSize: 16 }}>
            BIOFLOW <span style={{ color: '#d4a843' }}>Admin Métricas</span>
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            onClick={() => carregarMetricas(periodo)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Atualizar
          </button>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 800, textDecoration: 'none' }}>
            Ver Loja
          </Link>
          <button
            type="button"
            onClick={sair}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#dc2626', color: 'white', border: 'none', borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}
          >
            <LogOut size={13} /> Sair
          </button>
        </div>
      </header>

      {/* Navegação por Abas Unificada do Admin */}
      <div style={{ background: 'white', borderBottom: '1px solid #e2e8f0', padding: '0 20px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <Link
            href="/admin"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '14px 4px',
              color: '#64748b',
              fontWeight: 800,
              fontSize: 14,
              textDecoration: 'none',
              borderBottom: '3px solid transparent'
            }}
          >
            <ListOrdered size={16} /> Gestão de Pedidos
          </Link>

          <Link
            href="/admin"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '14px 4px',
              color: '#64748b',
              fontWeight: 800,
              fontSize: 14,
              textDecoration: 'none',
              borderBottom: '3px solid transparent'
            }}
          >
            <Layers size={16} /> Gerenciar Produtos
          </Link>

          <Link
            href="/admin/metricas"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '14px 4px',
              color: '#16a34a',
              fontWeight: 900,
              fontSize: 14,
              textDecoration: 'none',
              borderBottom: '3px solid #16a34a'
            }}
          >
            <TrendingUp size={16} color="#16a34a" /> 📊 Métricas & Desempenho (Shopee)
          </Link>
        </div>
      </div>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '30px 20px 80px' }}>
        
        {/* Cabeçalho */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <TrendingUp color="#16a34a" size={28} /> Painel de Desempenho & Métricas
            </h1>
            <p style={{ fontSize: 13.5, color: '#64748b', margin: 0 }}>
              Acompanhe tráfego, cliques por produto e intenção de compra em tempo real.
            </p>
          </div>

          {/* Seletor de Período */}
          <div style={{ display: 'flex', alignItems: 'center', background: 'white', border: '1px solid #e2e8f0', borderRadius: 12, padding: 4, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <button
              type="button"
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
              type="button"
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
              type="button"
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

        {/* CARDS DE RESUMO GERAL */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 32 }}>
          
          {/* Card Visitas Totais */}
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#64748b' }}>Visitas ao Site</span>
              <div style={{ background: '#f0fdf4', padding: 8, borderRadius: 10 }}>
                <Eye size={20} color="#16a34a" />
              </div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#0f172a' }}>
              {loading ? '...' : resumo.visitasTotais.toLocaleString('pt-BR')}
            </div>
            <span style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 4, display: 'block' }}>
              Páginas acessadas no período
            </span>
          </div>

          {/* Card Cliques em Produtos */}
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#64748b' }}>Cliques em Produtos</span>
              <div style={{ background: '#eff6ff', padding: 8, borderRadius: 10 }}>
                <MousePointer size={20} color="#2563eb" />
              </div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#0f172a' }}>
              {loading ? '...' : resumo.cliquesTotaisProdutos.toLocaleString('pt-BR')}
            </div>
            <span style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 4, display: 'block' }}>
              Acessos às páginas de produtos
            </span>
          </div>

          {/* Card Adicionados ao Carrinho */}
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#64748b' }}>Adicionados ao Carrinho</span>
              <div style={{ background: '#fef3c7', padding: 8, borderRadius: 10 }}>
                <ShoppingBag size={20} color="#d97706" />
              </div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#0f172a' }}>
              {loading ? '...' : resumo.adicionadosTotaisCarrinho.toLocaleString('pt-BR')}
            </div>
            <span style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 4, display: 'block' }}>
              Intenção real de compra
            </span>
          </div>

          {/* Card Taxa de Conversão */}
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#64748b' }}>Conversão para Carrinho</span>
              <div style={{ background: '#f3e8ff', padding: 8, borderRadius: 10 }}>
                <TrendingUp size={20} color="#9333ea" />
              </div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#0f172a' }}>
              {loading ? '...' : `${resumo.taxaConversaoGeral}%`}
            </div>
            <span style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 4, display: 'block' }}>
              Visitas que adicionaram itens
            </span>
          </div>

        </div>

        {/* TABELA DE DESEMPENHO POR PRODUTO */}
        <div style={{ background: 'white', borderRadius: 20, border: '1px solid #e2e8f0', padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <h2 style={{ fontSize: 17, fontWeight: 900, color: '#0f172a', margin: 0 }}>
              📦 Índices Detalhados por Produto ({produtosFiltrados.length})
            </h2>

            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: 12, top: 10 }} />
                <input
                  type="text"
                  placeholder="Buscar produto..."
                  value={busca}
                  onChange={e => setBusca(e.target.value)}
                  style={{
                    padding: '8px 12px 8px 36px',
                    borderRadius: 10,
                    border: '1px solid #cbd5e1',
                    fontSize: 13,
                    outline: 'none',
                    width: 220,
                  }}
                />
              </div>

              <button
                type="button"
                onClick={() => carregarMetricas(periodo)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: 10,
                  padding: '8px 12px',
                  color: '#475569',
                  fontWeight: 700,
                  fontSize: 12.5,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Atualizar
              </button>
            </div>
          </div>

          {/* TABELA */}
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
                      <td style={{ padding: '14px 16px', fontWeight: 800, color: '#0f172a' }}>
                        {item.nome}
                        <span style={{ display: 'block', fontSize: 11, color: '#94a3b8', fontWeight: 500, marginTop: 2 }}>
                          ID: {item.id}
                        </span>
                      </td>

                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '4px 12px', borderRadius: 999, fontWeight: 800, fontSize: 13 }}>
                          {item.cliques}
                        </span>
                      </td>

                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <span style={{ background: '#fef3c7', color: '#b45309', padding: '4px 12px', borderRadius: 999, fontWeight: 800, fontSize: 13 }}>
                          {item.adicionadosCarrinho}
                        </span>
                      </td>

                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <span style={{ background: item.taxaConversaoCarrinho > 10 ? '#dcfce7' : '#f1f5f9', color: item.taxaConversaoCarrinho > 10 ? '#15803d' : '#64748b', padding: '4px 12px', borderRadius: 999, fontWeight: 800, fontSize: 13 }}>
                          {item.taxaConversaoCarrinho}%
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>

      </main>
    </div>
  );
}