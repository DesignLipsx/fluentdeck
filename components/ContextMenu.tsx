import React, { useState, useEffect, useRef, ReactNode, Suspense } from 'react';
import { ChevronRightIcon } from './Icons';

interface ContextMenuProps {
    x: number;
    y: number;
    onClose: () => void;
    children: ReactNode;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, onClose, children }) => {
    const menuRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ top: y, left: x, opacity: 0 });

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        const handleResize = () => {
            onClose();
        };

        const adjustPosition = () => {
             if (menuRef.current) {
                const menuRect = menuRef.current.getBoundingClientRect();
                let newTop = y;
                let newLeft = x;
                const buffer = 8;

                if (y + menuRect.height > window.innerHeight) {
                    newTop = y - menuRect.height;
                }
                if (x + menuRect.width > window.innerWidth) {
                    newLeft = x - menuRect.width;
                }
                if (newTop < 0) newTop = buffer;
                if (newLeft < 0) newLeft = buffer;


                setPosition({ top: newTop, left: newLeft, opacity: 1 });
            }
        }
        
        requestAnimationFrame(adjustPosition);

        document.addEventListener('mousedown', handleClickOutside);
        window.addEventListener('resize', handleResize);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('resize', handleResize);
        };
    }, [x, y, onClose]);

    return (
        <div
            ref={menuRef}
            className="fixed z-50 w-48 rounded-md shadow-lg bg-white dark:bg-bg-secondary border border-gray-200 dark:border-border-primary focus:outline-none p-1 animate-scaleIn"
            style={{ top: position.top, left: position.left, opacity: position.opacity }}
            role="menu"
            aria-orientation="vertical"
        >
            <div role="none">{children}</div>
        </div>
    );
};

interface ContextMenuItemProps {
    children: ReactNode;
    onClick: () => void;
    className?: string;
    disabled?: boolean;
}

export const ContextMenuItem: React.FC<ContextMenuItemProps> = ({ children, onClick, className, disabled }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`w-full text-left text-gray-900 dark:text-text-primary group flex items-center px-3 py-2 text-sm rounded-md duration-150 ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-bg-active'} ${className}`}
        role="menuitem"
    >
        {children}
    </button>
);

interface ContextSubMenuTriggerProps {
    children: ReactNode;
    subMenu: ReactNode;
    className?: string;
}

export const ContextSubMenuTrigger: React.FC<ContextSubMenuTriggerProps> = ({ children, subMenu, className }) => {
    const [isOpen, setIsOpen] = useState(false);
    const itemRef = useRef<HTMLDivElement>(null);
    const subMenuRef = useRef<HTMLDivElement>(null);
    const closeTimer = useRef<number | null>(null);
    const [position, setPosition] = useState<{ top?: number; left?: number; opacity: number }>({ opacity: 0 });


    const handleMouseEnter = () => {
        if (closeTimer.current) {
            clearTimeout(closeTimer.current);
            closeTimer.current = null;
        }
        setIsOpen(true);
    };

    const handleMouseLeave = () => {
        closeTimer.current = window.setTimeout(() => {
            setIsOpen(false);
        }, 200);
    };
    
    useEffect(() => {
      if (isOpen && itemRef.current && subMenuRef.current) {
        const itemRect = itemRef.current.getBoundingClientRect();
        const subMenuRect = subMenuRef.current.getBoundingClientRect();
        const buffer = 8;

        let left = itemRect.right;
        if (left + subMenuRect.width > window.innerWidth) {
          left = itemRect.left - subMenuRect.width;
        }
        if (left < 0) left = buffer;

        let top = itemRect.top;
        if (top + subMenuRect.height > window.innerHeight) {
          top = window.innerHeight - subMenuRect.height - buffer;
        }
        if (top < 0) top = buffer;
        
        setPosition({ top, left, opacity: 1 });
      }
    }, [isOpen]);

    useEffect(() => {
        return () => {
            if (closeTimer.current) clearTimeout(closeTimer.current);
        };
    }, []);

    return (
        <div ref={itemRef} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="relative">
            <button
                className={`w-full text-left text-gray-900 dark:text-text-primary group flex items-center justify-between px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-bg-active duration-150 ${className}`}
                role="menuitem"
                aria-haspopup="true"
                aria-expanded={isOpen}
            >
                <div className="flex-grow">{children}</div>
                <ChevronRightIcon className="w-4 h-4 text-gray-400 dark:text-text-secondary" />
            </button>
            {isOpen && (
                 <div
                     ref={subMenuRef}
                     onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}
                     className="fixed z-[51] w-56 max-h-60 overflow-y-auto rounded-md shadow-lg bg-white dark:bg-bg-secondary border border-gray-200 dark:border-border-primary focus:outline-none p-1 animate-scaleIn"
                     style={{ top: position.top, left: position.left, opacity: position.opacity }}
                 >
                    <Suspense fallback={<div className="p-2 text-sm text-gray-500">Loading...</div>}>
                        {subMenu}
                    </Suspense>
                </div>
            )}
        </div>
    );
};