// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // Tags iniciais
  const tagsData = [
    { name: 'tradicional' },
    { name: 'com leite' },
    { name: 'gelado' },
    { name: 'especial' },
  ];

  const tags = await Promise.all(
    tagsData.map((tag) => prisma.tag.upsert({
      where: { name: tag.name },
      update: {},
      create: tag,
    }))
  );

  // Cafés iniciais
  const coffeesData = [
    {
      name: 'Expresso Tradicional',
      description: 'O tradicional café feito com água quente e grãos moídos.',
      price: 9.90,
      imageUrl: 'https://example.com/expresso.png',
      tagNames: ['tradicional'],
    },
    {
      name: 'Latte',
      description: 'Uma dose de café expresso com leite vaporizado.',
      price: 12.50,
      imageUrl: 'https://example.com/latte.png',
      tagNames: ['com leite', 'tradicional'],
    },
    {
      name: 'Capuccino Gelado',
      description: 'Bebida cremosa com café, leite e gelo.',
      price: 14.00,
      imageUrl: 'https://example.com/gelado.png',
      tagNames: ['gelado', 'com leite'],
    },
  ];

  for (const coffee of coffeesData) {
    const createdCoffee = await prisma.coffee.create({
      data: {
        name: coffee.name,
        description: coffee.description,
        price: coffee.price,
        imageUrl: coffee.imageUrl,
        tags: {
          create: coffee.tagNames.map((tagName) => ({
            tag: { connect: { name: tagName } },
          })),
        },
      },
    });

    console.log(`☕ Café criado: ${createdCoffee.name}`);
  }

  console.log('✅ Seed finalizado com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
