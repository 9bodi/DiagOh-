import Link from 'next/link';
import Logo from '@/components/ui/Logo';
import LogoutButton from '@/components/LogoutButton';
import ImpersonationBanner from './ImpersonationBanner';

interface AdminHeaderProps {
  userName: string;
  orgName: string;
  currentPath?: string;
  userRole?: string;
  isImpersonating?: boolean;
}

const NAV_ITEMS_BY_ROLE: Record<string, { href: string; label: string }[]> = {
  SUPERADMIN: [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/users', label: 'Participants' },
    { href: '/groups', label: 'Groupes' },
    { href: '/supervisors', label: 'Superviseurs' },
  ],
  ADMIN: [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/users', label: 'Participants' },
    { href: '/groups', label: 'Groupes' },
    { href: '/supervisors', label: 'Superviseurs' },
  ],
  SUPERVISOR: [
    { href: '/users', label: 'Participants' },
  ],
};

export default function AdminHeader({
  userName,
  orgName,
  currentPath,
  userRole = 'ADMIN',
  isImpersonating = false,
}: AdminHeaderProps) {
  const navItems = NAV_ITEMS_BY_ROLE[userRole] ?? [];
  const roleLabel = userRole === 'SUPERVISOR' ? 'Superviseur' : 'Admin';

  return (
    <>
      {isImpersonating && <ImpersonationBanner orgName={orgName} />}

      <header className="bg-white border-b border-ohe-slate-200">
        <div className="px-6 py-4 flex items-center justify-between gap-6">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <Logo size="md" />
              <span className="px-2 py-0.5 bg-ohe-orange/10 text-ohe-orange text-[10px] font-mono font-semibold tracking-[0.14em] uppercase rounded">
                {roleLabel}
              </span>
            </div>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = currentPath === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      px-3 py-1.5 text-sm font-medium rounded-lg transition-colors
                      ${
                        isActive
                          ? 'text-ohe-blue bg-ohe-blue/[0.06]'
                          : 'text-ohe-slate-600 hover:text-ohe-slate-900 hover:bg-ohe-slate-50'
                      }
                    `}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block leading-tight">
              <p className="text-sm font-medium text-ohe-slate-900">{userName}</p>
              <p className="text-xs text-ohe-slate-600">{orgName}</p>
            </div>
            <LogoutButton />
          </div>
        </div>

        {navItems.length > 1 && (
          <nav className="md:hidden px-6 pb-3 flex gap-1 overflow-x-auto">
            {navItems.map((item) => {
              const isActive = currentPath === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    px-3 py-1.5 text-sm font-medium rounded-lg whitespace-nowrap transition-colors
                    ${
                      isActive
                        ? 'text-ohe-blue bg-ohe-blue/[0.06]'
                        : 'text-ohe-slate-600 hover:text-ohe-slate-900 hover:bg-ohe-slate-50'
                    }
                  `}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        )}
      </header>
    </>
  );
}
