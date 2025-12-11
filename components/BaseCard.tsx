import React, { useCallback, memo, useState } from 'react';
import { CheckmarkIcon, CopyIcon } from './Icons';

interface BaseCardProps {
	name: string;
	isSelected: boolean;
	isSelectionMode: boolean;
	isPriority?: boolean;
	onCardClick: () => void;
	onToggleSelection: () => void;
	onContextMenu: (event: React.MouseEvent) => void;
	children: React.ReactNode;
	onCopy?: () => Promise<void>;
}

const BaseCard: React.FC<BaseCardProps> = ({
	name,
	isSelected,
	isSelectionMode,
	onCardClick,
	onToggleSelection,
	onContextMenu,
	children,
	onCopy,
}) => {
	const [isCopied, setIsCopied] = useState(false);

	const handleClick = useCallback(
		(e: React.MouseEvent) => {
			if (isSelectionMode) {
				e.preventDefault();
				onToggleSelection();
			} else {
				onCardClick();
			}
		},
		[isSelectionMode, onToggleSelection, onCardClick]
	);

	const handleContextMenu = useCallback(
		(event: React.MouseEvent) => {
			onContextMenu(event);
		},
		[onContextMenu]
	);

	const handleCopyClick = useCallback(async (e: React.MouseEvent) => {
		e.stopPropagation();
		
		if (onCopy) {
			await onCopy();
			setIsCopied(true);
			setTimeout(() => setIsCopied(false), 2000);
		}
	}, [onCopy]);

	return (
		<div
			onClick={handleClick}
			onContextMenu={handleContextMenu}
			className={`group relative cursor-pointer bg-white dark:bg-bg-secondary border rounded-lg p-4 flex flex-col items-center aspect-square render-fast-square ${isSelected ? 'border-blue-500 shadow-md' : 'border-neutral-200 dark:border-border-primary'
				} ${!isSelectionMode ? 'hover:brightness-95 dark:hover:brightness-110 duration-300 transition-transform hover:-translate-y-1' : ''}`}
			role="button"
			aria-label={`Select item: ${name}`}
			aria-pressed={isSelected}
			title={name}
		>
			{isSelectionMode && (
				<div
					className={`absolute top-2 right-2 w-5 h-5 rounded-full border-2 flex items-center justify-center z-10 ${isSelected
						? 'bg-blue-500 border-blue-500'
						: 'bg-white/50 dark:bg-neutral-800/50 border-neutral-400 dark:border-neutral-500'
						}`}
				>
					{isSelected && <CheckmarkIcon className="w-3 h-3 text-white" />}
				</div>
			)}

			{!isSelectionMode && onCopy && (
				<button
					onClick={handleCopyClick}
					className="absolute top-2 right-2 p-1.5 rounded-md bg-white/90 dark:bg-neutral-800/90 border border-neutral-200 dark:border-neutral-600 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-20 hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:outline-none focus-visible:opacity-100"
					title="Copy to clipboard"
				>
					{isCopied ? (
						<CheckmarkIcon className="w-4 h-4 text-green-500" />
					) : (
						<CopyIcon className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />
					)}
				</button>
			)}

			<div className="flex-1 flex items-center justify-center">{children}</div>
			<p className="text-xs text-center text-neutral-500 dark:text-text-secondary group-hover:text-neutral-900 dark:group-hover:text-text-primary truncate w-full flex-shrink-0">
				{name}
			</p>
		</div>
	);
};

export default memo(BaseCard);