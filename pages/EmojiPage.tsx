import React, { useState, useMemo, useEffect, FC, useCallback } from 'react';
import SkeletonCard from '../components/SkeletonCard';
import EmojiCard from '../components/EmojiCard';
import Tabs, { Dropdown } from '../components/Tabs'; // Import Dropdown from Tabs file
import { SearchIcon, DownloadIcon, CloseIcon, CopyIcon } from '../components/Icons';
import { Emoji, EmojiStyle } from '../types';
import AppModal from '../components/AppModal';

const EMOJIS_PER_PAGE = 160;

// Re-defining the categories with the icon property
const rawEmojiCategories = [
    { value: 'All', label: 'All Categories', tooltip: 'All available emojis across all categories', icon: undefined },
    { value: 'Smileys & Emotion', label: 'Smileys', icon: '😀', tooltip: 'Faces, emotions, and hand gestures' },
    { value: 'People & Body', label: 'People', icon: '🧑', tooltip: 'People, body parts, and clothing' },
    { value: 'Animals & Nature', label: 'Animals & Nature', icon: '🐻', tooltip: 'Animals, plants, and weather' },
    { value: 'Food & Drink', label: 'Food & Drink', icon: '🍔', tooltip: 'Various food and beverage items' },
    { value: 'Activities', label: 'Activity', icon: '⚽', tooltip: 'Sports, leisure, and events' },
    { value: 'Travel & Places', label: 'Travel & Places', icon: '🚀', tooltip: 'Vehicles, landmarks, and map symbols' },
    { value: 'Objects', label: 'Objects', icon: '💡', tooltip: 'Household items, tools, and electronics' },
    { value: 'Symbols', label: 'Symbols', icon: '❤️', tooltip: 'Punctuation, arrows, and other symbols' },
    { value: 'Flags', label: 'Flags', icon: '🏳️', tooltip: 'Country and other flags' },
];

export const emojiStyles: EmojiStyleItem[] = [
    { value: '3D', label: '3D', tooltip: 'Emojis with a modern, three-dimensional look' },
    { value: 'Modern', label: 'Modern', tooltip: 'Classic, vibrant, and detailed two-dimensional style' },
    { value: 'Flat', label: 'Flat', tooltip: 'Minimalist, simplified two-dimensional style' },
    { value: 'Mono', label: 'Mono', tooltip: 'Black and white or single-color outline style' },
    { value: 'Anim', label: 'Anim', tooltip: 'Animated versions of the emojis' },
];

// ... (downloadFile, CopyableField, EmojiDetail components remain unchanged)
const CopyableField: FC<{ label: string; value: string }> = ({ label, value }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  // ... (rest of CopyableField component)
    return (
    <div className="flex items-center justify-between bg-bg-tertiary rounded-lg px-3 py-2 text-sm group relative">
      <div className="flex items-center space-x-2 overflow-hidden flex-1 min-w-0">
        <span className="font-medium text-text-secondary w-16 flex-shrink-0">
          {label}
        </span>
        <div 
          className="flex-1 overflow-x-auto min-w-0"
          style={{
            scrollbarWidth: 'none', /* Firefox */
            msOverflowStyle: 'none', /* IE and Edge */
          }}
        >
          <span
            className="font-mono text-text-primary whitespace-nowrap inline-block"
            title={value}
          >
            {value}
          </span>
        </div>
      </div>
      <button
        onClick={handleCopy}
        className="flex items-center justify-center h-8 w-8 flex-shrink-0 rounded-md text-text-tertiary hover:bg-bg-hover hover:text-text-primary transition-colors ml-2 relative"
        title={copied ? 'Copied!' : 'Copy'}
      >
        <CopyIcon className="w-4 h-4" />
        {copied && (
          <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full bg-green-500 text-white text-xs rounded px-2 py-1 shadow transition-opacity duration-300 z-10">
            Copied!
          </span>
        )}
      </button>
    </div>
  );
};

const EmojiDetail: FC<{ data: { emoji: Emoji, style: EmojiStyle } }> = ({ data }) => {
  // ... (rest of EmojiDetail component)
  const { emoji, style } = data;
    
    function buildOriginalUrl(emojiName: string, style: EmojiStyle, isSkintoneBased: boolean = false): string | null {
        // ... (url logic)
        const base = 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/refs/heads/main/assets';
        const folderName = emojiName;
        const fileBase = emojiName.toLowerCase().replace(/ /g, '_');
        const suffix = isSkintoneBased ? '_default' : '';
        const defaults = isSkintoneBased ? 'Default/' : '';

        switch (style) {
            case '3D':
                return `${base}/${folderName}/${defaults}3D/${fileBase}_3d${suffix}.png`;
            case 'Modern':
            case 'Color':
                return `${base}/${folderName}/${defaults}Color/${fileBase}_color${suffix}.svg`;
            case 'Flat':
            // ... (rest of switch)
            case 'Flat':
                return `${base}/${folderName}/${defaults}Flat/${fileBase}_flat${suffix}.svg`;
            case 'Mono':
            case 'HighContrast':
                return `${base}/${folderName}/${defaults}High Contrast/${fileBase}_high_contrast${suffix}.svg`;
            case 'Anim':
            case 'Animated':
                return `https://media.githubusercontent.com/media/microsoft/fluentui-emoji-animated/refs/heads/main/assets/${folderName}/${defaults}animated/${fileBase}_animated${suffix}.png`;
            default:
                return null;
        }
    }

    const emojiUrlWebP = emoji.styles[style];
    const emojiUrl = buildOriginalUrl(emoji.name, style, emoji.isSkintoneBased || false);

    const handleDownload = useCallback(async () => {
        // ... (download logic)
        const downloadFile = (content: string | Blob, fileName: string, mimeType?: string) => {
          const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        };
        // ... (rest of handleDownload)
        try {
            const res = await fetch(emojiUrl);
            if (!res.ok) throw new Error(`HTTP error ${res.status}`);
            const blob = await res.blob();
            const fileExtension = emojiUrl.split('.').pop() || 'png';
            const filename = `${emoji.name.toLowerCase().replace(/ /g, '_')}.${fileExtension}`;
            downloadFile(blob, filename);
        } catch (error) {
            console.error('Failed to download emoji:', error);
        }
    }, [emojiUrl, emoji.name]);
    
    if (!emojiUrl) return null;

    return (
        <>
            <div className="p-6 flex bg-[#1e1f22] items-center justify-center bg-bg-inset" style={{minHeight: '200px'}}>
                <img src={emojiUrlWebP} alt={emoji.name} className="w-32 h-32" />
            </div>
            <div className="p-6 space-y-3">
                {emojiUrl && <CopyableField label="URL" value={emojiUrl} />}
                {emoji.symbol && <CopyableField label="Symbol" value={emoji.symbol} />}
                {emoji.unicode && <CopyableField label="Unicode" value={`U+${emoji.unicode.toUpperCase().replace(/ /g, ' U+')}`} />}

                <div className="pt-3">
                    <button onClick={handleDownload} className="w-full flex items-center justify-center px-4 py-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                        <DownloadIcon />
                        <span className="ml-2">Download</span>
                    </button>
                </div>
            </div>
        </>
    );
};


interface EmojiPageProps {
  emojis: Emoji[];
  loading: boolean;
  error: string | null;
}

const EmojiPage: React.FC<EmojiPageProps> = ({ emojis, loading, error }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(() => sessionStorage.getItem('emojiCategory') || 'All');
  const [selectedStyle, setSelectedStyle] = useState<EmojiStyle>(() => (sessionStorage.getItem('emojiStyle') as EmojiStyle) || '3D');
  const [modalItem, setModalItem] = useState<{emoji: Emoji, style: EmojiStyle} | null>(null);
  const [visibleCount, setVisibleCount] = useState(EMOJIS_PER_PAGE);

  const handleEmojiClick = (emoji: Emoji) => {
    setModalItem({ emoji, style: selectedStyle });
  };
  const handleCloseModal = () => setModalItem(null);


  useEffect(() => {
    sessionStorage.setItem('emojiCategory', selectedCategory);
  }, [selectedCategory]);

  useEffect(() => {
    sessionStorage.setItem('emojiStyle', selectedStyle);
  }, [selectedStyle]);
  
  useEffect(() => {
    setVisibleCount(EMOJIS_PER_PAGE);
  }, [searchTerm, selectedCategory, selectedStyle]);


  const filteredEmojis = useMemo(() => {
    let tempEmojis: Emoji[] = emojis;

    if (selectedCategory !== 'All') {
        tempEmojis = tempEmojis.filter(emoji => emoji.category === selectedCategory);
    }

    if (!searchTerm) return tempEmojis;

    const lowercasedTerm = searchTerm.toLowerCase();
    return tempEmojis.filter(emoji =>
      emoji.name.toLowerCase().includes(lowercasedTerm) ||
      (emoji.keywords && emoji.keywords.some(keyword => keyword.toLowerCase().includes(lowercasedTerm)))
    );
  }, [emojis, searchTerm, selectedCategory]);
  
  const emojisToShow = useMemo(() => {
    // Show all emojis if Anim style is selected
    if (selectedStyle === 'Anim') {
      return filteredEmojis;
    }
    return filteredEmojis.slice(0, visibleCount);
  }, [filteredEmojis, visibleCount, selectedStyle]);

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + EMOJIS_PER_PAGE);
  };
  
  // 1. For Desktop Tabs (Only Emoji, except 'All Categories')
  const categoryOptions = useMemo(() => rawEmojiCategories.map(cat => ({
    value: cat.value,
    // FIX: Set label to '' for all categories except 'All'
    label: cat.value === 'All' ? cat.label : '', 
    icon: cat.icon 
      ? <span className="text-lg leading-none">{cat.icon}</span>
      : undefined,
    tooltip: cat.tooltip, 
  })), []);

  // 2. For Mobile Dropdown (Show Text for all)
  const categoryDropdownOptions = useMemo(() => rawEmojiCategories.map(cat => ({
    value: cat.value,
    label: cat.label, // Show full label for mobile dropdown
    icon: cat.icon 
      ? <span className="text-lg leading-none">{cat.icon}</span>
      : undefined,
    tooltip: cat.tooltip, 
  })), []);

  const styleOptions = useMemo(() => emojiStyles.map(style => ({
    value: style.value,
    label: style.label,
    tooltip: style.tooltip, 
  })), []);

  const renderGridContent = () => {
    // ... (rest of renderGridContent remains unchanged)
    if (loading) {
      return (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
          {Array.from({ length: 32 }).map((_, index) => (
            <div key={index} className="bg-bg-tertiary rounded-xl aspect-square animate-pulse" />
          ))}
        </div>
      );
    }
    if (error) {
      return <div className="text-center py-16 text-red-400">{error}</div>;
    }
    if (filteredEmojis.length > 0) {
      return (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
            {emojisToShow.map((emoji, index) => (
              <EmojiCard 
                  key={`${emoji.name}-${selectedStyle}`} 
                  emoji={emoji} 
                  index={index} 
                  style={selectedStyle}
                  onClick={() => handleEmojiClick(emoji)}
              />
            ))}
          </div>
          {/* Hide Load More button on Anim tab */}
          {selectedStyle !== 'Anim' && filteredEmojis.length > visibleCount && (
              <div className="mt-8 text-center">
                <button
                    onClick={handleLoadMore}
                    className="px-6 py-2 font-semibold text-text-secondary bg-bg-tertiary rounded-lg hover:bg-bg-active"
                >
                    Load More
                </button>
              </div>
          )}
        </>
      );
    }
    return (
      <div className="text-center py-16 text-text-tertiary">
        <h3 className="text-xl font-semibold">No emojis found</h3>
        <p>Try adjusting your search or filters.</p>
      </div>
    );
  };
  
  return (
    <div>
      <div className="sticky top-16 z-10 bg-bg-backdrop backdrop-blur-md border-b border-border-primary">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              <div className="relative w-full lg:flex-1">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <SearchIcon />
                  </span>
                  <input
                    type="text"
                    placeholder={loading ? 'Loading emojis...' : `Search emojis...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full py-2 pl-10 pr-10 bg-bg-tertiary border border-border-secondary rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                    disabled={loading}
                  />
                  {searchTerm && (
                    <button
                        onClick={() => setSearchTerm('')}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-text-tertiary"
                        aria-label="Clear search"
                    >
                        <CloseIcon className="w-5 h-5" />
                    </button>
                  )}
              </div>
              <div className="w-full lg:w-auto flex-shrink-0">
                  <Tabs options={styleOptions} value={selectedStyle} onChange={(v) => setSelectedStyle(v as EmojiStyle)} />
              </div>
              <div className="w-full lg:w-auto">
                {/* Desktop: Uses categoryOptions which shows only emoji icons */}
                <div className="hidden lg:block">
                  <Tabs options={categoryOptions} value={selectedCategory} onChange={setSelectedCategory} />
                </div>
                {/* Mobile: Uses Dropdown which shows icon and text for better usability */}
                <div className="lg:hidden relative">
                  <Dropdown
                    label="Category" // Label shown on the button
                    options={categoryDropdownOptions}
                    value={selectedCategory}
                    onChange={setSelectedCategory}
                  />
                </div>
              </div>
            </div>
        </div>
      </div>
      
      <div className="p-4 sm:p-6 lg:p-8">
        {renderGridContent()}
      </div>

      <AppModal isOpen={!!modalItem} onClose={handleCloseModal} title={modalItem?.emoji.name || ''}>
        {modalItem && <EmojiDetail data={modalItem} />}
      </AppModal>

    </div>
  );
};

export default EmojiPage;