// lib/analytics.ts

// Gera ou recupera o id de sessão do visitante
export const getSessionId = (): string => {
  if (typeof window === 'undefined') return '';
  let sid = sessionStorage.getItem('bioflow_analytics_sid');
  if (!sid) {
    sid = 'sid_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
    sessionStorage.setItem('bioflow_analytics_sid', sid);
  }
  return sid;
};

// Envia o evento de rastreamento para a API sem bloquear a interface
export const trackEvent = (type: 'VISIT' | 'PRODUCT_CLICK' | 'ADD_TO_CART', data?: { productId?: string; productName?: string }) => {
  if (typeof window === 'undefined') return;

  const payload = {
    type,
    productId: data?.productId,
    productName: data?.productName,
    sessionId: getSessionId(),
  };

  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      navigator.sendBeacon('/api/analytics/track', blob);
    } else {
      fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {});
    }
  } catch (e) {
    console.warn('Erro ao disparar evento de métricas:', e);
  }
};