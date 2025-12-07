import { useState, useEffect } from 'react';

interface IconData {
  name: string;
  svgFileName: string;
}

const formatName = (name: string) => {
  // If the name already has spaces, assume it's correctly formatted (like from color.json)
  if (name.includes(' ')) {
      return name;
  }
  // Convert CamelCase to spaced words, e.g., "AddCircle" -> "Add Circle"
  return name.replace(/([A-Z])/g, ' $1').trim();
};

export const useFluentIcons = () => {
  const [icons, setIcons] = useState<IconData[]>([]);
  const [colorIcons, setColorIcons] = useState<IconData[]>([]);
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

        const filledIconsData: { name: string; svgFileName: string }[] = await filledRes.json();
        const regularIconsData: { name: string; svgFileName: string }[] = await regularRes.json();
        const colorIconsData: { name: string; svgFileName: string }[] = await colorRes.json();

        // Create a map to store icons by their formatted name, keeping track of both filled and regular
        const filledMap = new Map<string, string>();
        const regularMap = new Map<string, string>();
        
        // Add filled icons
        filledIconsData.forEach(icon => {
          const formattedName = formatName(icon.name);
          filledMap.set(formattedName, icon.svgFileName);
        });
        
        // Add regular icons
        regularIconsData.forEach(icon => {
          const formattedName = formatName(icon.name);
          regularMap.set(formattedName, icon.svgFileName);
        });

        // Combine all unique icon names
        const allNames = new Set([...filledMap.keys(), ...regularMap.keys()]);
        
        // Create icon objects with the appropriate svgFileName
        // Prefer filled if available, otherwise use regular
        const allStandardIcons = Array.from(allNames)
          .map(name => ({
            name,
            svgFileName: filledMap.get(name) || regularMap.get(name) || ''
          }))
          .sort((a, b) => a.name.localeCompare(b.name));

        const allColorIconsArray = colorIconsData
          .map(icon => ({ name: icon.name, svgFileName: icon.svgFileName }))
          .sort((a, b) => a.name.localeCompare(b.name));

        setIcons(allStandardIcons);
        setColorIcons(allColorIconsArray);
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