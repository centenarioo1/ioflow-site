// lib/frete.ts
// Regras de frete usadas no carrinho (front) E no servidor (cotação e pagamento).

// Frete grátis para pedidos a partir deste valor (subtotal já com o desconto do cupom).
export const FRETE_GRATIS_MINIMO = 129.0;

// Quantas opções de frete aparecem para o cliente (as mais baratas).
export const MAX_OPCOES_FRETE = 4;

// Compara em centavos para evitar erro de ponto flutuante.
// `>=` inclui exatamente o mínimo. Se quiser só valores ACIMA, troque por `>`.
export const temFreteGratisPorValor = (subtotalAposDesconto: number): boolean =>
  Math.round(subtotalAposDesconto * 100) >= Math.round(FRETE_GRATIS_MINIMO * 100);
