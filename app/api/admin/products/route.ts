// app/api/admin/products/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET: Lista todos os produtos direto do Supabase (com variações ordenadas por preço)
export async function GET() {
  try {
    const dbProducts = await prisma.product.findMany({
      include: { variants: true },
      orderBy: { createdAt: 'desc' },
    });

    const formattedProducts = dbProducts.map((p) => {
      // 🟢 Ordena as variações por preço (menor para o maior)
      const sortedVariants = [...p.variants].sort((a, b) => a.price - b.price);

      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        category: p.category,
        description: p.description,
        features: p.features,
        images: p.images,
        variants: sortedVariants.map((v) => ({
          id: v.id,
          size: v.size,
          price: v.price,
          originalPrice: v.originalPrice,
          stock: v.stock,
          weight: v.weight,
          dimensions: { height: v.height, width: v.width, length: v.length },
        })),
      };
    });

    return NextResponse.json({ ok: true, products: formattedProducts });
  } catch (error: any) {
    console.error('Erro ao buscar produtos:', error);
    return NextResponse.json({ error: 'Erro de conexão com o banco de dados.' }, { status: 500 });
  }
}

// POST: Cadastra um novo produto no Supabase
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, slug, category, description, features, images, variants } = body;

    if (!name || !slug || !variants || variants.length === 0) {
      return NextResponse.json({ error: 'Preencha todos os campos obrigatórios.' }, { status: 400 });
    }

    const createdProduct = await prisma.product.create({
      data: {
        name,
        slug,
        category: category || 'substratos',
        description: description || '',
        features: features || [],
        images: images || ['/images/products/substrato-rico.jpg'],
        variants: {
          create: variants.map((v: any) => ({
            size: v.size,
            price: Number(v.price),
            originalPrice: Number(v.originalPrice),
            stock: Number(v.stock),
            weight: Number(v.weight),
            height: Number(v.dimensions?.height || v.height || 10),
            width: Number(v.dimensions?.width || v.width || 20),
            length: Number(v.dimensions?.length || v.length || 30),
          })),
        },
      },
      include: { variants: true },
    });

    // 🟢 Ordena variações por preço ao retornar
    createdProduct.variants.sort((a, b) => a.price - b.price);

    return NextResponse.json({ ok: true, product: createdProduct });
  } catch (error: any) {
    console.error('Erro ao cadastrar produto:', error);
    return NextResponse.json({ error: error.message || 'Erro ao cadastrar produto no banco.' }, { status: 500 });
  }
}

// DELETE: Exclui um produto completo ou apenas uma variação
export async function DELETE(request: Request) {
  try {
    const { productId, variantId } = await request.json();

    if (!productId) {
      return NextResponse.json({ error: 'ID do produto é obrigatório.' }, { status: 400 });
    }

    if (variantId) {
      await prisma.productVariant.delete({
        where: { id: variantId },
      });
      return NextResponse.json({ ok: true, message: 'Variação removida com sucesso do Supabase.' });
    }

    await prisma.product.delete({
      where: { id: productId },
    });

    return NextResponse.json({ ok: true, message: 'Produto removido com sucesso do Supabase.' });
  } catch (error: any) {
    console.error('Erro ao excluir no Supabase:', error);
    return NextResponse.json({ error: 'Erro ao excluir item do banco de dados.' }, { status: 500 });
  }
}

// PATCH: Adiciona uma nova variação a um produto existente no Supabase
export async function PATCH(request: Request) {
  try {
    const { productId, action, variant } = await request.json();

    if (!productId || action !== 'add_variant' || !variant) {
      return NextResponse.json({ error: 'Parâmetros inválidos.' }, { status: 400 });
    }

    const createdVariant = await prisma.productVariant.create({
      data: {
        productId,
        size: variant.size,
        price: Number(variant.price),
        originalPrice: Number(variant.originalPrice),
        stock: Number(variant.stock),
        weight: Number(variant.weight),
        height: Number(variant.dimensions?.height || variant.height || 10),
        width: Number(variant.dimensions?.width || variant.width || 20),
        length: Number(variant.dimensions?.length || variant.length || 30),
      },
    });

    return NextResponse.json({ ok: true, variant: createdVariant });
  } catch (error: any) {
    console.error('Erro ao adicionar variação:', error);
    return NextResponse.json({ error: 'Erro ao adicionar variação no Supabase.' }, { status: 500 });
  }
}