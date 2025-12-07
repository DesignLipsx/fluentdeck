import React from 'react';

const NotFoundPage: React.FC = () => {
  return (
    <div className="bg-bg-primary text-text-secondary min-h-screen font-sans flex flex-col items-center justify-center text-center p-4">
      <h1 className="text-8xl font-bold text-blue-500 mb-4">404</h1>
      <h2 className="text-3xl font-semibold text-text-primary mb-2">Page Not Found</h2>
      <p className="text-text-tertiary max-w-sm mb-8">
        Sorry, the page you are looking for does not exist. It might have been moved or deleted.
      </p>
      <a
        href="/"
        className="px-8 py-3 font-semibold text-accent-primary-text bg-accent-primary rounded-lg hover:bg-accent-primary-hover transition shadow-lg shadow-gray-500/10 dark:shadow-gray-900/20 transform hover:scale-105"
      >
        Go to Homepage
      </a>
    </div>
  );
};

export default NotFoundPage;