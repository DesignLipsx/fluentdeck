import React from 'react';

export const AppCardSkeleton: React.FC = () => {
	return (
		<div className="bg-white dark:bg-bg-secondary border border-gray-200 dark:border-border-primary rounded-lg flex flex-col h-full animate-pulse">
			<div className="bg-gray-200 dark:bg-bg-active h-32 flex items-center justify-center">
				<div className="w-16 h-16 rounded-lg bg-gray-300 dark:bg-border-primary"></div>
			</div>
			<div className="p-4 border-t border-gray-100 dark:border-border-primary/50">
				<div className="h-4 bg-gray-300 dark:bg-border-primary rounded w-3/4 mb-3"></div>
				<div className="flex items-center justify-between">
					<div className="h-3 bg-gray-300 dark:bg-border-primary rounded w-1/4"></div>
					<div className="h-5 bg-gray-300 dark:bg-border-primary rounded-full w-10"></div>
				</div>
			</div>
		</div>
	);
};