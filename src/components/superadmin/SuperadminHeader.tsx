import Link from 'next/link';
import Logo from '@/components/ui/Logo';
import LogoutButton from '@/components/LogoutButton';

interface Props {
  userName: string;
  activePage: 'organizations' | 'credits';
}

export default function SuperadminHeader({ userName, activePage }: Props) {
  return (
    <header className="bg-white border-b border-ohe-slate-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Logo />
          <span className="bg-ohe-orange text-white text-xs font-bold px-2 py-1 rounded">
            SUPERADMIN
          </span>
          <nav className="flex gap-4">
            <Link
              href="/organizations"
              className={`text-sm font-medium ${
                activePage === 'organizations'
                  ? 'text-ohe-blue'
                  : 'text-ohe-slate-600 hover:text-ohe-blue'
              }`}
            >
              Organisations
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-ohe-slate-600">{userName}</span>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
