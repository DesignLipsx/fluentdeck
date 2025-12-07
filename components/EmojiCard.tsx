import React from 'react';
import { Emoji, EmojiStyle } from '../types';

interface EmojiCardProps {
  emoji: Emoji;
  index: number;
  style: EmojiStyle;
  onClick: () => void;
}

const EmojiCard: React.FC<EmojiCardProps> = ({ emoji, index, style, onClick }) => {
  const imageUrl = emoji.styles[style];

  if (!imageUrl) {
    return null;
  }
  
  const isHighContrast = style === 'Mono';

  return (
    <div
      onClick={onClick}
      className="bg-bg-tertiary rounded-xl p-4 flex flex-col items-center justify-center aspect-square
                 border border-border-primary hover:border-blue-500/60
                 group cursor-pointer opacity-0 animate-fade-in render-fast-square"
      style={{ animationDelay: `${(index % 192) * 10}ms` }}
      title={emoji.name}
    >
      <div className="flex-grow flex items-center justify-center">
         <img 
           key={imageUrl}
           src={imageUrl} 
           alt={emoji.name} 
           className={`w-16 h-16 object-contain ${isHighContrast ? 'dark:invert' : ''}`}
           loading="lazy"
         />
      </div>
      <p className="text-xs text-center text-text-tertiary mt-2 truncate w-full group-hover:text-text-primary">
        {emoji.name}
      </p>
    </div>
  );
};

export default EmojiCard;
