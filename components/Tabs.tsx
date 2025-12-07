import React from 'react';
import Tooltip from './Tooltip';

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
}

const Tabs: React.FC<TabsProps> = ({ options, value, onChange, className }) => {
  return (
    <div className={`bg-bg-tertiary border border-border-secondary rounded-full p-1 flex items-center gap-1 overflow-x-auto no-scrollbar ${className || ''}`}>
      {options.map(option => {
        const buttonContent = (
          <>
            {option.icon}
            <span className="whitespace-nowrap">{option.label}</span>
          </>
        );

        const buttonClasses = `px-3 py-1.5 text-sm rounded-full flex items-center justify-center space-x-2 flex-shrink-0 ${
              value === option.value
                ? 'bg-bg-secondary dark:bg-bg-active text-text-primary shadow-sm'
                : 'text-text-tertiary hover:bg-bg-hover hover:text-text-primary'
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
