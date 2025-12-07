import { FC } from 'react';
import { NavItem } from '../types';
import { HomeIcon, AppsIcon, FluentIconsIcon, EmojiIcon, ContributeIcon, CloseIcon } from './Icons';

interface MobileNavProps {
  currentPage: NavItem;
  setCurrentPage: (page: NavItem) => void;
  onClose: () => void;
}

const NavLink: FC<{
  label: NavItem;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full px-4 py-3 text-base font-medium rounded-lg transition-colors duration-150 ${
      isActive
        ? 'bg-bg-active text-text-primary'
        : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
    }`}
    aria-current={isActive ? 'page' : undefined}
  >
    <span className="w-6 h-6 flex items-center justify-center shrink-0">{icon}</span>
    <span className="ml-4 truncate">{label}</span>
  </button>
);

const MobileNav: FC<MobileNavProps> = ({ currentPage, setCurrentPage, onClose }) => {
  const navItems: { label: NavItem; icon: React.ReactNode }[] = [
    { label: 'Home', icon: <HomeIcon /> },
    { label: 'Apps', icon: <AppsIcon /> },
    { label: 'Icons', icon: <FluentIconsIcon /> },
    { label: 'Emoji', icon: <EmojiIcon /> },
    { label: 'Contribute', icon: <ContributeIcon /> },
  ];
  
  // New handler to ensure the menu closes after navigation
  const handleNavigation = (page: NavItem) => {
    setCurrentPage(page);
    onClose(); 
  };

  return (
    // Backdrop handles closing the menu when clicking outside
    <div className="fixed inset-0 bg-black/60 z-40 md:hidden animate-fade-in-fast" onClick={onClose}>
        <div 
            // Prevent clicks inside the navigation panel from closing the backdrop
            className="fixed inset-y-0 left-0 z-50 w-64 bg-bg-secondary border-r border-border-primary transform animate-slide-in-left shadow-2xl"
            onClick={(e) => e.stopPropagation()}
        >
            {/* Keeping the inline style block for the custom animation */}
            <style>{`
                @keyframes slide-in-left {
                    from { transform: translateX(-100%); }
                    to { transform: translateX(0); }
                }
                .animate-slide-in-left { animation: slide-in-left 0.3s ease-out forwards; }
            `}</style>
            
            <div className="flex flex-col h-full">
                {/* Header/Logo Section */}
                <div className="flex items-center justify-between h-16 px-4 border-b border-border-primary">
                    <div className="flex items-center space-x-3">
                        <img src="/assets/logo.png" alt="Fluent Deck Logo" className="h-7 w-7 rounded-md" />
                        <h1 className="text-lg font-semibold text-text-primary">Fluent Deck</h1>
                    </div>
                    {/* Close Button */}
                    <button 
                        onClick={onClose} 
                        className="p-1 text-text-tertiary hover:text-text-primary rounded-full hover:bg-bg-hover transition-colors"
                        aria-label="Close mobile navigation"
                    >
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>
                
                {/* Navigation Links */}
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {navItems.map(item => (
                    <NavLink
                        key={item.label}
                        label={item.label}
                        icon={item.icon}
                        isActive={currentPage === item.label}
                        onClick={() => handleNavigation(item.label)}
                    />
                    ))}
                </nav>
            </div>
        </div>
    </div>
  );
};

export default MobileNav;
