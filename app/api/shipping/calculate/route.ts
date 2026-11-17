// app/api/shipping/calculate/route.ts
import { NextResponse } from 'next/server';
import { cotarMelhorEnvio, ErroFrete } from '@/lib/shipping';
import { MAX_OPCOES_FRETE } from '@/lib/frete';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Corpo da requisição inválido' }, { status: 400 });
  }

  const destinationPostalCode = body.cepDestino || body.postalCode;
  const cartItems = body.itens || body.items || [];

  if (!destinationPostalCode) {
    return NextResponse.json({ error: 'CEP de destino é obrigatório' }, { status: 400 });
  }

  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    return NextResponse.json({ error: 'Carrinho vazio ou formato inválido' }, { status: 400 });
  }

  try {
    const { opcoes, motivos } = await cotarMelhorEnvio(String(destinationPostalCode), cartItems);

    // Só as opções mais baratas aparecem para o cliente; o resto fica oculto.
    const principais = opcoes.slice(0, MAX_OPCOES_FRETE);

    return NextResponse.json({
      opcoes: principais,
      motivos: principais.length === 0 ? motivos : undefined,
    });
  } catch (error: any) {
    if (error instanceof ErroFrete) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('Erro interno ao calcular frete:', error);
    return NextResponse.json(
      { error: 'Erro interno no servidor ao processar cotação de frete' },
      { status: 500 }
    );
  }
}
