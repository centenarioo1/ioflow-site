// app/admin/pedidos/AdminPedidosClient.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Package, 
  Search, 
  Truck, 
  DollarSign, 
  Send,
  Plus,
  ListOrdered,
  Layers,
  CheckCircle2,
  AlertCircle,
  Trash2,
  RefreshCw,
  Tag,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';

interface OrderItem {
  id: string;
  name: string;
  size?: string;
  price: number;
  quantity: number;
}

interface OrderData {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerCpf: string;
  shippingCep: string;
  shippingStreet: string;
  shippingNumber: string;
  shippingComplement?: string | null;
  shippingNeighborhood: string;
  shippingCity: string;
  shippingState: string;
  shippingServiceName?: string | null;
  shippingCost: number;
  trackingCode?: string | null;
  items: any;
  subtotal: number;
  desconto: number;
  total: number;
  status: string;
  mpPaymentId?: string | null;
  createdAt: Date | string;
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

const STATUS_LIST = [
  'Todos',
  'Pendente',
  'Aprovado',
  'Em Preparação',
  'Enviado',
  'Entregue',
  'Cancelado',
];

const fmt = (v: number) => `R$ ${(v || 0).toFixed(2).replace('.', ',')}`;

export default function AdminPedidosClient({ initialOrders = [] }: { initialOrders?: OrderData[] }) {
  const [abaAtiva, setAbaAtiva] = useState<'pedidos' | 'gerenciar-produtos' | 'novo-produto'>('pedidos');

  // --- ESTADOS PEDIDOS ---
  const [orders, setOrders] = useState<OrderData[]>(initialOrders || []);
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  // --- ESTADOS PRODUTOS EXISTENTES ---
  const [produtos, setProdutos] = useState<ProductItem[]>([]);
  const [carregandoProdutos, setCarregandoProdutos] = useState(false);
  const [erroProdutos, setErroProdutos] = useState('');
  const [sucessoProdutos, setSucessoProdutos] = useState('');
  const [excluindoId, setExcluindoId] = useState<string | null>(null);
  const [confirmandoProdId, setConfirmandoProdId] = useState<string | null>(null);
  const [confirmandoVarId, setConfirmandoVarId] = useState<string | null>(null);

  // --- ESTADO ADICIONAR VARIAÇÃO INLINE ---
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

  // --- ESTADOS NOVO PRODUTO ---
  const [nome, setNome] = useState('');
  const [slug, setSlug] = useState('');
  const [categoria, setCategoria] = useState('substratos');
  const [description, setDescription] = useState('');
  const [featuresInput, setFeaturesInput] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [variantesNovo, setVariantesNovo] = useState([
    { size: '5L', price: 32.50, originalPrice: 36.90, stock: 100, weight: 1000, height: 8, width: 25, length: 35 }
  ]);
  const [salvandoProduto, setSalvandoProduto] = useState(false);
  const [sucessoNovoProduto, setSucessoNovoProduto] = useState('');
  const [erroNovoProduto, setErroNovoProduto] = useState('');

  // Carregar produtos da API do admin
  const carregarProdutos = useCallback(async () => {
    setCarregandoProdutos(true);
    setErroProdutos('');
    try {
      const res = await fetch('/api/admin/products');
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
  }, []);

  useEffect(() => {
    if (abaAtiva === 'gerenciar-produtos') {
      carregarProdutos();
    }
  }, [abaAtiva, carregarProdutos]);

  // KPI Calculations
  const totalFaturado = orders
    .filter((o) => o.status === 'Aprovado' || o.status === 'Enviado' || o.status === 'Entregue')
    .reduce((acc, o) => acc + (o.total || 0), 0);

  const pendentesEnvio = orders.filter(
    (o) => o.status === 'Aprovado' || o.status === 'Em Preparação'
  ).length;

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setSavingId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
      }
    } catch {
      alert('Erro ao atualizar status');
    } finally {
      setSavingId(null);
    }
  };

  const handleSaveTracking = async (orderId: string) => {
    const code = trackingInputs[orderId];
    if (!code) return;
    setSavingId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackingCode: code }),
      });

      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, trackingCode: code } : o))
        );
        alert('Código de rastreio salvo com sucesso!');
      }
    } catch {
      alert('Erro ao salvar código de rastreio');
    } finally {
      setSavingId(null);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchStatus = filterStatus === 'Todos' || order.status === filterStatus;
    const matchSearch =
      (order.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customerEmail || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customerCpf || '').includes(searchTerm);
    return matchStatus && matchSearch;
  });

  // Slug Generator
  const handleNomeChange = (val: string) => {
    setNome(val);
    const s = val
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setSlug(s);
  };

  // Excluir Produto Inteiro
  const executarRemocaoProduto = async (productId: string, productName: string) => {
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
      setProdutos((prev) => prev.filter((p) => p.id !== productId));
    } catch (err: any) {
      setErroProdutos(err.message || 'Erro ao remover produto.');
    } finally {
      setExcluindoId(null);
      setConfirmandoProdId(null);
    }
  };

  // Excluir Variação
  const executarRemocaoVariacao = async (productId: string, variantId: string, variantSize: string) => {
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
      setProdutos((prev) =>
        prev.map((p) => {
          if (p.id === productId) {
            return {
              ...p,
              variants: p.variants.filter((v) => (v.id || v.size) !== variantId && v.size !== variantSize),
            };
          }
          return p;
        })
      );
    } catch (err: any) {
      setErroProdutos(err.message || 'Erro ao remover variação.');
    } finally {
      setExcluindoId(null);
      setConfirmandoVarId(null);
    }
  };

  // Add Variação Existente
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
        dimensions: { height: Number(novaVarAlt), width: Number(novaVarLarg), length: Number(novaVarComp) },
      };

      const res = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          action: 'add_variant',
          variant: novaVar,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao adicionar variação.');

      setSucessoProdutos(`✅ Variação "${novaVarTamanho}" adicionada com sucesso!`);
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
    setVariantesNovo((prev) => [
      ...prev,
      { size: '10L', price: 49.90, originalPrice: 56.90, stock: 100, weight: 2000, height: 12, width: 30, length: 40 },
    ]);
  };

  const removerVarianteNovo = (idx: number) => {
    if (variantesNovo.length === 1) return;
    setVariantesNovo((prev) => prev.filter((_, i) => i !== idx));
  };

  const atualizarVarianteNovo = (idx: number, campo: string, valor: any) => {
    setVariantesNovo((prev) => prev.map((v, i) => (i === idx ? { ...v, [campo]: valor } : v)));
  };

  const criarProdutoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErroNovoProduto('');
    setSucessoNovoProduto('');
    setSalvandoProduto(true);

    try {
      const features = featuresInput.split(/\r?\n/).map((f) => f.trim()).filter(Boolean);
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
          variants: variantesNovo.map((v) => ({
            size: v.size,
            price: Number(v.price),
            originalPrice: Number(v.originalPrice),
            stock: Number(v.stock),
            weight: Number(v.weight),
            dimensions: { height: Number(v.height), width: Number(v.width), length: Number(v.length) },
          })),
        }),
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

  return (
    <div className="space-y-6">
      
      {/* BARRA DE NAVEGAÇÃO POR ABAS NO TOPO DO ADMIN */}
      <div className="bg-white border border-stone-200 rounded-2xl p-2 shadow-sm flex flex-wrap gap-2">
        <button
          onClick={() => setAbaAtiva('pedidos')}
          className={`flex-1 min-w-[160px] py-3 px-4 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer ${
            abaAtiva === 'pedidos'
              ? 'bg-green-900 text-white shadow-sm'
              : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
          }`}
        >
          <ListOrdered size={16} /> Gestão de Pedidos ({orders.length})
        </button>

        <button
          onClick={() => setAbaAtiva('gerenciar-produtos')}
          className={`flex-1 min-w-[160px] py-3 px-4 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer ${
            abaAtiva === 'gerenciar-produtos'
              ? 'bg-green-900 text-white shadow-sm'
              : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Layers size={16} /> Gerenciar / Remover Produtos
        </button>

        <button
          onClick={() => setAbaAtiva('novo-produto')}
          className={`flex-1 min-w-[160px] py-3 px-4 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer ${
            abaAtiva === 'novo-produto'
              ? 'bg-green-900 text-white shadow-sm'
              : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Plus size={16} /> Cadastrar Novo Produto
        </button>
      </div>

      {/* ======================================================== */}
      {/* ABA 1: GESTÃO DE PEDIDOS */}
      {/* ======================================================== */}
      {abaAtiva === 'pedidos' && (
        <div className="space-y-6">
          {/* KPI METRICS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Total de Pedidos</p>
                <p className="text-2xl font-black text-stone-900 mt-1">{orders.length}</p>
              </div>
              <div className="w-12 h-12 bg-stone-100 rounded-xl flex items-center justify-center text-stone-700">
                <Package size={24} />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Faturamento Confirmado</p>
                <p className="text-2xl font-black text-emerald-700 mt-1">
                  {fmt(totalFaturado)}
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-700">
                <DollarSign size={24} />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Aguardando Envio</p>
                <p className="text-2xl font-black text-amber-600 mt-1">{pendentesEnvio}</p>
              </div>
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                <Truck size={24} />
              </div>
            </div>
          </div>

          {/* BARRA DE FILTROS & BUSCA */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Buscar por cliente, e-mail, CPF ou ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-stone-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>

            <div className="flex gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
              {STATUS_LIST.map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                    filterStatus === st
                      ? 'bg-green-900 text-white shadow-sm'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* LISTA DE PEDIDOS */}
          <div className="space-y-4">
            {filteredOrders.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-2xl border border-stone-200 text-stone-500">
                Nenhum pedido encontrado.
              </div>
            ) : (
              filteredOrders.map((order) => {
                const itemsArray: OrderItem[] = Array.isArray(order.items) ? order.items : [];

                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden"
                  >
                    <div className="bg-stone-50/80 p-4 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-black text-sm text-stone-800">
                          #{order.id.slice(-8).toUpperCase()}
                        </span>
                        <span className="text-xs text-stone-500">
                          {new Date(order.createdAt).toLocaleString('pt-BR')}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-stone-600">Status:</span>
                        <select
                          value={order.status}
                          disabled={savingId === order.id}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-lg border outline-none cursor-pointer ${
                            order.status === 'Aprovado'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : order.status === 'Enviado' || order.status === 'Entregue'
                              ? 'bg-blue-50 text-blue-800 border-blue-300'
                              : order.status === 'Cancelado'
                              ? 'bg-red-50 text-red-800 border-red-300'
                              : 'bg-amber-50 text-amber-800 border-amber-300'
                          }`}
                        >
                          <option value="Pendente">Pendente</option>
                          <option value="Aprovado">Aprovado</option>
                          <option value="Em Preparação">Em Preparação</option>
                          <option value="Enviado">Enviado</option>
                          <option value="Entregue">Entregue</option>
                          <option value="Cancelado">Cancelado</option>
                        </select>
                      </div>
                    </div>

                    <div className="p-5 grid grid-cols-1 md:grid-cols-12 gap-6">
                      <div className="md:col-span-4 space-y-3 text-xs border-b md:border-b-0 md:border-r border-stone-200 pb-4 md:pb-0 md:pr-4">
                        <div>
                          <p className="font-black text-sm text-stone-900">{order.customerName}</p>
                          <p className="text-stone-500 font-mono">CPF: {order.customerCpf}</p>
                        </div>

                        <div className="space-y-1 text-stone-600">
                          <p className="flex items-center gap-1.5">
                            <Mail size={13} className="text-stone-400" /> {order.customerEmail}
                          </p>
                          <p className="flex items-center gap-1.5">
                            <Phone size={13} className="text-stone-400" /> {order.customerPhone}
                          </p>
                          <div className="flex items-start gap-1.5 pt-1">
                            <MapPin size={13} className="text-stone-400 shrink-0 mt-0.5" />
                            <span>
                              {order.shippingStreet}, {order.shippingNumber}
                              {order.shippingComplement ? ` (${order.shippingComplement})` : ''} -{' '}
                              {order.shippingNeighborhood}, {order.shippingCity}/{order.shippingState} - CEP:{' '}
                              {order.shippingCep}
                            </span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-stone-100">
                          <span className="font-bold text-stone-700">Modalidade: </span>
                          <span className="text-stone-600">{order.shippingServiceName || 'Padrão'}</span>
                        </div>
                      </div>

                      <div className="md:col-span-5 space-y-2">
                        <p className="font-bold text-xs text-stone-500 uppercase tracking-wider mb-2">
                          Itens Comprados:
                        </p>
                        <div className="divide-y divide-stone-100 max-h-44 overflow-y-auto pr-1">
                          {itemsArray.map((item, idx) => (
                            <div key={idx} className="py-2 flex justify-between items-center text-xs">
                              <div>
                                <span className="font-bold text-stone-800">{item.name}</span>
                                {item.size && (
                                  <span className="ml-2 font-bold px-1.5 py-0.2 bg-stone-100 text-stone-600 rounded text-[10px]">
                                    {item.size}
                                  </span>
                                )}
                                <p className="text-stone-400 mt-0.5">Qtd: {item.quantity}</p>
                              </div>
                              <span className="font-bold text-stone-900">
                                {fmt(item.price * item.quantity)}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="pt-3 border-t border-stone-100 flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Código de Rastreio (ex: QB123456789BR)"
                            defaultValue={order.trackingCode || ''}
                            onChange={(e) =>
                              setTrackingInputs({ ...trackingInputs, [order.id]: e.target.value })
                            }
                            className="flex-1 p-2 border border-stone-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-green-700 uppercase"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveTracking(order.id)}
                            disabled={savingId === order.id}
                            className="px-3 py-2 bg-stone-900 text-white rounded-lg text-xs font-bold hover:bg-black transition flex items-center gap-1 cursor-pointer"
                          >
                            <Send size={12} /> Salvar
                          </button>
                        </div>
                      </div>

                      <div className="md:col-span-3 bg-stone-50 p-4 rounded-xl flex flex-col justify-between">
                        <div className="space-y-1.5 text-xs">
                          <div className="flex justify-between text-stone-500">
                            <span>Subtotal:</span>
                            <span>{fmt(order.subtotal)}</span>
                          </div>
                          {order.desconto > 0 && (
                            <div className="flex justify-between text-emerald-700 font-bold">
                              <span>Desconto:</span>
                              <span>- {fmt(order.desconto)}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-stone-500">
                            <span>Frete:</span>
                            <span>{fmt(order.shippingCost)}</span>
                          </div>
                          <div className="flex justify-between text-sm font-black text-stone-900 border-t border-stone-200 pt-2">
                            <span>Total:</span>
                            <span className="text-green-900">{fmt(order.total)}</span>
                          </div>
                        </div>

                        {order.mpPaymentId && (
                          <p className="text-[10px] text-stone-400 mt-3 truncate font-mono">
                            MP ID: {order.mpPaymentId}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* ABA 2: GERENCIAR / REMOVER PRODUTOS E VARIAÇÕES */}
      {/* ======================================================== */}
      {abaAtiva === 'gerenciar-produtos' && (
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl font-black text-stone-900">Produtos & Variações da Loja</h2>
            <p className="text-xs text-stone-500 mt-1">
              Gerencie seus produtos em catálogo, exclua variações obsoletas ou remova itens inteiros.
            </p>
          </div>

          {sucessoProdutos && (
            <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 size={16} /> {sucessoProdutos}
            </div>
          )}

          {erroProdutos && (
            <div className="p-3 bg-red-50 text-red-800 border border-red-200 rounded-xl text-xs font-bold flex items-center gap-2">
              <AlertCircle size={16} /> {erroProdutos}
            </div>
          )}

          {carregandoProdutos ? (
            <div className="py-12 text-center text-stone-500 font-bold text-sm">
              Carregando catálogo de produtos...
            </div>
          ) : produtos.length === 0 ? (
            <div className="py-12 text-center text-stone-500 text-sm">
              Nenhum produto encontrado no catálogo.
            </div>
          ) : (
            <div className="space-y-4">
              {produtos.map((p) => (
                <div key={p.id} className="border border-stone-200 rounded-xl p-5 bg-stone-50/50 space-y-4">
                  {/* CABEÇALHO DO PRODUTO */}
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <span className="inline-block px-2.5 py-0.5 bg-sky-100 text-sky-800 text-[10px] font-black rounded uppercase">
                        {p.category}
                      </span>
                      <h3 className="text-base font-black text-stone-900 mt-1">{p.name}</h3>
                      <p className="text-xs text-stone-500">
                        ID: {p.id} · Slug: <code className="bg-stone-200 px-1 rounded">{p.slug}</code>
                      </p>
                    </div>

                    {/* BOTAO REMOVER PRODUTO COM CONFIRMAÇÃO INLINE SAFE */}
                    <div>
                      {confirmandoProdId === p.id ? (
                        <div className="flex items-center gap-2 bg-red-50 p-1.5 rounded-lg border border-red-200">
                          <span className="text-[11px] font-bold text-red-700">Confirma exclusão?</span>
                          <button
                            type="button"
                            disabled={excluindoId === p.id}
                            onClick={() => executarRemocaoProduto(p.id, p.name)}
                            className="px-2.5 py-1 bg-red-600 text-white rounded text-[11px] font-bold hover:bg-red-700"
                          >
                            Sim, Excluir
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmandoProdId(null)}
                            className="px-2 py-1 bg-stone-200 text-stone-700 rounded text-[11px] font-bold hover:bg-stone-300"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmandoProdId(p.id)}
                          className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-bold hover:bg-red-200 transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Trash2 size={13} /> Excluir Produto Completo
                        </button>
                      )}
                    </div>
                  </div>

                  {/* PAINEL DE VARIAÇÕES DO PRODUTO */}
                  <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-stone-700 flex items-center gap-1.5">
                        <Tag size={14} className="text-green-700" /> Variações Cadastradas ({p.variants?.length || 0})
                      </span>

                      <button
                        type="button"
                        onClick={() => setProdutoEditandoId(produtoEditandoId === p.id ? null : p.id)}
                        className="px-2.5 py-1 bg-green-700 text-white rounded-lg text-xs font-bold hover:bg-green-800 transition flex items-center gap-1 cursor-pointer"
                      >
                        <Plus size={12} /> {produtoEditandoId === p.id ? 'Fechar Adição' : 'Nova Variação'}
                      </button>
                    </div>

                    {/* INLINE FORM ADD VARIAÇÃO */}
                    {produtoEditandoId === p.id && (
                      <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-3">
                        <p className="text-xs font-black text-emerald-900">Adicionar Nova Variação a este Produto</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <div>
                            <span className="text-[10px] font-bold text-stone-500">Tamanho</span>
                            <input type="text" value={novaVarTamanho} onChange={(e) => setNovaVarTamanho(e.target.value)} className="w-full p-1.5 border rounded text-xs" />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-stone-500">Preço (R$)</span>
                            <input type="number" step="0.01" value={novaVarPreco} onChange={(e) => setNovaVarPreco(Number(e.target.value))} className="w-full p-1.5 border rounded text-xs" />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-stone-500">Preço De (R$)</span>
                            <input type="number" step="0.01" value={novaVarPrecoDe} onChange={(e) => setNovaVarPrecoDe(Number(e.target.value))} className="w-full p-1.5 border rounded text-xs" />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-stone-500">Estoque</span>
                            <input type="number" value={novaVarEstoque} onChange={(e) => setNovaVarEstoque(Number(e.target.value))} className="w-full p-1.5 border rounded text-xs" />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <div>
                            <span className="text-[10px] font-bold text-stone-500">Peso (g)</span>
                            <input type="number" value={novaVarPeso} onChange={(e) => setNovaVarPeso(Number(e.target.value))} className="w-full p-1.5 border rounded text-xs" />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-stone-500">Alt (cm)</span>
                            <input type="number" value={novaVarAlt} onChange={(e) => setNovaVarAlt(Number(e.target.value))} className="w-full p-1.5 border rounded text-xs" />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-stone-500">Larg (cm)</span>
                            <input type="number" value={novaVarLarg} onChange={(e) => setNovaVarLarg(Number(e.target.value))} className="w-full p-1.5 border rounded text-xs" />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-stone-500">Comp (cm)</span>
                            <input type="number" value={novaVarComp} onChange={(e) => setNovaVarComp(Number(e.target.value))} className="w-full p-1.5 border rounded text-xs" />
                          </div>
                        </div>

                        <button
                          type="button"
                          disabled={adicionandoVar}
                          onClick={() => submitNovaVariacaoExistente(p.id)}
                          className="px-3 py-1.5 bg-emerald-800 text-white rounded text-xs font-bold hover:bg-emerald-900 cursor-pointer"
                        >
                          {adicionandoVar ? 'Adicionando...' : 'Salvar Variação'}
                        </button>
                      </div>
                    )}

                    {/* LISTA DE VARIAÇÕES COM BOTÃO REMOVER VARIAÇÃO SAFE */}
                    <div className="space-y-2">
                      {p.variants && p.variants.length > 0 ? (
                        p.variants.map((v, vIdx) => {
                          const varKey = v.id || `${p.id}-${v.size}-${vIdx}`;
                          const isConfirmandoThis = confirmandoVarId === `${p.id}-${varKey}`;

                          return (
                            <div key={varKey} className="p-2.5 bg-stone-50 rounded-lg border border-stone-200 flex flex-wrap items-center justify-between gap-2">
                              <div className="text-xs">
                                <span className="font-black text-stone-900">{v.size}</span>
                                <span className="text-stone-600 ml-2">Preço: <strong>{fmt(v.price)}</strong> (De: {fmt(v.originalPrice)})</span>
                                <span className="text-stone-500 ml-2">Estoque: {v.stock} un · Peso: {v.weight}g</span>
                              </div>

                              <div>
                                {isConfirmandoThis ? (
                                  <div className="flex items-center gap-1.5 bg-red-50 p-1 rounded border border-red-200">
                                    <span className="text-[10px] font-bold text-red-700">Excluir?</span>
                                    <button
                                      type="button"
                                      disabled={excluindoId === `${p.id}-${varKey}`}
                                      onClick={() => executarRemocaoVariacao(p.id, v.id || v.size, v.size)}
                                      className="px-2 py-0.5 bg-red-600 text-white rounded text-[10px] font-bold hover:bg-red-700"
                                    >
                                      Sim
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setConfirmandoVarId(null)}
                                      className="px-2 py-0.5 bg-stone-200 text-stone-700 rounded text-[10px] font-bold hover:bg-stone-300"
                                    >
                                      Não
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => setConfirmandoVarId(`${p.id}-${varKey}`)}
                                    className="px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 rounded text-xs font-bold hover:bg-red-100 transition flex items-center gap-1 cursor-pointer"
                                  >
                                    <Trash2 size={11} /> Excluir Variação
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-xs text-stone-400">Nenhuma variação cadastrada para este produto.</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* ABA 3: CADASTRAR NOVO PRODUTO */}
      {/* ======================================================== */}
      {abaAtiva === 'novo-produto' && (
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-6 max-w-3xl mx-auto">
          <div>
            <h2 className="text-xl font-black text-stone-900">Cadastrar Novo Produto</h2>
            <p className="text-xs text-stone-500 mt-1">
              Preencha os detalhes e variações para integrar ao catálogo e ao cálculo de frete do Melhor Envio.
            </p>
          </div>

          {sucessoNovoProduto && (
            <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 size={16} /> {sucessoNovoProduto}
            </div>
          )}

          {erroNovoProduto && (
            <div className="p-3 bg-red-50 text-red-800 border border-red-200 rounded-xl text-xs font-bold flex items-center gap-2">
              <AlertCircle size={16} /> {erroNovoProduto}
            </div>
          )}

          <form onSubmit={criarProdutoSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Nome do Produto</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Chips de Coco Lavado Orquídeas"
                  value={nome}
                  onChange={(e) => handleNomeChange(e.target.value)}
                  className="w-full p-2.5 border border-stone-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Slug (URL Amigável)</label>
                <input
                  type="text"
                  required
                  placeholder="chips-de-coco-lavado-orquideas"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full p-2.5 border border-stone-300 rounded-xl text-xs bg-stone-50 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Categoria Base</label>
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className="w-full p-2.5 border border-stone-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-green-600 bg-white"
                >
                  <option value="substratos">Substratos</option>
                  <option value="condicionadores">Condicionadores & Aeração</option>
                  <option value="fertilizantes">Fertilizantes / Nutrição Líquida</option>
                  <option value="adubos">Adubos Orgânicos</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">URL da Imagem</label>
                <input
                  type="text"
                  placeholder="/images/products/chips-coco.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full p-2.5 border border-stone-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Descrição Completa</label>
              <textarea
                rows={3}
                required
                placeholder="Descreva a composição, benefícios e modo de uso do produto..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2.5 border border-stone-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Características (1 por linha)</label>
              <textarea
                rows={3}
                placeholder="Baixa condutividade elétrica (EC)\nPH estável entre 5.8 e 6.5\nRetenção uniforme de umidade"
                value={featuresInput}
                onChange={(e) => setFeaturesInput(e.target.value)}
                className="w-full p-2.5 border border-stone-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>

            {/* VARIAÇÕES DO NOVO PRODUTO */}
            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
              <div className="flex justify-between items-center">
                <p className="text-xs font-black text-stone-800">Variações de Tamanho & Frete</p>
                <button
                  type="button"
                  onClick={adicionarVarianteNovo}
                  className="px-2.5 py-1 bg-green-700 text-white rounded text-xs font-bold hover:bg-green-800 transition flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={12} /> Add Variação
                </button>
              </div>

              {variantesNovo.map((v, idx) => (
                <div key={idx} className="p-3 bg-white rounded-lg border border-stone-200 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-green-800">Variação #{idx + 1}</span>
                    {variantesNovo.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removerVarianteNovo(idx)}
                        className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-[10px] font-bold hover:bg-red-200"
                      >
                        Remover
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-stone-500">Tamanho</span>
                      <input type="text" value={v.size} onChange={(e) => atualizarVarianteNovo(idx, 'size', e.target.value)} className="w-full p-1 border rounded text-xs" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-stone-500">Preço (R$)</span>
                      <input type="number" step="0.01" value={v.price} onChange={(e) => atualizarVarianteNovo(idx, 'price', e.target.value)} className="w-full p-1 border rounded text-xs" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-stone-500">Preço De (R$)</span>
                      <input type="number" step="0.01" value={v.originalPrice} onChange={(e) => atualizarVarianteNovo(idx, 'originalPrice', e.target.value)} className="w-full p-1 border rounded text-xs" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-stone-500">Estoque</span>
                      <input type="number" value={v.stock} onChange={(e) => atualizarVarianteNovo(idx, 'stock', e.target.value)} className="w-full p-1 border rounded text-xs" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-stone-500">Peso (g)</span>
                      <input type="number" value={v.weight} onChange={(e) => atualizarVarianteNovo(idx, 'weight', e.target.value)} className="w-full p-1 border rounded text-xs" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-stone-500">Alt (cm)</span>
                      <input type="number" value={v.height} onChange={(e) => atualizarVarianteNovo(idx, 'height', e.target.value)} className="w-full p-1 border rounded text-xs" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-stone-500">Larg (cm)</span>
                      <input type="number" value={v.width} onChange={(e) => atualizarVarianteNovo(idx, 'width', e.target.value)} className="w-full p-1 border rounded text-xs" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-stone-500">Comp (cm)</span>
                      <input type="number" value={v.length} onChange={(e) => atualizarVarianteNovo(idx, 'length', e.target.value)} className="w-full p-1 border rounded text-xs" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={salvandoProduto}
              className="w-full py-3 bg-green-800 text-white font-black text-xs rounded-xl hover:bg-green-900 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus size={16} /> {salvandoProduto ? 'Salvar Produto...' : 'Salvar Produto no Catálogo'}
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
