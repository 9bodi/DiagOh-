import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthorizedCronRequest } from '@/lib/cron-auth';
import { sendReminderJ1Email } from '@/lib/email';

export async function GET(request: Request) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const in23h = new Date(now.getTime() + 23 * 60 * 60 * 1000);

  // Cible : sessions READY_TO_START, deadline entre +23h et +24h, pas encore rappelées
  // La fenêtre d'1h évite les doublons entre exécutions horaires
  const toRemind = await prisma.testSession.findMany({
    where: {
      status: 'READY_TO_START',
      deadline: { gte: in23h, lte: in24h },
      reminderJ1SentAt: null,
    },
    include: {
      user: {
        include: { organization: true },
      },
    },
  });

  if (toRemind.length === 0) {
    return NextResponse.json({ sent: 0, message: 'Aucun rappel à envoyer.' });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const results = { sent: 0, failed: 0, errors: [] as string[] };

  for (const testSession of toRemind) {
    if (!testSession.deadline || !testSession.user) continue;

    const emailResult = await sendReminderJ1Email({
      to: testSession.user.email,
      firstName: testSession.user.firstName,
      deadline: testSession.deadline,
      organizationName: testSession.user.organization?.name ?? 'votre organisation',
      appUrl,
    });

    if (emailResult.success) {
      // Marque comme envoyé pour éviter les doublons
      await prisma.testSession.update({
        where: { id: testSession.id },
        data: { reminderJ1SentAt: new Date() },
      });
      results.sent++;
    } else {
      results.failed++;
      results.errors.push(`${testSession.user.email}: ${emailResult.error}`);
    }
  }

  console.log(`📧 Cron reminders-j1 : ${results.sent} envoyé(s), ${results.failed} échec(s)`);

  return NextResponse.json(results);
}
