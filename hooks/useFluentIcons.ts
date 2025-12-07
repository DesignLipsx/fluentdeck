import { useState, useEffect } from 'react';

const formatName = (name: string) => {
  // If the name already has spaces, assume it's correctly formatted (like from color.json)
  if (name.includes(' ')) {
      return name;
  }
  // Convert CamelCase to spaced words, e.g., "AddCircle" -> "Add Circle"
  return name.replace(/([A-Z])/g, ' $1').trim();
};


export const useFluentIcons = () => {
  const [icons, setIcons] = useState<string[]>([]);
  const [colorIcons, setColorIcons] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIcons = async () => {
      try {
        setLoading(true);
        
        const [filledRes, regularRes, colorRes] = await Promise.all([
          fetch(new URL('./filled.json', import.meta.url).href),
          fetch(new URL('./regular.json', import.meta.url).href),
          fetch(new URL('./color.json', import.meta.url).href)
        ]);

        if (!filledRes.ok || !regularRes.ok || !colorRes.ok) {
          throw new Error('Failed to fetch one or more icon data files.');
        }

        const filledIconsData: { name: string }[] = await filledRes.json();
        const regularIconsData: { name: string }[] = await regularRes.json();
        const colorIconsData: { name: string }[] = await colorRes.json();

        const allFilledNames = filledIconsData.map(icon => formatName(icon.name));
        const allRegularNames = regularIconsData.map(icon => formatName(icon.name));

        const allStandardIconNames = [...new Set([...allFilledNames, ...allRegularNames])].sort((a, b) => a.localeCompare(b));
        const allColorIconNames = colorIconsData.map(icon => icon.name).sort((a, b) => a.localeCompare(b));

        setIcons(allStandardIconNames);
        setColorIcons(allColorIconNames);
        setError(null);
      } catch (e) {
        if (e instanceof Error) {
            setError(`Failed to load icon data: ${e.message}`);
        } else {
            setError('An unknown error occurred while loading icon data.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchIcons();
  }, []);

  return { icons, colorIcons, loading, error };
};