// lib/products-dynamic.ts
import { prisma } from '@/lib/prisma';
import { products as fallbackProducts, Product } from '@/lib/products';

export async function getProductsFromDb(): Promise<Product[]> {
  try {
    const dbProducts = await prisma.product.findMany({
      include: {
        variants: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    if (!dbProducts || dbProducts.length === 0) {
      return fallbackProducts;
    }

    const INFO_CATEGORIA: Record<string, { categoria: Product['categoria']; fase: string; acento: string }> = {
      substratos:      { categoria: 'substrato', fase: 'Substrato',           acento: '#22c55e' },
      condicionadores: { categoria: 'substrato', fase: 'Aeração & Drenagem',  acento: '#0ea5e9' },
      fertilizantes:   { categoria: 'nutriente', fase: 'Nutrição Líquida',    acento: '#d4a843' },
      adubos:          { categoria: 'emenda',    fase: 'Adubo Orgânico',      acento: '#b45309' },
    };

    return dbProducts.map((p) => {
      const info = INFO_CATEGORIA[p.category] || { categoria: 'substrato', fase: 'Produto', acento: '#22c55e' };
      
      // 🟢 ORDENAÇÃO AUTOMÁTICA DAS VARIAÇÕES PELO PREÇO (DO MENOR PARA O MAIOR)
      const variantesOrdenadas = [...p.variants].sort((a, b) => a.price - b.price);
      
      const disponiveis = variantesOrdenadas.filter((v) => v.stock > 0);
      const base = disponiveis.length > 0 ? disponiveis : variantesOrdenadas;
      const maisBarata = base.length > 0 ? base[0] : { price: 0, originalPrice: 0 };
      const estoque = p.variants.reduce((acc, v) => acc + v.stock, 0);

      return {
        id: p.id,
        name: p.name,
        nome: p.name,
        slug: p.slug,
        category: p.category as any,
        categoria: info.categoria,
        subtitulo: variantesOrdenadas.map((v) => v.size).join(' · '),
        description: p.description,
        descricao: p.description,
        descricaoCurta: p.description,
        features: p.features,
        tags: [...p.features, info.fase, p.category],
        images: p.images,
        imagens: p.images,
        variants: variantesOrdenadas.map((v) => ({
          id: v.id,
          size: v.size,
          price: v.price,
          originalPrice: v.originalPrice,
          stock: v.stock,
          weight: v.weight,
          dimensions: {
            height: v.height,
            width: v.width,
            length: v.length,
          },
        })),
        preco: maisBarata.price,
        precoOriginal: maisBarata.originalPrice,
        fase: info.fase,
        acento: info.acento,
        estoque,
        emEstoque: estoque > 0,
      };
    });
  } catch (error) {
    console.error('Erro ao buscar produtos do Supabase, usando fallback estático:', error);
    return fallbackProducts;
  }
}
