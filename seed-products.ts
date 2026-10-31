import { PrismaClient } from '@prisma/client';
import products from './lib/products';

// Lógica de fallback para capturar a DATABASE_URL do arquivo .env
const dbUrl = process.env.DATABASE_URL || "postgresql://postgres:SuaSenhaAqui@db.cmiymskhqzelrhzlgkdy.supabase.co:5432/postgres";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: dbUrl,
    },
  },
});

async function main() {
  console.log('🌱 Iniciando sincronização do catálogo de produtos com o Supabase...');

  // Limpa produtos e variações existentes para evitar duplicidade
  await prisma.productVariant.deleteMany({});
  await prisma.product.deleteMany({});

  for (const p of products) {
    console.log(`📦 Sincronizando: ${p.name}`);
    await prisma.product.create({
      data: {
        id: p.id,
        slug: p.slug,
        name: p.name,
        category: p.category,
        description: p.description,
        features: p.features,
        images: p.images,
        variants: {
          create: p.variants.map((v) => ({
            id: v.id,
            size: v.size,
            price: v.price,
            originalPrice: v.originalPrice,
            stock: v.stock,
            weight: v.weight,
            height: v.dimensions?.height ?? 10,
            width: v.dimensions?.width ?? 20,
            length: v.dimensions?.length ?? 30,
          })),
        },
      },
    });
  }

  console.log('✅ Todos os produtos e variações foram populados com sucesso no Supabase!');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed do Supabase:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
