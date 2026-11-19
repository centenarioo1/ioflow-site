// lib/frete.ts
// Regra única de frete grátis: use este arquivo no carrinho (front) E em /api/mercadopago/process-payment (servidor).

export const FRETE_GRATIS_MINIMO = 129.0;

/**
 * Compara em centavos para evitar erro de ponto flutuante em JavaScript.
 * `>=` inclui exatamente R$ 129,00.
 */
export const temFreteGratisPorValor = (subtotalAposDesconto: number): boolean => {
  const subtotalCentavos = Math.round((subtotalAposDesconto || 0) * 100);
  const minimoCentavos = Math.round(FRETE_GRATIS_MINIMO * 100);
  return subtotalCentavos >= minimoCentavos;
};
