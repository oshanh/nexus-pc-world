import React, { useEffect } from 'react';
import GamingButton from './GamingButton';

type ConfirmDialogVariant = 'danger' | 'primary' | 'secondary';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmDialogVariant;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    if (!open) return;

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel();
    };

    globalThis.addEventListener('keydown', handleEsc);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      globalThis.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onCancel]);

  if (!open) return null;

  let confirmVariant: React.ComponentProps<typeof GamingButton>['variant'] = 'secondary';
  if (variant === 'danger') confirmVariant = 'danger';
  else if (variant === 'primary') confirmVariant = 'primary';

  return (
    <dialog
      open
      aria-modal="true"
      className="fixed top-0 left-0 w-screen h-screen m-0 bg-nexus-dark/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 border-0 max-w-none max-h-none overflow-hidden"
    >
      <div className="relative w-full max-w-lg">
        <button
          type="button"
          onClick={onCancel}
          className="fixed inset-0 cursor-default"
          aria-label="Close dialog"
          disabled={isLoading}
        />

        <div className="relative bg-nexus-gray w-full rounded-lg shadow-2xl shadow-nexus-purple/20 border border-nexus-purple/30 overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-nexus-purple/20">
          <h2 className="text-xl font-exo font-bold text-white">{title}</h2>
          <GamingButton onClick={onCancel} iconOnly={true} size="sm" variant="secondary" aria-label="Close dialog">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </GamingButton>
        </div>

        {description && (
          <div className="p-4 text-gray-300 text-sm leading-relaxed">
            {description}
          </div>
        )}

        <div className="p-4 bg-nexus-dark/50 border-t border-nexus-purple/20 flex justify-end gap-2">
          <GamingButton onClick={onCancel} variant="secondary" disabled={isLoading}>
            {cancelText}
          </GamingButton>
          <GamingButton onClick={onConfirm} variant={confirmVariant} disabled={isLoading}>
            {isLoading ? 'Please wait…' : confirmText}
          </GamingButton>
        </div>
      </div>
      </div>
    </dialog>
  );
};

export default ConfirmDialog;
