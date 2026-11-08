// lib/products.ts

// ==========================================================
// TIPOS BASE (dados brutos, usados também pelo Melhor Envio)
// ==========================================================
export interface ProductVariant {
  id: string;
  size: string;
  price: number;
  originalPrice: number;
  stock: number;
  weight: number; // em gramas (usado na API do Melhor Envio)
  dimensions: {
    height: number; // cm
    width: number;  // cm
    length: number; // cm
  };
}

export type CategoriaBase = 'substratos' | 'fertilizantes' | 'adubos' | 'condicionadores' | 'minerais';

export interface ProductBase {
  id: string;
  name: string;
  slug: string;
  category: CategoriaBase;
  description: string;
  features: string[];
  variants: ProductVariant[];
  images: string[];
}

// ==========================================================
// TIPO NORMALIZADO (o que as páginas do site consomem)
// ==========================================================
export interface Product extends ProductBase {
  nome: string;
  categoria: 'substrato' | 'nutriente' | 'emenda' | 'mineral';
  subtitulo: string;
  descricao: string;
  descricaoCurta: string;
  tags: string[];
  preco: number;          // menor preço entre variantes em estoque
  precoOriginal: number;
  imagens: string[];
  fase: string;
  acento: string;
  estoque: number;        // soma do estoque de todas as variantes
  emEstoque: boolean;
}

// ==========================================================
// CATÁLOGO BRUTO (17 Produtos Oficiais)
// ==========================================================
const catalogoBase: ProductBase[] = [
  // ==========================================
  // 1. SUBSTRATOS & AERAÇÃO
  // ==========================================
  {
    id: '58257070448',
    slug: 'substrato-rico-humus-perlita-fibra-coco-arroz',
    name: 'Substrato Rico Húmus-Perlita-Fibra de Coco',
    category: 'substratos',
    description: 'Substrato balanceado e aerado, rico em húmus com alta retenção de umidade e excelente drenagem para desenvolvimento radicular.',
    features: ['Composição nobre com húmus e perlita', 'Excelente capacidade de drenagem e aeração', 'Pronto para o plantio'],
    images: ['/images/products/substrato-rico.jpg'],
    variants: [
      { id: '219187113534', size: '5L', price: 17.50, originalPrice: 21.00, stock: 117, weight: 1300, dimensions: { height: 8, width: 25, length: 35 } },
      { id: '219187113535', size: '10L', price: 29.50, originalPrice: 35.40, stock: 117, weight: 2600, dimensions: { height: 12, width: 30, length: 40 } },
      { id: '219187113536', size: '20L', price: 52.99, originalPrice: 64.20, stock: 117, weight: 4000, dimensions: { height: 15, width: 30, length: 50 } },
    ],
  },
  {
    id: '23299389409',
    slug: 'substrato-super-solo-completo',
    name: 'Substrato Super-Solo Completo',
    category: 'substratos',
    description: 'Super solo completo formulado com matéria orgânica balanceada e minerais essenciais para todo o ciclo vegetal.',
    features: ['Nutrição orgânica de liberação lenta', 'Ideal para cultivo orgânico', 'Estrutura biológica viva'],
    images: ['/images/products/super-solo.jpg'],
    variants: [
      { id: '129655730543', size: '5L', price: 17.50, originalPrice: 21.00, stock: 107, weight: 1300, dimensions: { height: 8, width: 25, length: 35 } },
      { id: '129655730544', size: '10L', price: 29.50, originalPrice: 35.40, stock: 117, weight: 2600, dimensions: { height: 12, width: 30, length: 40 } },
      { id: '129655730545', size: '20L', price: 53.50, originalPrice: 64.20, stock: 117, weight: 4000, dimensions: { height: 15, width: 30, length: 50 } },
    ],
  },
  {
    id: '58256436680',
    slug: 'substrato-biomix-turfa-perlita-casca-arroz',
    name: 'Substrato BioMix Turfa-Perlita-Casca de Arroz Carbonizada',
    category: 'substratos',
    description: 'Combinação clássica de turfa, perlita e casca de arroz carbonizada para aeração extrema e excelente controle de pH.',
    features: ['Leveza estrutural superior', 'Perfeita relação ar/água para as raízes', 'Ideal para cultivo indoor e estufas'],
    images: ['/images/products/biomix.jpg'],
    variants: [
      { id: '238802853732', size: '10L', price: 31.99, originalPrice: 35.40, stock: 117, weight: 2600, dimensions: { height: 12, width: 30, length: 40 } },
      { id: '238802853733', size: '20L', price: 53.99, originalPrice: 64.20, stock: 55, weight: 4710, dimensions: { height: 20, width: 37, length: 50 } },
    ],
  },
  {
    id: '23599409706',
    slug: 'fibra-de-coco-e-perlita-hidroponia',
    name: 'Fibra de Coco e Perlita / Hidroponia',
    category: 'substratos',
    description: 'Substrato inerte de alta aeração combinando fibra de coco lavada de baixa condutividade elétrica (EC) e perlita expandida.',
    features: ['Substrato 100% inerte para controle total de fertirrigação', 'Baixa salinidade (EC baixo)', 'Excelente oxigenação radicular'],
    images: ['/images/products/fibra-perlita.jpg'],
    variants: [
      { id: '159552993387', size: '5L', price: 18.50, originalPrice: 21.00, stock: 100, weight: 1000, dimensions: { height: 8, width: 25, length: 35 } },
      { id: '159552993384', size: '10L', price: 29.50, originalPrice: 35.40, stock: 117, weight: 2000, dimensions: { height: 12, width: 30, length: 40 } },
      { id: '159552993385', size: '20L', price: 53.50, originalPrice: 64.20, stock: 117, weight: 4000, dimensions: { height: 15, width: 35, length: 45 } },
    ],
  },
  {
    id: '58206334194',
    slug: 'chips-de-coco-lavado-orquideas-folhagens',
    name: 'Chips de Coco Lavado Orquídeas e Folhagens',
    category: 'condicionadores',
    description: 'Cubos de casca de coco lavados e tratados para aeração de orquídeas, antúrios, samambaias e plantas tropicais.',
    features: ['Alta durabilidade e lenta decomposição', 'Retém umidade sem encharcar', 'Excelente drenagem para raízes aéreas'],
    images: ['/images/products/chips-coco.jpg'],
    variants: [
      { id: '159796192765', size: '5L', price: 17.50, originalPrice: 21.00, stock: 117, weight: 1000, dimensions: { height: 8, width: 25, length: 35 } },
      { id: '159796192766', size: '10L', price: 29.50, originalPrice: 35.40, stock: 100, weight: 2000, dimensions: { height: 12, width: 30, length: 40 } },
      { id: '159796192767', size: '20L', price: 53.50, originalPrice: 64.20, stock: 117, weight: 4000, dimensions: { height: 15, width: 35, length: 45 } },
    ],
  },
  {
    id: '58206260102',
    slug: 'perlita-expandida-grossa',
    name: 'Perlita Expandida Grossa',
    category: 'condicionadores',
    description: 'Mineral vulcânico expandido inerte e ultraleve. Não compacta e garante aeração permanente ao solo.',
    features: ['Indispensável para aeração de substratos', 'Ultra leve e não compactável', 'pH neutro e estéril'],
    images: ['/images/products/perlita.jpg'],
    variants: [
      { id: '189619447329', size: '2L', price: 15.90, originalPrice: 18.50, stock: 100, weight: 500, dimensions: { height: 5, width: 20, length: 30 } },
      { id: '199186920053', size: '5L', price: 27.50, originalPrice: 33.00, stock: 100, weight: 1000, dimensions: { height: 8, width: 25, length: 35 } },
      { id: '199186920054', size: '10L', price: 49.50, originalPrice: 59.40, stock: 100, weight: 2000, dimensions: { height: 12, width: 30, length: 40 } },
      { id: '129655658497', size: '20L', price: 92.90, originalPrice: 111.48, stock: 117, weight: 3000, dimensions: { height: 15, width: 35, length: 45 } },
    ],
  },
  {
    id: '58256222893',
    slug: 'fibra-de-coco-triturada-lavada-orquideas-rosa-do-deserto',
    name: 'Fibra de Coco Triturada Lavada Orquídeas Rosa do Deserto',
    category: 'condicionadores',
    description: 'Fibra de coco triturada lavada para remoção de taninos e sais. Ideal para rosa do deserto, orquídeas e condicionamento de solo.',
    features: ['Livre de taninos em excesso', 'Estimula enraizamento', 'Promove leveza e estrutura'],
    images: ['/images/products/fibra-coco.jpg'],
    variants: [
      { id: '159790972294', size: '2L', price: 15.90, originalPrice: 18.50, stock: 100, weight: 500, dimensions: { height: 5, width: 20, length: 30 } },
      { id: '199186998969', size: '5L', price: 17.50, originalPrice: 21.00, stock: 117, weight: 1000, dimensions: { height: 8, width: 25, length: 35 } },
      { id: '189619365173', size: '10L', price: 29.50, originalPrice: 35.40, stock: 100, weight: 2000, dimensions: { height: 12, width: 30, length: 40 } },
      { id: '189619365174', size: '20L', price: 53.50, originalPrice: 64.20, stock: 117, weight: 4000, dimensions: { height: 15, width: 35, length: 45 } },
    ],
  },
  {
    id: '22199406873',
    slug: 'casca-de-arroz-carbonizada-aeracao-drenagem',
    name: 'Casca de Arroz Carbonizada Aeração e Drenagem',
    category: 'condicionadores',
    description: 'Casca de arroz esterilizada pelo processo de carbonização. Rica em sílica, previne pragas e garante aeração duradoura.',
    features: ['Rica em Sílica natural', 'Proteção contra patógenos do solo', 'Condicionador físico de excelente drenagem'],
    images: ['/images/products/casca-arroz.jpg'],
    variants: [
      { id: '219186987101', size: '2L', price: 16.90, originalPrice: 19.50, stock: 122, weight: 500, dimensions: { height: 5, width: 20, length: 30 } },
      { id: '199186987056', size: '10L', price: 16.50, originalPrice: 19.08, stock: 100, weight: 1000, dimensions: { height: 12, width: 30, length: 40 } },
      { id: '149790922409', size: '20L', price: 26.50, originalPrice: 31.80, stock: 100, weight: 2000, dimensions: { height: 15, width: 35, length: 45 } },
      { id: '189187594669', size: '50L', price: 58.50, originalPrice: 71.20, stock: 100, weight: 4000, dimensions: { height: 30, width: 40, length: 50 } },
    ],
  },

  // ==========================================
  // 2. INSUMOS MINERAIS (NOVA CATEGORIA!)
  // ==========================================
  {
    id: '58222490590',
    slug: 'calcario-calcitico-85-corretivo-solo-nutricao-animal',
    name: 'Calcário Calcítico 85% Corretivo de Solo e Suplemento Animal',
    category: 'minerais',
    description: 'Mineral de Carbonato de Cálcio puro (PRNT 85%) com baixo teor de magnésio. Utilizado para elevação rápida do pH do solo e suplementação nutricional de cálcio para poedeiras, bovinos, suínos e ovinos.',
    features: ['PRNT 85% de alta reatividade', 'Alto teor de Cálcio solúvel (Ca)', 'Uso dual: Correção de solo e Nutrição Animal'],
    images: ['/images/products/calcario-calcitico.jpg'],
    variants: [
      { id: '229453744940', size: '2KG', price: 12.99, originalPrice: 17.00, stock: 266, weight: 2000, dimensions: { height: 8, width: 25, length: 30 } },
      { id: '229453744941', size: '5KG', price: 17.99, originalPrice: 20.00, stock: 133, weight: 5000, dimensions: { height: 10, width: 30, length: 35 } },
      { id: '229453744942', size: '10KG', price: 27.90, originalPrice: 30.00, stock: 75, weight: 10000, dimensions: { height: 15, width: 35, length: 40 } },
      { id: '229453744943', size: '20KG', price: 45.50, originalPrice: 50.00, stock: 46, weight: 20000, dimensions: { height: 18, width: 40, length: 50 } },
      { id: '239187124999', size: '25KG', price: 62.90, originalPrice: 69.00, stock: 53, weight: 25000, dimensions: { height: 20, width: 40, length: 50 } },
    ],
  },
  {
    id: '58222500632',
    slug: 'superfosfato-simples-granulado-adubo-ssp',
    name: 'Superfosfato Simples Granulado (SSP 18% P2O5 + 16% Ca + 10% S)',
    category: 'minerais',
    description: 'Fertilizante mineral fosfatado solúvel de alta eficiência. Fornece Fósforo imediato para arranque de raízes e floração, acrescido de Cálcio e Enxofre solúveis.',
    features: ['18% Fósforo (P₂O₅) solúvel', '16% Cálcio e 10% Enxofre integrados', 'Arranque rápido de raízes e flores'],
    images: ['/images/products/superfosfato-simples.jpg'],
    variants: [
      { id: '189196836656', size: '2KG', price: 24.50, originalPrice: 31.00, stock: 254, weight: 2000, dimensions: { height: 8, width: 25, length: 30 } },
      { id: '189196836657', size: '5KG', price: 39.99, originalPrice: 45.00, stock: 122, weight: 5000, dimensions: { height: 10, width: 30, length: 35 } },
      { id: '189196836658', size: '10KG', price: 85.50, originalPrice: 99.00, stock: 55, weight: 10000, dimensions: { height: 15, width: 35, length: 40 } },
      { id: '228815974705', size: '20KG', price: 162.50, originalPrice: 169.00, stock: 53, weight: 20000, dimensions: { height: 18, width: 40, length: 50 } },
    ],
  },

  // ==========================================
  // 3. ADUBOS ORGÂNICOS SÓLIDOS
  // ==========================================
  {
    id: '23899358271',
    slug: 'torta-de-mamona-adubo-organico',
    name: 'Torta de Mamona Adubo Orgânico',
    category: 'adubos',
    description: 'Adubo orgânico farelado de alta concentração de Nitrogênio e matéria orgânica. Estimula a vida microbiana e o crescimento foliar.',
    features: ['Rico em Nitrogênio orgânico de liberação gradativa', 'Recupera solos empobrecidos', 'Melhora a estrutura e retenção de água'],
    images: ['/images/products/torta-mamona.jpg'],
    variants: [
      { id: '159790961066', size: '2KG', price: 19.50, originalPrice: 22.50, stock: 100, weight: 2000, dimensions: { height: 8, width: 30, length: 20 } },
      { id: '229439512497', size: '5KG', price: 29.50, originalPrice: 35.40, stock: 163, weight: 5000, dimensions: { height: 8, width: 35, length: 25 } },
      { id: '229439512498', size: '10KG', price: 52.90, originalPrice: 63.48, stock: 117, weight: 10000, dimensions: { height: 12, width: 40, length: 30 } },
      { id: '229439512499', size: '20KG', price: 94.50, originalPrice: 120.60, stock: 34, weight: 20000, dimensions: { height: 15, width: 45, length: 35 } },
    ],
  },
  {
    id: '58206771793',
    slug: 'humus-de-minhoca-adubo-organico',
    name: 'Húmus de Minhoca Adubo Orgânico',
    category: 'adubos',
    description: 'Húmus de minhoca pura 100% estabilizado. Fonte completa de ácidos fúlvicos, húmicos e microrganismos benéficos.',
    features: ['100% puro e sem cheiro', 'Inóculo biológico para solos e vasos', 'Seguro: não queima as raízes das plantas'],
    images: ['/images/products/humus-minhoca.jpg'],
    variants: [
      { id: '199187589658', size: '2KG', price: 12.99, originalPrice: 15.00, stock: 100, weight: 2000, dimensions: { height: 8, width: 30, length: 20 } },
      { id: '238802856194', size: '5KG', price: 15.99, originalPrice: 19.90, stock: 100, weight: 5000, dimensions: { height: 8, width: 35, length: 25 } },
      { id: '229439358068', size: '10KG', price: 24.99, originalPrice: 29.90, stock: 100, weight: 10000, dimensions: { height: 12, width: 40, length: 30 } },
      { id: '179414529814', size: '20KG', price: 40.99, originalPrice: 48.90, stock: 100, weight: 20000, dimensions: { height: 15, width: 45, length: 35 } },
    ],
  },

  // ==========================================
  // 4. NUTRIENTES & BIOESTIMULANTES LÍQUIDOS (Apenas 1L)
  // ==========================================
  {
    id: '58256234535',
    slug: 'bio-inoculante-compostagem-recuperador-de-solo',
    name: 'Bio-Inoculante Compostagem Recuperador de Solo (Bio-EM1)',
    category: 'fertilizantes',
    description: 'Consórcio de microrganismos eficazes (EM) para aceleração de compostagem, eliminação de maus odores e regeneração de solos.',
    features: ['Inóculo vivo de bactérias láticas e leveduras', 'Acelera a decomposição orgânica', 'Regenera o microbioma do solo'],
    images: ['/images/products/bio-em1.jpg'],
    variants: [
      { id: '239439356487', size: '1L', price: 26.50, originalPrice: 31.80, stock: 50, weight: 1000, dimensions: { height: 15, width: 5, length: 8 } },
    ],
  },
  {
    id: '58206317707',
    slug: 'bio-start-fertilizante-algas-enraizador-protetor',
    name: 'Bio-Start® Fertilizante de Algas Enraizador e Protetor',
    category: 'fertilizantes',
    description: 'Extrato puro de algas marinhas (Ascophyllum nodosum) rico em fito-hormônios naturais (auxinas e citocininas) para enraizamento vigoroso.',
    features: ['Bioestimulante 100% natural de algas marinhas', 'Induz o enraizamento rápido e vigoroso', 'Aumenta a resistência contra estresses'],
    images: ['/images/products/biostart.jpg'],
    variants: [
      { id: '228801785804', size: '1L', price: 10.90, originalPrice: 13.08, stock: 50, weight: 1000, dimensions: { height: 15, width: 5, length: 8 } },
    ],
  },
  {
    id: '58256489886',
    slug: 'bio-green-fertilizante-organo-mineral-vegetacao',
    name: 'Bio-Green® Fertilizante Organo-Mineral para Vegetação',
    category: 'fertilizantes',
    description: 'Fertilizante organomineral foliar e via solo rico em Nitrogênio e aminoácidos para crescimento foliar vigoroso.',
    features: ['Rico em Nitrogênio e Aminoácidos', 'Folhagem verde intensa e forte', 'Rápida absorção foliar'],
    images: ['/images/products/biogreen.jpg'],
    variants: [
      { id: '199186722729', size: '1L', price: 26.50, originalPrice: 31.80, stock: 52, weight: 1400, dimensions: { height: 15, width: 15, length: 20 } },
    ],
  },
  {
    id: '58256489392',
    slug: 'bio-potassium-fertilizante-organo-mineral-flores-frutos',
    name: 'Bio-Potassium® Fertilizante Organo-Mineral Flores e Frutos',
    category: 'fertilizantes',
    description: 'Formulação líquida rica em Potássio solúvel e bioativadores para a fase de floração, frutificação e sabor de frutos.',
    features: ['Alto teor de Potássio (K)', 'Potencializa o aroma e peso dos frutos', 'Essencial na fase de floração'],
    images: ['/images/products/biopotassium.jpg'],
    variants: [
      { id: '219619165965', size: '1L', price: 26.50, originalPrice: 31.80, stock: 44, weight: 1200, dimensions: { height: 15, width: 15, length: 20 } },
    ],
  },
  {
    id: '58206330358',
    slug: 'melaco-de-cana-adubo-organico-bioestimulante',
    name: 'Melaço de Cana',
    category: 'fertilizantes',
    description: 'Melaço denso de cana-de-açúcar puríssimo. Alimenta a microbiologia benéfica do solo e potencializa chás aerados de compostagem.',
    features: ['Alimento premium para microbiologia do solo', 'Fonte de açúcares e minerais de rápida energia', 'Essencial para Chá de Compostagem (AACT)'],
    images: ['/images/products/melaco.jpg'],
    variants: [
      { id: '119872865375', size: '1L', price: 37.50, originalPrice: 45.00, stock: 100, weight: 1000, dimensions: { height: 20, width: 20, length: 10 } },
    ],
  },
];

// ==========================================================
// MAPEAMENTO DE CATEGORIAS
// ==========================================================
const INFO_CATEGORIA: Record<
  CategoriaBase,
  { categoria: Product['categoria']; fase: string; acento: string }
> = {
  substratos:      { categoria: 'substrato', fase: 'Substrato',           acento: '#22c55e' },
  condicionadores: { categoria: 'substrato', fase: 'Aeração & Drenagem',  acento: '#0ea5e9' },
  fertilizantes:   { categoria: 'nutriente', fase: 'Nutrição Líquida',    acento: '#d4a843' },
  adubos:          { categoria: 'emenda',    fase: 'Adubo Orgânico',      acento: '#b45309' },
  minerais:        { categoria: 'mineral',   fase: 'Insumo Mineral',      acento: '#a855f7' },
};

function normalizar(p: ProductBase): Product {
  const info = INFO_CATEGORIA[p.category];
  
  // 🟢 Ordena as variações automaticamente do menor para o maior preço
  const variantesOrdenadas = [...p.variants].sort((a, b) => a.price - b.price);
  
  const disponiveis = variantesOrdenadas.filter((v) => v.stock > 0);
  const base = disponiveis.length > 0 ? disponiveis : variantesOrdenadas;
  const maisBarata = base.reduce((menor, v) => (v.price < menor.price ? v : menor), base[0]);
  const estoque = variantesOrdenadas.reduce((acc, v) => acc + v.stock, 0);

  return {
    ...p,
    variants: variantesOrdenadas,
    nome: p.name,
    categoria: info.categoria,
    subtitulo: variantesOrdenadas.map((v) => v.size).join(' · '),
    descricao: p.description,
    descricaoCurta: p.description,
    tags: [...p.features, info.fase, p.category, p.slug.split('-').join(' ')],
    preco: maisBarata.price,
    precoOriginal: maisBarata.originalPrice,
    imagens: p.images,
    fase: info.fase,
    acento: info.acento,
    estoque,
    emEstoque: estoque > 0,
  };
}

// ==========================================================
// EXPORTS OFICIAIS
// ==========================================================
export const products: Product[] = catalogoBase.map(normalizar);
export const produtos: Product[] = products;

export const categorias: { id: string; label: string }[] = [
  { id: 'todos',     label: 'Todos' },
  { id: 'substrato', label: 'Substratos & Aeração' },
  { id: 'nutriente', label: 'Nutrientes Líquidos' },
  { id: 'emenda',    label: 'Adubos Orgânicos' },
  { id: 'mineral',   label: 'Insumos Minerais' },
];

export function getProdutoPorId(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getProdutoPorSlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

// Export default para suportar tanto importacoes nomeadas quanto padrao no Next.js
export default products;
