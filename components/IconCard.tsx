import React, { useCallback, memo } from 'react';
import { IconStyleType, IconType, CollectionItem } from '../types';
import IconDisplay from './IconDisplay';
import { getIconUrl } from '../utils';
import BaseCard from './BaseCard';

interface IconCardProps {
    icon: IconType;
    selectedStyle: IconStyleType;
    onCardClick: (icon: IconType) => void;
    onCardContextMenu: (event: React.MouseEvent, icon: IconType) => void;
    isSelectionMode: boolean;
    isSelected: boolean;
    onToggleSelection: (item: Omit<CollectionItem, 'itemType'>, itemType: CollectionItem['itemType']) => void;
    isPriority?: boolean;
}

const IconCard: React.FC<IconCardProps> = ({ 
    icon, 
    selectedStyle, 
    onCardClick, 
    onCardContextMenu, 
    isSelectionMode, 
    isSelected, 
    onToggleSelection, 
    isPriority = false 
}) => {
    
    const handleCardClick = useCallback(() => {
        onCardClick(icon);
    }, [onCardClick, icon]);

    const handleToggleSelection = useCallback(() => {
        const item = { ...icon, style: selectedStyle };
        onToggleSelection(item, 'icon');
    }, [onToggleSelection, icon, selectedStyle]);

    const handleContextMenu = useCallback((event: React.MouseEvent) => {
        if (!isSelectionMode) {
            onCardContextMenu(event, icon);
        }
    }, [onCardContextMenu, icon, isSelectionMode]);

    const handleCopy = useCallback(async () => {
        try {
            const url = getIconUrl(icon, selectedStyle);
            const response = await fetch(url);
            if (!response.ok) throw new Error('Network response was not ok');
            const svgText = await response.text();
            await navigator.clipboard.writeText(svgText);
        } catch (error) {
            console.error('Failed to copy SVG:', error);
        }
    }, [icon, selectedStyle]);

    return (
        <BaseCard
            name={icon.name}
            isSelected={isSelected}
            isSelectionMode={isSelectionMode}
            isPriority={isPriority}
            onCardClick={handleCardClick}
            onToggleSelection={handleToggleSelection}
            onContextMenu={handleContextMenu}
            onCopy={handleCopy}
        >
            <div className="w-16 h-16 flex items-center justify-center transform">
                <IconDisplay 
                    icon={icon} 
                    style={selectedStyle} 
                    className="w-12 h-12" 
                    urlResolver={getIconUrl} 
                    width={48} 
                    height={48}
                />
            </div>
        </BaseCard>
    );
};

export default memo(IconCard);