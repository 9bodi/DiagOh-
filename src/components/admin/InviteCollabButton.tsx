'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import InviteUserModal from './InviteUserModal';

interface GroupOption {
  id: string;
  name: string;
}

interface InviteCollabButtonProps {
  userRole: string;
  groups: GroupOption[];
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export default function InviteCollabButton({
  userRole,
  groups,
  variant = 'primary',
  size = 'lg',
  label = 'Inviter un participant →',
}: InviteCollabButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant={variant} size={size} onClick={() => setOpen(true)}>
        {label}
      </Button>
      <InviteUserModal
        isOpen={open}
        onClose={() => setOpen(false)}
        groups={groups}
        userRole={userRole}
      />
    </>
  );
}
