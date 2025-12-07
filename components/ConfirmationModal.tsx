import React from 'react';
import { SignOutIcon } from './Icons';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in-fast" onClick={onClose}>
      <div className="bg-bg-secondary rounded-xl border border-border-primary shadow-lg w-full max-w-sm animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/20">
            <SignOutIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="mt-5 text-lg font-semibold text-text-primary">{title}</h3>
          <p className="mt-2 text-sm text-text-tertiary">{message}</p>
        </div>
        <div className="flex justify-end p-4 bg-bg-tertiary/50 border-t border-border-primary space-x-3 rounded-b-xl">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-md bg-bg-inset hover:bg-bg-active text-text-primary">
            {cancelText}
          </button>
          <button onClick={onConfirm} className="px-4 py-2 text-sm font-medium rounded-md bg-red-600 hover:bg-red-700 text-white">
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;