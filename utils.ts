import { EmojiData, EmojiStyle, DECK_ASSETS_BASE_URL, EMOJI_ASSET_URL_BASE } from './constants';
import { IconType, IconStyleType, CollectionItem, CollectionEmoji, CollectionIcon, CollectionApp } from './types';
import { getCachedData, setCachedData } from './db';

// --- Caching Utility ---
export const fetchWithCache = async (cacheKey: string, url: string, responseType: 'json' | 'text' = 'json'): Promise<any> => {
	// 1. Try to get data from IndexedDB
	const cachedData = await getCachedData(cacheKey);
	if (cachedData) {
		return cachedData;
	}

	// 2. If not in cache, fetch from network
	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`Network response was not ok for ${url}`);
		}
		const data = responseType === 'json' ? await response.json() : await response.text();

		// 3. Store the new data in IndexedDB
		await setCachedData(cacheKey, data);

		// 4. Clean up old localStorage cache if it exists
		if (localStorage.getItem(cacheKey)) {
			localStorage.removeItem(cacheKey);
		}

		return data;
	} catch (error) {
		console.error(`Failed to fetch or cache data for key "${cacheKey}":`, error);
		return null;
	}
};

// =============================
//      EMOJI URL HANDLER
// =============================

const webpFolderMap: Record<string, string> = {
	'3D': '3D',
	'Animated': 'animated',
	'Color': 'color',
	'Flat': 'flat',
	'High Contrast': 'high_contrast',
};

export const getEmojiWebpUrl = (emoji: EmojiData, style: keyof EmojiStyle): string | undefined => {
	const relativePath = emoji.styles?.[style];
	if (!relativePath) return undefined;

	const filenamePart = relativePath.split('/').pop();
	if (!filenamePart) return undefined;

	const filenameWithoutExt = filenamePart.replace(/\.[^/.]+$/, '');
	const folder = webpFolderMap[style] || 'color';
	return `/emoji/webp/${folder}/${filenameWithoutExt}.webp`;
};

const originalFolderMap: Record<string, string> = {
	'3D': 'png/3D',
	'Animated': 'png/animated',
	'Color': 'svg/color',
	'Flat': 'svg/flat',
	'High Contrast': 'svg/high_contrast',
};

export const getEmojiOriginalUrl = (emoji: EmojiData, style: keyof EmojiStyle): string | undefined => {
	const relativePath = emoji.styles?.[style];
	if (!relativePath) return undefined;

	const filenamePart = relativePath.split('/').pop();
	if (!filenamePart) return undefined;
	const filenameWithoutExt = filenamePart.replace(/\.[^/.]+$/, '');
	const folder = originalFolderMap[style] || 'svg/color';
	const extension = (style === '3D' || style === 'Animated') ? 'png' : 'svg';
	return `/emoji/${folder}/${filenameWithoutExt}.${extension}`; // Keep this relative
};

// =============================
//       ICON URL HANDLER
// =============================
export const getIconUrl = (icon: IconType, style: IconStyleType): string => {
	const baseUrl = DECK_ASSETS_BASE_URL;

	// Pull base name from JSON
	let baseName = icon.styles?.[style];

	// Fallback if that style doesn't exist
	if (!baseName) {
		const values = Object.values(icon.styles || {});
		baseName = values.length ? values[0] : null;
	}

	if (!baseName) return "";

	const filename = `${baseName}.svg`;

	const folderMap: Record<string, string> = {
		Filled: "icons/icon_filled/",
		Regular: "icons/icon_regular/",
		Color: "icons/icon_color/",
	};

	const folder = folderMap[style] || "icons/icon_regular/";

	return baseUrl + folder + filename;
};

// =============================
//      COLLECTION HELPERS
// =============================
const colors = [
	'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-300',
	'bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-300',
	'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-300',
	'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-600 dark:text-yellow-300',
	'bg-lime-100 dark:bg-lime-900/50 text-lime-600 dark:text-lime-300',
	'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-300',
	'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-300',
	'bg-teal-100 dark:bg-teal-900/50 text-teal-600 dark:text-teal-300',
	'bg-cyan-100 dark:bg-cyan-900/50 text-cyan-600 dark:text-cyan-300',
	'bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-300',
	'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300',
	'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300',
	'bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-300',
	'bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300',
	'bg-fuchsia-100 dark:bg-fuchsia-900/50 text-fuchsia-600 dark:text-fuchsia-300',
	'bg-pink-100 dark:bg-pink-900/50 text-pink-600 dark:text-pink-300',
	'bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-300',
];

export const getColorForString = (str: string) => {
	if (!str) return colors[0];
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		hash = str.charCodeAt(i) + ((hash << 5) - hash);
	}
	return colors[Math.abs(hash % colors.length)];
};

export const getItemId = (item: Omit<CollectionItem, 'itemType'>, itemType: CollectionItem['itemType']): string => {
	if (itemType === 'emoji') return `emoji-${item.name}-${(item as CollectionEmoji).style}`;
	if (itemType === 'icon') {
		const style = (item as CollectionIcon).style;
		const base = (item as CollectionIcon).styles?.[style] || item.name;
		return `icon-${base}-${style}`;
	}
	if (itemType === 'app') return `app-${(item as CollectionApp).name}`;
	return `unknown-${(item as any).name}`;
};

export const slugify = (text: string): string => {
	return text.trim().toLowerCase().replace(/\s+/g, '-');
};
export const sanitizeSvg = (svg: string): string => {
	let s = svg.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');
	s = s.replace(/on\w+\s*=\s*(['"]).*?\1/gi, '');
	s = s.replace(/\b(xlink:href|href)\s*=\s*(['"])(javascript:|data:text\/html).*?\2/gi, '');
	s = s.replace(/<foreignObject[\s\S]*?>[\s\S]*?<\/foreignObject>/gi, '');
	s = s.replace(/<(iframe|object|embed|link|meta|base|style)[\s\S]*?>[\s\S]*?<\/\1>/gi, '');
	s = s.replace(/<(iframe|object|embed|link|meta|base|style)[^>]*\/>?/gi, '');
	return s;
};

export const runInChunks = async <T, R>(
	items: T[],
	concurrency: number,
	task: (item: T) => Promise<R>
): Promise<R[]> => {
	const results: R[] = [];
	const chunks = [];

	for (let i = 0; i < items.length; i += concurrency) {
		chunks.push(items.slice(i, i + concurrency));
	}

	for (const chunk of chunks) {
		const chunkResults = await Promise.all(chunk.map(task));
		results.push(...chunkResults);
	}

	return results;
};

// =============================
//      CLIPBOARD HELPERS
// =============================

/**
 * Internal Helper: Draws any image blob (WebP, SVG, etc.) to a Canvas 
 * and exports it as a clean PNG blob.
 */
const convertToPng = (blob: Blob): Promise<Blob> => {
	return new Promise((resolve, reject) => {
		const img = new Image();
		const url = URL.createObjectURL(blob);

		img.onload = () => {
			const canvas = document.createElement('canvas');
			canvas.width = img.width;
			canvas.height = img.height;

			const ctx = canvas.getContext('2d');
			if (!ctx) {
				URL.revokeObjectURL(url);
				reject(new Error('Canvas context failed'));
				return;
			}

			// Clear canvas to ensure transparency
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.drawImage(img, 0, 0);

			canvas.toBlob((pngBlob) => {
				URL.revokeObjectURL(url);
				if (pngBlob) {
					resolve(pngBlob);
				} else {
					reject(new Error('Failed to convert to PNG blob'));
				}
			}, 'image/png');
		};

		img.onerror = () => {
			URL.revokeObjectURL(url);
			reject(new Error('Failed to load image for conversion'));
		};

		img.src = url;
	});
};

/**
 * Fetches an image from a URL, ensures it is a PNG (converting via Canvas if needed),
 * and writes it to the clipboard.
 */
export const copyImageToClipboard = async (url: string): Promise<void> => {
	try {
		const response = await fetch(url);
		if (!response.ok) throw new Error(`Network response was not ok: ${response.statusText}`);

		const fetchedBlob = await response.blob();
		let clipboardBlob = fetchedBlob;

		// If not PNG, convert it (e.g. WebP to PNG) to ensure OS clipboard compatibility
		if (fetchedBlob.type !== 'image/png') {
			clipboardBlob = await convertToPng(fetchedBlob);
		}

		// Write to clipboard as 'image/png'
		const item = new ClipboardItem({
			'image/png': clipboardBlob
		});

		await navigator.clipboard.write([item]);
	} catch (error) {
		console.error('Failed to copy image to clipboard:', error);
		throw error;
	}
};