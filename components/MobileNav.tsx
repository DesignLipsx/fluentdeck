import React from 'react';
import { NavItem } from '../types';
import { HomeIcon, AppsIcon, FluentIconsIcon, EmojiIcon, ContributeIcon, CloseIcon } from './Icons';

interface MobileNavProps {
  currentPage: NavItem;
  setCurrentPage: (page: NavItem) => void;
  onClose: () => void;
}

const NavLink: React.FC<{
  label: NavItem;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full px-4 py-3 text-base font-medium rounded-lg ${
      isActive
        ? 'bg-bg-active text-text-primary'
        : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
    }`}
  >
    {icon}
    <span className="ml-4">{label}</span>
  </button>
);

const MobileNav: React.FC<MobileNavProps> = ({ currentPage, setCurrentPage, onClose }) => {
  const navItems: { label: NavItem; icon: React.ReactNode }[] = [
    { label: 'Home', icon: <HomeIcon /> },
    { label: 'Apps', icon: <AppsIcon /> },
    { label: 'Icons', icon: <FluentIconsIcon /> },
    { label: 'Emoji', icon: <EmojiIcon /> },
    { label: 'Contribute', icon: <ContributeIcon /> },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 z-40 md:hidden animate-fade-in-fast" onClick={onClose}>
        <div 
            className="fixed inset-y-0 left-0 z-50 w-64 bg-bg-secondary border-r border-border-primary transform animate-slide-in-left"
            onClick={(e) => e.stopPropagation()}
        >
            <style>{`
                @keyframes slide-in-left {
                    from { transform: translateX(-100%); }
                    to { transform: translateX(0); }
                }
                .animate-slide-in-left { animation: slide-in-left 0.3s ease-out forwards; }
            `}</style>
            <div className="flex flex-col h-full">
                <div className="flex items-center justify-between h-16 px-4 border-b border-border-primary">
                    <div className="flex items-center space-x-3">
                        <img src="https://ovquzgethkugtnxcoeiq.supabase.co/storage/v1/object/public/fluent_deck_assets/logo.png" alt="Fluent Deck Logo" className="h-7 w-7" />
                        <h1 className="text-lg font-semibold text-text-primary">Fluent Deck</h1>
                    </div>
                    <button onClick={onClose} className="p-1 text-text-tertiary hover:text-text-primary">
                        <CloseIcon />
                    </button>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map(item => (
                    <NavLink
                        key={item.label}
                        label={item.label}
                        icon={item.icon}
                        isActive={currentPage === item.label}
                        onClick={() => setCurrentPage(item.label)}
                    />
                    ))}
                </nav>
            </div>
        </div>
    </div>
  );
};

export default MobileNav;