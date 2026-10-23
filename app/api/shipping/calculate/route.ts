import { NextResponse } from 'next/server';

interface ProdutoMedidas {
  pesoKg: number;
  comprimentoCm: number;
  larguraCm: number;
  alturaCm: number;
}

const DICIONARIO_PRODUTOS: Record<string, ProdutoMedidas> = {
  "58206317707": {
    pesoKg: 0.35, // 350g convertido para kg
    comprimentoCm: 15,
    larguraCm: 15,
    alturaCm: 10
  }
};

export async function POST(req: Request) {
  try {
    const { cepDestino, itens } = await req.json();

    if (!cepDestino || !itens || itens.length === 0) {
      return NextResponse.json({ error: 'CEP de destino e itens são obrigatórios.' }, { status: 400 });
    }

    const token = process.env.MELHOR_ENVIO_TOKEN;
    const apiUrl = process.env.MELHOR_ENVIO_API_URL || 'https://sandbox.melhorenvio.com.br';

    if (!token) {
      return NextResponse.json({ error: 'Token de frete não configurado no servidor.' }, { status: 500 });
    }

    const cepOrigem = '16603268'; 

    let pesoTotalCaixa = 0;
    let volumeTotalCc = 0;
    let valorTotalSeguro = 0;

    itens.forEach((it: any) => {
      const cadastroReal = DICIONARIO_PRODUTOS[it.productId];
      let pesoItem = 1.0;
      let comp = 15;
      let larg = 15;
      let alt = 10;

      if (cadastroReal) {
        pesoItem = cadastroReal.pesoKg;
        comp = cadastroReal.comprimentoCm;
        larg = cadastroReal.larguraCm;
        alt = cadastroReal.alturaCm;
      } else {
        let pesoEnviado = it.weight || 1.0;
        if (pesoEnviado > 15) {
          pesoEnviado = pesoEnviado / 1000;
        }
        pesoItem = pesoEnviado;

        if (pesoItem <= 0.5) {
          comp = 15; larg = 12; alt = 8;
        } else if (pesoItem <= 1.5) {
          comp = 20; larg = 15; alt = 12;
        } else {
          comp = 25; larg = 20; alt = 15;
        }
      }

      const qtd = it.quantity || 1;
      pesoTotalCaixa += (pesoItem * qtd);
      valorTotalSeguro += ((it.preco || 30) * qtd);
      volumeTotalCc += ((comp * larg * alt) * qtd);
    });

    const dimensaoAproximada = Math.max(15, Math.ceil(Math.cbrt(volumeTotalCc)));

    const bodyPayload = {
      from: { postal_code: cepOrigem },
      to: { postal_code: cepDestino },
      volumes: [
        {
          height: Math.min(dimensaoAproximada, 105),
          width: Math.min(dimensaoAproximada, 105),
          length: Math.min(dimensaoAproximada, 105),
          weight: Math.min(pesoTotalCaixa, 30.0),
          insurance_value: valorTotalSeguro
        }
      ]
    };

    const response = await fetch(`${apiUrl}/api/v2/me/shipment/calculate`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'User-Agent': 'BioFlow App (contato@bioflow.com.br)'
      },
      body: JSON.stringify(bodyPayload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ [Melhor Envio Sandbox] Erro na API (${response.status}):`, errorText);
      return NextResponse.json({ error: 'Erro de resposta da transportadora.' }, { status: response.status });
    }

    const opcoesDeFrete = await response.json();

    // 🔍 LINHA DE DIAGNÓSTICO: Mostra no seu terminal CMD o que o Sandbox realmente devolveu!
    console.log('🔵 [Sandbox] Transportadoras retornadas pela API:', JSON.stringify(opcoesDeFrete, null, 2));

    const opcoesValidas = opcoesDeFrete
      .filter((opcao: any) => !opcao.error && opcao.price)
      .map((opcao: any) => ({
        id: opcao.id,
        nome: `${opcao.company.name} (${opcao.name})`,
        valor: parseFloat(opcao.price),
        prazo: opcao.delivery_time
      }));

    if (opcoesValidas.length === 0) {
      return NextResponse.json({ error: 'Nenhum serviço de entrega disponível no Sandbox para este CEP.' }, { status: 404 });
    }

    return NextResponse.json({ opcoes: opcoesValidas });

  } catch (error) {
    console.error('❌ Erro crítico no cálculo de frete:', error);
    return NextResponse.json({ error: 'Erro interno no servidor ao processar o frete.' }, { status: 500 });
  }
}