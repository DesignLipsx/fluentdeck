import { useState, useEffect } from 'react';
import { Category, App, OtherSection } from '../types';
import { README_URL } from '../constants';
import { supabase } from '../lib/supabase';

const parseTags = (str: string): string[] => {
    if (!str) return [];
    const backtickRegex = /`([^`]+)`/g;
    const supRegex = /<sup>(.*?)<\/sup>/g;
    
    const tags: string[] = [];
    let match;

    while((match = backtickRegex.exec(str)) !== null) {
        tags.push(match[1].trim());
    }
    while((match = supRegex.exec(str)) !== null) {
        // Exclude FOSS from general tags as it's handled separately
        const tagContent = match[1].replace(/`/g, '').trim();
        if (tagContent.toUpperCase() !== 'FOSS') {
            tags.push(tagContent);
        }
    }
    return tags;
};

const extractTitleParts = (rawTitle: string): { emoji?: string, text: string } => {
    const cleanedTitle = rawTitle.replace(/<[^>]*>/g, '').replace(/\*+/g, '').trim();
    // This regex handles complex emojis with Zero-Width Joiners (ZWJ), like 👨‍💻
    const emojiMatch = cleanedTitle.match(/^(\p{Extended_Pictographic}(?:\u200D\p{Extended_Pictographic})*)/u);
    if (emojiMatch) {
        const emoji = emojiMatch[0];
        const text = cleanedTitle.substring(emoji.length).trim();
        return { emoji, text };
    }
    return { text: cleanedTitle };
};

export const useMarkdownParser = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [otherSections, setOtherSections] = useState<OtherSection[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const parseMarkdown = async () => {
      try {
        const response = await fetch(README_URL);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        const lines = text.split('\n');

        let parsedCategories: Category[] = [];
        const parsedSections: OtherSection[] = [];
        let currentSection: OtherSection | null = null;
        let mainCategoryContext: Category | null = null;
        let listParentCategory: Category | null = null;
        let currentCategory: Category | null = null;
        let inAppsList = false;
        
        const appRegex = /^\s*-\s*((?:`[^`]+`\s*)+)\[([^\]]+)\]\(([^)]+)\)(.*)$/;
        const subgroupRegex = /^\s*-\s*\*\*(.*)\*\*.*$/;

        for (const line of lines) {
            // More flexible check for Apps List section - checks if line contains "Apps List"
            if (line.startsWith('## ') && line.toLowerCase().includes('apps list')) {
                inAppsList = true;
                continue;
            }

            if (line.startsWith('## ') && !line.toLowerCase().includes('apps list')) {
                inAppsList = false;
                mainCategoryContext = null;
                listParentCategory = null;
                currentCategory = null;
            }

            if (inAppsList) {
                if (line.startsWith('### ')) {
                    const rawTitle = line.substring(4).trim();
                    const { text, emoji } = extractTitleParts(rawTitle);

                    const category: Category = { name: text, apps: [], emoji: emoji };
                    currentCategory = category;
                    mainCategoryContext = category;
                    listParentCategory = category;
                    parsedCategories.push(category);

                } else if (line.startsWith('#### ') && mainCategoryContext) {
                    const rawSubTitle = line.substring(5).trim();
                    const { text: subText, emoji: subEmoji } = extractTitleParts(rawSubTitle);
                    
                    const fullName = `${mainCategoryContext.name} / ${subText}`;
                    
                    const category: Category = { name: fullName, apps: [], emoji: subEmoji };
                    currentCategory = category;
                    listParentCategory = category;
                    parsedCategories.push(category);

                } else if (currentCategory && line.trim().startsWith('- ')) {
                    const subgroupMatch = line.match(subgroupRegex);
                    const appMatch = line.match(appRegex);

                    if (subgroupMatch) {
                        const rawSubgroupTitle = subgroupMatch[1].trim();
                        const { text: subgroupText, emoji: subgroupEmoji } = extractTitleParts(rawSubgroupTitle);

                        if (listParentCategory) {
                             const fullName = `${listParentCategory.name} / ${subgroupText}`;
                             const category: Category = { name: fullName, apps: [], emoji: subgroupEmoji };
                             currentCategory = category;
                             parsedCategories.push(category);
                        }
                    } else if (appMatch) {
                      let [, initialTagsStr, name, link, restOfLine] = appMatch;
                      const initialTags = parseTags(initialTagsStr);
                      
                      let pricing: 'FOSS' | 'Paid' | 'Free' = 'Free';
                      if (restOfLine.includes('💰')) {
                          pricing = 'Paid';
                          restOfLine = restOfLine.replace(/💰/g, '').trim();
                      } else if (restOfLine.toLowerCase().includes('foss')) {
                          pricing = 'FOSS';
                          restOfLine = restOfLine.replace(/<sup>(.*?)FOSS(.*?)<\/sup>/i, '').trim();
                      }

                      const restTags = parseTags(restOfLine);
                      const tags = [...new Set([...initialTags, ...restTags])];

                      currentCategory.apps.push({
                        name: name.trim(),
                        link: link.trim(),
                        description: '', // Descriptions are not present in this README format
                        tags,
                        category: currentCategory.name,
                        pricing,
                      });
                    }
                }
            } else {
                 if (line.startsWith('## ')) {
                    if (currentSection) {
                        parsedSections.push(currentSection);
                    }
                    const title = line.substring(3).trim();
                    if (['Disclaimer', 'Abbreviations', 'Contributing'].includes(title)) {
                        currentSection = { title, content: '' };
                    } else {
                        currentSection = null;
                    }
                } else if (currentSection) {
                    currentSection.content += line + '\n';
                }
            }
        }

        if (currentSection) {
            parsedSections.push(currentSection);
        }
        
        if (parsedCategories.length > 0) {
            const { data: logos, error: logosError } = await supabase
                .from('app_metadata')
                .select('app_name, logo_url');
            
            let finalCategories = parsedCategories;

            if (logos && !logosError) {
                const logoMap = new Map(logos.map(item => [item.app_name, item.logo_url]));
                
                finalCategories = parsedCategories.map(category => ({
                    ...category,
                    apps: category.apps.map(app => ({
                        ...app,
                        logo_url: (logoMap.get(app.name) as any) || undefined,
                    })),
                }));
            }
           setCategories(finalCategories);
           setOtherSections(parsedSections);
        } else {
            // Log some debug info to help diagnose the issue
            console.error('Parsing failed. First 10 lines of README:', lines.slice(0, 10));
            console.error('Lines containing "##":', lines.filter(l => l.startsWith('##')).slice(0, 20));
            throw new Error("Failed to parse any app categories from the README.");
        }

      } catch (e: unknown) {
        if (e instanceof Error) {
            setError(`Failed to load or parse app list: ${e.message}`);
        } else {
            setError('An unknown error occurred.');
        }
      } finally {
        setLoading(false);
      }
    };

    parseMarkdown();
  }, []);

  return { categories, setCategories, otherSections, loading, error };
};