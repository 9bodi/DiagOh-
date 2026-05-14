import Link from 'next/link';
import Logo from '@/components/ui/Logo';
import LogoutButton from '@/components/LogoutButton';

interface AdminHeaderProps {
  userName: string;
  orgName: string;
  currentPath?: string;
}

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Tableau de bord' },
  { href: '/users', label: 'Collaborateurs' },
  { href: '/results', label: 'Restitution' },
];

export default function AdminHeader({ userName, orgName, currentPath }: AdminHeaderProps) {
  return (
    <header className="bg-white border-b border-ohe-slate-200">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo size="md" />
          <span className="px-2 py-1 bg-ohe-slate-100 text-ohe-slate-600 text-xs font-semibold rounded">
            ADMIN
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium text-ohe-slate-900">{userName}</p>
            <p className="text-xs text-ohe-slate-600">{orgName}</p>
          </div>
          <LogoutButton />
        </div>
      </div>
      <nav className="px-6 flex gap-6 border-t border-ohe-slate-100">
        {NAV_ITEMS.map((item) => {
          const isActive = currentPath === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                py-3 text-sm font-medium border-b-2 -mb-px transition-colors
                ${
                  isActive
                    ? 'text-ohe-blue border-ohe-blue'
                    : 'text-ohe-slate-600 border-transparent hover:text-ohe-slate-900'
                }
              `}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
