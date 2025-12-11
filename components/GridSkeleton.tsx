import React from 'react';

interface GridSkeletonProps {
	count?: number;
}

const GridSkeleton: React.FC<GridSkeletonProps> = ({ count = 30 }) => {
	return (
		<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-8 gap-4">
			{Array.from({ length: count }).map((_, i) => (
				<div key={i} className="animate-pulse">
					<div className="aspect-square bg-gray-200 dark:bg-bg-active rounded-lg"></div>
				</div>
			))}
		</div>
	);
};

export default GridSkeleton;