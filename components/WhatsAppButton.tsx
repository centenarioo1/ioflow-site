// components/WhatsAppButton.tsx
'use client';

import React from 'react';

// Troque o número abaixo pelo seu WhatsApp comercial (formato: 55DDDNUMERO)
const NUMERO_WHATSAPP = '5517999999999';
const MENSAGEM_PADRAO = 'Olá! Tenho uma dúvida sobre os produtos BIOFLOW.';

export default function WhatsAppButton() {
  const link = `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(MENSAGEM_PADRAO)}`;

  return (
    <a href={link} target="_blank" rel="noopener noreferrer" style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 200,
      width: 56, height: 56, borderRadius: '50%',
      background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 6px 20px rgba(0,0,0,0.25)', textDecoration: 'none',
    }}>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.79.47 3.55 1.36 5.1L2 22l5.14-1.44a9.9 9.9 0 0 0 4.9 1.28h.01c5.46 0 9.9-4.45 9.9-9.91C21.96 6.45 17.5 2 12.04 2Zm5.86 14.07c-.25.7-1.24 1.28-2.02 1.44-.53.11-1.23.2-3.6-.77-2.86-1.19-4.71-4.1-4.85-4.29-.14-.19-1.16-1.55-1.16-2.96 0-1.41.73-2.1 1-2.39.25-.27.55-.34.73-.34.19 0 .37 0 .53.01.17.01.4-.06.62.48.25.6.85 2.08.92 2.23.07.15.12.33.02.53-.09.19-.14.31-.28.48-.14.17-.29.37-.42.5-.14.14-.28.29-.12.57.16.28.71 1.18 1.53 1.91 1.05.94 1.94 1.24 2.22 1.38.28.14.44.12.6-.07.17-.19.71-.83.9-1.11.19-.28.37-.23.63-.14.25.09 1.61.76 1.89.9.28.14.46.21.53.33.07.12.07.68-.18 1.38Z"/>
      </svg>
    </a>
  );
}
