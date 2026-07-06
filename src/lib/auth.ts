import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';
import { readImpersonationFromCookies } from './impersonation';
import type { Role } from '@prisma/client';

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60,
  },
  pages: {
    signIn: '/login',
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = String(credentials.email).toLowerCase();
        const password = String(credentials.password);

        const user = await prisma.user.findUnique({
          where: { email },
          include: { organization: true },
        });

        if (!user || !user.passwordHash) return null;

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.firstName ? `${user.firstName} ${user.lastName ?? ''}`.trim() : user.email,
          role: user.role,
          organizationId: user.organizationId,
          organizationName: user.organization?.name ?? null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = (user as { role: Role }).role;
        token.organizationId = (user as { organizationId: string | null }).organizationId;
        token.organizationName = (user as { organizationName: string | null }).organizationName;
      }
      return token;
    },
    async session({ session, token }) {
      if (!session.user) return session;

      // Contexte normal
      session.user.id = token.id as string;
      session.user.role = token.role as Role;
      session.user.organizationId = token.organizationId as string | null;
      session.user.organizationName = token.organizationName as string | null;

      // Impersonation : uniquement si l'utilisateur est SUPERADMIN
      if (session.user.role === 'SUPERADMIN') {
        try {
          const impersonation = await readImpersonationFromCookies();
          if (impersonation && impersonation.superadminId === session.user.id) {
            // Charge l'organisation cible
            const org = await prisma.organization.findUnique({
              where: { id: impersonation.organizationId },
              select: { id: true, name: true },
            });
            if (org) {
              // Sauvegarde le contexte réel puis surcharge
              session.user.actualRole = session.user.role;
              session.user.actualOrganizationId = session.user.organizationId;
              session.user.role = 'ADMIN' as Role;
              session.user.organizationId = org.id;
              session.user.organizationName = org.name;
              session.user.isImpersonating = true;
            }
          }
        } catch (e) {
          console.error('Erreur lecture impersonation:', e);
        }
      }

      return session;
    },
  },
});
