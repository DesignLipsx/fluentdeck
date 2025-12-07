import React, { useState, useRef, useEffect, ReactNode, FC } from 'react';
import Tooltip from './Tooltip';

// --- Interface Definitions ---

interface TabOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  tooltip?: string;
}

interface TabsProps {
  options: TabOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  tabButtonClassName?: string;
  // NEW: Add props for customizing active/inactive states
  activeTabClassName?: string;
  inactiveTabClassName?: string;
}

// --- Tabs Component ---

const Tabs: React.FC<TabsProps> = ({ 
  options, 
  value, 
  onChange, 
  className, 
  tabButtonClassName,
  // NEW: Default values for active/inactive states
  activeTabClassName = 'bg-bg-secondary dark:bg-bg-active text-text-primary shadow-sm',
  inactiveTabClassName = 'text-text-tertiary hover:bg-bg-hover hover:text-text-primary'
}) => {
  return (
    <div className={`bg-bg-tertiary border border-border-secondary rounded-full p-1 flex items-center gap-1 overflow-x-auto no-scrollbar ${className || ''}`}>
      {options.map(option => {
        // Condition to decide whether to show icon, label, or both
        const buttonContent = (
          <div className='flex items-center justify-center space-x-2'>
            {option.icon}
            {option.label && <span className="whitespace-nowrap">{option.label}</span>}
          </div>
        );

        // UPDATED: Use the new props for active/inactive styling
        const buttonClasses = `grow px-3 py-1.5 h-8 text-sm rounded-full flex items-center justify-center ${tabButtonClassName || ''} ${
              value === option.value
                ? activeTabClassName
                : inactiveTabClassName
            }`;

        if (option.tooltip) {
          return (
            <Tooltip key={option.value} content={<p className="whitespace-nowrap">{option.tooltip}</p>}>
              <button
                onClick={() => onChange(option.value)}
                className={buttonClasses}
              >
                {buttonContent}
              </button>
            </Tooltip>
          );
        } else {
          return (
            <button
              key={option.value}
              onClick={() => onChange(option.value)}
              className={buttonClasses}
            >
              {buttonContent}
            </button>
          );
        }
      })}
    </div>
  );
};

export default Tabs;

// --- Dropdown Component ---
interface DropdownProps extends TabsProps {
  label: string;
}

const ChevronDownIcon: FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5" {...props}>
      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
    </svg>
);

export const Dropdown: React.FC<DropdownProps> = ({ label, options, value, onChange, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const selectedOption = options.find(opt => opt.value === value) || options[0];

  const handleSelect = (newValue: string) => {
    onChange(newValue);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <div className={`relative ${className || ''}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-full py-2 text-sm font-medium text-text-primary bg-bg-tertiary border border-border-secondary rounded-lg shadow-sm hover:bg-bg-hover focus:outline-none focus:ring-2 focus:ring-blue-500/10 flex items-center pl-4 pr-3"
        aria-expanded={isOpen}
      >
        <span className="text-text-tertiary font-normal mr-2 whitespace-nowrap">{label}:</span>
        
        {/* Selected option content */}
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          {selectedOption.icon && (
            <span className="text-sm flex-shrink-0">
              {selectedOption.icon}
            </span>
          )}
          <span className="truncate">{selectedOption.label}</span>
        </div>
        
        {/* Chevron - this will be on the right side */}
        <ChevronDownIcon 
          className={`h-4 w-4 text-current transition-transform duration-200 flex-shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full rounded-lg bg-bg-primary border border-border-secondary shadow-lg">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={`w-full text-left px-4 py-2 text-sm flex items-center space-x-2 hover:bg-bg-hover ${
                value === option.value
                  ? 'bg-bg-secondary text-text-primary font-semibold'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {option.icon && (
                <span className="flex-shrink-0 text-sm">{option.icon}</span>
              )}
              <span className="truncate">{option.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};