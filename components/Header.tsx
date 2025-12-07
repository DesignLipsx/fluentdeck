import React from 'react';
import { MenuIcon, HomeIcon, AppsIcon, FluentIconsIcon, EmojiIcon, ContributeIcon } from './Icons';
import { NavItem } from '../types';
import UserProfileDropdown from './UserProfileDropdown';

interface HeaderProps {
  onMenuClick: () => void;
  currentPage: NavItem;
  setCurrentPage: (page: NavItem) => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, currentPage, setCurrentPage }) => {
  const navItems: { label: NavItem; icon: React.ReactNode }[] = [
    { label: 'Home', icon: <HomeIcon /> },
    { label: 'Apps', icon: <AppsIcon /> },
    { label: 'Icons', icon: <FluentIconsIcon /> },
    { label: 'Emoji', icon: <EmojiIcon /> },
    { label: 'Contribute', icon: <ContributeIcon /> },
  ];

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8 bg-bg-backdrop backdrop-blur-md border-b border-border-primary">
      <div className="flex items-center space-x-4">
        <button onClick={onMenuClick} className="md:hidden p-2 -ml-2 text-text-tertiary hover:text-text-primary">
          <MenuIcon />
        </button>
        <button onClick={() => setCurrentPage('Home')} className="flex items-center space-x-3">
            <img src="https://ovquzgethkugtnxcoeiq.supabase.co/storage/v1/object/public/fluent_deck_assets/logo.png" alt="Fluent Deck Logo" className="h-8 w-8" />
            <h1 className="text-lg font-semibold text-text-primary">Fluent Deck</h1>
        </button>
      </div>

      <nav className="hidden md:flex items-center space-x-2 h-full">
        {navItems.map(item => {
            const isActive = currentPage === item.label;
            return (
              <button
                key={item.label}
                onClick={() => setCurrentPage(item.label)}
                className={`h-full flex items-center px-3 text-sm font-medium border-b-2 -mb-px ${
                  isActive
                    ? 'border-accent-primary text-text-primary'
                    : 'border-transparent text-text-tertiary hover:text-text-primary hover:border-border-secondary'
                }`}
              >
                {item.label}
              </button>
            )
        })}
      </nav>

      <div className="flex items-center">
        <UserProfileDropdown />
      </div>
    </header>
  );
};

export default Header;