import { useState, useEffect, useCallback, FC, createContext, useContext } from 'react';
import { IconStyle } from '../types';

// Heart Icon Component for Favorites
export const HeartIcon: FC<{ filled?: boolean; className?: string }> = ({ filled, className = '' }) => (
  <svg 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

export interface FavoriteItem {
  name: string;
  style: IconStyle | string;
  svgFileName?: string;
  type: 'icon' | 'emoji';
  previewUrl?: string; // Store the preview URL for emojis
}

// Create a context for favorites
const FavoritesContext = createContext<{
  favorites: FavoriteItem[];
  toggleFavorite: (item: FavoriteItem) => void;
  removeFavorite: (name: string, style: IconStyle | string, type: 'icon' | 'emoji') => void;
  isFavorite: (name: string, style: IconStyle | string, type: 'icon' | 'emoji') => boolean;
} | null>(null);

// Favorites Provider Component
export const FavoritesProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>(() => {
    try {
      const stored = localStorage.getItem('fluentDeckFavorites');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Sync with localStorage changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'fluentDeckFavorites' && e.newValue) {
        try {
          setFavorites(JSON.parse(e.newValue));
        } catch {
          setFavorites([]);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Save to localStorage whenever favorites change
  useEffect(() => {
    try {
      localStorage.setItem('fluentDeckFavorites', JSON.stringify(favorites));
    } catch (error) {
      console.error('Failed to save favorites:', error);
    }
  }, [favorites]);

  const toggleFavorite = useCallback((item: FavoriteItem) => {
    setFavorites(prev => {
      const exists = prev.some(
        fav => fav.name === item.name && fav.style === item.style && fav.type === item.type
      );
      if (exists) {
        return prev.filter(
          fav => !(fav.name === item.name && fav.style === item.style && fav.type === item.type)
        );
      } else {
        return [...prev, item];
      }
    });
  }, []);

  const removeFavorite = useCallback((name: string, style: IconStyle | string, type: 'icon' | 'emoji') => {
    setFavorites(prev => prev.filter(
      fav => !(fav.name === name && fav.style === style && fav.type === type)
    ));
  }, []);

  const isFavorite = useCallback((name: string, style: IconStyle | string, type: 'icon' | 'emoji') => {
    return favorites.some(
      fav => fav.name === name && fav.style === style && fav.type === type
    );
  }, [favorites]);

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, removeFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

// Custom hook to use favorites
export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};