import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import AdminHeader from '@/components/admin/AdminHeader';
import InviteCollabButton from '@/components/admin/InviteCollabButton';
import { getAccessibleGroupIds } from '@/lib/permissions';
import AdminsListSection from '@/components/admin/AdminsListSection';


export default async function DashboardPage() {
  const session = await auth();
  if (
    !session ||
    (session.user.role !== 'ADMIN' &&
      session.user.role !== 'SUPERADMIN' &&
      session.user.role !== 'SUPERVISOR')
  ) {
    redirect('/login');
  }

  const orgId = session.user.organizationId;
  if (!orgId) redirect('/login');

  // Filtrage par rôle : superviseur ne voit que les users de ses groupes
  const isSupervisor = session.user.role === 'SUPERVISOR';
  let userWhereClause: any = { role: 'USER', organizationId: orgId };

  if (isSupervisor) {
    const accessibleGroupIds = await getAccessibleGroupIds(
      session.user.id,
      session.user.role,
      orgId,
    );
    userWhereClause = {
      role: 'USER',
      organizationId: orgId,
      groupId: { in: accessibleGroupIds },
    };
  }
  // (à placer après la définition de userWhereClause, avant le prisma.organization.findUnique)

const accessibleGroupIds = isSupervisor
  ? await getAccessibleGroupIds(session.user.id, session.user.role, orgId)
  : null;

const groups = await prisma.group.findMany({
  where: isSupervisor
    ? { organizationId: orgId, id: { in: accessibleGroupIds ?? [] } }
    : { organizationId: orgId },
  select: { id: true, name: true },
  orderBy: { name: 'asc' },
});

  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    include: {
      users: {
        where: userWhereClause,
        include: {
          testSessions: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      },
    },
  });

  if (!org) redirect('/login');

  const totalUsers = org.users.length;
  const completedTests = org.users.filter((u) => u.testSessions[0]?.status === 'COMPLETED').length;
  const inProgressTests = org.users.filter((u) => u.testSessions[0]?.status === 'IN_PROGRESS').length;
  const notStartedTests = totalUsers - completedTests - inProgressTests;

  const adminFirstName = session.user.name?.split(' ')[0] ?? '';
// Fetch admins de l'organisation (masqué pour supervisor)
const admins = isSupervisor
  ? []
  : await prisma.user.findMany({
      where: {
        organizationId: org.id,
        role: 'ADMIN',
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        passwordCreated: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  return (
    <main className="min-h-screen bg-ohe-slate-50">
      <AdminHeader
  userName={session.user.name ?? session.user.email}
  orgName={org.name}
  currentPath="/dashboard"
  userRole={session.user.role}
  isImpersonating={session.user.isImpersonating}
/>



      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Hero */}
        <div className="mb-10">
          <p className="font-mono text-[11px] tracking-[0.16em] uppercase text-ohe-orange mb-4">
             Tableau de bord
          </p>
          <h1 className="font-serif font-normal text-4xl lg:text-[52px] leading-[1.05] tracking-tight text-ohe-slate-900">
            {adminFirstName ? `Bonjour ${adminFirstName},` : 'Bonjour,'}
            <br />
            <em className="italic text-ohe-blue">
              {isSupervisor ? 'suivez vos participants.' : 'pilotez votre équipe.'}
            </em>
          </h1>
          <p className="mt-5 text-base lg:text-lg text-ohe-slate-600 leading-relaxed max-w-xl">
            {isSupervisor
              ? `Vue d'ensemble des participants de vos groupes chez ${org.name}.`
              : `Vue d'ensemble de l'activité diagnostic de ${org.name}.`}
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {!isSupervisor && (
            <KpiCard
              label="Crédits restants"
              value={String(org.credits)}
              hint="tests disponibles"
              accent="blue"
            />
          )}
          <KpiCard
            label="Participants"
            value={String(totalUsers)}
            hint={isSupervisor ? 'dans vos groupes' : 'au total'}
            accent="slate"
          />
          <KpiCard
            label="Tests terminés"
            value={String(completedTests)}
            hint="résultats disponibles"
            accent="green"
          />
          <KpiCard
            label="En cours · à démarrer"
            value={String(inProgressTests + notStartedTests)}
            hint={`${inProgressTests} en cours · ${notStartedTests} à démarrer`}
            accent="orange"
          />
        </div>

        {/* Actions principales */}
        <div className="bg-white rounded-2xl border border-ohe-slate-200/60 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_20px_40px_-20px_rgba(15,23,42,0.15)] p-8 lg:p-10 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-7">
            <div>
              <p className="font-mono text-[10.5px] tracking-[0.16em] uppercase text-ohe-orange mb-3">
                Inviter
              </p>
              <h2 className="font-serif text-2xl lg:text-[28px] tracking-tight leading-tight text-ohe-slate-900">
                Ajoutez un nouveau <em className="italic text-ohe-blue">participant.</em>
              </h2>
              <p className="mt-2 text-sm text-ohe-slate-600 max-w-md">
                Un lien d&apos;activation lui sera envoyé pour créer son compte et passer le diagnostic.
              </p>
            </div>
            <InviteCollabButton userRole={session.user.role} groups={groups} />

          </div>
        </div>
        {/* Section admins (masquée pour supervisor) */}
{!isSupervisor && (
  <AdminsListSection
    admins={admins.map(a => ({ ...a, createdAt: a.createdAt.toISOString() }))}
    currentUserId={session.user.id}
    organizationId={org.id}
    isSuperadmin={session.user.role === 'SUPERADMIN'}
  />
)}


        {/* Quick links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/users" className="group">
            <div className="h-full bg-white rounded-2xl border border-ohe-slate-200/60 p-6 transition-all hover:border-ohe-blue/40 hover:shadow-[0_8px_24px_-12px_rgba(45,61,181,0.25)]">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 bg-ohe-blue/10 rounded-xl flex items-center justify-center text-ohe-blue flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ohe-slate-500 mb-1.5">
                    Gestion
                  </p>
                  <h3 className="font-serif text-xl text-ohe-slate-900 mb-1.5 leading-tight">
                    Vos participants
                  </h3>
                  <p className="text-sm text-ohe-slate-600">
                    Suivre les passages, voir les résultats, gérer les sessions.
                  </p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/results" className="group">
            <div className="h-full bg-white rounded-2xl border border-ohe-slate-200/60 p-6 transition-all hover:border-ohe-orange/40 hover:shadow-[0_8px_24px_-12px_rgba(255,107,53,0.25)]">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 bg-ohe-orange/10 rounded-xl flex items-center justify-center text-ohe-orange flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ohe-slate-500 mb-1.5">
                    Restitution
                  </p>
                  <h3 className="font-serif text-xl text-ohe-slate-900 mb-1.5 leading-tight">
                    Vue collective
                  </h3>
                  <p className="text-sm text-ohe-slate-600">
                    Résultats agrégés, niveaux moyens et tendances par bloc.
                  </p>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Alerte crédits (masquée pour superviseur) */}
        {!isSupervisor && org.credits === 0 && (
          <div className="mt-6 p-5 bg-ohe-orange/5 border border-ohe-orange/30 rounded-2xl flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-ohe-orange/15 text-ohe-orange flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ohe-orange mb-1">
                Crédits épuisés
              </p>
              <p className="text-sm text-ohe-slate-900">
                Plus aucun crédit disponible pour inviter de nouveaux participants.{' '}
                <span className="text-ohe-slate-600">
                  Contactez l&apos;équipe OHé pour recharger votre compte.
                </span>
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

// ============ KPI Card ============
interface KpiCardProps {
  label: string;
  value: string;
  hint: string;
  accent: 'blue' | 'slate' | 'green' | 'orange';
}

function KpiCard({ label, value, hint, accent }: KpiCardProps) {
  const accentColor = {
    blue: 'text-ohe-blue',
    slate: 'text-ohe-slate-900',
    green: 'text-emerald-600',
    orange: 'text-ohe-orange',
  }[accent];

  return (
    <div className="bg-white rounded-2xl border border-ohe-slate-200/60 p-5">
      <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-ohe-slate-500 mb-3">
        {label}
      </p>
      <p className={`font-serif text-4xl lg:text-[44px] leading-none ${accentColor}`}>
        {value}
      </p>
      <p className="text-xs text-ohe-slate-600 mt-3">{hint}</p>
    </div>
  );
}
