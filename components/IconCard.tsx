import React, { useState, useEffect } from 'react';
import { IconStyle } from '../types';

interface IconCardProps {
  iconName: string;
  style: IconStyle;
  index: number;
  onClick: () => void;
}

const IconCard: React.FC<IconCardProps> = ({ iconName, style, index, onClick }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [iconName, style]);

  const snakeCaseName = iconName.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/_$/, '').replace(/^_/, '');
  
  const styleSuffix = style === 'outlined' ? 'regular' : style;

  const fileName = `ic_fluent_${snakeCaseName}_24_${styleSuffix}.svg`;

  const encodedIconDir = encodeURIComponent(iconName);

  const iconUrl = `https://cdn.jsdelivr.net/gh/microsoft/fluentui-system-icons@main/assets/${encodedIconDir}/SVG/${fileName}`;
  
  const handleError = () => {
    setHasError(true);
  };

  if (hasError) {
    return null;
  }

  return (
    <div
      onClick={onClick}
      className="bg-bg-tertiary rounded-xl p-4 flex flex-col items-center justify-center aspect-square
                 border border-border-primary hover:border-blue-500/60
                 group cursor-pointer opacity-0 animate-fade-in render-fast-square"
      style={{ animationDelay: `${(index % 72) * 5}ms` }}
      title={iconName}
    >
      <div className="flex-grow flex items-center justify-center">
         <img 
            src={iconUrl} 
            alt={iconName} 
            className={`w-12 h-12 ${style !== 'color' ? 'dark:filter dark:invert' : ''}`}
            onError={handleError}
            loading="lazy"
        />
      </div>
      <p className="text-xs text-center text-text-tertiary mt-2 truncate w-full group-hover:text-text-primary">
        {iconName}
      </p>
    </div>
  );
};

export default IconCard;