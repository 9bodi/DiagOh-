'use client';

interface BulkActivateBarProps {
  count: number;
  onActivate: () => void;
  onClear: () => void;
}

export default function BulkActivateBar({ count, onActivate, onClear }: BulkActivateBarProps) {
  if (count === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 duration-200">
      <div className="flex items-center gap-4 px-5 py-3 bg-ohe-slate-900 text-white rounded-2xl shadow-[0_20px_50px_-15px_rgba(15,23,42,0.4)] border border-ohe-slate-800">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 bg-white/10 rounded-full text-xs font-mono font-semibold">
            {count}
          </span>
          <span className="text-sm">
            {count > 1 ? 'participants sélectionnés' : 'participant sélectionné'}
          </span>
        </div>

        <div className="w-px h-6 bg-white/20" />

        <button
          type="button"
          onClick={onActivate}
          className="px-4 py-2 bg-ohe-orange hover:bg-ohe-orange/90 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          Démarrer le test →
        </button>

        <button
          type="button"
          onClick={onClear}
          className="text-sm text-white/60 hover:text-white transition-colors"
        >
          Annuler
        </button>
      </div>
    </div>
  );
}
