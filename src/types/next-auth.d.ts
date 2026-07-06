import { Role } from '@prisma/client';
import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      role: Role;
      organizationId: string | null;
      organizationName: string | null;
      isImpersonating?: boolean;
      actualRole?: Role;
      actualOrganizationId?: string | null;
    };
  }

  interface User {
    role: Role;
    organizationId: string | null;
    organizationName: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: Role;
    organizationId: string | null;
    organizationName: string | null;
  }
}
