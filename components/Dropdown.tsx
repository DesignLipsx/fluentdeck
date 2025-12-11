import React, { useState, useEffect, useRef, ReactNode, ComponentType, ElementType, createContext, useContext } from "react";

interface DropdownContextType {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  closeMenu: () => void;
}

const DropdownContext = createContext<DropdownContextType | undefined>(undefined);

interface DropdownMenuProps {
  children: ReactNode;
  trigger: (isOpen: boolean) => ReactNode;
  direction?: 'up' | 'down';
  menuClassName?: string;
  onOpen?: () => void;
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({ children, trigger, direction = 'down', menuClassName = '', onOpen }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [positionClass, setPositionClass] = useState('right-0');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const closeMenu = () => setIsOpen(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTriggerClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isOpen && dropdownRef.current) {
      if (onOpen) onOpen();

      const rect = dropdownRef.current.getBoundingClientRect();
      const menuWidth = 256;
      const spaceRight = window.innerWidth - rect.right;
      const spaceLeft = rect.left;

      if (spaceRight >= menuWidth) {
        setPositionClass('left-0');
      } else if (spaceLeft >= menuWidth) {
        setPositionClass('right-0');
      } else {
        setPositionClass('right-0');
      }
    }

    setIsOpen(!isOpen);
  };

  const originClass = direction === 'up'
    ? (positionClass === 'right-0' ? 'origin-bottom-right' : 'origin-bottom-left')
    : (positionClass === 'right-0' ? 'origin-top-right' : 'origin-top-left');

  const baseDropdownClasses = `absolute rounded-lg shadow-lg bg-white dark:bg-bg-secondary border border-gray-200 dark:border-border-primary focus:outline-none z-50 p-1 ${originClass} ${positionClass} ${menuClassName}`;

  const dropdownClasses = direction === 'up'
    ? `bottom-full mb-2 ${baseDropdownClasses}`
    : `mt-2 ${baseDropdownClasses}`;

  return (
    <DropdownContext.Provider value={{ isOpen, setIsOpen, closeMenu }}>
      <div className="relative w-full text-left" ref={dropdownRef}>
        <div onClick={handleTriggerClick} className="cursor-pointer">
          {trigger(isOpen)}
        </div>
        {isOpen && (
          <div className={dropdownClasses} role="menu" aria-orientation="vertical">
            <div role="none" className="flex flex-col gap-1">
                {children}
            </div>
          </div>
        )}
      </div>
    </DropdownContext.Provider>
  );
};

interface DropdownMenuItemProps {
  children: ReactNode;
  onClick?: () => void;
  isActive?: boolean;
  disabled?: boolean;
  as?: ElementType | ComponentType<any>;
  to?: string;
  href?: string;
  target?: string;
  rel?: string;
  className?: string;
  [key: string]: any;
}

export const DropdownMenuItem: React.FC<DropdownMenuItemProps> = ({
  children,
  onClick,
  isActive,
  disabled,
  as: Component = 'a',
  className = '',
  ...rest
}) => {
  const context = useContext(DropdownContext);

  const handleClick = (e: React.MouseEvent) => {
    if (Component === 'a' && rest.href === '#') {
      e.preventDefault();
    }

    if (disabled) return;

    if (onClick) onClick();

    if (context) {
      context.closeMenu();
    }
  };

  const baseClasses = `
    text-gray-900 dark:text-text-primary 
    group flex items-center px-2 py-2 text-sm rounded-md w-full
    ${isActive ? 'bg-gray-100 dark:bg-bg-active' : ''}
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:!bg-gray-100 dark:hover:!bg-bg-active'}
  `;
  const combinedClassName = `${baseClasses} ${className}`;

  return (
    <Component
      onClick={handleClick}
      className={combinedClassName}
      role="menuitem"
      aria-disabled={disabled}
      {...rest}
    >
      {children}
    </Component>
  );
};