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

const extractWebpPathFromUrl = (originalUrl: string, category: string): string => {
    try {
        const url = new URL(originalUrl);
        let filename = url.pathname.split('/').pop() || '';
        filename = filename.replace(/\.(png|webp|svg)$/i, '');
        // Use the category folder for the webp version
        return `/${category}/${filename}.webp`;
    } catch (e) {
        return '';
    }
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

        const emojiRes = await fetch(new URL('./emoji.json', import.meta.url).href);

        if (!emojiRes.ok) {
          throw new Error(`HTTP error! status: ${emojiRes.status}`);
        }

        const rawEmojiData = await emojiRes.json();
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

            // --- MODIFIED LOGIC FOR ALL WEBP STYLES ---
            const localAnimWebpUrl = styleSource.Animated
                ? extractWebpPathFromUrl(styleSource.Animated, 'animated_emoji')
                : undefined;
            const local3DWebpUrl = styleSource['3D']
                ? extractWebpPathFromUrl(styleSource['3D'], '3D')
                : undefined;
            const localModernWebpUrl = styleSource.Color
                ? extractWebpPathFromUrl(styleSource.Color, 'modern')
                : undefined;
            const localFlatWebpUrl = styleSource.Flat
                ? extractWebpPathFromUrl(styleSource.Flat, 'flat')
                : undefined;
            const localMonoWebpUrl = (styleSource.HighContrast || styleSource['High contrast'])
                ? extractWebpPathFromUrl(styleSource.HighContrast || styleSource['High contrast'], 'high_contrast')
                : undefined;

            return {
              name,
              keywords: data.keywords || [],
              category: groupMap[data.group.toLowerCase()],
              sortOrder: data.sortOrder,
              styles: {
                '3D': local3DWebpUrl,
                Modern: localModernWebpUrl,
                Flat: localFlatWebpUrl,
                Mono: localMonoWebpUrl,
                Anim: localAnimWebpUrl,
              },
              unicode,
              symbol,
              isSkintoneBased: data.isSkintoneBased || false,
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
    
    loadEmojis();
  }, []);

  return { emojis, loading, error };
};
