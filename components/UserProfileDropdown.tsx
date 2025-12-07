import React, { useState, useEffect, useRef, ReactNode } from "react";
import { ThemeSwitch } from './ThemeSwitch';
import { GITHUB_REPO_URL } from '../constants';
import { useAuth } from '../hooks/useAuth';
import { SunIcon, MoonIcon, LaptopIcon, GithubIcon, AdminIcon, SignOutIcon, ProfileMenuIcon } from './Icons';

interface DropdownMenuProps {
  children?: ReactNode;
  trigger: ReactNode;
  onStateChange?: (isOpen: boolean) => void;
}

const DropdownMenu = ({ children, trigger, onStateChange }: DropdownMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onStateChange?.(isOpen);
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onStateChange]);

  const handleTriggerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const closeMenu = () => setIsOpen(false);

  // Pass closeMenu function to children
  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { closeMenu } as any);
    }
    return child;
  });

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div onClick={handleTriggerClick} className="cursor-pointer">
        {trigger}
      </div>
      {isOpen && (
        <div
          className="origin-top-right absolute right-0 mt-2 w-64 rounded-xl shadow-xl bg-bg-secondary ring-1 ring-black ring-opacity-5 dark:ring-white/10 focus:outline-none z-50 animate-in fade-in-0 zoom-in-95"
          role="menu"
          aria-orientation="vertical"
        >
          {childrenWithProps}
        </div>
      )}
    </div>
  );
};

const DropdownMenuSeparator = () => (
  <div className="my-1 h-px bg-border-primary" />
);

const MenuItem: React.FC<{
  label: string;
  rightContent?: ReactNode;
  onClick?: () => void;
  href?: string;
  className?: string;
  closeMenu?: () => void; // Added prop
}> = ({ label, rightContent, onClick, href, className, closeMenu }) => {
  const commonClasses = "flex items-center justify-between w-full px-2 py-1.5 text-sm rounded-md text-text-primary hover:bg-bg-hover cursor-pointer";
  
  const content = (
    <>
      <span className="font-medium">{label}</span>
      {rightContent}
    </>
  );

  const handleClick = (e: React.MouseEvent) => {
    if (!href || href === "#") e.preventDefault();
    onClick?.();
    closeMenu?.();
  };
  
  const props = {
    className: `${commonClasses} ${className || ''}`,
    onClick: handleClick,
  };
  
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
        {content}
      </a>
    );
  }

  return (
    <button {...props}>
      {content}
    </button>
  );
};


const MenuContainer: React.FC<{children: ReactNode, closeMenu?: () => void}> = ({ children, closeMenu }) => {
  // Pass closeMenu to MenuItem children
  // FIX: Provide explicit types for child props and elements to fix TypeScript errors when cloning and manipulating children.
  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement<{ className?: string, children?: ReactNode }>(child) && (child.type === MenuItem || child.type === DropdownMenuSeparator || child.props.className?.includes('p-1'))) {
       if (child.type === MenuItem) {
         return React.cloneElement(child as React.ReactElement<React.ComponentProps<typeof MenuItem>>, { closeMenu });
       }
       if (child.props.className?.includes('p-1')) { // For div wrappers
         const newChildren = React.Children.map(child.props.children, grandChild => {
            if (React.isValidElement(grandChild) && grandChild.type === MenuItem) {
              return React.cloneElement(grandChild as React.ReactElement<React.ComponentProps<typeof MenuItem>>, { closeMenu });
            }
            return grandChild;
         });
         return React.cloneElement(child, {}, newChildren);
       }
    }
    return child;
  });
  return <>{childrenWithProps}</>;
};


export default function UserProfileDropdown() {
  const { user, requestSignOut } = useAuth();
  const { pathname } = window.location;
  const onAdminPage = pathname.startsWith('/admin') || pathname.startsWith('/dashboard');
  
  const username = user?.email?.split('@')[0];

  return (
    <div className="flex items-center justify-center font-sans">
      <DropdownMenu
        trigger={
           <button className="group flex h-11 w-11 items-center justify-center rounded-full hover:bg-bg-hover">
            {user ? (
              <img
                src="https://avatars.githubusercontent.com/u/108184606?v=4"
                alt="User Avatar"
                className="h-9 w-9 rounded-full object-cover"
              />
            ) : (
              <ProfileMenuIcon className="h-7 w-7 text-text-secondary group-hover:text-text-primary" />
            )}
          </button>
        }
      >
        <MenuContainer>
          <div className="py-1">
            {user && (
              <>
                <div className="px-3 py-2">
                  <p className="text-sm font-bold text-text-primary truncate">{username}</p>
                  <p className="text-xs text-text-tertiary truncate">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
              </>
            )}

            <div className="p-1">
              {user && !onAdminPage && (
                <MenuItem
                  label="Admin Dashboard"
                  onClick={() => window.location.href = '/dashboard'}
                />
              )}
            </div>

            {(user && !onAdminPage) && <DropdownMenuSeparator />}
            
            <div className="p-1">
              <div className="flex items-center justify-between px-2 py-1 text-sm text-text-primary">
                <span className="font-medium">Theme</span>
                <div className="w-auto">
                  <ThemeSwitch
                      modes={["system", "light", "dark"]}
                      icons={[
                          <LaptopIcon key="laptop" className="w-4 h-4" />,
                          <SunIcon key="sun" className="w-4 h-4" />, 
                          <MoonIcon key="moon" className="w-4 h-4" />
                      ]}
                  />
                </div>
              </div>
            </div>
            
            <DropdownMenuSeparator />
            
            <div className="p-1">
              <MenuItem
                label="GitHub Repository"
                href={GITHUB_REPO_URL}
              />
            </div>

            {user && (
              <>
                <DropdownMenuSeparator />
                <div className="p-1">
                  <MenuItem
                    label="Log Out"
                    onClick={requestSignOut}
                    rightContent={<SignOutIcon className="w-4 h-4 text-text-tertiary" />}
                  />
                </div>
              </>
            )}
          </div>
        </MenuContainer>
      </DropdownMenu>
    </div>
  );
}