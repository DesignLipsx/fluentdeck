import React, { useState, useMemo } from 'react';
import { App } from '../types';

interface AppCardProps {
  app: App;
  index: number;
  onContextMenu?: (event: React.MouseEvent) => void;
  onClick?: () => void;
}

const AppCard: React.FC<AppCardProps> = ({ app, index, onContextMenu, onClick }) => {
  const [logoError, setLogoError] = useState(false);

  const getInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const bgColor = useMemo(() => {
    /**
     * Generates a consistent HSL color based on a string's hash.
     * This ensures the background color for the initial display is stable for a given app name.
     */
    const generateColor = (str: string) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        // A simple string hashing algorithm to produce a unique number.
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      const h = hash % 360; // Ensure hue is within 0-359 range for HSL.
      return `hsl(${h}, 40%, 35%)`;
    };
    return generateColor(app.name);
  }, [app.name]);

  const processedLogoUrl = useMemo(() => {
    if (!app.logo_url) return undefined;
    if (app.logo_url.endsWith('.ico')) {
      // Use an image proxy to convert .ico to a browser-friendly format like PNG.
      return `https://images.weserv.nl/?url=${encodeURIComponent(app.logo_url)}&w=64&h=64&fit=contain&output=png`;
    }
    return app.logo_url;
  }, [app.logo_url]);

  const showLogo = processedLogoUrl && !logoError;

  const renderPricingTag = () => {
    let colorClass = 'bg-gray-200 dark:bg-gray-700/60 text-gray-600 dark:text-gray-300'; // Default for Free/Unknown pricing
    if (app.pricing === 'FOSS') colorClass = 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300';
    if (app.pricing === 'Paid') colorClass = 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-300';

    return (
      <span className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${colorClass}`}>
        {app.pricing}
      </span>
    );
  };

  return (
    <div
      onClick={onClick}
      onContextMenu={onContextMenu}
      className={`bg-bg-secondary rounded-xl flex flex-col group border border-border-primary
                 hover:border-blue-500/60 hover:bg-bg-hover opacity-0 animate-fade-in render-fast-card ${onClick ? 'cursor-pointer' : ''}`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Invisible link overlay covering the entire card to make it clickable */}
      <a
        href={app.link}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute inset-0 z-10"
        onClick={(e) => e.stopPropagation()}
      ></a>
      <div className="h-32 flex items-center justify-center overflow-hidden rounded-t-xl bg-bg-tertiary">
        {showLogo ? (
          <img
            src={processedLogoUrl}
            alt={`${app.name} logo`}
            className="w-16 h-16 rounded-lg object-contain"
            onError={() => setLogoError(true)}
            referrerPolicy="no-referrer"
          />
        ) : (
          <div
            className="w-16 h-16 rounded-lg flex items-center justify-center text-white text-2xl font-bold"
            style={{ backgroundColor: bgColor }}
          >
            {getInitial(app.name)}
          </div>
        )}
      </div>
      <div className="p-4 flex-grow">
        <div className="font-semibold text-base">{app.name}</div>
        <div className="flex items-center justify-between text-sm text-text-tertiary mt-1">
          <span className="text-xs font-mono">{app.tags.slice(0, 3).join(', ')}</span>
          {renderPricingTag()}
        </div>
      </div>
    </div>
  );
};

export default AppCard;