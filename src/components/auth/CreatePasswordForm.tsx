'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface Props {
  token: string;
  email: string;
}

export default function CreatePasswordForm({ token, email }: Props) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!firstName.trim() || !lastName.trim()) {
      setError('Veuillez renseigner votre prénom et nom.');
      return;
    }
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (!consent) {
      setError('Vous devez accepter la politique de confidentialité et les CGU pour continuer.');
      return;
    }

    setLoading(true);

    const res = await fetch('/api/auth/activate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, firstName, lastName, password, consent }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Une erreur est survenue.');
      setLoading(false);
      return;
    }

    const result = await signIn('credentials', { email, password, redirect: false });
    if (result?.error) {
      setError('Compte créé mais connexion impossible. Allez sur /login.');
      setLoading(false);
      return;
    }

    const role = data.role;
    if (role === 'ADMIN' || role === 'SUPERADMIN' || role === 'SUPERVISOR') {
      router.push('/users');
    } else {
      router.push('/welcome');
    }
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Email" value={email} disabled />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Prénom"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
        <Input
          label="Nom"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />
      </div>
      <Input
        label="Mot de passe"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        helperText="Minimum 8 caractères"
        required
      />
      <Input
        label="Confirmer le mot de passe"
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
      />

      {/* Case à cocher consentement RGPD */}
      <label className="flex items-start gap-3 text-sm text-ohe-slate-700 cursor-pointer pt-2">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-1 w-4 h-4 shrink-0 accent-ohe-accent"
        />
        <span className="leading-relaxed">
          J&apos;ai lu et j&apos;accepte la{' '}
          <Link
            href="/politique-confidentialite"
            target="_blank"
            className="text-ohe-accent underline hover:opacity-80"
          >
            politique de confidentialité
          </Link>
          {' '}et les{' '}
          <Link
            href="/cgu"
            target="_blank"
            className="text-ohe-accent underline hover:opacity-80"
          >
            conditions générales d&apos;utilisation
          </Link>
          .
        </span>
      </label>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded">
          {error}
        </div>
      )}
      <Button type="submit" variant="primary" fullWidth loading={loading}>
        Activer mon compte
      </Button>
    </form>
  );
}
