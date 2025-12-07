import React, { useState, useEffect } from 'react';
import { IconStyle } from '../types';

interface IconCardProps {
  iconName: string;
  svgFileName?: string;
  style: IconStyle;
  index: number;
  onClick: () => void;
}

const IconCard: React.FC<IconCardProps> = ({ iconName, svgFileName, style, index, onClick }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [iconName, style, svgFileName]);

  // Use the provided svgFileName if available, otherwise construct it
  let fileName: string;
  if (svgFileName) {
    // Replace the style suffix in the filename to match the current style
    const styleSuffix = style === 'outlined' ? 'regular' : style;
    fileName = svgFileName.replace(/_24_(filled|regular|color)\.svg$/, `_24_${styleSuffix}.svg`);
  } else {
    const snakeCaseName = iconName.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/_$/, '').replace(/^_/, '');
    const styleSuffix = style === 'outlined' ? 'regular' : style;
    fileName = `ic_fluent_${snakeCaseName}_24_${styleSuffix}.svg`;
  }

  // Use local icon folders
  const folderName = style === 'outlined' ? 'icon_regular' : style === 'filled' ? 'icon_filled' : 'icon_color';
  const iconUrl = `/${folderName}/${fileName}`;
  
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