import React, { FC, ReactNode } from 'react';
import { CloseIcon } from './Icons';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

const AppModal: FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in-fast" onClick={onClose}>
      <div className="bg-bg-secondary rounded-xl border border-border-primary shadow-lg w-full max-w-md animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <header className="flex items-center justify-between p-4 border-b border-border-primary">
          <h3 className="text-lg font-semibold text-text-primary truncate pr-4">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-full text-text-tertiary hover:bg-bg-hover hover:text-text-primary">
            <CloseIcon />
          </button>
        </header>
        <div>{children}</div>
      </div>
    </div>
  );
};

export default AppModal;