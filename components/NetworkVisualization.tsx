import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface Contributor {
	id: number;
	login: string;
	avatar_url: string;
	html_url: string;
}

interface NetworkVisualizationProps {
	onNavigate: () => void;
	contributors: Contributor[];
	loading: boolean;
}

const NetworkVisualization: React.FC<NetworkVisualizationProps> = ({ onNavigate, contributors = [], loading }) => {
	if (loading) {
		return <div className="flex justify-center py-8"><LoadingSpinner text="Loading contributors..." /></div>
	}

	if (contributors.length === 0) {
		return (
			<div className="relative w-full max-w-5xl mx-auto text-center py-8">
				<p className="text-gray-500 dark:text-text-secondary">No contributors to display.</p>
			</div>
		);
	}

	return (
		<div className="relative w-full max-w-6xl mx-auto" onClick={onNavigate} style={{ cursor: 'pointer' }}>
			<div
				className="relative flex gap-6 overflow-hidden p-4 bg-white/60 dark:bg-black/40 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200 dark:border-border-primary [mask-image:linear-gradient(to_right,transparent,black_20%,black_80%,transparent)]"
			>
				<div className="flex gap-6 animate-marquee-scroll">
					{[...contributors, ...contributors].map((contributor, index) => (
						<a
							key={`${contributor.id}-${index}`}
							href={contributor.html_url}
							target="_blank"
							rel="noopener noreferrer"
							onClick={(e) => e.stopPropagation()}
							className="flex-shrink-0 flex flex-col items-center gap-2 text-center w-24 group/avatar"
						>
							<img
								src={contributor.avatar_url}
								alt={`Avatar of ${contributor.login}`}
								loading="lazy"
								decoding="async"
								width="64"
								height="64"
								className="w-16 h-16 rounded-full object-cover border-2 border-white dark:border-bg-secondary shadow-md group-hover/avatar:scale-105 transition-transform duration-300 ease-in-out"
							/>
							<span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate w-full">{contributor.login}</span>
						</a>
					))}
				</div>
			</div>
		</div>
	);
};

export default NetworkVisualization;