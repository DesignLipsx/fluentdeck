import { useState, useEffect } from 'react';
import { Emoji } from '../types';

const EMOJI_METADATA_URL = 'https://raw.githubusercontent.com/xsalazar/fluent-emoji/refs/heads/main/src/Components/metadata.json';

interface FluentEmojiMetadataEntry {
  group: string;
  keywords: string[];
  sortOrder: number;
  styles: {
    '3D'?: string;
    Color?: string;
    Flat?: string;
    HighContrast?: string;
    Animated?: string;
  };
}

type FluentEmojiMetadata = Record<string, FluentEmojiMetadataEntry>;

export const useFluentEmojis = () => {
  const [emojis, setEmojis] = useState<Emoji[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAndProcessEmojis = async () => {
      try {
        setLoading(true);

        const response = await fetch(EMOJI_METADATA_URL);
        if (!response.ok) {
          throw new Error(`Failed to fetch Fluent emoji metadata: ${response.status}`);
        }
        const fluentEmojisMetadata: FluentEmojiMetadata = await response.json();
        
        const validCategories = new Set([
            'Smileys & Emotion', 'People & Body', 'Animals & Nature', 'Food & Drink',
            'Activities', 'Travel & Places', 'Objects', 'Symbols', 'Flags',
        ]);

        const emojisFromMetadata: (Emoji & { sortOrder: number })[] = Object.entries(fluentEmojisMetadata)
            .filter(([, data]) => {
              return data && typeof data === 'object' && data.group && validCategories.has(data.group) && data.styles;
            })
            .map(([name, data]) => ({
                name,
                keywords: data.keywords || [],
                category: data.group,
                sortOrder: data.sortOrder,
                styles: {
                    '3D': data.styles['3D'],
                    'Modern': data.styles.Color,
                    'Flat': data.styles.Flat,
                    'Mono': data.styles.HighContrast,
                    'Anim': data.styles.Animated,
                }
            }));
        
        emojisFromMetadata.sort((a, b) => a.sortOrder - b.sortOrder);
        
        const finalEmojis: Emoji[] = emojisFromMetadata.map(({ sortOrder, ...rest}) => rest);

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

    fetchAndProcessEmojis();
  }, []);

  return { emojis, loading, error };
};
