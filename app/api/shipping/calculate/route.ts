// app/api/shipping/calculate/route.ts
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const LIMITE_PESO_KG_PLAUSIVEL = 100;

const toNumber = (v: unknown): number => {
  if (typeof v === 'number') return v;
  const n = parseFloat(String(v ?? '').replace(',', '.'));
  return Number.isFinite(n) ? n : NaN;
};

const firstPositive = (...vals: unknown[]): number => {
  for (const v of vals) {
    const n = toNumber(v);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return NaN;
};

export async function POST(request: Request) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Corpo da requisição inválido (JSON esperado)' }, { status: 400 });
  }

  const destinationPostalCode = body.cepDestino || body.postalCode;
  const cartItems = body.itens || body.items || [];

  if (!destinationPostalCode) {
    return NextResponse.json({ error: 'CEP de destino é obrigatório' }, { status: 400 });
  }

  const cleanCep = String(destinationPostalCode).replace(/\D/g, '');
  if (cleanCep.length !== 8) {
    return NextResponse.json({ error: 'CEP de destino inválido' }, { status: 400 });
  }

  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    return NextResponse.json({ error: 'Carrinho vazio ou formato inválido' }, { status: 400 });
  }

  // 1. Variáveis de ambiente
  const meToken = process.env.MELHOR_ENVIO_TOKEN;
  const originPostalCode = (process.env.MELHOR_ENVIO_POSTAL_CODE || '').replace(/\D/g, '');
  const contactEmail = process.env.MELHOR_ENVIO_CONTACT_EMAIL || 'contato@biofloworganicos.com.br';
  const appName = process.env.MELHOR_ENVIO_APP_NAME || 'LojaBioflow';

  if (!meToken || originPostalCode.length !== 8) {
    console.error('Config de frete incompleta. Defina MELHOR_ENVIO_TOKEN e MELHOR_ENVIO_POSTAL_CODE (8 dígitos).');
    return NextResponse.json(
      { error: 'Configuração de frete ausente no servidor (MELHOR_ENVIO_TOKEN ou MELHOR_ENVIO_POSTAL_CODE)' },
      { status: 500 }
    );
  }

  const meHost = 'melhorenvio.com.br';
  const endpointUrl = process.env.MELHOR_ENVIO_ENDPOINT || `https://${meHost}/api/v2/me/shipment/calculate`;

  // 2. Formata os produtos
  const formattedProducts = cartItems.map((item: any) => {
    const rawWeight = firstPositive(item.weight, item.peso);
    const weightKg = rawWeight > LIMITE_PESO_KG_PLAUSIVEL ? rawWeight / 1000 : (rawWeight || 0.5);

    const width = firstPositive(item.dimensions?.width, item.width, item.largura) || 15;
    const height = firstPositive(item.dimensions?.height, item.height, item.altura) || 15;
    const length = firstPositive(item.dimensions?.length, item.length, item.comprimento) || 20;

    const price = Math.max(0, toNumber(item.price ?? item.preco) || 0);
    const quantity = Math.max(1, Math.floor(toNumber(item.quantity ?? item.quantidade) || 1));

    return {
      id: String(item.id || item.productId || 'item'),
      width,
      height,
      length,
      weight: weightKg,
      insurance_value: Number(price.toFixed(2)),
      quantity,
    };
  });

  // 3. Chamada à API V2 do Melhor Envio
  let response: Response;
  try {
    response = await fetch(endpointUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${meToken}`,
        'User-Agent': `${appName} (${contactEmail})`,
      },
      body: JSON.stringify({
        from: { postal_code: originPostalCode },
        to: { postal_code: cleanCep },
        products: formattedProducts,
      }),
      cache: 'no-store',
      signal: AbortSignal.timeout(15000),
    });
  } catch (error: any) {
    const timeout = error?.name === 'TimeoutError' || error?.name === 'AbortError';
    console.error('Falha de rede ao chamar o Melhor Envio:', error);
    return NextResponse.json(
      { error: timeout ? 'O cálculo de frete demorou demais. Tente novamente.' : 'Serviço de frete indisponível no momento.' },
      { status: timeout ? 504 : 502 }
    );
  }

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Erro na API do Melhor Envio:', response.status, errorText);
    return NextResponse.json(
      { error: 'Não foi possível calcular o frete agora. Tente novamente em instantes.' },
      { status: response.status === 422 ? 422 : 502 }
    );
  }

  let data: any;
  try {
    data = await response.json();
  } catch {
    console.error('Resposta do Melhor Envio não é um JSON válido');
    return NextResponse.json({ error: 'Resposta inválida do serviço de frete.' }, { status: 502 });
  }

  if (!Array.isArray(data)) {
    console.error('Resposta inesperada do Melhor Envio:', JSON.stringify(data));
    return NextResponse.json({ error: 'Resposta inválida do serviço de frete.' }, { status: 502 });
  }

  // 4. Normalização: filtra erros, calcula preços válidos e ordena por menor preço
  const motivos: string[] = [];
  const opcoes: {
    id: string;
    nome: string;
    valor: number;
    prazo: number;
    transportadora: string;
    servico: string;
    foto: string | null;
  }[] = [];

  for (const shipping of data) {
    const companyName = shipping.company?.name || 'Transportadora';
    const serviceName = shipping.name || '';

    if (shipping.error) {
      motivos.push(`${companyName} ${serviceName}: ${shipping.error}`);
      continue;
    }

    const finalPrice = firstPositive(shipping.custom_price, shipping.price);
    if (!Number.isFinite(finalPrice) || finalPrice <= 0) {
      motivos.push(`${companyName} ${serviceName}: sem preço retornado ou preço zero`);
      continue;
    }

    const prazo = parseInt(String(shipping.custom_delivery_time ?? shipping.delivery_time ?? '0'), 10);

    opcoes.push({
      id: String(shipping.id),
      nome: `${companyName} (${serviceName})`,
      valor: Number(finalPrice.toFixed(2)),
      prazo: Number.isFinite(prazo) ? prazo : 0,
      transportadora: companyName,
      servico: serviceName,
      foto: shipping.company?.picture || null,
    });
  }

  // Ordena por menor preço primeiro
  opcoes.sort((a, b) => a.valor - b.valor || a.prazo - b.prazo);

  // 🟢 REGRA DE NEGÓCIO: Retorna apenas as 4 opções mais baratas
  const quatroMaisBaratos = opcoes.slice(0, 4);

  if (quatroMaisBaratos.length === 0) {
    console.warn('Nenhuma opção de frete válida para o CEP', cleanCep, motivos);
  }

  return NextResponse.json({ 
    opcoes: quatroMaisBaratos, 
    motivos: quatroMaisBaratos.length === 0 ? motivos : undefined 
  });
}
