// prisma/seed.ts ou seed-products.ts
import { PrismaClient } from "@prisma/client";
import { products as catalogoEstatico } from "../lib/products";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando sincronização e seed do banco de dados...");

  for (const prod of catalogoEstatico) {
    console.log(`📦 Processando produto: ${prod.nome} (${prod.id})`);

    const produtoDb = await prisma.product.upsert({
      where: { id: prod.id },
      update: {
        name: prod.nome,
        slug: prod.slug,
        category: prod.category, // ex: "minerais", "substratos", "adubos", "fertilizantes", "condicionadores"
        description: prod.description,
        features: prod.features,
        images: prod.images,
      },
      create: {
        id: prod.id,
        name: prod.nome,
        slug: prod.slug,
        category: prod.category,
        description: prod.description,
        features: prod.features,
        images: prod.images,
      },
    });

    // Sincroniza variações
    for (const variant of prod.variants) {
      await prisma.productVariant.upsert({
        where: { id: variant.id },
        update: {
          size: variant.size,
          price: variant.price,
          originalPrice: variant.originalPrice,
          stock: variant.stock,
          weight: variant.weight,
          height: variant.dimensions.height,
          width: variant.dimensions.width,
          length: variant.dimensions.length,
        },
        create: {
          id: variant.id,
          productId: produtoDb.id,
          size: variant.size,
          price: variant.price,
          originalPrice: variant.originalPrice,
          stock: variant.stock,
          weight: variant.weight,
          height: variant.dimensions.height,
          width: variant.dimensions.width,
          length: variant.dimensions.length,
        },
      });
    }
  }

  console.log("✅ Seed finalizado com sucesso! Todos os 17 produtos e minerais cadastrados.");
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
