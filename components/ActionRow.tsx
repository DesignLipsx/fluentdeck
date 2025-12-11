import React from 'react';
import { CheckmarkIcon, CopyIcon as CopyIconFeather, DownloadIcon as DownloadIconFeather } from './Icons';

interface ActionRowProps {
	title: string;
	description: string;
	icon: React.ReactNode;
	isCopied?: boolean;
	onCopy?: () => void;
	onDownload?: () => void;
	isDownloadDisabled?: boolean;
}

export const ActionRow: React.FC<ActionRowProps> = ({ title, description, icon, isCopied = false, onCopy, onDownload, isDownloadDisabled = false }) => {
	return (
		<div className="group">
			<div className="flex items-center justify-between px-3 py-4 rounded-lg border border-gray-200 dark:border-border-primary bg-gray-50 dark:bg-bg-primary">
				<div className="flex items-center gap-4 flex-1 min-w-0">
					<div className="w-9 h-9 rounded-lg bg-gray-200 dark:bg-bg-active flex items-center justify-center group-hover:bg-gray-300 dark:group-hover:bg-bg-secondary">
						{icon}
					</div>
					<div className="flex-1 text-left truncate">
						<div className="text-sm font-semibold text-gray-800 dark:text-text-primary truncate mb-1">{title}</div>
						<div className="text-xs text-text-secondary truncate">{description}</div>
					</div>
				</div>
				<div className="flex items-center gap-2">
					{onCopy && (
						<button onClick={onCopy} className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-bg-active text-gray-800 dark:text-text-secondary" title={`Copy ${title}`} aria-label={`Copy ${title} to clipboard`}>
							{isCopied ? <CheckmarkIcon className="w-5 h-5 text-green-600" /> : <CopyIconFeather className="w-5 h-5 text-gray-700 dark:text-text-secondary" />}
						</button>
					)}
					{onDownload && (
						<button onClick={onDownload} disabled={isDownloadDisabled} className={`p-2 rounded-md hover:bg-gray-200 dark:hover:bg-bg-active text-gray-800 dark:text-text-secondary ${isDownloadDisabled ? 'opacity-30 cursor-not-allowed' : ''}`} title={`Download ${title}`} aria-label={`Download ${title} file`}>
							<DownloadIconFeather className="w-5 h-5 text-gray-700 dark:text-text-secondary" />
						</button>
					)}
				</div>
			</div>
		</div>
	);
};