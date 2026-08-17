'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import Button from '@/components/ui/Button';

interface ImportUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ParsedRow {
  email: string;
  group?: string;
}

interface ImportReport {
  totalRows: number;
  validRows: number;
  created: number;
  attributed: number;
  skipped: number;
  groupsCreated: string[];
  creditsUsed: number;
  creditsRemaining: number;
  errors: { line: number; email: string; reason: string }[];
  emailErrors?: { email: string; error: string }[];
}

const HEADER_ALIASES: Record<string, 'email' | 'group'> = {
  email: 'email',
  'e-mail': 'email',
  mail: 'email',
  group: 'group',
  groupe: 'group',
  classe: 'group',
};

function normalizeHeader(h: string): string {
  return h
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export default function ImportUsersModal({ isOpen, onClose }: ImportUsersModalProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ImportReport | null>(null);
  const [creditsError, setCreditsError] = useState<{
    needed: number;
    available: number;
  } | null>(null);

  if (!isOpen) return null;

  function resetAll() {
    setFile(null);
    setParsedRows([]);
    setParseError(null);
    setReport(null);
    setCreditsError(null);
    setLoading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function handleClose() {
    resetAll();
    onClose();
  }

  async function handleFileSelected(f: File) {
    setFile(f);
    setParseError(null);
    setParsedRows([]);
    setCreditsError(null);

    try {
      const buffer = await f.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
        defval: '',
        raw: false,
      });

      if (raw.length === 0) {
        setParseError('Le fichier est vide.');
        return;
      }

      // Reconstitue le mapping headers réels → clés normalisées
      const firstRow = raw[0];
      const headerMap: Record<string, 'email' | 'group'> = {};
      Object.keys(firstRow).forEach((h) => {
        const norm = normalizeHeader(h);
        const target = HEADER_ALIASES[norm];
        if (target) headerMap[h] = target;
      });

      if (!Object.values(headerMap).includes('email')) {
        setParseError('Colonne "email" introuvable. Vérifiez l\'en-tête du fichier.');
        return;
      }

      const rows: ParsedRow[] = raw.map((r) => {
        const parsed: ParsedRow = { email: '' };
        Object.entries(r).forEach(([key, val]) => {
          const target = headerMap[key];
          if (!target) return;
          const strVal = String(val ?? '').trim();
          if (target === 'email') parsed.email = strVal;
          if (target === 'group') parsed.group = strVal || undefined;
        });
        return parsed;
      });

      const nonEmpty = rows.filter((r) => r.email.length > 0);
      if (nonEmpty.length === 0) {
        setParseError('Aucune ligne exploitable (colonne email vide sur toutes les lignes).');
        return;
      }

      setParsedRows(nonEmpty);
    } catch (err) {
      console.error(err);
      setParseError('Impossible de lire le fichier. Format non supporté.');
    }
  }

  async function handleSubmit() {
    if (parsedRows.length === 0) return;
    setLoading(true);
    setCreditsError(null);

    try {
      const res = await fetch('/api/admin/import-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: parsedRows }),
      });
      const data = await res.json();
      setLoading(false);

      if (res.status === 402) {
        setCreditsError({
          needed: data.newEmailsCount,
          available: data.creditsAvailable,
        });
        return;
      }

      if (!res.ok) {
        toast.error(data.error ?? 'Erreur lors de l\'import.');
        return;
      }

      setReport(data);
      router.refresh();
      toast.success(`${data.created} participant(s) créé(s), ${data.attributed} attribué(s).`);
    } catch (err) {
      console.error(err);
      setLoading(false);
      toast.error('Erreur réseau.');
    }
  }

  // ============ Écran RAPPORT ============
  if (report) {
    return (
      <div className="fixed inset-0 bg-ohe-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 z-50">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full max-h-[85vh] overflow-y-auto">
  <p className="font-mono text-[10.5px] tracking-[0.16em] uppercase text-ohe-orange mb-3">
    ✱ Import terminé
  </p>
  <h3 className="font-serif text-2xl text-ohe-slate-900 mb-3 leading-snug">
    Import <em className="italic text-ohe-blue">terminé</em>
  </h3>
  <p className="text-sm text-ohe-slate-600 mb-6 leading-relaxed">
    {report.totalRows} ligne{report.totalRows > 1 ? 's' : ''} traitée
    {report.totalRows > 1 ? 's' : ''}.
  </p>


          <div className="grid grid-cols-3 gap-3 mb-6">
            <StatCard label="Créés" value={report.created} accent="green" />
            <StatCard label="Attribués" value={report.attributed} accent="blue" />
            <StatCard label="Ignorés" value={report.skipped} accent="slate" />
          </div>

          {report.groupsCreated.length > 0 && (
            <div className="mb-5 p-3 bg-ohe-blue/5 border border-ohe-blue/20 rounded-lg">
              <p className="text-xs font-mono uppercase tracking-[0.12em] text-ohe-blue mb-1.5">
                Groupes créés
              </p>
              <p className="text-sm text-ohe-slate-700">
                {report.groupsCreated.join(', ')}
              </p>
            </div>
          )}

          <div className="mb-5 text-sm text-ohe-slate-600">
            <strong>{report.creditsUsed}</strong> crédit{report.creditsUsed > 1 ? 's' : ''} consommé{report.creditsUsed > 1 ? 's' : ''} ·{' '}
            <strong>{report.creditsRemaining}</strong> restant{report.creditsRemaining > 1 ? 's' : ''}.
          </div>

          {report.errors.length > 0 && (
            <details className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg">
              <summary className="text-sm font-semibold text-red-700 cursor-pointer">
                {report.errors.length} erreur{report.errors.length > 1 ? 's' : ''} sur les lignes
              </summary>
              <ul className="mt-3 space-y-1 text-xs text-red-700 max-h-40 overflow-y-auto">
                {report.errors.map((e, i) => (
                  <li key={i} className="font-mono">
                    Ligne {e.line} — {e.email || '(email vide)'} : {e.reason}
                  </li>
                ))}
              </ul>
            </details>
          )}

          {report.emailErrors && report.emailErrors.length > 0 && (
            <details className="mb-5 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <summary className="text-sm font-semibold text-amber-700 cursor-pointer">
                {report.emailErrors.length} email{report.emailErrors.length > 1 ? 's' : ''} non envoyé{report.emailErrors.length > 1 ? 's' : ''}
              </summary>
              <p className="mt-2 text-xs text-amber-700">
                Les participants ont bien été créés. Vous pouvez leur renvoyer manuellement l&apos;invitation depuis la liste.
              </p>
            </details>
          )}

          <div className="flex gap-3">
            <Button variant="secondary" fullWidth onClick={resetAll}>
              Nouvel import
            </Button>
            <Button variant="primary" fullWidth onClick={handleClose}>
              Fermer
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ============ Écran SÉLECTION FICHIER ============
  return (
    <div className="fixed inset-0 bg-ohe-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 z-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full max-h-[85vh] overflow-y-auto">
        <p className="font-mono text-[10.5px] tracking-[0.16em] uppercase text-ohe-orange mb-3">
          ✱ Import en masse
        </p>
       <h3 className="font-serif text-2xl text-ohe-slate-900 mb-3 leading-snug">
  Importer des <em className="italic text-ohe-blue">participants</em>
</h3>

        <p className="text-sm text-ohe-slate-600 mb-5 leading-relaxed">
          Format attendu : deux colonnes <code className="text-xs bg-ohe-slate-100 px-1.5 py-0.5 rounded">email</code>{' '}
          (obligatoire) et <code className="text-xs bg-ohe-slate-100 px-1.5 py-0.5 rounded">group</code>{' '}
          (optionnel). Les emails déjà présents ne sont pas dupliqués.
        </p>

        <div className="flex gap-3 mb-5">
  <a
    href="/api/admin/import-users/template?format=csv"
    className="text-xs text-ohe-blue hover:underline"
  >
    Télécharger le template CSV
  </a>
  <span className="text-xs text-ohe-slate-300">·</span>
  <a
    href="/api/admin/import-users/template?format=xlsx"
    className="text-xs text-ohe-blue hover:underline"
  >
    Template Excel
  </a>
</div>


        <label
          htmlFor="import-file"
          className={`block border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
            file ? 'border-ohe-blue bg-ohe-blue/5' : 'border-ohe-slate-300 hover:border-ohe-blue hover:bg-ohe-slate-50'
          }`}
        >
          <input
            ref={fileInputRef}
            id="import-file"
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFileSelected(f);
            }}
            className="hidden"
            disabled={loading}
          />
          {file ? (
            <>
              <p className="text-sm font-medium text-ohe-slate-900 mb-1">{file.name}</p>
              <p className="text-xs text-ohe-slate-500">
                {(file.size / 1024).toFixed(1)} Ko · Cliquez pour changer
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-ohe-slate-700 mb-1">
                Cliquez pour sélectionner un fichier
              </p>
              <p className="text-xs text-ohe-slate-500">Formats acceptés : .csv, .xlsx</p>
            </>
          )}
        </label>

        {parseError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {parseError}
          </div>
        )}

        {parsedRows.length > 0 && !parseError && (
          <div className="mt-5 p-4 bg-ohe-slate-50 border border-ohe-slate-200 rounded-lg">
            <p className="text-sm font-semibold text-ohe-slate-900 mb-2">
              Aperçu : {parsedRows.length} ligne{parsedRows.length > 1 ? 's' : ''} détectée
              {parsedRows.length > 1 ? 's' : ''}
            </p>
            <ul className="text-xs text-ohe-slate-600 space-y-0.5 max-h-32 overflow-y-auto font-mono">
              {parsedRows.slice(0, 5).map((r, i) => (
                <li key={i}>
                  {r.email} {r.group && <span className="text-ohe-blue">→ {r.group}</span>}
                </li>
              ))}
              {parsedRows.length > 5 && (
                <li className="text-ohe-slate-400 italic">
                  … et {parsedRows.length - 5} de plus
                </li>
              )}
            </ul>
          </div>
        )}

        {creditsError && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-300 rounded-lg text-sm text-amber-800">
            <strong>Crédits insuffisants.</strong> L&apos;import créerait{' '}
            {creditsError.needed} participant(s) mais il ne reste que{' '}
            {creditsError.available} crédit(s). Import annulé.
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <Button variant="secondary" fullWidth onClick={handleClose} disabled={loading}>
            Annuler
          </Button>
          <Button
            variant="primary"
            fullWidth
            onClick={handleSubmit}
            loading={loading}
            disabled={parsedRows.length === 0 || !!parseError}
          >
            Importer {parsedRows.length > 0 && `(${parsedRows.length})`}
          </Button>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: 'green' | 'blue' | 'slate';
}) {
  const color = {
    green: 'text-emerald-600',
    blue: 'text-ohe-blue',
    slate: 'text-ohe-slate-900',
  }[accent];
  return (
    <div className="bg-white border border-ohe-slate-200 rounded-xl p-3 text-center">
      <p className={`font-serif text-2xl ${color} leading-none`}>{value}</p>
      <p className="text-[10px] font-mono uppercase tracking-[0.12em] text-ohe-slate-500 mt-2">
        {label}
      </p>
    </div>
  );
}
