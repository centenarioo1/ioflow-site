import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. Suporta tanto cepDestino/itens quanto postalCode/items
    const destinationPostalCode = body.cepDestino || body.postalCode;
    const cartItems = body.itens || body.items || [];

    if (!destinationPostalCode) {
      return NextResponse.json(
        { error: 'CEP de destino é obrigatório' },
        { status: 400 }
      );
    }

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json(
        { error: 'Carrinho vazio ou formato inválido' },
        { status: 400 }
      );
    }

    const cleanCep = String(destinationPostalCode).replace(/\D/g, '');

    // 2. Formata cada produto para o payload oficial do Melhor Envio
    const formattedProducts = cartItems.map((item: any) => {
      // Trata peso em gramas (ex: 2600g -> 2.6kg) ou em KG (ex: 20kg -> 20kg)
      const rawWeight = item.weight || 0.3;
      const weightKg = rawWeight > 50 ? rawWeight / 1000 : rawWeight;

      // Lê dimensões aninhadas do objeto dimensions ou da raiz
      const width = item.dimensions?.width || item.width || 11;
      const height = item.dimensions?.height || item.height || 11;
      const length = item.dimensions?.length || item.length || 16;
      const price = item.price || 0;
      const quantity = item.quantity || 1;

      return {
        id: String(item.id || 'item'),
        width: Number(width),
        height: Number(height),
        length: Number(length),
        weight: Number(weightKg),
        insurance_value: Number(price),
        quantity: Number(quantity),
      };
    });

    const meToken = process.env.MELHOR_ENVIO_TOKEN;
    const originPostalCode = (process.env.MELHOR_ENVIO_POSTAL_CODE || '01001000').replace(/\D/g, '');

    if (!meToken) {
      console.error('MELHOR_ENVIO_TOKEN não configurado nas variáveis de ambiente.');
      return NextResponse.json(
        { error: 'Configuração de frete ausente no servidor (MELHOR_ENVIO_TOKEN)' },
        { status: 500 }
      );
    }

    // 3. Chamada à API oficial V2 do Melhor Envio
    const response = await fetch('[suspicious link removed]', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${meToken}`,
        'User-Agent': 'LojaBioflow contato@seudominio.com.br'
      },
      body: JSON.stringify({
        from: {
          postal_code: originPostalCode
        },
        to: {
          postal_code: cleanCep
        },
        products: formattedProducts
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro na API do Melhor Envio:', response.status, errorText);
      return NextResponse.json(
        { error: `Falha ao calcular frete no Melhor Envio (Status ${response.status})` },
        { status: response.status }
      );
    }

    const data = await response.json();

    // 4. Normalização da resposta para o front-end
    const validShippingOptions = Array.isArray(data)
      ? data
          .filter((shipping: any) => !shipping.error)
          .map((shipping: any) => {
            const companyName = shipping.company?.name || 'Transportadora';
            const serviceName = shipping.name || '';
            const price = parseFloat(shipping.custom_price || shipping.price || '0');
            const deliveryDays = parseInt(shipping.custom_delivery_time || shipping.delivery_time || '0', 10);

            return {
              id: String(shipping.id),
              nome: `${companyName} (${serviceName})`,
              valor: price,
              prazo: deliveryDays,
              transportadora: companyName,
              servico: serviceName,
              foto: shipping.company?.picture || null
            };
          })
      : [];

    return NextResponse.json({ opcoes: validShippingOptions });

  } catch (error: any) {
    console.error('Erro interno ao calcular frete:', error);
    return NextResponse.json(
      { error: 'Erro interno no servidor ao processar cotação de frete' },
      { status: 500 }
    );
  }
}