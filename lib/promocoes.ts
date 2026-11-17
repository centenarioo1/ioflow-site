// lib/promocoes.ts
// Regras do brinde BIOMAIS5 (+5L a cada 20L). Usado no carrinho E no servidor,
// para o cliente e o servidor sempre chegarem ao mesmo resultado.

export const CUPOM_BRINDE = 'BIOMAIS5';
export const LITROS_PARA_BRINDE = 20;
export const LITROS_DE_BRINDE = 5;

export const BRINDES_OPCOES = [
  { id: 'brinde-substrato-rico', nomeBase: 'Substrato Rico Bioflow', descricao: 'Nutrição completa e aeração ideal' },
  { id: 'brinde-super-solo', nomeBase: 'Super Solo Vivo Bioflow', descricao: 'Orgânico pronto e super ativado' },
  { id: 'brinde-coco-perlita', nomeBase: 'Fibra de Coco & Perlita', descricao: 'Drenagem máxima e leveza' },
];

type ItemComVolume = {
  variacao?: string;
  size?: string;
  nome?: string;
  name?: string;
};

// Litros de UMA unidade do item (ex.: "20L" -> 20). Só conta volumes em litros:
// "500ML" não vira 500 nem 50 litros.
export function litrosDoItem(item: ItemComVolume): number {
  const sizeStr = String(item.variacao || item.size || '').toUpperCase().trim();
  const nameStr = String(item.nome || item.name || '').toUpperCase();
  const padrao = /(\d+)\s*(?:LITROS?|LTS?|L)\b/;

  const match = sizeStr.match(padrao) || nameStr.match(padrao);
  if (match) return parseInt(match[1], 10);

  // Variação escrita só com o número (ex.: "20")
  if (/^\d+$/.test(sizeStr)) return parseInt(sizeStr, 10);

  return 0;
}

export function litrosTotais(items: (ItemComVolume & { quantity?: number })[]): number {
  return items.reduce((acc, it) => acc + litrosDoItem(it) * Number(it.quantity || 1), 0);
}

// A cada 20L completos no carrinho, +5L de brinde.
export function litrosDeBrinde(totalLitros: number): number {
  return Math.floor(totalLitros / LITROS_PARA_BRINDE) * LITROS_DE_BRINDE;
}
