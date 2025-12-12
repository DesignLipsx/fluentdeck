import React, { useCallback, memo, forwardRef } from 'react';
import { IconStyleType, IconType, CollectionItem } from '../types';
import IconDisplay from './IconDisplay';
import { getIconUrl } from '../utils';
import BaseCard, { BaseCardHandle } from './BaseCard';

interface IconCardProps {
    icon: IconType;
    selectedStyle: IconStyleType;
    onCardClick: (icon: IconType) => void;
    onCardContextMenu: (event: React.MouseEvent, icon: IconType) => void;
    isSelectionMode: boolean;
    isSelected: boolean;
    isActive?: boolean;
    onToggleSelection: (item: Omit<CollectionItem, 'itemType'>, itemType: CollectionItem['itemType']) => void;
    isPriority?: boolean;
}

const IconCard = forwardRef<BaseCardHandle, IconCardProps>(({
    icon,
    selectedStyle,
    onCardClick,
    onCardContextMenu,
    isSelectionMode,
    isSelected,
    isActive = false,
    onToggleSelection,
    isPriority = false
}, ref) => {

    const handleCardClick = useCallback(() => {
        onCardClick(icon);
    }, [onCardClick, icon]);

    const handleToggleSelection = useCallback(() => {
        const item = { ...icon, style: selectedStyle } as unknown as Omit<CollectionItem, 'itemType'>;
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
            ref={ref}
            name={icon.name}
            isSelected={isSelected}
            isSelectionMode={isSelectionMode}
            isActive={isActive}
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
});

export default memo(IconCard);