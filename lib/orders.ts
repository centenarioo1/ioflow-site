import type { Order, User } from '@prisma/client';

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
  return {
    ...order,
    orderNumber: `BF-${order.id.slice(-8).toUpperCase()}`,
    items: mapOrderItems(order.items),
    frete: order.shippingCost,
    cupom: order.cupomCodigo || undefined,
    cliente: {
      nome: order.user?.nome || order.customerName,
      email: order.user?.email || order.customerEmail,
    },
    endereco: { cep: order.shippingCep },
  };
}
