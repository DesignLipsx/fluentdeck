import { FC } from 'react';
import { MenuIcon, HomeIcon, AppsIcon, FluentIconsIcon, EmojiIcon, ContributeIcon } from './Icons';
import { NavItem } from '../types';
import UserProfileDropdown from './UserProfileDropdown';

interface HeaderProps {
  onMenuClick: () => void;
  currentPage: NavItem;
  setCurrentPage: (page: NavItem) => void;
}

const Header: FC<HeaderProps> = ({ onMenuClick, currentPage, setCurrentPage }) => {
  // ✅ FIXED: Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ✅ FIXED: Navigation handler with scroll reset
  const handleNavigation = (page: NavItem) => {
    scrollToTop();
    setCurrentPage(page);
  };

  // Define navigation items with their labels and corresponding icons
  const navItems: { label: NavItem; icon: React.ReactNode }[] = [
    { label: 'Home', icon: <HomeIcon /> },
    { label: 'Apps', icon: <AppsIcon /> },
    { label: 'Icons', icon: <FluentIconsIcon /> },
    { label: 'Emoji', icon: <EmojiIcon /> },
    { label: 'Contribute', icon: <ContributeIcon /> },
  ];

  return (
    <header 
      className="sticky top-0 z-20 flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8 
                 bg-bg-backdrop backdrop-blur-md border-b border-border-primary"
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
            )
        })}
      </nav>

      {/* User Profile Dropdown */}
      <div className="flex items-center">
        <UserProfileDropdown />
      </div>
    </header>
  );
};

export default Header;