'use client';

import { useState, FormEvent } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/ui/Logo';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (!result || result.error) {
      setError('Email ou mot de passe incorrect.');
      return;
    }

    const session = await getSession();

    if (session?.user?.role === 'SUPERADMIN') {
      router.push('/organizations');
    } else if (session?.user?.role === 'ADMIN') {
      router.push('/dashboard');
    } else {
      router.push('/welcome');
    }
    router.refresh();
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ohe-slate-50 to-ohe-slate-100 p-6">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Logo size="lg" />
        </div>

        <Card padding="lg">
          <h1 className="text-2xl font-bold text-ohe-slate-900 mb-2">Connexion</h1>
          <p className="text-sm text-ohe-slate-600 mb-6">
            Accédez à votre espace d&apos;administration.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              name="email"
              placeholder="vous@organisation.fr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />

            <Input
              label="Mot de passe"
              type="password"
              name="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
              Se connecter
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-ohe-slate-200">
            <p className="text-xs text-ohe-slate-600 text-center">
              <Link href="/" className="hover:text-ohe-blue">
                ← Retour à l&apos;accueil
              </Link>
            </p>
          </div>
        </Card>

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs font-semibold text-yellow-900 mb-2">🧪 Comptes de test (dev) :</p>
          <ul className="text-xs text-yellow-800 space-y-1 font-mono">
            <li>Superadmin: superadmin@ohe.fr / superadmin123</li>
            <li>Admin: admin@domusvi.fr / admin123</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
