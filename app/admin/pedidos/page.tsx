// app/admin/page.tsx
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Package, RefreshCw, LogOut, ShieldCheck, Plus, ListOrdered, CheckCircle2, AlertCircle, Trash2, Edit, Layers, Tag } from 'lucide-react';

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

interface ProductVariant {
  id?: string;
  size: string;
  price: number;
  originalPrice: number;
  stock: number;
  weight: number;
  dimensions?: { height: number; width: number; length: number };
  height?: number;
  width?: number;
  length?: number;
}

interface ProductItem {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  features: string[];
  images: string[];
  variants: ProductVariant[];
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
  const [abaAtiva, setAbaAtiva] = useState<'pedidos' | 'gerenciar-produtos' | 'novo-produto'>('pedidos');
  
  // Estado Pedidos
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [carregandoOrders, setCarregandoOrders] = useState(true);
  const [erroOrders, setErroOrders] = useState('');
  const [salvandoOrderId, setSalvandoOrderId] = useState<string | null>(null);

  // Estado Produtos Existentes
  const [produtos, setProdutos] = useState<ProductItem[]>([]);
  const [carregandoProdutos, setCarregandoProdutos] = useState(false);
  const [erroProdutos, setErroProdutos] = useState('');
  const [sucessoProdutos, setSucessoProdutos] = useState('');
  const [excluindoId, setExcluindoId] = useState<string | null>(null);
  const [confirmandoProdId, setConfirmandoProdId] = useState<string | null>(null);
  const [confirmandoVarId, setConfirmandoVarId] = useState<string | null>(null);

  // Estado Formulário Adicionar Variação a Produto Existente
  const [produtoEditandoId, setProdutoEditandoId] = useState<string | null>(null);
  const [novaVarTamanho, setNovaVarTamanho] = useState('5L');
  const [novaVarPreco, setNovaVarPreco] = useState(32.50);
  const [novaVarPrecoDe, setNovaVarPrecoDe] = useState(36.90);
  const [novaVarEstoque, setNovaVarEstoque] = useState(100);
  const [novaVarPeso, setNovaVarPeso] = useState(1000);
  const [novaVarAlt, setNovaVarAlt] = useState(8);
  const [novaVarLarg, setNovaVarLarg] = useState(25);
  const [novaVarComp, setNovaVarComp] = useState(35);
  const [adicionandoVar, setAdicionandoVar] = useState(false);

  // Estado Novo Produto
  const [nome, setNome] = useState('');
  const [slug, setSlug] = useState('');
  const [categoria, setCategoria] = useState('substratos');
  const [description, setDescription] = useState('');
  const [featuresInput, setFeaturesInput] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  
  // Variantes do NOVO produto
  const [variantesNovo, setVariantesNovo] = useState([
    { size: '5L', price: 32.50, originalPrice: 36.90, stock: 100, weight: 1000, height: 8, width: 25, length: 35 }
  ]);
  const [salvandoProduto, setSalvandoProduto] = useState(false);
  const [sucessoNovoProduto, setSucessoNovoProduto] = useState('');
  const [erroNovoProduto, setErroNovoProduto] = useState('');

  // Carregar Pedidos
  const carregarPedidos = useCallback(async () => {
    setCarregandoOrders(true);
    setErroOrders('');
    try {
      const res = await fetch('/api/admin/orders');
      if (res.status === 401 || res.status === 403) {
        router.push('/login?redirect=/admin');
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        setErroOrders(data.error || 'Erro ao carregar pedidos.');
        return;
      }
      setOrders(data.orders || []);
    } catch {
      setErroOrders('Erro de conexão.');
    } finally {
      setCarregandoOrders(false);
    }
  }, [router]);

  // Carregar Produtos Existentes
  const carregarProdutos = useCallback(async () => {
    setCarregandoProdutos(true);
    setErroProdutos('');
    try {
      const res = await fetch('/api/admin/products');
      if (res.status === 401 || res.status === 403) {
        router.push('/login?redirect=/admin');
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        setErroProdutos(data.error || 'Erro ao carregar produtos.');
        return;
      }
      setProdutos(data.products || []);
    } catch {
      setErroProdutos('Erro de conexão ao carregar produtos.');
    } finally {
      setCarregandoProdutos(false);
    }
  }, [router]);

  useEffect(() => {
    if (abaAtiva === 'pedidos') {
      carregarPedidos();
    } else if (abaAtiva === 'gerenciar-produtos') {
      carregarProdutos();
    }
  }, [abaAtiva, carregarPedidos, carregarProdutos]);

  // Gerar Slug Automático a partir do Nome
  const handleNomeChange = (val: string) => {
    setNome(val);
    const s = val
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setSlug(s);
  };

  const mudarStatusOrder = async (orderId: string, status: string) => {
    setSalvandoOrderId(orderId);
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
        setErroOrders(data.error || 'Erro ao atualizar status.');
      }
    } catch {
      setErroOrders('Erro de conexão ao atualizar status.');
    } finally {
      setSalvandoOrderId(null);
    }
  };

  // 🚨 REMOVER PRODUTO INTEIRO (Sem window.confirm - SSR / Vercel Safe)
  const executarRemocaoProdutoInteiro = async (productId: string, productName: string) => {
    setConfirmandoProdId(null);
    setExcluindoId(productId);
    setErroProdutos('');
    setSucessoProdutos('');

    try {
      const res = await fetch('/api/admin/products', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao excluir produto.');

      setSucessoProdutos(`✅ Produto "${productName}" removido com sucesso!`);
      setProdutos(prev => prev.filter(p => p.id !== productId));
    } catch (err: any) {
      setErroProdutos(err.message || 'Erro ao remover produto.');
    } finally {
      setExcluindoId(null);
    }
  };

  // 🚨 REMOVER VARIAÇÃO EXISTENTE DE UM PRODUTO (Sem window.confirm - SSR / Vercel Safe)
  const executarRemocaoVariacaoExistente = async (productId: string, variantId: string, variantSize: string) => {
    setConfirmandoVarId(null);
    setExcluindoId(`${productId}-${variantId}`);
    setErroProdutos('');
    setSucessoProdutos('');

    try {
      const res = await fetch('/api/admin/products', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, variantId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao remover variação.');

      setSucessoProdutos(`✅ Variação "${variantSize}" removida com sucesso!`);
      setProdutos(prev => prev.map(p => {
        if (p.id === productId) {
          return {
            ...p,
            variants: p.variants.filter(v => (v.id || v.size) !== variantId && v.size !== variantSize)
          };
        }
        return p;
      }));
    } catch (err: any) {
      setErroProdutos(err.message || 'Erro ao remover variação.');
    } finally {
      setExcluindoId(null);
    }
  };

  // ➕ ADICIONAR NOVA VARIAÇÃO A UM PRODUTO EXISTENTE
  const submitNovaVariacaoExistente = async (productId: string) => {
    setAdicionandoVar(true);
    setErroProdutos('');
    setSucessoProdutos('');

    try {
      const novaVar = {
        size: novaVarTamanho,
        price: Number(novaVarPreco),
        originalPrice: Number(novaVarPrecoDe),
        stock: Number(novaVarEstoque),
        weight: Number(novaVarPeso),
        dimensions: { height: Number(novaVarAlt), width: Number(novaVarLarg), length: Number(novaVarComp) }
      };

      const res = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          action: 'add_variant',
          variant: novaVar
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao adicionar variação.');

      setSucessoProdutos(`✅ Variação "${novaVarTamanho}" adicionada com sucesso ao produto!`);
      setProdutoEditandoId(null);
      carregarProdutos();
    } catch (err: any) {
      setErroProdutos(err.message || 'Erro ao adicionar variação.');
    } finally {
      setAdicionandoVar(false);
    }
  };

  // Manipuladores de Variantes do Novo Produto
  const adicionarVarianteNovo = () => {
    setVariantesNovo(prev => [
      ...prev,
      { size: '10L', price: 49.90, originalPrice: 56.90, stock: 100, weight: 2000, height: 12, width: 30, length: 40 }
    ]);
  };

  const removerVarianteNovo = (idx: number) => {
    if (variantesNovo.length === 1) return;
    setVariantesNovo(prev => prev.filter((_, i) => i !== idx));
  };

  const atualizarVarianteNovo = (idx: number, campo: string, valor: any) => {
    setVariantesNovo(prev => prev.map((v, i) => i === idx ? { ...v, [campo]: valor } : v));
  };

  const criarProdutoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErroNovoProduto('');
    setSucessoNovoProduto('');
    setSalvandoProduto(true);

    try {
      const features = featuresInput.split('
').map(f => f.trim()).filter(Boolean);
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: nome,
          slug,
          category: categoria,
          description,
          features,
          images: [imageUrl || '/images/products/substrato-rico.jpg'],
          variants: variantesNovo.map(v => ({
            size: v.size,
            price: Number(v.price),
            originalPrice: Number(v.originalPrice),
            stock: Number(v.stock),
            weight: Number(v.weight),
            dimensions: { height: Number(v.height), width: Number(v.width), length: Number(v.length) }
          }))
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao cadastrar produto.');

      setSucessoNovoProduto('✅ Produto cadastrado com sucesso!');
      setNome('');
      setSlug('');
      setDescription('');
      setFeaturesInput('');
      setImageUrl('');
    } catch (err: any) {
      setErroNovoProduto(err.message || 'Erro de conexão ao salvar produto.');
    } finally {
      setSalvandoProduto(false);
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
            onClick={() => {
              if (abaAtiva === 'pedidos') carregarPedidos();
              else if (abaAtiva === 'gerenciar-produtos') carregarProdutos();
            }}
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

      {/* Navegação por Abas */}
      <div style={{ background: 'white', borderBottom: '1px solid #e7e2d6', padding: '0 20px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', gap: 20 }}>
          <button
            onClick={() => setAbaAtiva('pedidos')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '14px 4px',
              border: 'none',
              borderBottom: abaAtiva === 'pedidos' ? '3px solid #15803d' : '3px solid transparent',
              background: 'transparent',
              color: abaAtiva === 'pedidos' ? '#15803d' : '#6b7280',
              fontWeight: 800,
              fontSize: 14,
              cursor: 'pointer'
            }}
          >
            <ListOrdered size={16} /> Gestão de Pedidos ({orders.length})
          </button>

          <button
            onClick={() => setAbaAtiva('gerenciar-produtos')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '14px 4px',
              border: 'none',
              borderBottom: abaAtiva === 'gerenciar-produtos' ? '3px solid #15803d' : '3px solid transparent',
              background: 'transparent',
              color: abaAtiva === 'gerenciar-produtos' ? '#15803d' : '#6b7280',
              fontWeight: 800,
              fontSize: 14,
              cursor: 'pointer'
            }}
          >
            <Layers size={16} /> Gerenciar / Remover Produtos
          </button>

          <button
            onClick={() => setAbaAtiva('novo-produto')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '14px 4px',
              border: 'none',
              borderBottom: abaAtiva === 'novo-produto' ? '3px solid #15803d' : '3px solid transparent',
              background: 'transparent',
              color: abaAtiva === 'novo-produto' ? '#15803d' : '#6b7280',
              fontWeight: 800,
              fontSize: 14,
              cursor: 'pointer'
            }}
          >
            <Plus size={16} /> Cadastrar Novo Produto
          </button>
        </div>
      </div>

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 20px 80px' }}>
        
        {/* ABA 1: PEDIDOS */}
        {abaAtiva === 'pedidos' && (
          <>
            <h1 style={{ fontSize: 22, fontWeight: 900, color: '#111827', margin: '0 0 4px' }}>Pedidos da Loja</h1>
            <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 20px' }}>
              {orders.length} pedido{orders.length !== 1 ? 's' : ''} no total
            </p>

            {erroOrders && (
              <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '10px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
                {erroOrders}
              </div>
            )}

            {carregandoOrders ? (
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
                            disabled={salvandoOrderId === order.id}
                            onChange={e => mudarStatusOrder(order.id, e.target.value)}
                            style={{ padding: '6px 8px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 12, fontWeight: 700, cursor: 'pointer', background: 'white' }}
                          >
                            {STATUS_OPCOES.map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                          {salvandoOrderId === order.id && <Loader2 size={14} className="animate-spin" color="#15803d" />}
                        </div>
                      </div>

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
          </>
        )}

        {/* ABA 2: GERENCIAR / REMOVER PRODUTOS E VARIAÇÕES */}
        {abaAtiva === 'gerenciar-produtos' && (
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 900, color: '#111827', margin: '0 0 4px' }}>Produtos & Variações da Loja</h1>
            <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 20px' }}>
              Gerencie seus produtos em catálogo, exclua variações antigas ou remova itens obsoletos.
            </p>

            {sucessoProdutos && (
              <div style={{ background: '#dcfce7', color: '#166534', padding: '12px 16px', borderRadius: 8, fontSize: 13, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle2 size={16} /> {sucessoProdutos}
              </div>
            )}

            {erroProdutos && (
              <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '12px 16px', borderRadius: 8, fontSize: 13, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertCircle size={16} /> {erroProdutos}
              </div>
            )}

            {carregandoProdutos ? (
              <div style={{ textAlign: 'center', padding: 60 }}>
                <Loader2 size={32} className="animate-spin" color="#15803d" style={{ margin: '0 auto' }} />
              </div>
            ) : produtos.length === 0 ? (
              <div style={{ background: 'white', borderRadius: 14, padding: '50px 20px', textAlign: 'center', border: '1px solid #e7e2d6' }}>
                <Package size={40} color="#9ca3af" style={{ margin: '0 auto 10px' }} />
                <p style={{ fontSize: 14, color: '#6b7280' }}>Nenhum produto encontrado no catálogo.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {produtos.map(p => (
                  <div key={p.id} style={{ background: 'white', borderRadius: 14, border: '1px solid #e7e2d6', padding: 20 }}>
                    {/* Cabeçalho do Card do Produto */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
                      <div>
                        <span style={{ background: '#e0f2fe', color: '#0369a1', fontSize: 11, fontWeight: 900, padding: '3px 8px', borderRadius: 6, textTransform: 'uppercase' }}>
                          {p.category}
                        </span>
                        <h2 style={{ fontSize: 17, fontWeight: 900, color: '#111827', margin: '4px 0 2px' }}>{p.name}</h2>
                        <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>
                          ID: {p.id} · Slug: <code style={{ background: '#f3f4f6', padding: '2px 4px', borderRadius: 4 }}>{p.slug}</code>
                        </p>
                      </div>

                      {/* Botão de Excluir Produto Inteiro (Com Confirmação Inline em React) */}
                      {confirmandoProdId === p.id ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fee2e2', padding: '6px 10px', borderRadius: 8, border: '1px solid #fca5a5' }}>
                          <span style={{ fontSize: 11, fontWeight: 900, color: '#991b1b' }}>Confirma exclusão?</span>
                          <button
                            onClick={() => executarRemocaoProdutoInteiro(p.id, p.name)}
                            disabled={excluindoId === p.id}
                            style={{ background: '#dc2626', color: 'white', border: 'none', borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 800, cursor: 'pointer' }}
                          >
                            {excluindoId === p.id ? <Loader2 size={12} className="animate-spin" /> : 'Sim, Excluir'}
                          </button>
                          <button
                            onClick={() => setConfirmandoProdId(null)}
                            style={{ background: '#6b7280', color: 'white', border: 'none', borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 800, cursor: 'pointer' }}
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmandoProdId(p.id)}
                          disabled={excluindoId === p.id}
                          style={{
                            background: '#fee2e2',
                            color: '#b91c1c',
                            border: 'none',
                            borderRadius: 8,
                            padding: '8px 14px',
                            fontSize: 12,
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6
                          }}
                        >
                          {excluindoId === p.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                          Excluir Produto Completo
                        </button>
                      )}
                    </div>

                    {/* Variações do Produto */}
                    <div style={{ background: '#f9fafb', borderRadius: 10, padding: 14, border: '1px solid #f3f4f6' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <span style={{ fontSize: 13, fontWeight: 900, color: '#374151', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Tag size={14} color="#15803d" /> Variações Cadastradas ({p.variants?.length || 0})
                        </span>

                        <button
                          onClick={() => setProdutoEditandoId(produtoEditandoId === p.id ? null : p.id)}
                          style={{ background: '#15803d', color: 'white', border: 'none', borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                        >
                          <Plus size={13} /> {produtoEditandoId === p.id ? 'Fechar Adição' : 'Nova Variação'}
                        </button>
                      </div>

                      {/* Formulário Inline de Adicionar Nova Variação ao Produto Existente */}
                      {produtoEditandoId === p.id && (
                        <div style={{ background: 'white', padding: 14, borderRadius: 8, border: '1px solid #bbf7d0', marginBottom: 12 }}>
                          <h4 style={{ fontSize: 12, fontWeight: 900, color: '#166534', margin: '0 0 10px' }}>Adicionar Nova Variação a este Produto</h4>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, marginBottom: 8 }}>
                            <div>
                              <span style={{ fontSize: 10, color: '#6b7280', fontWeight: 700 }}>Tamanho</span>
                              <input type="text" value={novaVarTamanho} onChange={e => setNovaVarTamanho(e.target.value)} style={{ width: '100%', padding: 4, fontSize: 12, borderRadius: 4, border: '1px solid #ccc' }} />
                            </div>
                            <div>
                              <span style={{ fontSize: 10, color: '#6b7280', fontWeight: 700 }}>Preço (R$)</span>
                              <input type="number" step="0.01" value={novaVarPreco} onChange={e => setNovaVarPreco(Number(e.target.value))} style={{ width: '100%', padding: 4, fontSize: 12, borderRadius: 4, border: '1px solid #ccc' }} />
                            </div>
                            <div>
                              <span style={{ fontSize: 10, color: '#6b7280', fontWeight: 700 }}>Preço De (R$)</span>
                              <input type="number" step="0.01" value={novaVarPrecoDe} onChange={e => setNovaVarPrecoDe(Number(e.target.value))} style={{ width: '100%', padding: 4, fontSize: 12, borderRadius: 4, border: '1px solid #ccc' }} />
                            </div>
                            <div>
                              <span style={{ fontSize: 10, color: '#6b7280', fontWeight: 700 }}>Estoque</span>
                              <input type="number" value={novaVarEstoque} onChange={e => setNovaVarEstoque(Number(e.target.value))} style={{ width: '100%', padding: 4, fontSize: 12, borderRadius: 4, border: '1px solid #ccc' }} />
                            </div>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, marginBottom: 10 }}>
                            <div>
                              <span style={{ fontSize: 10, color: '#6b7280', fontWeight: 700 }}>Peso (g)</span>
                              <input type="number" value={novaVarPeso} onChange={e => setNovaVarPeso(Number(e.target.value))} style={{ width: '100%', padding: 4, fontSize: 12, borderRadius: 4, border: '1px solid #ccc' }} />
                            </div>
                            <div>
                              <span style={{ fontSize: 10, color: '#6b7280', fontWeight: 700 }}>Alt (cm)</span>
                              <input type="number" value={novaVarAlt} onChange={e => setNovaVarAlt(Number(e.target.value))} style={{ width: '100%', padding: 4, fontSize: 12, borderRadius: 4, border: '1px solid #ccc' }} />
                            </div>
                            <div>
                              <span style={{ fontSize: 10, color: '#6b7280', fontWeight: 700 }}>Larg (cm)</span>
                              <input type="number" value={novaVarLarg} onChange={e => setNovaVarLarg(Number(e.target.value))} style={{ width: '100%', padding: 4, fontSize: 12, borderRadius: 4, border: '1px solid #ccc' }} />
                            </div>
                            <div>
                              <span style={{ fontSize: 10, color: '#6b7280', fontWeight: 700 }}>Comp (cm)</span>
                              <input type="number" value={novaVarComp} onChange={e => setNovaVarComp(Number(e.target.value))} style={{ width: '100%', padding: 4, fontSize: 12, borderRadius: 4, border: '1px solid #ccc' }} />
                            </div>
                          </div>

                          <button
                            onClick={() => submitNovaVariacaoExistente(p.id)}
                            disabled={adicionandoVar}
                            style={{ background: '#166534', color: 'white', border: 'none', borderRadius: 6, padding: '6px 12px', fontSize: 11, fontWeight: 800, cursor: 'pointer' }}
                          >
                            {adicionandoVar ? 'Adicionando...' : 'Salvar Variação'}
                          </button>
                        </div>
                      )}

                      {/* Lista de Variações Existentes com Botão de Remover */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {p.variants && p.variants.length > 0 ? (
                          p.variants.map((v, vIdx) => {
                            const varKey = v.id || `${p.id}-${v.size}-${vIdx}`;
                            const isExcluindo = excluindoId === `${p.id}-${varKey}` || excluindoId === `${p.id}-${v.id}`;
                            return (
                              <div key={varKey} style={{ background: 'white', padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                                <div>
                                  <span style={{ fontSize: 13, fontWeight: 900, color: '#111827' }}>{v.size}</span>
                                  <span style={{ fontSize: 12, color: '#4b5563', marginLeft: 10 }}>
                                    Preço: <strong>{fmt(v.price)}</strong> (De: {fmt(v.originalPrice)})
                                  </span>
                                  <span style={{ fontSize: 12, color: '#6b7280', marginLeft: 10 }}>
                                    Estoque: {v.stock} un · Peso: {v.weight}g
                                  </span>
                                </div>

                                {/* Botão Excluir Variação (Com Confirmação Inline em React) */}
                                {confirmandoVarId === `${p.id}-${varKey}` ? (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#fef2f2', padding: '3px 8px', borderRadius: 6, border: '1px solid #fecaca' }}>
                                    <span style={{ fontSize: 10, fontWeight: 900, color: '#991b1b' }}>Excluir {v.size}?</span>
                                    <button
                                      onClick={() => executarRemocaoVariacaoExistente(p.id, v.id || v.size, v.size)}
                                      disabled={isExcluindo}
                                      style={{ background: '#dc2626', color: 'white', border: 'none', borderRadius: 4, padding: '2px 6px', fontSize: 10, fontWeight: 800, cursor: 'pointer' }}
                                    >
                                      {isExcluindo ? <Loader2 size={10} className="animate-spin" /> : 'Sim'}
                                    </button>
                                    <button
                                      onClick={() => setConfirmandoVarId(null)}
                                      style={{ background: '#6b7280', color: 'white', border: 'none', borderRadius: 4, padding: '2px 6px', fontSize: 10, fontWeight: 800, cursor: 'pointer' }}
                                    >
                                      Não
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setConfirmandoVarId(`${p.id}-${varKey}`)}
                                    disabled={isExcluindo}
                                    style={{
                                      background: '#fef2f2',
                                      color: '#dc2626',
                                      border: '1px solid #fecaca',
                                      borderRadius: 6,
                                      padding: '4px 10px',
                                      fontSize: 11,
                                      fontWeight: 800,
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 4
                                    }}
                                  >
                                    {isExcluindo ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                                    Excluir Variação
                                  </button>
                                )}
                              </div>
                            );
                          })
                        ) : (
                          <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>Nenhuma variação cadastrada para este produto.</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ABA 3: CADASTRAR NOVO PRODUTO */}
        {abaAtiva === 'novo-produto' && (
          <div style={{ background: 'white', borderRadius: 14, border: '1px solid #e7e2d6', padding: 24, maxWidth: 800, margin: '0 auto' }}>
            <h1 style={{ fontSize: 20, fontWeight: 900, color: '#111827', margin: '0 0 4px' }}>Cadastrar Novo Produto</h1>
            <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 20px' }}>
              Preencha os detalhes e variações de peso/tamanho para integrar ao catálogo e ao cálculo de frete.
            </p>

            {sucessoNovoProduto && (
              <div style={{ background: '#dcfce7', color: '#166534', padding: '12px 16px', borderRadius: 8, fontSize: 13, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle2 size={16} /> {sucessoNovoProduto}
              </div>
            )}

            {erroNovoProduto && (
              <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '12px 16px', borderRadius: 8, fontSize: 13, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertCircle size={16} /> {erroNovoProduto}
              </div>
            )}

            <form onSubmit={criarProdutoSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#374151', marginBottom: 6 }}>Nome do Produto</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Chips de Coco Lavado Orquídeas"
                    value={nome}
                    onChange={e => handleNomeChange(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13 }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#374151', marginBottom: 6 }}>Slug (URL Amigável)</label>
                  <input
                    type="text"
                    required
                    placeholder="chips-de-coco-lavado-orquideas"
                    value={slug}
                    onChange={e => setSlug(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13, background: '#f9fafb' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#374151', marginBottom: 6 }}>Categoria Base</label>
                  <select
                    value={categoria}
                    onChange={e => setCategoria(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13, background: 'white' }}
                  >
                    <option value="substratos">Substratos</option>
                    <option value="condicionadores">Condicionadores & Aeração</option>
                    <option value="fertilizantes">Fertilizantes / Nutrição Líquida</option>
                    <option value="adubos">Adubos Orgânicos</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#374151', marginBottom: 6 }}>URL da Imagem</label>
                  <input
                    type="text"
                    placeholder="/images/products/chips-coco.jpg"
                    value={imageUrl}
                    onChange={e => setImageUrl(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13 }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#374151', marginBottom: 6 }}>Descrição Completa</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Descreva a composição, benefícios e modo de uso do produto..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13, resize: 'vertical' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#374151', marginBottom: 6 }}>Características (1 por linha)</label>
                <textarea
                  rows={3}
                  placeholder="Baixa condutividade elétrica (EC)&#10;PH estável entre 5.8 e 6.5&#10;Retenção uniforme de umidade"
                  value={featuresInput}
                  onChange={e => setFeaturesInput(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13, resize: 'vertical' }}
                />
              </div>

              {/* VARIAÇÕES DO NOVO PRODUTO */}
              <div style={{ marginTop: 10, background: '#f9fafb', padding: 16, borderRadius: 10, border: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 900, color: '#111827', margin: 0 }}>Variações de Tamanho & Frete</h3>
                  <button
                    type="button"
                    onClick={adicionarVarianteNovo}
                    style={{ background: '#15803d', color: 'white', border: 'none', borderRadius: 6, padding: '6px 12px', fontSize: 12, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    <Plus size={14} /> Add Variação
                  </button>
                </div>

                {variantesNovo.map((v, idx) => (
                  <div key={idx} style={{ background: 'white', padding: 12, borderRadius: 8, border: '1px solid #d1d5db', marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 900, color: '#15803d' }}>Variação #{idx + 1}</span>
                      {variantesNovo.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removerVarianteNovo(idx)}
                          style={{ background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: 4, padding: '2px 8px', fontSize: 11, fontWeight: 800, cursor: 'pointer' }}
                        >
                          Remover
                        </button>
                      )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10, marginBottom: 8 }}>
                      <div>
                        <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 700 }}>Tamanho/Rótulo</span>
                        <input
                          type="text"
                          value={v.size}
                          onChange={e => atualizarVarianteNovo(idx, 'size', e.target.value)}
                          style={{ width: '100%', padding: 6, borderRadius: 6, border: '1px solid #d1d5db', fontSize: 12 }}
                        />
                      </div>
                      <div>
                        <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 700 }}>Preço (R$)</span>
                        <input
                          type="number"
                          step="0.01"
                          value={v.price}
                          onChange={e => atualizarVarianteNovo(idx, 'price', e.target.value)}
                          style={{ width: '100%', padding: 6, borderRadius: 6, border: '1px solid #d1d5db', fontSize: 12 }}
                        />
                      </div>
                      <div>
                        <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 700 }}>Preço De (R$)</span>
                        <input
                          type="number"
                          step="0.01"
                          value={v.originalPrice}
                          onChange={e => atualizarVarianteNovo(idx, 'originalPrice', e.target.value)}
                          style={{ width: '100%', padding: 6, borderRadius: 6, border: '1px solid #d1d5db', fontSize: 12 }}
                        />
                      </div>
                      <div>
                        <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 700 }}>Estoque</span>
                        <input
                          type="number"
                          value={v.stock}
                          onChange={e => atualizarVarianteNovo(idx, 'stock', e.target.value)}
                          style={{ width: '100%', padding: 6, borderRadius: 6, border: '1px solid #d1d5db', fontSize: 12 }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10 }}>
                      <div>
                        <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 700 }}>Peso (gramas)</span>
                        <input
                          type="number"
                          value={v.weight}
                          onChange={e => atualizarVarianteNovo(idx, 'weight', e.target.value)}
                          style={{ width: '100%', padding: 6, borderRadius: 6, border: '1px solid #d1d5db', fontSize: 12 }}
                        />
                      </div>
                      <div>
                        <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 700 }}>Alt (cm)</span>
                        <input
                          type="number"
                          value={v.height}
                          onChange={e => atualizarVarianteNovo(idx, 'height', e.target.value)}
                          style={{ width: '100%', padding: 6, borderRadius: 6, border: '1px solid #d1d5db', fontSize: 12 }}
                        />
                      </div>
                      <div>
                        <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 700 }}>Larg (cm)</span>
                        <input
                          type="number"
                          value={v.width}
                          onChange={e => atualizarVarianteNovo(idx, 'width', e.target.value)}
                          style={{ width: '100%', padding: 6, borderRadius: 6, border: '1px solid #d1d5db', fontSize: 12 }}
                        />
                      </div>
                      <div>
                        <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 700 }}>Comp (cm)</span>
                        <input
                          type="number"
                          value={v.length}
                          onChange={e => atualizarVarianteNovo(idx, 'length', e.target.value)}
                          style={{ width: '100%', padding: 6, borderRadius: 6, border: '1px solid #d1d5db', fontSize: 12 }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="submit"
                disabled={salvandoProduto}
                style={{
                  background: '#15803d',
                  color: 'white',
                  border: 'none',
                  borderRadius: 10,
                  padding: '14px',
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  marginTop: 10
                }}
              >
                {salvandoProduto ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                {salvandoProduto ? 'Cadastrando...' : 'Salvar Produto no Catálogo'}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
