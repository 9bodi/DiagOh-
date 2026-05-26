'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import InviteUserModal from './InviteUserModal';

interface InviteCollabButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export default function InviteCollabButton({
  variant = 'primary',
  size = 'lg',
  label = 'Inviter un collaborateur →',
}: InviteCollabButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant={variant} size={size} onClick={() => setOpen(true)}>
        {label}
      </Button>
      <InviteUserModal isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}
