import React, { lazy, Suspense, useLayoutEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

import Header from './components/Header';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ToastContainer } from './components/Toast';

import { ToastProvider } from './contexts/ToastContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { CollectionsProvider } from './contexts/CollectionsContext';
import { AppProvider, useApp } from './contexts/AppContext';

export { usePersistentState } from './hooks/usePersistentState';
export { ThemeContext, type Theme } from './contexts/ThemeContext';
export { CollectionsContext } from './contexts/CollectionsContext';
export { AppContext } from './contexts/AppContext';

const HomePage = lazy(() => import('./pages/HomePage'));
const AppsPage = lazy(() => import('./pages/AppsPage'));
const EmojiPage = lazy(() => import('./pages/EmojiPage'));
const IconsPage = lazy(() => import('./pages/IconsPage'));
const ContributePage = lazy(() => import('./pages/ContributePage'));
const CollectionsPage = lazy(() => import('./pages/CollectionsPage'));
const ChangelogPage = lazy(() => import('./pages/ChangelogPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

const SelectionActionBar = lazy(() => import('./components/SelectionActionBar'));

const PageLoader: React.FC = () => {
  const { pathname } = useLocation();

  if (pathname === '/') {
    return null;
  }

  return (
    <div className="flex items-center justify-center w-full min-h-[calc(100vh-12rem)]">
      <LoadingSpinner text="Loading page..." />
    </div>
  );
};

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useLayoutEffect(() => {
    document.documentElement.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const AppContent: React.FC = () => {
  const { isSelectionMode, selectionContext } = useApp();
  const location = useLocation();

  return (
    <div className="bg-transparent text-gray-900 dark:text-text-primary min-h-screen font-sans flex flex-col">
      <Header />
      <main className="flex-grow pt-16">
        <ScrollToTop />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/apps" element={<AppsPage />} />
            <Route path="/emoji/*" element={<EmojiPage />} />
            <Route path="/icons/*" element={<IconsPage />} />
            <Route path="/contribute" element={<ContributePage />} />
            <Route path="/collections" element={<CollectionsPage />} />
            <Route path="/changelog" element={<ChangelogPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>          
        </Suspense>
      </main>
      {isSelectionMode && selectionContext === location.pathname && (
        <Suspense fallback={null}>
          <SelectionActionBar />
        </Suspense>
      )}
      <ToastContainer />
    </div>
  );
};

const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider>
    <ToastProvider>
      <CollectionsProvider>
        <AppProvider>{children}</AppProvider>
      </CollectionsProvider>
    </ToastProvider>
  </ThemeProvider>
);

const App: React.FC = () => (
  <AppProviders>
    <AppContent />
  </AppProviders>
);

export default App;