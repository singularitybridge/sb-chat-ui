import React, { useEffect, useRef } from 'react';
import { DialogComponentEventData } from '../../services/DialogFactory';
import { X } from 'lucide-react';

interface ModalDialogProps {
  dialogData: DialogComponentEventData;
  onClose: () => void;
  isOpen: boolean;
}

const ModalDialog: React.FC<ModalDialogProps> = ({
  dialogData,
  onClose,
  isOpen,
}) => {
  const { title, component, width = 'normal' } = dialogData;
  const dialogRef = useRef<HTMLDivElement>(null);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const widthClass = width === 'wide' ? 'max-w-4xl' : 'max-w-lg';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        ref={dialogRef}
        className={`relative w-full ${widthClass} mx-4 bg-white dark:bg-neutral-800 rounded-lg shadow-xl`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700">
          <h5
            id="modal-title"
            className="text-xl font-medium leading-normal text-neutral-800 dark:text-neutral-200"
          >
            {title}
          </h5>
          <button
            type="button"
            className="p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="h-5 w-5 text-neutral-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4">{component}</div>
      </div>
    </div>
  );
};

export { ModalDialog };
