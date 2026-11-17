// lib/shipping.ts  (uso exclusivo no servidor)
// Cotação no Melhor Envio. Usada por /api/shipping/calculate (mostrar opções)
// e por /api/mercadopago/process-payment (recotar no servidor e não confiar no navegador).

// Se o peso informado for maior que isso, assume-se que está em GRAMAS (ex.: 2600 -> 2,6 kg).
// Ideal: padronizar o cadastro dos produtos sempre em KG e remover essa heurística.
const LIMITE_PESO_KG_PLAUSIVEL = 100;

export class ErroFrete extends Error {
  status: number;
  constructor(message: string, status = 500) {
    super(message);
    this.name = 'ErroFrete';
    this.status = status;
  }
}

export type OpcaoFrete = {
  id: string;
  nome: string;
  valor: number;
  prazo: number;
  transportadora: string;
  servico: string;
  foto: string | null;
};

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

export function montarProdutosMelhorEnvio(itens: any[]) {
  const invalidos: string[] = [];

  const produtos = itens.map((item: any) => {
    const nome = String(item.nome || item.name || item.id || 'item');

    const rawWeight = firstPositive(item.weight, item.peso);
    const weightKg = rawWeight > LIMITE_PESO_KG_PLAUSIVEL ? rawWeight / 1000 : rawWeight;

    const width = firstPositive(item.dimensions?.width, item.width, item.largura);
    const height = firstPositive(item.dimensions?.height, item.height, item.altura);
    const length = firstPositive(item.dimensions?.length, item.length, item.comprimento);

    if (![weightKg, width, height, length].every((n) => Number.isFinite(n) && n > 0)) {
      invalidos.push(nome);
    }

    const price = Math.max(0, toNumber(item.price ?? item.preco) || 0);
    const quantity = Math.max(1, Math.floor(toNumber(item.quantity ?? item.quantidade) || 1));

    return {
      id: String(item.id || item.productId || 'item'),
      width,
      height,
      length,
      weight: weightKg,
      insurance_value: Number(price.toFixed(2)), // valor unitário; a API multiplica pela quantity
      quantity,
    };
  });

  if (invalidos.length > 0) {
    console.error('Produtos sem peso/dimensões válidos:', invalidos);
    throw new ErroFrete(
      `Não foi possível calcular o frete: faltam peso/dimensões no cadastro de: ${invalidos.join(', ')}`,
      422
    );
  }

  return produtos;
}

// Retorna TODAS as opções válidas (preço > 0), da mais barata para a mais cara.
export async function cotarMelhorEnvio(
  cepDestino: string,
  itens: any[]
): Promise<{ opcoes: OpcaoFrete[]; motivos: string[] }> {
  const cleanCep = String(cepDestino || '').replace(/\D/g, '');
  if (cleanCep.length !== 8) throw new ErroFrete('CEP de destino inválido', 400);

  const meToken = process.env.MELHOR_ENVIO_TOKEN;
  const originPostalCode = (process.env.MELHOR_ENVIO_POSTAL_CODE || '').replace(/\D/g, '');
  const contactEmail = process.env.MELHOR_ENVIO_CONTACT_EMAIL;
  const appName = process.env.MELHOR_ENVIO_APP_NAME || 'LojaBioflow';

  if (!meToken || originPostalCode.length !== 8 || !contactEmail) {
    console.error(
      'Config de frete incompleta. Defina MELHOR_ENVIO_TOKEN, MELHOR_ENVIO_POSTAL_CODE (8 dígitos) e MELHOR_ENVIO_CONTACT_EMAIL.'
    );
    throw new ErroFrete('Configuração de frete ausente no servidor', 500);
  }

  const endpointUrl =
    process.env.MELHOR_ENVIO_ENDPOINT || 'https://melhorenvio.com.br/api/v2/me/shipment/calculate';

  // Opcional: IDs de serviço que você consegue despachar (ex.: "1,2,3"). Vazio = todos.
  const permitidos = (process.env.MELHOR_ENVIO_SERVICES_PERMITIDOS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const produtos = montarProdutosMelhorEnvio(itens);

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
        products: produtos,
      }),
      cache: 'no-store',
      signal: AbortSignal.timeout(15000),
    });
  } catch (error: any) {
    const timeout = error?.name === 'TimeoutError' || error?.name === 'AbortError';
    console.error('Falha de rede ao chamar o Melhor Envio:', error);
    throw new ErroFrete(
      timeout ? 'O cálculo de frete demorou demais. Tente novamente.' : 'Serviço de frete indisponível no momento.',
      timeout ? 504 : 502
    );
  }

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Erro na API do Melhor Envio:', response.status, errorText);
    throw new ErroFrete(
      'Não foi possível calcular o frete agora. Tente novamente em instantes.',
      response.status === 422 ? 422 : 502
    );
  }

  let data: any;
  try {
    data = await response.json();
  } catch {
    throw new ErroFrete('Resposta inválida do serviço de frete.', 502);
  }

  if (!Array.isArray(data)) {
    console.error('Resposta inesperada do Melhor Envio:', JSON.stringify(data));
    throw new ErroFrete('Resposta inválida do serviço de frete.', 502);
  }

  const motivos: string[] = [];
  const opcoes: OpcaoFrete[] = [];

  for (const shipping of data) {
    const companyName = shipping.company?.name || 'Transportadora';
    const serviceName = shipping.name || '';

    if (shipping.error) {
      motivos.push(`${companyName} ${serviceName}: ${shipping.error}`);
      continue;
    }

    if (permitidos.length > 0 && !permitidos.includes(String(shipping.id))) continue;

    // custom_price reflete as taxas/descontos da sua conta; usa price só se não houver custom_price válido
    const finalPrice = firstPositive(shipping.custom_price, shipping.price);
    if (!Number.isFinite(finalPrice)) {
      motivos.push(`${companyName} ${serviceName}: sem preço retornado`);
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

  opcoes.sort((a, b) => a.valor - b.valor || a.prazo - b.prazo);

  if (motivos.length > 0) {
    console.warn('Serviços descartados para o CEP', cleanCep, motivos);
  }

  return { opcoes, motivos };
}
