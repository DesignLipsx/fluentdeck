import React, { useState, useCallback, useEffect } from 'react';
import { NavItem, App as AppType, Category } from './types';
import { useMarkdownParser } from './hooks/useMarkdownParser';
import { useFluentEmojis } from './hooks/useFluentEmojis';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import AppsPage from './pages/AppsPage';
import IconsPage from './pages/IconsPage';
import EmojiPage from './pages/EmojiPage';
import ContributePage from './pages/ContributePage';
import LoadingSpinner from './components/LoadingSpinner';
import MobileNav from './components/MobileNav';
import Footer from './components/Footer';

const getPageFromPath = (path: string): NavItem => {
  const page = path.split('/')[1]?.toLowerCase();
  switch (page) {
    case 'apps': return 'Apps';
    case 'icons': return 'Icons';
    case 'emoji': return 'Emoji';
    case 'contribute': return 'Contribute';
    default: return 'Home';
  }
};

const App: React.FC = () => {
  const { categories, setCategories, otherSections, loading, error } = useMarkdownParser();
  const { emojis, loading: emojisLoading, error: emojisError } = useFluentEmojis();
  const [currentPage, setCurrentPageState] = useState<NavItem>(getPageFromPath(window.location.pathname));
  const [isMobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    const onPopState = () => {
      setCurrentPageState(getPageFromPath(window.location.pathname));
    };
    window.addEventListener('popstate', onPopState);
    return () => {
      window.removeEventListener('popstate', onPopState);
    };
  }, []);

  const handleLogoUpdate = useCallback((appName: string, newLogoUrl: string) => {
    const newCategories = categories.map(category => ({
      ...category,
      apps: category.apps.map(app => 
        app.name === appName ? { ...app, logo_url: newLogoUrl } : app
      )
    }));
    setCategories(newCategories);
  }, [categories, setCategories]);
  
  const setCurrentPage = useCallback((page: NavItem, callback?: () => void) => {
    const path = page === 'Home' ? '/' : `/${page.toLowerCase()}`;
    if (window.location.pathname !== path) {
      window.history.pushState({ page }, '', path);
    }
    setCurrentPageState(page);
    setMobileNavOpen(false);
    if (callback) {
      // Use a small timeout to allow the new page component to render before scrolling
      setTimeout(callback, 50);
    }
  }, []);

  const renderContent = () => {
    if (loading && categories.length === 0) {
      return <div className="flex items-center justify-center h-full"><LoadingSpinner text="Loading Apps..." /></div>;
    }
    if (error) {
      return <div className="flex items-center justify-center h-full text-red-400">{error}</div>;
    }

    switch (currentPage) {
      case 'Home':
        return <HomePage onNavigate={setCurrentPage} emojis={emojis} categories={categories} />;
      case 'Apps':
        return <AppsPage categories={categories} onLogoUpdate={handleLogoUpdate} />;
      case 'Icons':
        return <IconsPage />;
      case 'Emoji':
        return <EmojiPage emojis={emojis} loading={emojisLoading} error={emojisError} />;
      case 'Contribute':
        return <ContributePage />;
      default:
        return <HomePage onNavigate={setCurrentPage} emojis={emojis} categories={categories} />;
    }
  };

  return (
    <div className="bg-bg-primary text-text-secondary min-h-screen font-sans flex">
      {isMobileNavOpen && <MobileNav currentPage={currentPage} setCurrentPage={setCurrentPage} onClose={() => setMobileNavOpen(false)} />}
      <div className="flex-1 flex flex-col">
        <Header 
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          onMenuClick={() => setMobileNavOpen(true)}
        />
        <main className="flex-1">
          {renderContent()}
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default App;