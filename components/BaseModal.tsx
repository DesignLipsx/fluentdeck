import React, { useState, useEffect, useCallback } from 'react';

interface BaseModalProps {
	isOpen: boolean;
	onClose: () => void;
	children: React.ReactNode;
	className?: string;
	ariaLabelledBy: string;
}

export const BaseModal: React.FC<BaseModalProps> = ({
	isOpen,
	onClose,
	children,
	className = 'max-w-sm',
	ariaLabelledBy
}) => {
	const [isClosing, setIsClosing] = useState(false);

	const handleClose = useCallback(() => {
		setIsClosing(true);
		setTimeout(onClose, 200);
	}, [onClose]);

	useEffect(() => {
		if (isOpen) {
			setIsClosing(false);
		}
	}, [isOpen]);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				handleClose();
			}
		};
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [handleClose]);

	if (!isOpen && !isClosing) return null;

	return (
		<div
			className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-[70] flex items-center justify-center p-4"
			onClick={handleClose}
			role="dialog"
			aria-modal="true"
			aria-labelledby={ariaLabelledBy}
		>
			<div
				className={`bg-white dark:bg-bg-secondary border border-gray-200 dark:border-border-primary rounded-xl w-full ${className} ${isClosing ? 'animate-scaleOut' : 'animate-scaleIn'}`}
				onClick={e => e.stopPropagation()}
			>
				{children}
			</div>
		</div>
	);
};