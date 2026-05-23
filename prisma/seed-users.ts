import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Création des comptes de test...');

  // 1. Superadmin
  const superadminHash = await bcrypt.hash('superadmin123', 10);
  await prisma.user.upsert({
    where: { email: 'superadmin@ohe.fr' },
    update: {},
    create: {
      email: 'superadmin@ohe.fr',
      passwordHash: superadminHash,
      firstName: 'Super',
      lastName: 'Admin',
      role: Role.SUPERADMIN,
      passwordCreated: true,
    },
  });
  console.log('✅ Superadmin : superadmin@ohe.fr / superadmin123');

  // 2. Organisation DomusVi Demo
  const org = await prisma.organization.upsert({
    where: { id: 'domusvi-demo-org' },
    update: {},
    create: {
      id: 'domusvi-demo-org',
      name: 'DomusVi Demo',
      credits: 10,
    },
  });
  console.log(`✅ Organisation : ${org.name} (10 crédits)`);

  // 3. Admin DomusVi
  const adminHash = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@domusvi.fr' },
    update: {},
    create: {
      email: 'admin@domusvi.fr',
      passwordHash: adminHash,
      firstName: 'Admin',
      lastName: 'DomusVi',
      role: Role.ADMIN,
      organizationId: org.id,
      passwordCreated: true,
    },
  });
  console.log('✅ Admin : admin@domusvi.fr / admin123');

  console.log('\n🎉 Comptes créés avec succès.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
