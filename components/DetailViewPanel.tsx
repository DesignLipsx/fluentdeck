import React, { useState, useEffect, useCallback } from 'react';
import { XIcon } from './Icons';

interface DetailViewPanelProps {
	title: string;
	onClose: () => void;
	children: React.ReactNode;
	headerActions?: React.ReactNode;
}

export const DetailViewPanel: React.FC<DetailViewPanelProps> = ({ title, onClose, children, headerActions }) => {
	const [isClosing, setIsClosing] = useState(false);

	const handleClose = useCallback(() => {
		setIsClosing(true);
		// Wait for animation to complete before calling onClose
		setTimeout(() => {
			onClose();
		}, 350); // Match the animation duration
	}, [onClose]);

	// Prevent closing during animation
	const handleAnimationEnd = useCallback(() => {
		if (isClosing) {
			onClose();
		}
	}, [isClosing, onClose]);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				handleClose();
			}
		};
		document.addEventListener('keydown', handleKeyDown);
		return () => {
			document.removeEventListener('keydown', handleKeyDown);
		};
	}, [handleClose]);

	return (
		<div 
			className={`fixed bottom-0 left-0 right-0 z-40 flex flex-col max-h-[90vh] lg:max-h-[80vh] xl:max-h-[80vh] bg-white dark:bg-bg-secondary border-t border-gray-200 dark:border-border-primary shadow-[0_-4px_12px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_12px_rgba(0,0,0,0.2)] mt-16 md:mt-0 ${isClosing ? 'animate-slideDown' : 'animate-slideUp'}`}
			onAnimationEnd={handleAnimationEnd}
		>
			{/* Header */}
			<div className="p-4 border-b border-gray-200 dark:border-border-primary flex justify-between items-center flex-shrink-0">
				<h2 className="font-semibold text-lg truncate">{title}</h2>
				<div className="flex items-center gap-2">
					{headerActions}
					<button 
						onClick={handleClose} 
						className="p-1 rounded-full text-gray-500 dark:text-text-secondary hover:bg-gray-200 dark:hover:bg-bg-active focus:outline-none focus:ring-2 focus:ring-blue-500"
						aria-label="Close detail view"
					>
						<XIcon className="w-5 h-5" aria-hidden="true" />
					</button>
				</div>
			</div>

			{/* Body */}
			<div className="p-4 lg:p-6 xl:p-6 overflow-y-auto">
				{children}
			</div>
		</div>
	);
};