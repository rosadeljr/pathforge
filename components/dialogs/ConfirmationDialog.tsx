'use client';

import { ReactNode } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { AlertTriangle } from 'lucide-react';

type ConfirmationLevel = 'info' | 'warning' | 'danger';

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  level?: ConfirmationLevel;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const levelStyles: Record<ConfirmationLevel, string> = {
  info: 'text-cyan-400',
  warning: 'text-amber-400',
  danger: 'text-rose-400',
};

export function ConfirmationDialog({
  isOpen,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  level = 'info',
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmationDialogProps) {
  const handleConfirm = async () => {
    try {
      await onConfirm();
    } catch (error) {
      console.error('Confirmation action failed:', error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      size="sm"
      footer={
        <div className="flex gap-3 justify-end">
          <Button
            variant="tertiary"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={level === 'danger' ? 'primary' : 'primary'}
            onClick={handleConfirm}
            loading={isLoading}
          >
            {confirmLabel}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {level === 'danger' && (
          <div className="flex items-center gap-3 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg">
            <AlertTriangle size={20} className="text-rose-400 flex-shrink-0" />
            <p className="text-sm text-rose-300">This action cannot be undone.</p>
          </div>
        )}

        {description && (
          <div className="text-slate-300 text-sm leading-relaxed">
            {description}
          </div>
        )}
      </div>
    </Modal>
  );
}
