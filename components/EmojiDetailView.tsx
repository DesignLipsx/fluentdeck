import React, { useState, useContext, useMemo, useEffect } from 'react';
import { EmojiData, EmojiStyle, emojiStyles, EMOJI_ASSET_URL_BASE } from '../constants';
import { LinkIcon, SymbolIcon, UnicodeIcon, CopyIcon as CopyIconFeather, ChevronDownIcon, ShareIcon } from '../components/Icons';
import { CollectionsContext } from '../App';
import { useToast } from '../contexts/ToastContext';
import { Tabs } from './SegmentedControl';
import { getEmojiWebpUrl, getEmojiOriginalUrl, copyImageToClipboard } from '../utils';
import { CollectionMenu } from './CollectionMenu';
import { DetailViewPanel } from './DetailViewPanel';
import { ActionRow } from './ActionRow';
import { DropdownMenu, DropdownMenuItem } from './Dropdown';

interface EmojiDetailViewProps {
	emoji: EmojiData & { name: string };
	selectedStyle: keyof EmojiStyle;
	onClose: () => void;
	onStyleChange: (style: keyof EmojiStyle) => void;
	showCollectionControls?: boolean;
}

type ExportFormat = 'PNG' | 'WebP';
type CopiedField = 'url' | 'symbol' | 'unicode' | 'image' | 'download' | null;

export const EmojiDetailView: React.FC<EmojiDetailViewProps> = ({
	emoji,
	selectedStyle,
	onClose,
	onStyleChange,
	showCollectionControls = true
}) => {

	// ------------------------------
	// State
	// ------------------------------
	const [copiedField, setCopiedField] = useState<CopiedField>(null);
	const [exportFormat, setExportFormat] = useState<ExportFormat>('PNG');
	const [emojiIdMap, setEmojiIdMap] = useState<{ name: string; id: string }[]>([]);

	const { addToast } = useToast();
	const collectionsContext = useContext(CollectionsContext);
	if (!collectionsContext) throw new Error("CollectionsContext not found");

	// ------------------------------
	// Load ID mapping
	// ------------------------------
	useEffect(() => {
		fetch("/data/emoji_url.json")
			.then(res => res.json())
			.then(data => setEmojiIdMap(data))
			.catch(() => console.error("Failed to load emoji_url.json"));
	}, []);

	const getEmojiId = (name: string): string | null => {
		const entry = emojiIdMap.find(e => e.name === name);
		return entry?.id ?? null;
	};

	// ------------------------------
	// Core URLs
	// ------------------------------
	const imageUrl = getEmojiWebpUrl(emoji, selectedStyle) || '';
	const isSvgStyle = ['Color', 'Flat', 'High Contrast'].includes(selectedStyle);
	const exportFileType = isSvgStyle ? 'SVG' : 'PNG';
	const isMono = selectedStyle === 'High Contrast';

	const originalImageUrl = useMemo(() => {
		const relative = getEmojiOriginalUrl(emoji, selectedStyle);
		return relative ? `${EMOJI_ASSET_URL_BASE}${relative.substring(1)}` : '';
	}, [emoji, selectedStyle]);

	// ------------------------------
	// Copy functions
	// ------------------------------
	const markCopied = (field: CopiedField) => {
		setCopiedField(field);
		setTimeout(() => setCopiedField(null), 2000);
	};

	const handleCopy = (text: string, field: CopiedField) => {
		if (!text) return;
		navigator.clipboard.writeText(text);
		markCopied(field);
	};

	const handleCopyImage = async () => {
		try {
			const is3DOrAnimated = selectedStyle === '3D' || selectedStyle === 'Animated';
			const relative = is3DOrAnimated
				? getEmojiOriginalUrl(emoji, selectedStyle)
				: getEmojiWebpUrl(emoji, selectedStyle);

			if (!relative) return;

			const fullUrl = relative.startsWith('/')
				? `${EMOJI_ASSET_URL_BASE}${relative.substring(1)}`
				: relative;

			await copyImageToClipboard(fullUrl);

			markCopied('image');
		} catch {
			addToast('Failed to copy image.', 'error');
		}
	};

	const handleDownload = async () => {
		try {
			const response = await fetch(originalImageUrl);
			const blob = await response.blob();
			const url = URL.createObjectURL(blob);

			const a = document.createElement('a');
			a.href = url;

			const ext = originalImageUrl.split('.').pop() || 'png';
			a.download = `${emoji.name.replace(/\s+/g, '_')}_${selectedStyle}.${ext}`;

			a.click();
			URL.revokeObjectURL(url);
		} catch {
			addToast('Download failed.', 'error');
		}
	};

	// ------------------------------
	// SHARE BUTTON
	// ------------------------------
	const handleShareUrl = () => {
		const id = getEmojiId(emoji.name);

		if (!id) {
			addToast("No sharable ID found for this emoji.", "error");
			return;
		}

		const shareUrl = `${window.location.origin}/emoji/${id}?style=${encodeURIComponent(selectedStyle)}`;
		navigator.clipboard.writeText(shareUrl);

		markCopied("url");
		addToast("Emoji link copied!", "success");
	};

	// ------------------------------
	// Render
	// ------------------------------
	const styleOptions = emojiStyles.map(s => ({
		value: s.value,
		label: s.label,
		tooltip: s.tooltip
	}));

	return (
		<DetailViewPanel
			title={emoji.name}
			onClose={onClose}
			headerActions={
				<div className="flex items-center gap-2">
					<button
						onClick={handleShareUrl}
						className="p-1 rounded-full text-gray-500 dark:text-text-secondary hover:bg-gray-200 dark:hover:bg-bg-active transition"
						title="Copy share URL"
					>
						<ShareIcon className="w-5 h-5" />
					</button>

					{showCollectionControls && (
						<CollectionMenu
							item={emoji}
							selectedStyle={selectedStyle}
							itemType="emoji"
							onCloseDetail={onClose}
						/>
					)}
				</div>
			}
		>
			<div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
				{/* IMAGE PANEL */}
				<div className="w-full lg:w-[340px] flex-shrink-0 space-y-4">
					<div className="flex flex-col items-center justify-center p-4 rounded-xl text-gray-800 dark:text-text-primary bg-gray-50 dark:bg-bg-primary border border-gray-200 dark:border-border-primary h-64 lg:h-80 relative max-w-full">
						<div 
							className="absolute inset-0 opacity-5 dark:opacity-100" 
							style={{ backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)", backgroundSize: "10px 10px", opacity: 0.02 }}
						/>
						<div className="w-1/2 h-1/2 relative z-10 flex items-center justify-center">
							<img
								src={imageUrl}
								alt={emoji.name}
								className={`w-full h-full object-contain ${isMono ? "dark:filter dark:invert" : ""}`}
							/>
						</div>
					</div>

					<Tabs 
						options={styleOptions}
						value={selectedStyle}
						onChange={(v) => onStyleChange(v as keyof EmojiStyle)}
					/>
				</div>

				{/* ACTION PANEL */}
				<div className="flex-1 min-w-0 flex flex-col space-y-4">
					<div className="flex justify-between items-center">
						<h3 className="text-sm font-semibold text-gray-800 dark:text-text-primary uppercase tracking-wide">
							Export Options
						</h3>

						<div className="w-auto">
							<DropdownMenu
								trigger={(isOpen) => (
									<div className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-gray-100 dark:bg-bg-secondary border border-gray-200 dark:border-border-primary rounded-md cursor-pointer min-w-[150px] justify-between">
										{exportFormat}
										<ChevronDownIcon className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
									</div>
								)}
								menuClassName="min-w-[150px]"
							>
								<DropdownMenuItem onClick={() => setExportFormat("PNG")} isActive={exportFormat === "PNG"}>
									PNG (Original)
								</DropdownMenuItem>

								<DropdownMenuItem onClick={() => setExportFormat("WebP")} isActive={exportFormat === "WebP"}>
									WebP (Optimized)
								</DropdownMenuItem>
							</DropdownMenu>
						</div>
					</div>

					<div className="flex-1 flex flex-col justify-between space-y-3">
						<ActionRow
							title={`Copy Image / Download ${exportFileType}`}
							description={`Copy as ${exportFormat} or download as ${exportFileType}`}
							onCopy={handleCopyImage}
							onDownload={handleDownload}
							isCopied={copiedField === 'image'}
							icon={<CopyIconFeather className="w-5 h-5 text-gray-800 dark:text-text-primary" />}
						/>

						<ActionRow
							title="Copy URL"
							description={originalImageUrl}
							onCopy={() => handleCopy(originalImageUrl, 'url')}
							isCopied={copiedField === 'url'}
							icon={<LinkIcon className="w-5 h-5 text-gray-800 dark:text-text-primary" />}
						/>

						<ActionRow
							title="Copy Symbol"
							description={emoji.glyph}
							onCopy={() => handleCopy(emoji.glyph, 'symbol')}
							isCopied={copiedField === 'symbol'}
							icon={<SymbolIcon className="w-5 h-5 text-gray-800 dark:text-text-primary" />}
						/>

						<ActionRow
							title="Copy Unicode"
							description={emoji.unicode}
							onCopy={() => handleCopy(emoji.unicode, 'unicode')}
							isCopied={copiedField === 'unicode'}
							icon={<UnicodeIcon className="w-5 h-5 text-gray-800 dark:text-text-primary" />}
						/>
					</div>
				</div>
			</div>
		</DetailViewPanel>
	);
};