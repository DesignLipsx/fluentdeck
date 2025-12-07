import { useState, useEffect } from 'react';
import { Emoji } from '../types';

/**
 * Converts the original GitHub PNG URL into the local WebP path for previewing.
 * Example: '.../assets/Grinning face/animated/grinning_face_animated.png'
 * -> '/animated_emoji/grinning_face_animated.webp'
 */
const getWebpPathFromPngUrl = (pngUrl: string): string => {
  if (!pngUrl) return '';
  // Find the last path segment (e.g., 'grinning_face_animated.png')
  const lastSegment = pngUrl.substring(pngUrl.lastIndexOf('/') + 1);
  // Replace .png with .webp
  const filenameWithWebp = lastSegment.replace(/\.png$/, '.webp');
  // Prepend the local directory path where you uploaded the WebP files
  return `/animated_emoji/${filenameWithWebp}`;
};


interface FluentEmojiStyleData {
  '3D'?: string;
  Color?: string;
  Flat?: string;
  'High contrast'?: string;
  HighContrast?: string;
  Animated?: string;
}

interface FluentEmojiMetadataEntry {
  group: string;
  keywords: string[];
  sortOrder: number;
  styles?: FluentEmojiStyleData;
  isSkintoneBased?: boolean;
  skintones?: {
    Default: FluentEmojiStyleData;
    [key: string]: FluentEmojiStyleData;
  };
  unicode?: string;
}

type FluentEmojiMetadata = Record<string, FluentEmojiMetadataEntry>;

// Placeholder for groupMap (assuming it's loaded/defined elsewhere in your setup)
// In a real application, this would map group names to categories.
const groupMap: Record<string, string> = {
  'smileys & emotion': 'Smileys & Emotion',
  'people & body': 'People & Body',
  'animals & nature': 'Animals & Nature',
  'food & drink': 'Food & Drink',
  activities: 'Activities',
  'travel & places': 'Travel & Places',
  objects: 'Objects',
  symbols: 'Symbols',
  flags: 'Flags',
};

export const useFluentEmojis = () => {
  const [emojis, setEmojis] = useState<Emoji[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEmojis = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch the JSON file (assuming this path works in your environment)
        const emojiRes = await fetch(new URL('./emoji.json', import.meta.url).href);

        if (!emojiRes.ok) {
          throw new Error(`HTTP error! status: ${emojiRes.status}`);
        }

        const rawEmojiData: FluentEmojiMetadata = await emojiRes.json();
        
        const fluentEmojisMetadata = rawEmojiData;

        const emojisFromMetadata = Object.entries(fluentEmojisMetadata)
          .flatMap(([name, data]) => {
            // Determine the style source, handling skintone-based emojis (using Default)
            const styleSource = data.isSkintoneBased ? data.skintones?.Default : data.styles;
            
            // We only process entries that have at least some style data
            if (!styleSource) return null;

            const unicode = data.unicode;
            const symbol = unicode
              ? String.fromCodePoint(...unicode.split(' ').map((u) => parseInt(u, 16)))
              : undefined;

            // Check specifically for the Animated style
            const animPngUrl = styleSource.Animated;
            
            // If there's no animated asset, we skip it or proceed without Anim styles
            if (!animPngUrl) {
                return null;
            }

            // 1. Store the original PNG URL for the download button (new property)
            const animDownloadUrl = animPngUrl;
            
            // 2. Calculate the local WebP path for the preview (used in styles.Anim)
            const animWebpPath = getWebpPathFromPngUrl(animPngUrl);

            return {
              name,
              keywords: data.keywords || [],
              category: groupMap[data.group.toLowerCase()],
              sortOrder: data.sortOrder,
              styles: {
                '3D': styleSource['3D'],
                Modern: styleSource.Color,
                Flat: styleSource.Flat,
                Mono: styleSource.HighContrast || styleSource['High contrast'],
                // Use the local WebP path for previewing the animated emoji
                Anim: animWebpPath,
              },
              unicode,
              symbol,
              // Add the original PNG URL for the actual download
              animDownloadUrl: animDownloadUrl,
            };
          })
          .filter((emoji): emoji is Emoji & { sortOrder: number, animDownloadUrl: string } => emoji !== null);

        emojisFromMetadata.sort((a, b) => a.sortOrder - b.sortOrder);

        // Map back to the public Emoji interface, omitting temporary properties
        const finalEmojis: Emoji[] = emojisFromMetadata.map(({ sortOrder, animDownloadUrl, ...rest }) => ({
            ...rest,
            animDownloadUrl, // Include the new download URL property in the final Emoji type
        }));

        setEmojis(finalEmojis);
      } catch (e: unknown) {
        if (e instanceof Error) {
          setError(`Failed to load or process emoji list: ${e.message}`);
        } else {
          setError('An unknown error occurred.');
        }
      } finally {
        setLoading(false);
      }
    };
    
    loadEmojis();
  }, []);

  return { emojis, loading, error };
};
