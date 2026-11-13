// app/api/test-email/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { enviarEmailConfirmacaoPedido } from '@/lib/email';

export async function GET() {
  try {
    console.log('🧪 Testing Resend direct send...');
    
    const res = await enviarEmailConfirmacaoPedido({
      emailCliente: 'seuemailaqui@gmail.com', // 👈 Substitua pelo seu e-mail real para o teste
      nomeCliente: 'Cultivador Teste',
      numeroPedido: 'TESTE-123',
      itens: [
        { nome: 'Adubo Bioflow Organomineral 1L', quantidade: 1, preco: 49.90 }
      ],
      valorTotal: 49.90,
      metodoPagamento: 'PIX (Teste Direto)',
      enderecoEntrega: 'Rua de Teste, 123 - São Paulo/SP'
    });

    return NextResponse.json({ ok: true, resendResponse: res });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}