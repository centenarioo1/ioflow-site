// app/api/shipping/calculate/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { cepDestino, itens } = body;

    if (!cepDestino) {
      return NextResponse.json({ error: 'CEP de destino é obrigatório' }, { status: 400 });
    }

    // Mapeamento correto lendo as dimensões aninhadas e o peso
    const productsFormatted = itens.map((item: any) => {
      // Se o peso for maior que 50, assume gramas e converte em KG (ex: 2600g -> 2.6kg). Se for <= 50, já está em KG (ex: 20kg).
      const weightKg = item.weight ? (item.weight > 50 ? item.weight / 1000 : item.weight) : 0.3;

      return {
        id: item.id,
        width: item.dimensions?.width || item.width || 11,
        height: item.dimensions?.height || item.height || 11,
        length: item.dimensions?.length || item.length || 16,
        weight: weightKg,
        insurance_value: item.price || 0,
        quantity: item.quantity || 1
      };
    });

    const response = await fetch('[suspicious link removed]', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MELHOR_ENVIO_TOKEN}`,
        'User-Agent': 'Aplicaçao contato@seudominio.com.br'
      },
      body: JSON.stringify({
        from: {
          postal_code: process.env.MELHOR_ENVIO_POSTAL_CODE || '01001000'
        },
        to: {
          postal_code: cepDestino.replace(/\D/g, '')
        },
        products: productsFormatted
      })
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Falha ao calcular frete no Melhor Envio' }, { status: response.status });
    }

    const data = await response.json();
    const validShipping = data.filter((shipping: any) => !shipping.error);

    return NextResponse.json({ opcoes: validShipping });
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno no cálculo de frete' }, { status: 500 });
  }
}