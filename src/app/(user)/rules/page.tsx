import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/ui/Logo';
import Button from '@/components/ui/Button';

export default async function RulesPage() {
  const session = await auth();

  if (!session || session.user.role !== 'USER') {
    redirect('/login');
  }

  return (
    <main className="min-h-screen bg-ohe-slate-50 flex items-center justify-center p-4 sm:p-8 lg:p-16">
      <div className="w-full max-w-6xl bg-white rounded-3xl border border-ohe-slate-200/60 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_24px_48px_-24px_rgba(15,23,42,0.18)] overflow-hidden grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] min-h-[640px]">
        {/* Left — title + CTA */}
        <div className="p-10 lg:p-14 flex flex-col justify-between gap-12">
          <div>
            <Logo size="sm" />

            <p className="font-mono text-[11px] tracking-[0.16em] uppercase text-ohe-orange mt-9 mb-5">
              ✱ Avant de démarrer
            </p>

            <h1 className="font-serif font-normal text-4xl lg:text-[56px] leading-[1.05] tracking-tight text-ohe-slate-900">
              Court, chronométré,
              <br />
              <em className="italic text-ohe-blue">en une seule fois.</em>
            </h1>

            <p className="mt-6 text-base lg:text-lg text-ohe-slate-600 leading-relaxed max-w-md">
              Prenez le temps de lire chaque question, mais répondez sans hésiter trop longtemps. Vos premières intuitions sont les meilleures.
            </p>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <Link href="/test">
              <Button variant="primary" size="lg">
                J&apos;ai compris, je démarre →
              </Button>
            </Link>
            <Link
              href="/welcome"
              className="text-sm text-ohe-slate-600 hover:text-ohe-slate-900 transition-colors"
            >
              Revenir à l&apos;accueil
            </Link>
          </div>
        </div>

        {/* Right — indigo panel with rules */}
        <div className="relative p-10 lg:p-14 flex flex-col justify-center gap-7 bg-gradient-to-br from-ohe-indigo to-[#2A2580] text-white overflow-hidden">
          {/* Subtle warm glow */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(circle at 80% 20%, rgba(255,107,53,0.18), transparent 50%)',
            }}
          />

          {/* Rule 01 */}
          <div className="relative grid grid-cols-[42px_1fr] gap-4 items-start">
            <div className="w-[42px] h-[42px] rounded-lg bg-white/[0.12] border border-white/[0.16] flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="font-mono text-[11px] tracking-[0.14em] text-white/60 mb-1">01</p>
              <p className="font-semibold text-lg lg:text-[19px] mb-1.5 tracking-tight">Chronométré</p>
              <p className="text-sm text-white/70 leading-relaxed max-w-xs">
                15 secondes par question, validation auto à la fin du temps.
              </p>
            </div>
          </div>

          {/* Rule 02 */}
          <div className="relative grid grid-cols-[42px_1fr] gap-4 items-start">
            <div className="w-[42px] h-[42px] rounded-lg bg-white/[0.12] border border-white/[0.16] flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
            <div>
              <p className="font-mono text-[11px] tracking-[0.14em] text-white/60 mb-1">02</p>
              <p className="font-semibold text-lg lg:text-[19px] mb-1.5 tracking-tight">Définitif</p>
              <p className="text-sm text-white/70 leading-relaxed max-w-xs">
                Aucun retour en arrière une fois la réponse validée.
              </p>
            </div>
          </div>

          {/* Rule 03 — accent orange */}
          <div className="relative grid grid-cols-[42px_1fr] gap-4 items-start">
            <div className="w-[42px] h-[42px] rounded-lg bg-ohe-orange flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" strokeWidth={1.8} stroke="currentColor" fill="none" />
                <path d="M12 3 a9 9 0 0 1 0 18 z" fill="currentColor" />
              </svg>
            </div>
            <div>
              <p className="font-mono text-[11px] tracking-[0.14em] text-white/60 mb-1">03</p>
              <p className="font-semibold text-lg lg:text-[19px] mb-1.5 tracking-tight">Une seule session</p>
              <p className="text-sm text-white/70 leading-relaxed max-w-xs">
                À faire d&apos;une traite, sans interruption ni pause.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}