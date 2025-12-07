import React, { FC } from 'react';
import { Emoji, EmojiStyle } from '../types';

interface EmojiCardProps {
  emoji: Emoji;
  index: number;
  style: EmojiStyle;
  onClick: () => void;
}

const EmojiCard: FC<EmojiCardProps> = ({ emoji, index, style, onClick }) => {
  const imageUrl = emoji.styles[style];

  // If the specific style is not available for this emoji, render nothing.
  if (!imageUrl) {
    return null;
  }
    
  // 'Mono' style requires inverting the color in dark mode for visibility.
  const isHighContrast = style === 'Mono';

  // Calculate animation delay for staggered entrance effect
  // (index % 192) * 10ms creates a smooth, repeating, staggered animation.
  const animationDelay = `${(index % 192) * 10}ms`;

  return (
    <div
      onClick={onClick}
      className={`
        bg-bg-tertiary rounded-xl p-4 flex flex-col items-center justify-center aspect-square
        border border-border-primary hover:border-blue-500/60
        group cursor-pointer transition duration-150 transform hover:scale-[1.02]
        opacity-0 animate-fade-in render-fast-square
      `}
      style={{ animationDelay }}
      title={emoji.name}
    >
      <div className="flex-grow flex items-center justify-center">
        <img 
          key={imageUrl} // Forces image reload when style/URL changes
          src={imageUrl} 
          alt={emoji.name} 
          className={`w-16 h-16 object-contain ${isHighContrast ? 'dark:invert' : ''}`}
          loading="lazy"
        />
      </div>
      <p className="text-xs text-center text-text-tertiary mt-2 truncate w-full group-hover:text-text-primary transition-colors">
        {emoji.name}
      </p>
    </div>
  );
};

export default EmojiCard;
