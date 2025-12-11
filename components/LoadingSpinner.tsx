import React from 'react';

interface LoadingSpinnerProps {
	text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ text }) => (
	<div className="flex flex-col items-center justify-center gap-4">
		<div className="w-12 h-12 border-4 border-gray-200 dark:border-border-primary border-t-blue-500 dark:border-t-accent rounded-full animate-spin"></div>
		{text && <p className="text-gray-500 dark:text-text-secondary">{text}</p>}
	</div>
);

export default LoadingSpinner;