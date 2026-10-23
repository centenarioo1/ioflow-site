import { prisma } from '@/lib/prisma';

// Tipagens locais flexíveis para ignorar a checagem estrita de exportação do Prisma Client no Vercel
export interface User {
  id: string;
  nome?: string | null;
  email: string;
  role?: string | null;
  [key: string]: any;
}

export interface Order {
  id: string;
  userId?: string | null;
  total: number;
  status?: string | null;
  items?: unknown;
  shippingCost?: number;
  cupomCodigo?: string | null;
  customerName?: string | null;
  customerEmail?: string | null;
  shippingCep?: string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  [key: string]: any;
}

export type OrderItemView = {
  produtoId: string;
  nome: string;
  variacao?: string;
  preco: number;
  quantity: number;
};

export function mapOrderItems(items: unknown): OrderItemView[] {
  if (!Array.isArray(items)) return [];
  return items.map((raw) => {
    const it = raw as Record<string, unknown>;
    const variacao = it.variacao ?? it.size;
    return {
      produtoId: String(it.produtoId ?? it.productId ?? it.id ?? ''),
      nome: String(it.nome ?? it.name ?? 'Produto'),
      variacao: variacao ? String(variacao) : undefined,
      preco: Number(it.preco ?? it.price ?? 0),
      quantity: Number(it.quantity ?? 1),
    };
  });
}

export function serializeOrder(
  order: Order & { user?: Pick<User, 'nome' | 'email'> | null }
) {
  const o = order as Record<string, any>;
  return {
    ...order,
    orderNumber: `BF-${String(order.id || '').slice(-8).toUpperCase()}`,
    items: mapOrderItems(order.items),
    frete: o.shippingCost ?? o.frete ?? 0,
    cupom: o.cupomCodigo || o.cupom || undefined,
    cliente: {
      nome: order.user?.nome || o.customerName || o.nomeCliente || 'Cliente',
      email: order.user?.email || o.customerEmail || o.emailCliente || '',
    },
    endereco: { cep: o.shippingCep || o.cep || '' },
  };
}