import { ImageResponse } from 'next/og';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const LEVEL_META: Record<string, { name: string; description: string }> = {
  A: { name: 'Fondamental', description: 'Bases en construction' },
  B1: { name: 'Intermédiaire', description: 'Acquis solides' },
  B2: { name: 'Avancé', description: 'Maîtrise professionnelle' },
  C: { name: 'Expert', description: 'Maîtrise experte' },
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const { userId } = await params;

  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      organization: true,
      testSessions: {
        where: { status: 'COMPLETED' },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });

  if (!targetUser) {
    return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
  }

  const isOwner = session.user.id === userId;
  const isAdminSameOrg =
    session.user.role === 'ADMIN' &&
    session.user.organizationId === targetUser.organizationId;
  const isSuperadmin = session.user.role === 'SUPERADMIN';

  if (!isOwner && !isAdminSameOrg && !isSuperadmin) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  const lastSession = targetUser.testSessions[0];
  if (!lastSession || !lastSession.completedAt) {
    return NextResponse.json(
      { error: 'Aucun test terminé' },
      { status: 404 }
    );
  }

  const level = (lastSession.level ?? 'A') as 'A' | 'B1' | 'B2' | 'C';
  const meta = LEVEL_META[level];
  const fullName = `${targetUser.firstName ?? ''} ${targetUser.lastName ?? ''}`.trim() || targetUser.email;
  const dateStr = new Date(lastSession.completedAt).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '1200px',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#FDF8F0',
          padding: '80px',
          position: 'relative',
          fontFamily: 'serif',
        }}
      >
        {/* Bordure décorative */}
        <div
          style={{
            position: 'absolute',
            top: '40px',
            left: '40px',
            right: '40px',
            bottom: '40px',
            border: '2px solid #1B3A5C',
            display: 'flex',
          }}
        />

        {/* Header : logo OHé */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '20px',
          }}
        >
          <div
            style={{
              fontSize: '52px',
              fontWeight: 700,
              color: '#1B3A5C',
              fontStyle: 'italic',
              display: 'flex',
            }}
          >
            OHé
          </div>
          <div
            style={{
              fontSize: '16px',
              letterSpacing: '4px',
              color: '#E97B4E',
              textTransform: 'uppercase',
              display: 'flex',
            }}
          >
            Certification
          </div>
        </div>

        {/* Corps central */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            paddingLeft: '60px',
            paddingRight: '60px',
          }}
        >
          <div
            style={{
              fontSize: '22px',
              letterSpacing: '6px',
              color: '#1B3A5C',
              textTransform: 'uppercase',
              marginBottom: '40px',
              display: 'flex',
            }}
          >
            Diagnostic d'orthographe validé
          </div>

          <div
            style={{
              fontSize: '80px',
              fontWeight: 400,
              color: '#1A1A1A',
              lineHeight: 1.1,
              marginBottom: '20px',
              display: 'flex',
            }}
          >
            {fullName}
          </div>

          <div
            style={{
              width: '120px',
              height: '2px',
              backgroundColor: '#E97B4E',
              marginTop: '30px',
              marginBottom: '40px',
              display: 'flex',
            }}
          />

          {/* Bloc niveau */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              backgroundColor: '#1B3A5C',
              color: '#FDF8F0',
              padding: '40px 80px',
              borderRadius: '8px',
            }}
          >
            <div
              style={{
                fontSize: '20px',
                letterSpacing: '4px',
                textTransform: 'uppercase',
                opacity: 0.7,
                marginBottom: '12px',
                display: 'flex',
              }}
            >
              Niveau atteint
            </div>
            <div
              style={{
                fontSize: '96px',
                fontWeight: 700,
                lineHeight: 1,
                fontStyle: 'italic',
                display: 'flex',
              }}
            >
              {level}
            </div>
            <div
              style={{
                fontSize: '32px',
                marginTop: '10px',
                fontStyle: 'italic',
                display: 'flex',
              }}
            >
              {meta.name}
            </div>
            <div
              style={{
                fontSize: '18px',
                opacity: 0.8,
                marginTop: '6px',
                display: 'flex',
              }}
            >
              {meta.description}
            </div>
          </div>
        </div>

        {/* Footer : signature + date */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: '20px',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                fontSize: '14px',
                letterSpacing: '2px',
                color: '#E97B4E',
                textTransform: 'uppercase',
                marginBottom: '8px',
                display: 'flex',
              }}
            >
              Diagnostic conçu par
            </div>
            <div
              style={{
                fontSize: '22px',
                color: '#1B3A5C',
                fontStyle: 'italic',
                display: 'flex',
              }}
            >
              Roxane Joannidès
            </div>
            <div
              style={{
                fontSize: '14px',
                color: '#6B6B6B',
                marginTop: '4px',
                display: 'flex',
              }}
            >
              Docteure en sciences du langage
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
            }}
          >
            <div
              style={{
                fontSize: '14px',
                letterSpacing: '2px',
                color: '#E97B4E',
                textTransform: 'uppercase',
                marginBottom: '8px',
                display: 'flex',
              }}
            >
              Délivré le
            </div>
            <div
              style={{
                fontSize: '22px',
                color: '#1B3A5C',
                fontStyle: 'italic',
                display: 'flex',
              }}
            >
              {dateStr}
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 1200,
    }
  );
}
