// components/CartDrawer.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';

export default function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, getTotal } = useCartStore();

  if (!isOpen) return null;

  const total = getTotal();

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', justifyContent: 'flex-end' }}>
      {/* Backdrop escuro com fecho ao clicar */}
      <div 
        onClick={closeCart} 
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)' }} 
      />

      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 420,
          background: '#ffffff',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-8px 0 30px rgba(0,0,0,0.2)',
          zIndex: 10000,
        }}
      >
        {/* Cabeçalho da Gaveta */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f0eee6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ShoppingBag size={20} color="#15803d" />
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: '#111827' }}>Seu Carrinho</h3>
          </div>
          <button onClick={closeCart} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4 }}>
            <X size={22} color="#6b7280" />
          </button>
        </div>

        {/* Lista de Itens no Carrinho */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#6b7280' }}>
              <ShoppingBag size={48} color="#d1d5db" style={{ margin: '0 auto 16px' }} />
              <p style={{ fontSize: 16, fontWeight: 700, margin: '0 0 6px', color: '#374151' }}>Seu carrinho está vazio</p>
              <p style={{ fontSize: 13, margin: 0 }}>Adicione fertilizantes e substratos para turbinar seu cultivo.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {items.map((item) => {
                // Compatibilidade flexível para propriedades de imagem, nome e variação
                const imgUrl = item.imagem || (item as any).image;
                const nameStr = item.nome || (item as any).name || 'Produto';
                const sizeStr = item.variacao || (item as any).size;

                return (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: 12,
                      borderRadius: 12,
                      border: '1px solid #f0eee6',
                      background: '#faf9f5',
                    }}
                  >
                    {/* 🟢 MINIATURA DA IMAGEM DO PRODUTO */}
                    {imgUrl ? (
                      <img
                        src={imgUrl}
                        alt={nameStr}
                        style={{
                          width: 48,
                          height: 48,
                          objectFit: 'cover',
                          borderRadius: 8,
                          border: '1px solid #e5e7eb',
                          flexShrink: 0,
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          background: '#f3f4f6',
                          borderRadius: 8,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1px solid #e5e7eb',
                          flexShrink: 0,
                        }}
                      >
                        <ShoppingBag size={20} color="#15803d" />
                      </div>
                    )}

                    {/* Detalhes do Item */}
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: 13.5, fontWeight: 800, margin: '0 0 3px', color: '#111827', lineHeight: 1.25 }}>
                        {nameStr}
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {sizeStr && (
                          <span style={{ fontSize: 10.5, fontWeight: 800, background: '#dcfce7', color: '#166534', padding: '1px 6px', borderRadius: 4 }}>
                            {sizeStr}
                          </span>
                        )}
                        <span style={{ fontSize: 11, color: '#6b7280' }}>
                          R$ {(item.preco || (item as any).price || 0).toFixed(2).replace('.', ',')} un
                        </span>
                      </div>
                      <p style={{ fontSize: 13.5, fontWeight: 900, color: '#15803d', margin: '4px 0 0' }}>
                        R$ {((item.preco || (item as any).price || 0) * item.quantity).toFixed(2).replace('.', ',')}
                      </p>
                    </div>

                    {/* Controles de Quantidade */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'white', padding: '4px 8px', borderRadius: 8, border: '1px solid #e5e7eb' }}>
                      <button onClick={() => updateQuantity(item.id, -1)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
                        <Minus size={13} />
                      </button>
                      <span style={{ fontSize: 12, fontWeight: 800, minWidth: 16, textAlign: 'center' }}>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
                        <Plus size={13} />
                      </button>
                    </div>

                    {/* Botão Remover */}
                    <button onClick={() => removeItem(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                      <Trash2 size={16} color="#ef4444" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Rodapé do Carrinho com Subtotal e Botão Checkout */}
        {items.length > 0 && (
          <div style={{ padding: '20px 24px', borderTop: '1px solid #f0eee6', background: '#ffffff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
              <span style={{ fontSize: 14, color: '#6b7280', fontWeight: 600 }}>Subtotal:</span>
              <span style={{ fontSize: 24, fontWeight: 900, color: '#111827' }}>
                R$ {total.toFixed(2).replace('.', ',')}
              </span>
            </div>

            <Link
              href="/carrinho"
              onClick={closeCart}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                background: '#15803d',
                color: '#ffffff',
                textDecoration: 'none',
                padding: '14px',
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 900,
                boxShadow: '0 4px 14px rgba(21, 128, 61, 0.3)',
              }}
            >
              Finalizar Pedido <ArrowRight size={18} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}