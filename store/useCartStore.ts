// store/useCartStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;             // id único (produto + variação)
  productId?: string;
  variantId?: string;
  nome: string;           // Suporta ambos PT e EN para compatibilidade total
  name: string;
  preco: number;
  price: number;
  originalPrice?: number;
  variacao?: string;
  size?: string;
  imagem?: string;
  image?: string;
  dimensions?: {
    height: number;
    width: number;
    length: number;
  } | any;
  weight?: number;        // peso em gramas ou kg
  quantity: number;
}

type AddInput = {
  id: string;
  productId?: string;
  variantId?: string;
  nome?: string;
  name?: string;
  preco?: number;
  price?: number;
  originalPrice?: number;
  variacao?: string;
  size?: string;
  dimensions?: any;
  imagem?: string;
  image?: string;
  weight?: number;
  quantity?: number;
};

function normalize(input: AddInput): Omit<CartItem, 'quantity'> {
  const nome = input.nome ?? input.name ?? 'Produto';
  const preco = Number(input.preco ?? input.price ?? 0);
  const variacao = input.variacao ?? input.size;
  const imagem = input.imagem ?? input.image;

  return {
    id: input.id,
    productId: input.productId,
    variantId: input.variantId,
    nome,
    name: nome,
    preco,
    price: preco,
    originalPrice: input.originalPrice,
    variacao,
    size: variacao,
    imagem,
    image: imagem,
    dimensions: input.dimensions, // CORRIGIDO: Preserva as dimensões do produto no carrinho
    weight: input.weight,
  };
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (item: AddInput) => void;
  addItem: (item: AddInput, quantity?: number) => void;
  removeItem: (id: string, variacao?: string) => void;
  updateQuantity: (id: string, quantity: number, variacao?: string) => void;
  clearCart: () => void;
  totalItems: () => number;
  getTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      addToCart: (input) =>
        set((state) => {
          const item = normalize(input);
          const qty = Number(input.quantity) || 1;
          const existente = state.items.find(
            (i) => i.id === item.id && (item.variacao ? i.variacao === item.variacao : true)
          );
          if (existente) {
            return {
              items: state.items.map((i) =>
                i.id === item.id && (item.variacao ? i.variacao === item.variacao : true)
                  ? { ...i, quantity: i.quantity + qty }
                  : i
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity: qty }] };
        }),

      addItem: (input, quantity = 1) => {
        get().addToCart({ ...input, quantity: Number(input.quantity) || quantity });
      },

      removeItem: (id, variacao) =>
        set((state) => ({
          items: state.items.filter((i) => {
            if (i.id !== id) return true;
            if (variacao !== undefined && i.variacao !== variacao && i.size !== variacao) {
              return true;
            }
            return false;
          }),
        })),

      updateQuantity: (id, quantity, variacao) =>
        set((state) => {
          const isTarget = (i: CartItem) => {
            if (i.id !== id) return false;
            if (variacao !== undefined && i.variacao !== variacao && i.size !== variacao) return false;
            return true;
          };

          if (quantity <= 0) {
            return { items: state.items.filter((i) => !isTarget(i)) };
          }

          return {
            items: state.items.map((i) => (isTarget(i) ? { ...i, quantity } : i)),
          };
        }),

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.reduce((acc, i) => acc + i.quantity, 0),

      getTotal: () => get().items.reduce((acc, i) => acc + (i.preco || i.price || 0) * i.quantity, 0),
    }),
    { name: 'bioflow_cart' }
  )
);
