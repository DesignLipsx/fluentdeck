import { FC, useState, useRef, useEffect } from 'react';
import { MenuIcon, HomeIcon, AppsIcon, FluentIconsIcon, EmojiIcon, ContributeIcon, DownloadIcon } from './Icons';
import { NavItem } from '../types';
import UserProfileDropdown from './UserProfileDropdown';
import { useFavorites, HeartIcon, FavoriteItem } from '../hooks/useFavorites';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

interface HeaderProps {
  onMenuClick: () => void;
  currentPage: NavItem;
  setCurrentPage: (page: NavItem) => void;
  onFavoriteIconClick?: (item: FavoriteItem) => void;
  onFavoriteEmojiClick?: (item: FavoriteItem) => void;
}

const Header: FC<HeaderProps> = ({ onMenuClick, currentPage, setCurrentPage, onFavoriteIconClick, onFavoriteEmojiClick }) => {
  const { favorites, removeFavorite } = useFavorites();
  const [showFavoritesMenu, setShowFavoritesMenu] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowFavoritesMenu(false);
      }
    };

    if (showFavoritesMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFavoritesMenu]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigation = (page: NavItem) => {
    scrollToTop();
    setCurrentPage(page);
  };

  const handleFavoriteItemClick = (item: FavoriteItem) => {
    setShowFavoritesMenu(false);
    
    if (item.type === 'icon') {
      if (currentPage !== 'Icons') {
        setCurrentPage('Icons');
      }
      if (onFavoriteIconClick) {
        onFavoriteIconClick(item);
      }
    } else if (item.type === 'emoji') {
      if (currentPage !== 'Emoji') {
        setCurrentPage('Emoji');
      }
      if (onFavoriteEmojiClick) {
        onFavoriteEmojiClick(item);
      }
    }
  };

  const handleRemoveFavorite = (e: React.MouseEvent, item: FavoriteItem) => {
    e.stopPropagation();
    removeFavorite(item.name, item.style, item.type);
  };

    // Update the buildEmojiDownloadUrl function to match EmojiPage format
    const buildEmojiDownloadUrl = (emojiName: string, style: string, isSkintoneBased: boolean = false): string | null => {
      const base = 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/refs/heads/main/assets';
      const folderName = emojiName;
      const fileBase = emojiName.toLowerCase().replace(/ /g, '_');
      const suffix = isSkintoneBased ? '_default' : '';
      const defaults = isSkintoneBased ? 'Default/' : '';

      switch (style) {
        case '3D':
          return `${base}/${folderName}/${defaults}3D/${fileBase}_3d${suffix}.png`;
        case 'Modern':
        case 'Color':
          return `${base}/${folderName}/${defaults}Color/${fileBase}_color${suffix}.svg`;
        case 'Flat':
          return `${base}/${folderName}/${defaults}Flat/${fileBase}_flat${suffix}.svg`;
        case 'Mono':
        case 'HighContrast':
          return `${base}/${folderName}/${defaults}High Contrast/${fileBase}_high_contrast${suffix}.svg`;
        case 'Anim':
        case 'Animated':
          return `https://media.githubusercontent.com/media/microsoft/fluentui-emoji-animated/refs/heads/main/assets/${folderName}/${defaults}animated/${fileBase}_animated${suffix}.png`;
        default:
          return null;
      }
    };

    // Update the getFavoritePreview function for emojis
    const getFavoritePreview = (item: FavoriteItem) => {
      if (item.type === 'icon') {
        let fileName: string;
        const snakeCaseName = item.svgFileName
          ? item.svgFileName.replace('ic_fluent_', '').replace(/_24_(filled|regular|color)\.svg$/, '')
          : item.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/_$/, '').replace(/^_/, '');
    
        const styleSuffix = item.style === 'outlined' ? 'regular' : item.style;
        fileName = item.svgFileName 
          ? item.svgFileName.replace(/_24_(filled|regular|color)\.svg$/, `_24_${styleSuffix}.svg`)
          : `ic_fluent_${snakeCaseName}_24_${styleSuffix}.svg`;

        const folderName = item.style === 'outlined' ? 'icon_regular' : item.style === 'filled' ? 'icon_filled' : 'icon_color';
        return {
          type: 'icon' as const,
          url: `/${folderName}/${fileName}`,
          downloadUrl: `/${folderName}/${fileName}`,
          fileName: fileName
        };
      } else {
        // For emojis, use the exact same URL construction as in EmojiPage
        const downloadUrl = buildEmojiDownloadUrl(item.name, item.style, item.isSkintoneBased || false);
    
        if (!downloadUrl) {
          // Fallback to preview URL if download URL can't be constructed
          return {
            type: 'emoji' as const,
            url: item.previewUrl || '/assets/placeholder-emoji.png',
            downloadUrl: item.previewUrl || '/assets/placeholder-emoji.png',
            fileName: `${item.name.toLowerCase().replace(/\s+/g, '_')}.png`
          };
        }
    
        // Determine file extension based on style
        let fileExtension = 'svg';
        if (item.style === '3D') fileExtension = 'png';
        if (item.style === 'Anim' || item.style === 'Animated') fileExtension = 'png'; // Animated are PNG in the media repo
    
        const fileName = `${item.name.toLowerCase().replace(/\s+/g, '_')}.${fileExtension}`;
    
        return {
          type: 'emoji' as const,
          url: item.previewUrl || '/assets/placeholder-emoji.png', // Use preview URL for display
          downloadUrl: downloadUrl, // Use GitHub URL for download
          fileName: fileName
        };
      }
    };

    // Update the download part in downloadAllFavoritesAsZip
    const downloadAllFavoritesAsZip = async () => {
      if (favorites.length === 0) return;
  
      setIsDownloading(true);
      try {
        const zip = new JSZip();
        const iconFolder = zip.folder("icons");
        const emojiFolder = zip.folder("emojis");

        // Download each favorite file
        for (const item of favorites) {
          const preview = getFavoritePreview(item);
      
          try {
            // For emojis from GitHub, we might need to handle CORS
            const response = await fetch(preview.downloadUrl, {
              mode: 'cors',
              headers: {
                'Accept': item.type === 'emoji' ? 'image/*' : 'image/svg+xml',
              }
            });
        
            if (!response.ok) throw new Error(`Failed to fetch ${preview.downloadUrl} - Status: ${response.status}`);
        
            const blob = await response.blob();
        
            // Verify it's actually an image and not an error page
            if (blob.size < 100) { // Error pages are usually small
              throw new Error('Downloaded file appears to be invalid');
            }
        
            if (item.type === 'icon') {
              iconFolder?.file(preview.fileName, blob);
            } else {
              emojiFolder?.file(preview.fileName, blob);
            }
          } catch (error) {
            console.error(`Failed to download ${item.name}:`, error);
            // Continue with other files even if one fails
          }
        }

        // Generate ZIP file
        const content = await zip.generateAsync({ type: "blob" });
        saveAs(content, `fluent-deck-favorites-${new Date().toISOString().split('T')[0]}.zip`);
    
      } catch (error) {
        console.error('Failed to create ZIP file:', error);
        alert('Failed to download favorites. Please try again.');
      } finally {
        setIsDownloading(false);
        setShowFavoritesMenu(false);
      }
    };

  const navItems: { label: NavItem; icon: React.ReactNode }[] = [
    { label: 'Home', icon: <HomeIcon /> },
    { label: 'Apps', icon: <AppsIcon /> },
    { label: 'Icons', icon: <FluentIconsIcon /> },
    { label: 'Emoji', icon: <EmojiIcon /> },
    { label: 'Contribute', icon: <ContributeIcon /> },
  ];

  return (
    <header 
      className="fixed top-0 z-30 w-full flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8
                 bg-bg-primary border-b border-border-primary"
    >
      {/* Logo and Mobile Menu */}
      <div className="flex items-center space-x-4">
        <button 
          onClick={onMenuClick} 
          className="md:hidden p-2 -ml-2 text-text-tertiary hover:text-text-primary transition-colors"
          aria-label="Toggle navigation menu"
        >
          <MenuIcon />
        </button>
        <button 
          onClick={() => handleNavigation('Home')} 
          className="flex items-center space-x-3 group"
          aria-label="Go to Home page"
        >
          <img 
            src="/assets/logo.png" 
            alt="Fluent Deck Logo" 
            className="h-8 w-8 transition-transform group-hover:scale-105" 
          />
          <h1 className="text-lg font-semibold text-text-primary">Fluent Deck</h1>
        </button>
      </div>

      {/* Desktop Navigation Links */}
      <nav className="hidden md:flex items-center space-x-2 h-full">
        {navItems.map(item => {
          const isActive = currentPage === item.label;
          const linkClasses = `
            h-full flex items-center px-3 text-sm font-medium border-b-2 -mb-px transition-colors duration-200
            ${isActive
              ? 'border-accent-primary text-text-primary'
              : 'border-transparent text-text-tertiary hover:text-text-primary hover:border-border-secondary'
            }
          `;
          return (
            <button
              key={item.label}
              onClick={() => handleNavigation(item.label)}
              className={linkClasses}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Favorites and User Profile */}
      <div className="flex items-center space-x-3">
        {/* Favorites Menu Button - Always shown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowFavoritesMenu(!showFavoritesMenu)}
            className="relative p-2 text-text-tertiary hover:text-text-primary hover:bg-bg-tertiary rounded-lg transition-colors"
            aria-label="View favorites"
          >
            <HeartIcon filled={favorites.length > 0} className="w-5 h-5" />
            {favorites.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                {favorites.length}
              </span>
            )}
          </button>

          {/* Favorites Dropdown Menu */}
          {showFavoritesMenu && (
            <div className="absolute right-0 mt-2 w-80 bg-bg-secondary border border-border-primary rounded-lg shadow-lg overflow-hidden z-50">
              <div className="p-3 border-b border-border-secondary bg-bg-tertiary">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary">Favorites</h3>
                    <p className="text-xs text-text-tertiary mt-0.5">
                      {favorites.length > 0 
                        ? `${favorites.length} item${favorites.length !== 1 ? 's' : ''}`
                        : 'No favorites yet'
                      }
                    </p>
                  </div>
                  {favorites.length > 0 && (
                    <button
                      onClick={downloadAllFavoritesAsZip}
                      disabled={isDownloading}
                      className="flex items-center space-x-1 px-3 py-2 text-xs bg-blue-700 hover:bg-blue-800 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Download all as ZIP"
                    >
                      <DownloadIcon className="w-3 h-3" />
                      <span>{isDownloading ? 'Downloading...' : 'Download as ZIP'}</span>
                    </button>
                  )}
                </div>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {favorites.length > 0 ? (
                    favorites.map((item, index) => {
                    const preview = getFavoritePreview(item);
                    return (
                        // Change this from button to div
                        <div
                        key={`${item.type}-${item.name}-${item.style}-${index}`}
                        onClick={() => handleFavoriteItemClick(item)}
                        className="w-full px-3 py-2.5 flex items-center space-x-3 hover:bg-bg-hover transition-colors text-left group cursor-pointer"
                        >
                        {/* Icon/Emoji Preview */}
                        <div className="w-10 h-10 flex items-center justify-center bg-bg-tertiary rounded-lg flex-shrink-0 group-hover:bg-bg-inset">
                            {preview.type === 'icon' ? (
                            <img
                                src={preview.url}
                                alt={item.name}
                                className={`w-6 h-6 ${item.style !== 'color' ? 'dark:filter dark:invert' : ''}`}
                                onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                }}
                            />
                            ) : (
                            <img
                                src={preview.url}
                                alt={item.name}
                                className="w-8 h-8"
                                onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentNode as HTMLElement;
                                if (parent) {
                                    const fallback = document.createElement('div');
                                    fallback.className = 'w-8 h-8 flex items-center justify-center text-lg';
                                    fallback.textContent = item.name.charAt(0) || '🎭';
                                    parent.appendChild(fallback);
                                }
                                }}
                            />
                            )}
                        </div>

                        {/* Item Info */}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-text-primary truncate">
                            {item.name}
                            </p>
                            <p className="text-xs text-text-tertiary">
                            {item.type === 'icon' ? 'Icon' : 'Emoji'} • {item.style}
                            </p>
                        </div>

                        {/* Remove button */}
                        <button
                            onClick={(e) => handleRemoveFavorite(e, item)}
                            className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-red-500/10 text-text-tertiary hover:text-red-500 transition-all"
                            title="Remove from favorites"
                        >
                            <svg 
                            className="w-4 h-4" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                            >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        </div>
                    );
                    })
                ) : (
                  <div className="p-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-3 flex items-center justify-center bg-bg-tertiary rounded-full">
                      <HeartIcon className="w-8 h-8 text-text-tertiary" />
                    </div>
                    <h4 className="text-sm font-medium text-text-primary mb-1">No favorites yet</h4>
                    <p className="text-xs text-text-tertiary">
                      Start adding icons and emojis to your favorites!
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <UserProfileDropdown />
      </div>
    </header>
  );
};

export default Header;