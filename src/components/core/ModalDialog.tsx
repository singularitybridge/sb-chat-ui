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
  const bodyRef = useRef<HTMLDivElement>(null);

  // Scroll body to top when modal opens (delay to run after form auto-focus)
  useEffect(() => {
    if (isOpen && bodyRef.current) {
      // Immediate scroll
      bodyRef.current.scrollTop = 0;
      // Delayed scroll to override browser's auto-scroll to focused element
      // Using requestAnimationFrame + small delay to ensure it runs after focus scroll
      const timeoutId = setTimeout(() => {
        requestAnimationFrame(() => {
          if (bodyRef.current) {
            bodyRef.current.scrollTop = 0;
          }
        });
      }, 50);
      return () => clearTimeout(timeoutId);
    }
  }, [isOpen]);

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
    >
      <div
        ref={dialogRef}
        className={`relative w-full ${widthClass} max-h-[90vh] flex flex-col bg-white dark:bg-neutral-800 rounded-lg shadow-xl`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header - fixed at top */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700 shrink-0">
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
            autoFocus
          >
            <X className="h-5 w-5 text-neutral-500" />
          </button>
        </div>

        {/* Body - scrollable */}
        <div ref={bodyRef} className="p-4 overflow-y-auto flex-1">{component}</div>
      </div>
    </div>
  );
};

export { ModalDialog };
