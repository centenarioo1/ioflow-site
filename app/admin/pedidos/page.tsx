// app/admin/page.tsx
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Package, RefreshCw, LogOut, ShieldCheck } from 'lucide-react';

interface AdminOrder {
  id: string;
  orderNumber: string;
  items: { produtoId: string; nome: string; variacao?: string; preco: number; quantity: number }[];
  subtotal: number;
  frete: number;
  cupom?: string;
  desconto: number;
  total: number;
  status: string;
  trackingCode?: string;
  endereco?: { cep: string };
  createdAt: string;
  cliente: { nome: string; email: string };
}

const STATUS_OPCOES = ['Pendente', 'Aprovado', 'Enviado', 'Entregue', 'Cancelado', 'Reembolsado'];

const STATUS_CORES: Record<string, { bg: string; cor: string }> = {
  Pendente: { bg: '#fef3c7', cor: '#92400e' },
  Aprovado: { bg: '#dcfce7', cor: '#166534' },
  Enviado: { bg: '#dbeafe', cor: '#1e40af' },
  Entregue: { bg: '#d1fae5', cor: '#065f46' },
  Cancelado: { bg: '#fee2e2', cor: '#991b1b' },
  Reembolsado: { bg: '#f3e8ff', cor: '#6b21a8' },
};

const fmt = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`;

export default function AdminPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [salvandoId, setSalvandoId] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro('');
    try {
      const res = await fetch('/api/admin/orders');
      if (res.status === 401 || res.status === 403) {
        router.push('/login?redirect=/admin');
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        setErro(data.error || 'Erro ao carregar pedidos.');
        return;
      }
      setOrders(data.orders || []);
    } catch {
      setErro('Erro de conexão.');
    } finally {
      setCarregando(false);
    }
  }, [router]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const mudarStatus = async (orderId: string, status: string) => {
    setSalvandoId(orderId);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status }),
      });
      const data = await res.json();
      if (res.ok) {
        setOrders(prev => prev.map(o => (o.id === orderId ? { ...o, status } : o)));
      } else {
        setErro(data.error || 'Erro ao atualizar status.');
      }
    } catch {
      setErro('Erro de conexão ao atualizar status.');
    } finally {
      setSalvandoId(null);
    }
  };

  const sair = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    localStorage.removeItem('user_session');
    router.push('/login');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f7f4ee', fontFamily: "'Inter', sans-serif" }}>
      {/* Topo */}
      <header style={{ background: '#0d2410', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ShieldCheck size={20} color="#d4a843" />
          <span style={{ color: 'white', fontWeight: 900, fontSize: 16 }}>
            BIOFLOW <span style={{ color: '#d4a843' }}>Admin</span>
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={carregar}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}
          >
            <RefreshCw size={13} /> Atualizar
          </button>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 800, textDecoration: 'none' }}>
            Ver Loja
          </Link>
          <button
            onClick={sair}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#dc2626', color: 'white', border: 'none', borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}
          >
            <LogOut size={13} /> Sair
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 20px 80px' }}>
        <h1 style={{ fontSize: 22, fontWeight: 900, color: '#111827', margin: '0 0 4px' }}>Pedidos da Loja</h1>
        <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 20px' }}>
          {orders.length} pedido{orders.length !== 1 ? 's' : ''} no total
        </p>

        {erro && (
          <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '10px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
            {erro}
          </div>
        )}

        {carregando ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <Loader2 size={32} className="animate-spin" color="#15803d" style={{ margin: '0 auto' }} />
          </div>
        ) : orders.length === 0 ? (
          <div style={{ background: 'white', borderRadius: 14, padding: '50px 20px', textAlign: 'center', border: '1px solid #e7e2d6' }}>
            <Package size={40} color="#9ca3af" style={{ margin: '0 auto 10px' }} />
            <p style={{ fontSize: 14, color: '#6b7280' }}>Nenhum pedido ainda. Faça um pedido de teste na loja.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {orders.map(order => {
              const cor = STATUS_CORES[order.status] || STATUS_CORES.Pendente;
              return (
                <div key={order.id} style={{ background: 'white', borderRadius: 14, border: '1px solid #e7e2d6', padding: 18 }}>
                  {/* Cabeçalho do pedido */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
                    <div>
                      <span style={{ fontSize: 15, fontWeight: 900, color: '#111827' }}>
                        Pedido {order.orderNumber}
                      </span>
                      <p style={{ fontSize: 12, color: '#6b7280', margin: '2px 0 0' }}>
                        {new Date(order.createdAt).toLocaleString('pt-BR')} · {order.cliente.nome} ({order.cliente.email})
                        {order.endereco?.cep && ` · CEP ${order.endereco.cep}`}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ background: cor.bg, color: cor.cor, fontSize: 11, fontWeight: 900, padding: '4px 10px', borderRadius: 999 }}>
                        {order.status}
                      </span>
                      <select
                        value={order.status}
                        disabled={salvandoId === order.id}
                        onChange={e => mudarStatus(order.id, e.target.value)}
                        style={{ padding: '6px 8px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 12, fontWeight: 700, cursor: 'pointer', background: 'white' }}
                      >
                        {STATUS_OPCOES.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      {salvandoId === order.id && <Loader2 size={14} className="animate-spin" color="#15803d" />}
                    </div>
                  </div>

                  {/* Itens */}
                  <div style={{ background: '#f9fafb', borderRadius: 10, padding: '10px 14px', marginBottom: 12 }}>
                    {order.items.map((it, idx) => (
                      <div key={`${order.id}-item-${idx}`} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: '#374151', padding: '3px 0' }}>
                        <span>
                          {it.quantity}x {it.nome}{it.variacao ? ` (${it.variacao})` : ''}
                        </span>
                        <span style={{ fontWeight: 700 }}>{fmt(it.preco * it.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Totais */}
                  <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', fontSize: 12.5, color: '#4b5563' }}>
                    <span>Subtotal: <strong>{fmt(order.subtotal)}</strong></span>
                    {order.desconto > 0 && (
                      <span style={{ color: '#15803d' }}>
                        Cupom {order.cupom}: <strong>- {fmt(order.desconto)}</strong>
                      </span>
                    )}
                    <span>Frete: <strong>{fmt(order.frete)}</strong></span>
                    <span style={{ color: '#111827', fontSize: 13.5 }}>
                      Total: <strong>{fmt(order.total)}</strong>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}