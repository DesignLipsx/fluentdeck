import { useState, useEffect } from 'react';
import { Emoji } from '../types';

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

/**
 * Extracts the filename from the original GitHub Animated URL and constructs the local WebP path.
 * * E.g., 
 * Input: "https://media.githubusercontent.com/.../Grinning face/animated/grinning_face_animated.png"
 * Output: "/animated_emoji/grinning_face_animated.webp"
 * * Input: "https://media.githubusercontent.com/.../Person/animated/person_animated_default.png"
 * Output: "/animated_emoji/person_animated_default.webp" (if your local file is 'person_animated_default.webp')
 * * If your local files drop the '_default' suffix, we need a slight modification.
 * Assuming your local file is ALWAYS simplified to the non-default version (e.g., 'person_animated.webp' for 'person_animated_default.png'):
 */
const extractWebpPathFromUrl = (originalUrl: string): string => {
    try {
        const url = new URL(originalUrl);
        // Get the last part of the path, which is the filename (e.g., 'person_animated_default.png')
        let filename = url.pathname.split('/').pop() || '';

        // 1. Remove the file extension (.png)
        filename = filename.replace(/\.(png|webp|svg)$/i, '');
        

        // 3. Re-append the new suffix and extension
        // Since the original file is usually already in snake_case, we just append .webp
        return `/animated_emoji/${filename}.webp`;

    } catch (e) {
        // Fallback or error handling
        return '';
    }
};

export const useFluentEmojis = () => {
  const [emojis, setEmojis] = useState<Emoji[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // ✅ Use the fetch pattern inside an async function, which works in your environment
    const loadEmojis = async () => {
      try {
        setLoading(true);
        setError(null);

        // ✅ Fetch the JSON file using the working relative path pattern
        const emojiRes = await fetch(new URL('./emoji.json', import.meta.url).href);

        if (!emojiRes.ok) {
          throw new Error(`HTTP error! status: ${emojiRes.status}`);
        }

        const rawEmojiData = await emojiRes.json();
        
        // ✅ Load local emoji metadata and assert the type
        const fluentEmojisMetadata: FluentEmojiMetadata = rawEmojiData as FluentEmojiMetadata;

        const groupMap: Record<string, string> = {
          'smileys & emotion': 'Smileys & Emotion',
          'people & body': 'People & Body',
          'animals & nature': 'Animals & Nature',
          'food & drink': 'Food & Drink',
          'activities': 'Activities',
          'travel & places': 'Travel & Places',
          'objects': 'Objects',
          'symbols': 'Symbols',
          'flags': 'Flags',
        };

        const emojisFromMetadata: (Emoji & { sortOrder: number })[] = Object.entries(fluentEmojisMetadata)
          .map(([name, data]): (Emoji & { sortOrder: number }) | null => {
            if (!data || typeof data !== 'object' || !data.group || !groupMap[data.group.toLowerCase()]) {
              return null;
            }

            const styleSource = data.isSkintoneBased ? data.skintones?.Default : data.styles;
            if (!styleSource) return null;

            const unicode = data.unicode;
            const symbol = unicode
              ? String.fromCodePoint(...unicode.split(' ').map((u) => parseInt(u, 16)))
              : undefined;

            // --- MODIFIED LOGIC FOR ANIMATED EMOJI ---
            let localAnimWebpUrl: string | undefined;

            if (styleSource.Animated) {
                // Use the new helper to reliably parse the URL and format the local path.
                localAnimWebpUrl = extractWebpPathFromUrl(styleSource.Animated);
                // The filename structure is often: {name}_animated.webp
                // If the name is "Money-mouth face", the original URL already converts to 'money-mouth_face_animated.png'.
                // If it's a skintone base like "Person", it's 'person_animated_default.png', and we simplify to 'person_animated.webp'.
            }
            // --- END: MODIFIED LOGIC FOR ANIMATED EMOJI ---

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
                // Use the locally constructed WebP URL for the Animated style
                Anim: localAnimWebpUrl, 
              },
              unicode,
              symbol,
            };
          })
          .filter((emoji): emoji is Emoji & { sortOrder: number } => emoji !== null);

        emojisFromMetadata.sort((a, b) => a.sortOrder - b.sortOrder);

        const finalEmojis: Emoji[] = emojisFromMetadata.map(({ sortOrder, ...rest }) => rest);

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
    
    loadEmojis(); // ✅ Call the async function
  }, []); // Run once on mount

  return { emojis, loading, error };
};