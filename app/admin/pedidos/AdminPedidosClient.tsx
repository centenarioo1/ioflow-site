import Link from 'next/link';
import { ListOrdered, Layers, Plus, TrendingUp } from 'lucide-react';

{/* BARRA DE NAVEGAÇÃO POR ABAS NO TOPO DO ADMIN (100% SEM TAILWIND) */}
<div style={{
  background: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '16px',
  padding: '12px',
  display: 'flex',
  flexWrap: 'wrap',
  gap: '10px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  marginBottom: '24px'
}}>
  <button
    type="button"
    onClick={() => setAbaAtiva('pedidos')}
    style={{
      flex: '1 1 160px',
      padding: '12px 16px',
      borderRadius: '10px',
      border: 'none',
      background: abaAtiva === 'pedidos' ? '#0d2410' : '#f8fafc',
      color: abaAtiva === 'pedidos' ? '#ffffff' : '#475569',
      fontWeight: 800,
      fontSize: '13px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px'
    }}
  >
    <ListOrdered size={16} /> Gestão de Pedidos ({orders.length})
  </button>

  <button
    type="button"
    onClick={() => setAbaAtiva('gerenciar-produtos')}
    style={{
      flex: '1 1 160px',
      padding: '12px 16px',
      borderRadius: '10px',
      border: 'none',
      background: abaAtiva === 'gerenciar-produtos' ? '#0d2410' : '#f8fafc',
      color: abaAtiva === 'gerenciar-produtos' ? '#ffffff' : '#475569',
      fontWeight: 800,
      fontSize: '13px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px'
    }}
  >
    <Layers size={16} /> Gerenciar / Remover Produtos
  </button>

  <button
    type="button"
    onClick={() => setAbaAtiva('novo-produto')}
    style={{
      flex: '1 1 160px',
      padding: '12px 16px',
      borderRadius: '10px',
      border: 'none',
      background: abaAtiva === 'novo-produto' ? '#0d2410' : '#f8fafc',
      color: abaAtiva === 'novo-produto' ? '#ffffff' : '#475569',
      fontWeight: 800,
      fontSize: '13px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px'
    }}
  >
    <Plus size={16} /> Cadastrar Novo Produto
  </button>

  {/* 🟢 BOTÃO DE MÉTRICAS (ESTILO INLINE PURO) */}
  <Link
    href="/admin/metricas"
    style={{
      flex: '1 1 160px',
      padding: '12px 16px',
      borderRadius: '10px',
      border: '1px solid #bbf7d0',
      background: '#f0fdf4',
      color: '#15803d',
      fontWeight: 800,
      fontSize: '13px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      textDecoration: 'none'
    }}
  >
    <TrendingUp size={16} color="#15803d" /> Métricas & Desempenho (Shopee)
  </Link>
</div>