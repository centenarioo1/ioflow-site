// app/api/shipping/calculate/route.ts
import { NextResponse } from 'next/server';

interface ProdutoMedidas {
  pesoKg: number;
  comprimentoCm: number;
  larguraCm: number;
  alturaCm: number;
}

// Dicionário de peso e dimensões dos produtos reais da Bioflow
const DICIONARIO_PRODUTOS: Record<string, ProdutoMedidas> = {
  "58206317707": {
    pesoKg: 0.35, // 350g
    comprimentoCm: 15,
    larguraCm: 15,
    alturaCm: 10,
  },
};

export async function POST(req: Request) {
  try {
    const { cepDestino, itens } = await req.json();

    if (!cepDestino || !itens || !Array.isArray(itens) || itens.length === 0) {
      return NextResponse.json(
        { error: 'CEP de destino e itens válidos são obrigatórios.' },
        { status: 400 }
      );
    }

    const token = process.env.MELHOR_ENVIO_TOKEN;
    // Trata a URL limpando barras finais
    const baseUrl = (process.env.MELHOR_ENVIO_API_URL || 'https://melhorenvio.com.br/').replace(/\/+$/, '');

    if (!token) {
      console.error('❌ [Frete API] MELHOR_ENVIO_TOKEN não foi configurado nas variáveis de ambiente.');
      return NextResponse.json(
        { error: 'Token de frete não configurado no servidor.' },
        { status: 500 }
      );
    }

    const cepOrigem = '16603268'; // CEP de Origem (Pirajuí - SP)
    const cepDestinoLimpo = String(cepDestino).replace(/\D/g, '');

    // Mapeia os itens do carrinho enviando dimensões reais para a API
    const productsPayload = itens.map((it: any) => {
      const productId = String(it.productId || it.id || '');
      const cadastroReal = DICIONARIO_PRODUTOS[productId];

      let weight = 0.35;
      let width = 15;
      let height = 10;
      let length = 15;

      if (cadastroReal) {
        weight = cadastroReal.pesoKg;
        width = cadastroReal.larguraCm;
        height = cadastroReal.alturaCm;
        length = cadastroReal.comprimentoCm;
      } else {
        let pesoEnviado = Number(it.weight || 0.35);
        if (pesoEnviado > 15) pesoEnviado = pesoEnviado / 1000;
        weight = Math.max(0.1, pesoEnviado);
      }

      const quantity = Number(it.quantity || it.qtd || 1);
      const unitValue = Number(it.preco || it.price || 30);

      return {
        id: productId,
        width,
        height,
        length,
        weight,
        insurance_value: unitValue,
        quantity,
      };
    });

    const bodyPayload = {
      from: { postal_code: cepOrigem },
      to: { postal_code: cepDestinoLimpo },
      products: productsPayload,
    };

    // Monta a URL garantindo que /api/v2 não seja duplicado
    const targetUrl = baseUrl.includes('/api/v2')
      ? `${baseUrl}/me/shipment/calculate`
      : `${baseUrl}/api/v2/me/shipment/calculate`;

    console.log('🔵 [Frete API] Consultando no Melhor Envio:', { targetUrl, cepOrigem, cepDestinoLimpo });

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'User-Agent': 'BioFlow App (contato@bioflow.com.br)',
      },
      body: JSON.stringify(bodyPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ [Melhor Envio] Erro HTTP ${response.status}:`, errorText);
      return NextResponse.json(
        { error: `Erro na API do Melhor Envio: ${response.statusText}` },
        { status: response.status }
      );
    }

    const opcoesDeFrete = await response.json();

    if (!Array.isArray(opcoesDeFrete)) {
      console.error('❌ [Melhor Envio] Resposta da API não veio em formato de lista:', opcoesDeFrete);
      return NextResponse.json({ opcoes: [] });
    }

    // Filtra opções válidas com preço real
    const opcoesValidas = opcoesDeFrete
      .filter((opcao: any) => !opcao.error && opcao.price)
      .map((opcao: any) => ({
        id: String(opcao.id),
        nome: `${opcao.company?.name || 'Transportadora'} (${opcao.name})`,
        valor: parseFloat(opcao.price),
        prazo: opcao.custom_delivery_time || opcao.delivery_time || 5,
        empresa: opcao.company?.name,
      }));

    return NextResponse.json({ opcoes: opcoesValidas });

  } catch (err: any) {
    console.error('❌ [Frete API] Erro interno no processamento:', err);
    return NextResponse.json(
      { error: 'Erro interno ao calcular frete.' },
      { status: 500 }
    );
  }
}