import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@mojito.cl' },
    update: {},
    create: {
      email: 'admin@mojito.cl',
      password: adminPassword,
      name: 'Administrador',
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin user:', admin.email);

  // Demo buyer
  const buyerPassword = await bcrypt.hash('buyer123', 10);
  const buyer = await prisma.user.upsert({
    where: { email: 'comprador@demo.cl' },
    update: {},
    create: {
      email: 'comprador@demo.cl',
      password: buyerPassword,
      name: 'Comprador Demo',
      role: 'BUYER',
    },
  });
  console.log('✅ Buyer user:', buyer.email);

  // Categories
  const tarot = await prisma.category.upsert({
    where: { slug: 'tarot' },
    update: {},
    create: {
      name: 'Tarot',
      slug: 'tarot',
      description: 'Lecturas de tarot para guiar tu camino espiritual',
      order: 1,
    },
  });

  const espiritual = await prisma.category.upsert({
    where: { slug: 'servicios-espirituales' },
    update: {},
    create: {
      name: 'Servicios Espirituales',
      slug: 'servicios-espirituales',
      description: 'Sanaciones y limpiezas energéticas',
      order: 2,
    },
  });

  const brujeria = await prisma.category.upsert({
    where: { slug: 'brujeria' },
    update: {},
    create: {
      name: 'Brujería',
      slug: 'brujeria',
      description: 'Rituales y trabajos mágicos',
      order: 3,
    },
  });
  console.log('✅ Categories created');

  // Services – Tarot
  await prisma.service.upsert({
    where: { slug: 'lectura-general-tarot' },
    update: {},
    create: {
      categoryId: tarot.id,
      name: 'Lectura General de Tarot',
      slug: 'lectura-general-tarot',
      description: 'Lectura completa sobre tu estado actual en amor, trabajo y salud.',
      price: 2500000, // $25.000 CLP en centavos
      duration: '45 minutos',
    },
  });

  await prisma.service.upsert({
    where: { slug: 'lectura-uno-a-uno' },
    update: {},
    create: {
      categoryId: tarot.id,
      name: 'Lectura Uno a Uno',
      slug: 'lectura-uno-a-uno',
      description: 'Sesión personalizada y profunda sobre un tema específico de tu vida.',
      price: 3500000,
      duration: '60 minutos',
    },
  });

  await prisma.service.upsert({
    where: { slug: 'preguntas-al-oraculo' },
    update: {},
    create: {
      categoryId: tarot.id,
      name: 'Preguntas al Oráculo',
      slug: 'preguntas-al-oraculo',
      description: 'Respuestas concretas a tus preguntas específicas mediante el tarot.',
      price: 1500000,
      duration: '20 minutos',
    },
  });

  // Services – Espiritual
  await prisma.service.upsert({
    where: { slug: 'sanacion-cuantica' },
    update: {},
    create: {
      categoryId: espiritual.id,
      name: 'Sanación Cuántica',
      slug: 'sanacion-cuantica',
      description: 'Trabajo energético profundo para equilibrar y sanar cuerpo, mente y espíritu.',
      price: 4500000,
      duration: '90 minutos',
    },
  });

  await prisma.service.upsert({
    where: { slug: 'limpieza-pendulo-hebreo' },
    update: {},
    create: {
      categoryId: espiritual.id,
      name: 'Limpieza con Péndulo Hebreo',
      slug: 'limpieza-pendulo-hebreo',
      description: 'Limpieza energética utilizando las antiguas técnicas del péndulo hebreo.',
      price: 3000000,
      duration: '60 minutos',
    },
  });

  // Services – Brujería
  await prisma.service.upsert({
    where: { slug: 'ritual-personalizado' },
    update: {},
    create: {
      categoryId: brujeria.id,
      name: 'Ritual Personalizado',
      slug: 'ritual-personalizado',
      description: 'Ritual diseñado específicamente para tus necesidades: amor, protección, prosperidad o destierro.',
      price: 5000000,
      duration: '1 sesión',
    },
  });
  console.log('✅ Services created');

  // Site config defaults
  const configs = [
    { key: 'site_name', value: 'Mojito — Servicios Holísticos' },
    { key: 'site_tagline', value: 'Guía espiritual para tu camino' },
    { key: 'contact_email', value: 'contacto@mojito.cl' },
    { key: 'contact_whatsapp', value: '+56912345678' },
  ];

  for (const config of configs) {
    await prisma.siteConfig.upsert({
      where: { key: config.key },
      update: {},
      create: config,
    });
  }
  console.log('✅ Site config seeded');

  console.log('🎉 Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
