import React, { useState, useMemo, useEffect, FC, useCallback } from 'react';
import SkeletonCard from '../components/SkeletonCard';
import EmojiCard from '../components/EmojiCard';
import Tabs from '../components/Tabs';
import { SearchIcon, DownloadIcon, CloseIcon } from '../components/Icons';
import { Emoji, EmojiStyle } from '../types';
import AppModal from '../components/AppModal';

const EMOJIS_PER_PAGE = 64;

const emojiCategories = [
    { value: 'All', label: 'All Categories' },
    { value: 'Smileys & Emotion', label: 'Smileys', icon: '😀' },
    { value: 'People & Body', label: 'People', icon: '🧑' },
    { value: 'Animals & Nature', label: 'Animals & Nature', icon: '🐻' },
    { value: 'Food & Drink', label: 'Food & Drink', icon: '🍔' },
    { value: 'Activities', label: 'Activity', icon: '⚽' },
    { value: 'Travel & Places', label: 'Travel & Places', icon: '🚀' },
    { value: 'Objects', label: 'Objects', icon: '💡' },
    { value: 'Symbols', label: 'Symbols', icon: '❤️' },
    { value: 'Flags', label: 'Flags', icon: '🏳️' },
];

const emojiStyles: {value: EmojiStyle, label: string}[] = [
    { value: '3D', label: '3D' },
    { value: 'Modern', label: 'Modern' },
    { value: 'Flat', label: 'Flat' },
    { value: 'Mono', label: 'Mono' },
    { value: 'Anim', label: 'Anim' },
];

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

const EmojiDetail: FC<{ data: { emoji: Emoji, style: EmojiStyle } }> = ({ data }) => {
    const { emoji, style } = data;
    const emojiUrl = emoji.styles[style];

    const handleDownload = useCallback(async () => {
        if (!emojiUrl) return;
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
            <div className="p-6 flex items-center justify-center bg-bg-inset" style={{minHeight: '200px'}}>
                <img src={emojiUrl} alt={emoji.name} className="w-32 h-32" />
            </div>
            <div className="p-6">
                <button onClick={handleDownload} className="w-full flex items-center justify-center px-4 py-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                    <DownloadIcon />
                    <span className="ml-2">Download</span>
                </button>
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
    return filteredEmojis.slice(0, visibleCount);
  }, [filteredEmojis, visibleCount]);

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + EMOJIS_PER_PAGE);
  };

  const categoryOptions = useMemo(() => emojiCategories.map(cat => ({
      value: cat.value,
      label: cat.label,
      icon: cat.icon ? <span className="text-lg leading-none">{cat.icon}</span> : undefined,
  })), []);
  
  const styleOptions = useMemo(() => emojiStyles.map(style => ({
    value: style.value,
    label: style.label,
  })), []);


  const renderGridContent = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
          {Array.from({ length: 32 }).map((_, index) => (
            <SkeletonCard key={index} className="aspect-square" />
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
          {filteredEmojis.length > visibleCount && (
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
                    className="w-full py-2 pl-10 pr-10 bg-bg-tertiary border border-border-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
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
                <div className="hidden lg:block">
                  <Tabs options={categoryOptions} value={selectedCategory} onChange={setSelectedCategory} />
                </div>
                <div className="lg:hidden relative">
                  <select
                    aria-label="Emoji category"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full h-10 pl-4 pr-10 text-sm bg-bg-tertiary border border-border-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none"
                  >
                    {emojiCategories.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.icon} {cat.label}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-text-tertiary">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
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