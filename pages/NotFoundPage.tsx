import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
	const navigate = useNavigate();

	useEffect(() => {
		document.title = 'Fluent Deck | 404 Not Found';
	}, []);

	return (
		<div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] text-center px-4 animate-fadeIn">
			<h1 className="text-6xl md:text-9xl font-bold text-gray-800 dark:text-gray-100">404</h1>
			<p className="mt-4 text-2xl md:text-3xl font-semibold text-gray-900 dark:text-text-primary">Page Not Found</p>
			<p className="mt-2 text-base text-gray-700 dark:text-text-secondary">
				Sorry, the page you are looking for does not exist.
			</p>
			<button
				onClick={() => navigate('/')}
				className="mt-8 px-6 py-3 font-semibold text-white dark:text-black bg-gray-900 dark:bg-white rounded-lg hover:opacity-90"
			>
				Go Back to Home
			</button>
		</div>
	);
};

export default NotFoundPage;