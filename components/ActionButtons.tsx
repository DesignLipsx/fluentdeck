import React, { useState, useCallback, FC } from 'react';
import { CopyIcon, DownloadIcon } from '../components/Icons';

interface CopyButtonProps {
  onClick: () => Promise<void>;
  disabled?: boolean;
  className?: string;
}

export const CopyButton: FC<CopyButtonProps> = ({ onClick, disabled = false, className = '' }) => {
  const [copyButtonText, setCopyButtonText] = useState('Copy');

  const handleClick = useCallback(async () => {
    setCopyButtonText('Copy');
    try {
      await onClick();
      setCopyButtonText('Copied!');
      setTimeout(() => setCopyButtonText('Copy'), 2000);
    } catch (error) {
      setCopyButtonText('Error!');
      setTimeout(() => setCopyButtonText('Copy'), 2000);
    }
  }, [onClick]);

  const isUnsupported = disabled;

  return (
    <button
      onClick={handleClick}
      disabled={isUnsupported}
      className={`flex items-center justify-center w-full h-full px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ease-in-out border relative group ${
        isUnsupported
          ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-700 cursor-not-allowed'
          : copyButtonText === 'Copied!'
            ? 'bg-emerald-600 text-white border-emerald-700 shadow-lg animate-jiggle'
            : 'bg-black dark:bg-white text-white dark:text-black border-gray-800 dark:border-gray-300 hover:bg-gray-800 dark:hover:bg-gray-200 shadow-md hover:shadow-lg'
      } ${copyButtonText === 'Copied!' ? 'scale-105' : ''} ${className}`}
    >
      <div className={`w-full flex items-center justify-center gap-2 transition-transform duration-300 ${copyButtonText === 'Copied!' ? 'scale-105' : ''}`}>
        {copyButtonText === 'Copied!' ? (
          <>
            <svg className="w-4 h-4 text-white transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 6L9 17l-5-5" />
            </svg>
            <span className="font-semibold">Copied!</span>
          </>
        ) : (
          <>
            <CopyIcon className={`transition-transform duration-200 ${!isUnsupported ? 'group-hover:scale-110' : ''}`} />
            <span>{isUnsupported ? 'Unsupported' : 'Copy'}</span>
          </>
        )}
      </div>
    </button>
  );
};

interface DownloadButtonProps {
  onClick: () => Promise<void>;
  disabled?: boolean;
  className?: string;
}

export const DownloadButton: FC<DownloadButtonProps> = ({ onClick, disabled = false, className = '' }) => {
  const [downloadState, setDownloadState] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');

  const handleClick = useCallback(async () => {
    setDownloadState('processing');
    try {
      await onClick();
      setDownloadState('success');
      setTimeout(() => setDownloadState('idle'), 2000);
    } catch (error) {
      setDownloadState('error');
      setTimeout(() => setDownloadState('idle'), 2000);
    }
  }, [onClick]);

  return (
    <button
      onClick={handleClick}
      disabled={downloadState === 'processing' || disabled}
      className={`flex items-center justify-center w-full h-full px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 border relative group overflow-hidden ${
        downloadState === 'idle'
          ? 'bg-black dark:bg-white text-white dark:text-black border-gray-800 dark:border-gray-300 hover:bg-gray-800 dark:hover:bg-gray-200 shadow-md hover:shadow-lg'
          : downloadState === 'processing'
          ? 'bg-black dark:bg-white text-white dark:text-black border-gray-800 dark:border-gray-300 shadow-lg cursor-wait'
          : downloadState === 'success'
          ? 'bg-green-600 text-white border-green-700 shadow-lg animate-scale-in-out'
          : 'bg-red-600 text-white border-red-700 shadow-lg animate-scale-in-out'
      } ${className}`}
    >
      <div className={`relative w-full flex items-center justify-center gap-2 ${downloadState !== 'idle' ? 'animate-scale-in-out' : ''}`}>
        {downloadState === 'idle' && (
          <>
            <DownloadIcon />
            <span>Download</span>
          </>
        )}
        {downloadState === 'processing' && (
          <>
            <div className={`w-4 h-4 border-2 rounded-full animate-spin ${
              downloadState === 'processing' 
                ? 'border-white dark:border-black border-t-transparent' 
                : ''
            }`} />
            <span>Processing...</span>
          </>
        )}
        {downloadState === 'success' && (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 6L9 17l-5-5" />
            </svg>
            <span>Complete!</span>
          </>
        )}
        {downloadState === 'error' && (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 6L6 18" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m6 6 12 12" />
            </svg>
            <span>Failed</span>
          </>
        )}
      </div>
    </button>
  );
};

interface ActionButtonsProps {
  copyAction: () => Promise<void>;
  downloadAction: () => Promise<void>;
  copyDisabled?: boolean;
  downloadDisabled?: boolean;
  className?: string;
}

export const ActionButtons: FC<ActionButtonsProps> = ({
  copyAction,
  downloadAction,
  copyDisabled = false,
  downloadDisabled = false,
  className = ''
}) => {
  return (
    <div className={`grid grid-cols-2 gap-3 items-stretch h-10 ${className}`}>
      <CopyButton onClick={copyAction} disabled={copyDisabled} />
      <DownloadButton onClick={downloadAction} disabled={downloadDisabled} />
    </div>
  );
};
