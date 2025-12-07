import React from 'react';

const SkeletonCard: React.FC<{className?: string}> = ({ className = ''}) => {
  return (
    <div className={`bg-bg-tertiary rounded-xl p-4 border border-border-primary ${className}`}>
      <div className="animate-pulse flex flex-col items-center justify-center h-full">
        <div className="w-16 h-16 bg-bg-inset rounded-lg mb-4"></div>
        <div className="h-2 w-20 bg-bg-inset rounded"></div>
      </div>
    </div>
  );
};

export default SkeletonCard;