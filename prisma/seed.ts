import { PrismaClient, Role, QuestionType, QuestionCategory, DeclarativeAxis } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // 1. Superadmin OHé
  const superadminPassword = await bcrypt.hash('superadmin123', 10);
  const superadmin = await prisma.user.upsert({
    where: { email: 'superadmin@ohe.fr' },
    update: {},
    create: {
      email: 'superadmin@ohe.fr',
      passwordHash: superadminPassword,
      firstName: 'Super',
      lastName: 'Admin',
      role: Role.SUPERADMIN,
      passwordCreated: true,
    },
  });
  console.log('✅ Superadmin created:', superadmin.email);

  // 2. Demo Organization
  const demoOrg = await prisma.organization.upsert({
    where: { id: 'demo-org-id' },
    update: {},
    create: {
      id: 'demo-org-id',
      name: 'DomusVi Demo',
      credits: 10,
    },
  });
  console.log('✅ Organization created:', demoOrg.name);

  // 3. Admin of the demo org
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@domusvi.fr' },
    update: {},
    create: {
      email: 'admin@domusvi.fr',
      passwordHash: adminPassword,
      firstName: 'Sophie',
      lastName: 'Martin',
      role: Role.ADMIN,
      organizationId: demoOrg.id,
      passwordCreated: true,
    },
  });
  console.log('✅ Admin created:', admin.email);

  // 4. Demo User (the one who will take the test)
  const userPassword = await bcrypt.hash('user123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'marie.dupont@domusvi.fr' },
    update: {},
    create: {
      email: 'marie.dupont@domusvi.fr',
      passwordHash: userPassword,
      firstName: 'Marie',
      lastName: 'Dupont',
      role: Role.USER,
      organizationId: demoOrg.id,
      passwordCreated: true,
    },
  });
  console.log('✅ User created:', user.email);

  // 5. Questions
  await prisma.question.deleteMany({});

  // Procedural questions
  await prisma.question.create({
    data: {
      type: QuestionType.PROCEDURAL,
      category: QuestionCategory.ORTHOGRAPHE_GRAMMATICALE,
      subCategory: 'HOMOPHONES - CE/SE/CEUX',
      questionText: '« N\'oublie pas ____ qui sont importants pour toi. »',
      options: ['ce', 'se', 'ceux', 'je ne sais pas'],
      correctAnswerIndex: 2,
      timeLimit: 15,
    },
  });

  await prisma.question.create({
    data: {
      type: QuestionType.PROCEDURAL,
      category: QuestionCategory.CONJUGAISON,
      subCategory: 'PRÉSENT - VERBES DU 3E GROUPE',
      questionText: 'Quelle est la forme correcte ? « Il ____ son travail rapidement. »',
      options: ['finis', 'finit', 'finie', 'je ne sais pas'],
      correctAnswerIndex: 1,
      timeLimit: 15,
    },
  });

  await prisma.question.create({
    data: {
      type: QuestionType.PROCEDURAL,
      category: QuestionCategory.ORTHOGRAPHE_LEXICALE,
      subCategory: 'ORTHOGRAPHE D\'USAGE',
      questionText: 'Quelle est l\'orthographe correcte ?',
      options: ['language', 'langage', 'languaje', 'je ne sais pas'],
      correctAnswerIndex: 1,
      timeLimit: 15,
    },
  });

  console.log('✅ 3 procedural questions created');

  // Declarative questions
  await prisma.question.create({
    data: {
      type: QuestionType.DECLARATIF,
      questionText: 'Pensez-vous avoir un bon niveau en orthographe ?',
      options: ['Oui, très bon', 'Plutôt oui', 'Plutôt non', 'Non, à améliorer'],
      declarativeAxis: DeclarativeAxis.RELEVANCE,
      declarativeWeight: 1,
      timeLimit: 15,
    },
  });

  await prisma.question.create({
    data: {
      type: QuestionType.DECLARATIF,
      questionText: 'Seriez-vous intéressé(e) par une formation en orthographe ?',
      options: ['Très intéressé(e)', 'Plutôt intéressé(e)', 'Peu intéressé(e)', 'Pas du tout'],
      declarativeAxis: DeclarativeAxis.INTEREST,
      declarativeWeight: 1,
      timeLimit: 15,
    },
  });

  console.log('✅ 2 declarative questions created');

  // 6. Initial credit transaction (trace the initial 10 credits)
  await prisma.creditTransaction.create({
    data: {
      organizationId: demoOrg.id,
      amount: 10,
      reason: 'Initial credits (seed)',
      createdById: superadmin.id,
    },
  });
  console.log('✅ Initial credit transaction logged');

  console.log('🎉 Seed completed successfully!');
  console.log('\n📋 Test accounts:');
  console.log('   Superadmin: superadmin@ohe.fr / superadmin123');
  console.log('   Admin:      admin@domusvi.fr / admin123');
  console.log('   User:       marie.dupont@domusvi.fr / user123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
