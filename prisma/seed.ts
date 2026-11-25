/**
 * Dados iniciais da Petit Laços. Pode rodar várias vezes sem duplicar nada (usa upsert).
 *   npm run db:seed
 */
import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../src/generated/prisma/client";
import { hashPassword } from "../src/lib/password";

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

const categories = [
  { slug: "lacos", name: "Laços", position: 0 },
  { slug: "faixinhas-baby", name: "Faixinhas Baby", position: 1 },
  { slug: "parzinhos", name: "Parzinhos", position: 2 },
  { slug: "tematicos", name: "Temáticos", position: 3 },
] as const;

const collections = [
  { slug: "natal", name: "Natal", position: 0 },
  { slug: "kits-para-presente", name: "Kits para presente", position: 1 },
] as const;

type SeedProduct = {
  slug: string;
  name: string;
  category: (typeof categories)[number]["slug"];
  collections?: (typeof collections)[number]["slug"][];
  priceCents: number;
  compareAtPriceCents?: number;
  description: string;
  materials?: string;
  tags: string[];
  isNew?: boolean;
  isFeatured?: boolean;
};

// Produtos da loja atual. Preços marcados com "conferir" não estavam visíveis
// na referência e precisam ser confirmados no painel.
const products: SeedProduct[] = [
  {
    slug: "teddy-noel",
    name: "Teddy Noel",
    category: "parzinhos",
    collections: ["natal"],
    priceCents: 1490,
    description: "Parzinho de presilhas com ursinho bordado sobre lacinho vermelho. Um charme para o Natal.",
    tags: ["natal", "ursinho", "vermelho", "presilha"],
    isNew: true,
    isFeatured: true,
  },
  {
    slug: "faixinha-baby-floral",
    name: "Faixinha Baby Floral",
    category: "faixinhas-baby",
    priceCents: 1990,
    description: "Faixinha macia e elástica com laço floral em tons de creme e rosa. Confortável para bebês.",
    materials: "Meia de nylon macia e tecido estampado",
    tags: ["floral", "creme", "rosa", "bebe"],
    isFeatured: true,
  },
  {
    slug: "laco-trama",
    name: "Laço Trama",
    category: "lacos",
    priceCents: 1500,
    description: "Laço grande em tecido tramado rosa, com presilha. Delicado para o dia a dia.",
    materials: "Tecido tramado (tweed)",
    tags: ["rosa", "tweed", "presilha"],
    isFeatured: true,
  },
  {
    slug: "laco-de-linho",
    name: "Laço de Linho",
    category: "lacos",
    priceCents: 1500,
    description: "Laço em linho lilás com fios brilhantes, com presilha.",
    materials: "Linho",
    tags: ["lilas", "linho", "presilha"],
    isFeatured: true,
  },
  {
    slug: "faixinha-baby-lilas",
    name: "Faixinha Baby Lilás",
    category: "faixinhas-baby",
    priceCents: 1990, // conferir
    description: "Faixinha macia com lacinho lilás de tricô. Leve e confortável.",
    tags: ["lilas", "trico", "bebe"],
    isNew: true,
  },
  {
    slug: "parzinho-candy",
    name: "Parzinho Candy",
    category: "parzinhos",
    priceCents: 2490, // conferir
    compareAtPriceCents: 2790, // conferir (-11% na referência)
    description: "Parzinho com lacinho creme e lacinho de tricô com cereja. Doce como o nome.",
    tags: ["creme", "cereja", "trico", "presilha"],
    isNew: true,
  },
  {
    slug: "parzinho-tweed",
    name: "Parzinho Tweed",
    category: "parzinhos",
    priceCents: 1990, // conferir
    description: "Par de lacinhos em tweed rosa, com presilhas. Perfeito para chiquinhas.",
    materials: "Tweed",
    tags: ["rosa", "tweed", "presilha"],
    isNew: true,
  },
];

const defaultWhatsappTemplates = {
  duvidaProduto: "Olá! Tenho uma dúvida sobre o {produto}.",
  combinarEntrega:
    "Olá! Sou {nome} e fiz o pedido #{pedido} ({itens}), total {total}. Quero combinar a entrega.",
  vendedorParaCliente: "Olá, {nome}! Aqui é da Petit Laços sobre o seu pedido #{pedido}. Vamos combinar a entrega?",
  geral: "Olá! Vim pelo site da Petit Laços.",
};

async function seedOwner() {
  const email = process.env.SEED_OWNER_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_OWNER_PASSWORD;
  const name = process.env.SEED_OWNER_NAME?.trim() || "Dona Petit Laços";

  if (!email || !password) {
    console.warn("⚠️  SEED_OWNER_EMAIL/SEED_OWNER_PASSWORD não definidos — usuário dono não criado.");
    return;
  }
  if (password.length < 10) throw new Error("SEED_OWNER_PASSWORD precisa ter pelo menos 10 caracteres.");

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`• Dono já existe (${email}) — senha mantida.`);
    return;
  }
  await db.user.create({
    data: { email, name, role: "DONO", passwordHash: await hashPassword(password) },
  });
  console.log(`✓ Usuário dono criado: ${email}`);
}

async function main() {
  await db.storeSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      announcements: ["Seu próximo laço favorito está aqui"],
      nationwideShippingEnabled: false, // venda LOCAL é o padrão
      whatsappMain: "+55 35 9781-3556",
      whatsappRouting: "PRINCIPAL",
      whatsappTemplates: defaultWhatsappTemplates,
      localDeliveryInfo:
        "Depois do pagamento, você combina a entrega direto com a gente pelo WhatsApp: retirada, entrega em mãos ou motoboy.",
      pixDiscountPercent: 5,
      maxInstallmentsNoInterest: 3,
    },
  });
  console.log("✓ Configurações da loja (modo Venda Local ativo, Brasil desligado)");

  const theme = { version: 1, preset: "petit-classico" };
  await db.themeSettings.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default", activePreset: "petit-classico", draft: theme, published: theme },
  });
  console.log("✓ Tema padrão: Petit Clássico");

  await seedOwner();

  for (const c of categories) {
    await db.category.upsert({ where: { slug: c.slug }, update: {}, create: c });
  }
  for (const c of collections) {
    await db.collection.upsert({ where: { slug: c.slug }, update: {}, create: c });
  }
  console.log(`✓ ${categories.length} categorias e ${collections.length} coleções`);

  for (const p of products) {
    const { category, collections: productCollections = [], ...data } = p;
    await db.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        ...data,
        status: "PUBLICADO",
        publishedAt: new Date(),
        category: { connect: { slug: category } },
        collections: { connect: productCollections.map((slug) => ({ slug })) },
        variants: {
          create: {
            sku: `PL-${p.slug.toUpperCase()}`,
            name: "Padrão",
            isDefault: true,
            stock: 10,
          },
        },
      },
    });
  }
  console.log(`✓ ${products.length} produtos de exemplo`);

  // Fotos de demonstração (recortadas da loja antiga) — trocar pelas fotos reais no painel
  let withImages = 0;
  for (const p of products) {
    const product = await db.product.findUnique({
      where: { slug: p.slug },
      include: { _count: { select: { images: true } } },
    });
    if (product && product._count.images === 0) {
      await db.productImage.create({
        data: { productId: product.id, url: `/demo/${p.slug}.webp`, alt: p.name, position: 0 },
      });
      withImages++;
    }
  }
  if (withImages) console.log(`✓ Fotos de demonstração em ${withImages} produtos`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
