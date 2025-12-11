import React, { useState, useContext, useMemo } from 'react';
import { EmojiData, EmojiStyle, emojiStyles } from '../constants';
import { LinkIcon, SymbolIcon, UnicodeIcon, CopyIcon as CopyIconFeather, ChevronDownIcon } from '../components/Icons';
import { CollectionsContext } from '../App';
import { useToast } from '../contexts/ToastContext';
import { Tabs } from './SegmentedControl';
import { getEmojiWebpUrl, getEmojiOriginalUrl, copyImageToClipboard } from '../utils';
import { CollectionMenu } from './CollectionMenu';
import { DetailViewPanel } from './DetailViewPanel';
import { ActionRow } from './ActionRow';
import { EMOJI_ASSET_URL_BASE } from '../constants';
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

export const EmojiDetailView: React.FC<EmojiDetailViewProps> = ({ emoji, selectedStyle, onClose, onStyleChange, showCollectionControls = true }) => {
	const [copiedField, setCopiedField] = useState<CopiedField>(null);
	const [exportFormat, setExportFormat] = useState<ExportFormat>('PNG');

	const { addToast } = useToast();
	const collectionsContext = useContext(CollectionsContext);
	if (!collectionsContext) throw new Error("CollectionsContext not found");

	const imageUrl = getEmojiWebpUrl(emoji, selectedStyle) || '';

	const isSvgStyle = selectedStyle === 'Color' || selectedStyle === 'Flat' || selectedStyle === 'High Contrast';
	const exportFileType = isSvgStyle ? 'SVG' : 'PNG';

	const isMono = selectedStyle === 'High Contrast';

	const styleOptions = emojiStyles.map(s => ({ value: s.value, label: s.label, tooltip: s.tooltip }));

	const originalImageUrl = useMemo(() => {
		const relativeUrl = getEmojiOriginalUrl(emoji, selectedStyle);
		return relativeUrl ? `${EMOJI_ASSET_URL_BASE}${relativeUrl.substring(1)}` : '';
	}, [emoji, selectedStyle]);

	const handleCopy = (text: string, field: CopiedField) => {
		if (!text) return;
		navigator.clipboard.writeText(text);
		setCopiedField(field);
		setTimeout(() => setCopiedField(null), 2000);
	};

	const handleDownload = async () => {
		try {
			const response = await fetch(originalImageUrl);
			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.style.display = 'none';
			a.href = url;

			const parts = originalImageUrl.split('.');
			const fileExtension = parts.length > 1 ? parts.pop() : 'png';

			a.download = `${emoji.name.replace(/\s+/g, '_')}_${selectedStyle}.${fileExtension}`;
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);
		} catch (error) {
			console.error('Error downloading image:', error);
			addToast('Download failed.', 'error');
		}
	};

	const handleCopyImage = async () => {
		try {
			let urlToFetch: string | undefined;
			const is3DOrAnimated = selectedStyle === '3D' || selectedStyle === 'Animated';

			if (is3DOrAnimated) {
				urlToFetch = getEmojiOriginalUrl(emoji, selectedStyle);
			} else {
				urlToFetch = getEmojiWebpUrl(emoji, selectedStyle);
			}

			if (!urlToFetch) return;

			const fullUrl = urlToFetch.startsWith('/') ? `${EMOJI_ASSET_URL_BASE}${urlToFetch.substring(1)}` : urlToFetch;

			// This utility will fetch, convert to PNG if needed, and write to clipboard
			await copyImageToClipboard(fullUrl);

			setCopiedField('image');
			setTimeout(() => setCopiedField(null), 2000);

		} catch (error) {
			addToast('Failed to copy image.', 'error');
		}
	};

	return (
		<DetailViewPanel
			title={emoji.name}
			onClose={onClose}
			headerActions={
				showCollectionControls && (
					<CollectionMenu item={emoji} selectedStyle={selectedStyle} itemType="emoji" onCloseDetail={onClose} />
				)
			}
		>
			<div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
				<div className="w-full lg:w-[340px] flex-shrink-0 space-y-4">
					<div className="flex flex-col items-center justify-center p-4 rounded-xl text-gray-800 dark:text-text-primary bg-gray-50 dark:bg-bg-primary border border-gray-200 dark:border-border-primary h-64 lg:h-80 xl:h-80 relative flex-shrink-0 max-w-full">
						<div className="absolute inset-0 opacity-5 dark:opacity-100" style={{ backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)", backgroundSize: "10px 10px", opacity: 0.02 }}></div>
						<div className="w-1/2 h-1/2 relative z-10 flex items-center justify-center">
							{isMono ? (
								<img src={imageUrl} alt={emoji.name} className="w-full h-full object-contain dark:filter dark:invert" />
							) : (
								<img src={imageUrl} alt={emoji.name} className="w-full h-full object-contain" />
							)}
						</div>
					</div>
					<Tabs options={styleOptions} value={selectedStyle} onChange={(v) => onStyleChange(v as keyof EmojiStyle)} />
				</div>

				<div className="flex-1 min-w-0 flex flex-col space-y-4">
					<div className="flex justify-between items-center">
						<h3 className="text-sm font-semibold text-gray-800 dark:text-text-primary uppercase tracking-wide">
							Export Options
						</h3>

						<div className="flex items-center">
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
					</div>
					<div className="flex-1 flex flex-col justify-between space-y-3">
						<ActionRow title={`Copy Image / Download ${exportFileType}`} description={`Copy as ${exportFormat} or download as ${exportFileType}`} onCopy={handleCopyImage} onDownload={handleDownload} isCopied={copiedField === 'image'} icon={<CopyIconFeather className="w-5 h-5 text-gray-800 dark:text-text-primary" />} />
						<ActionRow title="Copy URL" description={originalImageUrl} onCopy={() => handleCopy(originalImageUrl, 'url')} isCopied={copiedField === 'url'} icon={<LinkIcon className="w-5 h-5 text-gray-800 dark:text-text-primary" />} />
						<ActionRow title="Copy Symbol" description={emoji.glyph} onCopy={() => handleCopy(emoji.glyph, 'symbol')} isCopied={copiedField === 'symbol'} icon={<SymbolIcon className="w-5 h-5 text-gray-800 dark:text-text-primary" />} />
						<ActionRow title="Copy Unicode" description={emoji.unicode} onCopy={() => handleCopy(emoji.unicode, 'unicode')} isCopied={copiedField === 'unicode'} icon={<UnicodeIcon className="w-5 h-5 text-gray-800 dark:text-text-primary" />} />
					</div>
				</div>
			</div>
		</DetailViewPanel>
	);
};