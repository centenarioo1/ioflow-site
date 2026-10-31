// app/api/admin/products/route.ts
import { NextResponse } from 'next/server';
import products, { Product } from '@/lib/products';

export const dynamic = 'force-dynamic';

// GET: Retorna a lista de produtos para o painel
export async function GET() {
  try {
    return NextResponse.json({ ok: true, products });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar produtos' }, { status: 500 });
  }
}

// POST: Cadastra um novo produto
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, slug, category, description, features, images, variants } = body;

    if (!name || !slug || !variants || variants.length === 0) {
      return NextResponse.json({ error: 'Preencha os campos obrigatórios' }, { status: 400 });
    }

    const newProduct: Product = {
      id: String(Date.now()),
      name,
      slug,
      category,
      description,
      features: features || [],
      images: images || ['/images/products/substrato-rico.jpg'],
      variants: variants.map((v: any, idx: number) => ({
        id: `${Date.now()}-${idx}`,
        size: v.size,
        price: Number(v.price),
        originalPrice: Number(v.originalPrice),
        stock: Number(v.stock),
        weight: Number(v.weight),
        dimensions: v.dimensions || { height: 10, width: 20, length: 30 },
      })),
      nome: name,
      categoria: category === 'fertilizantes' ? 'nutriente' : category === 'adubos' ? 'emenda' : 'substrato',
      subtitulo: variants.map((v: any) => v.size).join(' · '),
      descricao: description,
      descricaoCurta: description,
      tags: [name, category],
      preco: Number(variants[0].price),
      precoOriginal: Number(variants[0].originalPrice),
      imagens: images || ['/images/products/substrato-rico.jpg'],
      fase: category === 'fertilizantes' ? 'Nutrição Líquida' : 'Substrato',
      acento: '#15803d',
      estoque: variants.reduce((acc: number, v: any) => acc + Number(v.stock), 0),
      emEstoque: true,
    };

    products.unshift(newProduct);
    return NextResponse.json({ ok: true, product: newProduct });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar produto' }, { status: 500 });
  }
}

// DELETE: Exclui produto ou variação
export async function DELETE(request: Request) {
  try {
    const { productId, variantId } = await request.json();

    if (!productId) {
      return NextResponse.json({ error: 'ID do produto é obrigatório' }, { status: 400 });
    }

    const index = products.findIndex((p) => p.id === productId);
    if (index === -1) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
    }

    // Se passou variantId, remove apenas a variação
    if (variantId) {
      products[index].variants = products[index].variants.filter(
        (v) => v.id !== variantId && v.size !== variantId
      );
      return NextResponse.json({ ok: true, message: 'Variação removida com sucesso' });
    }

    // Se não passou variantId, remove o produto completo
    products.splice(index, 1);
    return NextResponse.json({ ok: true, message: 'Produto removido com sucesso' });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao remover produto' }, { status: 500 });
  }
}