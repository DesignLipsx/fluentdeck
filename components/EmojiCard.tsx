import React, { useCallback, memo } from 'react';
import { EmojiData, EmojiStyle } from '../constants';
import { getEmojiWebpUrl, getEmojiOriginalUrl, copyImageToClipboard } from '../utils';
import BaseCard from './BaseCard';
import { EMOJI_ASSET_URL_BASE } from '../constants';

interface EmojiCardProps {
	emoji: EmojiData & { name: string };
	selectedStyle: keyof EmojiStyle;
	onCardClick: (emoji: EmojiData & { name: string }) => void;
	onCardContextMenu: (event: React.MouseEvent, emoji: EmojiData & { name: string }) => void;
	isSelectionMode: boolean;
	isSelected: boolean;
    isActive?: boolean;
	onToggleSelection: () => void;
	isPriority?: boolean;
}

const EmojiCard: React.FC<EmojiCardProps> = ({
	emoji,
	selectedStyle,
	onCardClick,
	onCardContextMenu,
	isSelectionMode,
	isSelected,
    isActive = false,
	onToggleSelection,
	isPriority = false
}) => {
	const imageUrl = getEmojiWebpUrl(emoji, selectedStyle);
	const isMono = selectedStyle === 'High Contrast';

	const handleCardClick = useCallback(() => {
		onCardClick(emoji);
	}, [onCardClick, emoji]);

	const handleToggleSelection = useCallback(() => {
		onToggleSelection();
	}, [onToggleSelection]);

	const handleContextMenu = useCallback((event: React.MouseEvent) => {
		onCardContextMenu(event, emoji);
	}, [onCardContextMenu, emoji]);

	const handleCopy = useCallback(async () => {
		try {
			let urlToFetch: string | undefined;
			const is3DOrAnimated = selectedStyle === '3D' || selectedStyle === 'Animated';

			if (is3DOrAnimated) {
				urlToFetch = getEmojiOriginalUrl(emoji, selectedStyle);
			} else {
				urlToFetch = getEmojiWebpUrl(emoji, selectedStyle);
			}

			if (!urlToFetch) {
				console.error("No URL found for emoji copy");
				return;
			}

			const fullUrl = urlToFetch.startsWith('/')
				? `${EMOJI_ASSET_URL_BASE}${urlToFetch.substring(1)}`
				: urlToFetch;

			await copyImageToClipboard(fullUrl);

		} catch (error) {
			console.error('Failed to copy image:', error);
		}
	}, [emoji, selectedStyle]);

	return (
		<BaseCard
			name={emoji.name}
			isSelected={isSelected}
			isSelectionMode={isSelectionMode}
            isActive={isActive}
			isPriority={isPriority}
			onCardClick={handleCardClick}
			onToggleSelection={handleToggleSelection}
			onContextMenu={handleContextMenu}
			onCopy={handleCopy}
		>
			{imageUrl && (
				<div className="w-16 h-16 flex items-center justify-center transform text-gray-900 dark:text-text-primary">
					<img
						src={imageUrl}
						alt={emoji.name}
						decoding="async"
						loading={isPriority ? "eager" : "lazy"}
						fetchPriority={isPriority ? "high" : "low"}
						className={`w-full h-full object-contain ${isMono ? 'dark:filter dark:invert' : ''}`}
						width="96"
						height="96"
					/>
				</div>
			)}
		</BaseCard>
	);
};

export default memo(EmojiCard);