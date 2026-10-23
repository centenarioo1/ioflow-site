// app/admin/pedidos/AdminPedidosClient.tsx
'use client';

import React, { useState } from 'react';
import { 
  Package, 
  Search, 
  Truck, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  ExternalLink, 
  MapPin, 
  Phone, 
  Mail, 
  DollarSign, 
  Send,
  Tag,
  CreditCard,
  Ticket
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
  cupomCodigo?: string | null;
  status: string;
  mpPaymentId?: string | null;
  createdAt: Date | string;
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

export default function AdminPedidosClient({ initialOrders }: { initialOrders: OrderData[] }) {
  const [orders, setOrders] = useState<OrderData[]>(initialOrders);
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  // Totais para os Cards de KPI
  const totalFaturado = orders
    .filter((o) => o.status === 'Aprovado' || o.status === 'Enviado' || o.status === 'Entregue')
    .reduce((acc, o) => acc + o.total, 0);

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
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerCpf.includes(searchTerm);
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* CABEÇALHO DO PAINEL */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2">
            <Package className="w-7 h-7 text-green-700" />
            Painel de Administração de Pedidos
          </h1>
          <p className="text-sm text-stone-600">
            Gerencie o ciclo de faturamento, separação e envio dos pedidos da BIOFLOW.
          </p>
        </div>
      </div>

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
              R$ {totalFaturado.toFixed(2).replace('.', ',')}
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
                {/* TOPO DO PEDIDO */}
                <div className="bg-stone-50/80 p-4 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-black text-sm text-stone-800">
                      #{order.id.slice(-8).toUpperCase()}
                    </span>
                    <span className="text-xs text-stone-500">
                      {new Date(order.createdAt).toLocaleString('pt-BR')}
                    </span>
                  </div>

                  {/* SELETOR DE STATUS */}
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

                {/* CORPO DO PEDIDO: DADOS DO CLIENTE + ENDEREÇO + PRODUTOS */}
                <div className="p-5 grid grid-cols-1 md:grid-cols-12 gap-6">
                  
                  {/* Comprador, Endereço, Envio & Pagamento */}
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

                    {/* 🟢 ENVIO ESCOLHIDO */}
                    <div className="pt-2 border-t border-stone-100 flex items-center gap-1.5">
                      <Truck size={13} className="text-green-700 shrink-0" />
                      <span className="font-bold text-stone-700">Envio: </span>
                      <span className="text-stone-800 font-bold bg-green-50 text-green-800 px-2 py-0.5 rounded border border-green-200">
                        {order.shippingServiceName || 'Padrão'} (R$ {order.shippingCost.toFixed(2).replace('.', ',')})
                      </span>
                    </div>

                    {/* 🟢 FORMA DE PAGAMENTO */}
                    <div className="pt-1 flex items-center gap-1.5">
                      <CreditCard size={13} className="text-stone-500 shrink-0" />
                      <span className="font-bold text-stone-700">Pagamento: </span>
                      <span className="text-stone-800 font-medium">
                        Mercado Pago {order.mpPaymentId ? `(ID: ${order.mpPaymentId})` : '(Aguardando)'}
                      </span>
                    </div>
                  </div>

                  {/* Itens do Pedido */}
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
                            R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Rastreio */}
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

                  {/* Resumo Financeiro & Cupom */}
                  <div className="md:col-span-3 bg-stone-50 p-4 rounded-xl flex flex-col justify-between border border-stone-100">
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between text-stone-500">
                        <span>Subtotal:</span>
                        <span>R$ {order.subtotal.toFixed(2).replace('.', ',')}</span>
                      </div>

                      {/* 🟢 CUPOM UTILIZADO */}
                      {order.cupomCodigo && (
                        <div className="flex justify-between text-emerald-800 font-bold bg-emerald-100/70 p-1.5 rounded border border-emerald-200 text-[11px]">
                          <span className="flex items-center gap-1">
                            <Tag size={12} className="text-emerald-700" />
                            {order.cupomCodigo}
                          </span>
                          <span>- R$ {order.desconto.toFixed(2).replace('.', ',')}</span>
                        </div>
                      )}

                      {!order.cupomCodigo && order.desconto > 0 && (
                        <div className="flex justify-between text-emerald-700 font-bold">
                          <span>Desconto:</span>
                          <span>- R$ {order.desconto.toFixed(2).replace('.', ',')}</span>
                        </div>
                      )}

                      <div className="flex justify-between text-stone-500">
                        <span>Frete ({order.shippingServiceName || 'Padrão'}):</span>
                        <span>R$ {order.shippingCost.toFixed(2).replace('.', ',')}</span>
                      </div>

                      <div className="flex justify-between text-sm font-black text-stone-900 border-t border-stone-200 pt-2">
                        <span>Total:</span>
                        <span className="text-green-900">
                          R$ {order.total.toFixed(2).replace('.', ',')}
                        </span>
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
  );
}