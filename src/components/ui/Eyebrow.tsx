interface EyebrowProps {
  children?: React.ReactNode;
  mark?: string;
  tone?: 'accent' | 'muted';
  className?: string;
}

// Composant neutralisé : ne rend plus rien (décision produit — retrait des sur‑titres éditoriaux).
// Conservé comme no‑op pour éviter un refactor massif ; à supprimer plus tard avec ses imports.
export function Eyebrow(_props: EyebrowProps) {
  return null;
}

export default Eyebrow;
