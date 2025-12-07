import React, { useState, useMemo, useEffect, FC, useCallback } from 'react';
import SkeletonCard from '../components/SkeletonCard';
import EmojiCard from '../components/EmojiCard';
import Tabs from '../components/Tabs';
import { SearchIcon, DownloadIcon, CloseIcon, CopyIcon } from '../components/Icons';
import { useFluentEmojis } from '../hooks/useFluentEmojis';
// Assuming types are defined in types.ts
import { Emoji, EmojiStyle } from '../types';

// --- MOCK COMPONENTS (You need to replace these with your actual components) ---

// Assume AppModal is a component that renders children in a modal
const AppModal: FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  
  // Basic modal structure for demonstration
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/80 flex items-center justify-center p-4">
      <div className="bg-bg-primary rounded-xl w-full max-w-md p-6 relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-text-primary truncate">{title}</h2>
          <button onClick={onClose} className="text-text-tertiary hover:text-text-primary"><CloseIcon /></button>
        </div>
        {children}
      </div>
    </div>
  );
};


interface EmojiDetailProps {
  data: {
    emoji: Emoji;
    style: EmojiStyle;
  };
}

// CONCEPTUAL EmojiDetail Component - IMPORTANT MODIFICATION HERE
const EmojiDetail: FC<EmojiDetailProps> = ({ data }) => {
  const { emoji, style } = data;
  const imageUrl = emoji.styles[style];

  // Function to determine the URL for download (Original PNG for Anim, Preview URL otherwise)
  const getDownloadUrl = (currentStyle: EmojiStyle) => {
    // This is the critical change: use the stored original PNG URL for the Anim style download
    if (currentStyle === 'Anim') {
      return emoji.animDownloadUrl;
    }
    // For all other styles (3D, Modern, etc.), use the displayed image URL
    return imageUrl;
  };
  
  const downloadUrl = getDownloadUrl(style);
  const isAnimated = style === 'Anim';

  return (
    <div className="flex flex-col items-center">
      <div className="w-32 h-32 mb-6 bg-bg-secondary rounded-lg p-4 flex items-center justify-center">
        <img src={imageUrl} alt={emoji.name} className="w-full h-full object-contain" />
      </div>

      <div className="flex gap-4 mb-6">
        <a 
          href={downloadUrl}
          // The download attribute ensures the file is downloaded. The name will be derived from the URL.
          download={isAnimated ? `${emoji.name.replace(/\s/g, '_')}_animated.png` : `${emoji.name.replace(/\s/g, '_')}_${style.toLowerCase()}.svg`} 
          className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-150"
        >
          <DownloadIcon className="w-5 h-5 mr-2" />
          {isAnimated ? 'Download Original PNG' : `Download ${style}`}
        </a>
        <button 
          onClick={() => { /* Copy logic here */ }} 
          className="flex items-center justify-center px-4 py-2 bg-bg-tertiary border border-border-secondary text-text-primary font-semibold rounded-lg shadow-md hover:bg-bg-secondary transition duration-150"
        >
          <CopyIcon className="w-5 h-5 mr-2" />
          Copy URL
        </button>
      </div>
      
      <p className="text-sm text-text-secondary">
        Previewing as {isAnimated ? 'WebP (Animated, optimized)' : style}
      </p>
      {isAnimated && (
        <p className="text-xs text-text-tertiary mt-1">
          The download link provides the original, high-quality PNG.
        </p>
      )}
    </div>
  );
};

// --- END MOCK COMPONENTS ---

const EMOJIS_PER_PAGE = 64;

// Add 'animDownloadUrl' to the Emoji type definition for local use.
// You should update your global `types.ts` file to include this property.
type ExtendedEmoji = Emoji & { animDownloadUrl?: string };


const emojiCategories = [
    { value: 'All', label: 'All Categories', icon: '✨' },
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
    { value: 'Anim', label: 'Animated (WebP)' }, // Updated label for clarity
];


const EmojiPage: FC = () => {
    const { emojis: allEmojis, loading, error } = useFluentEmojis();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStyle, setSelectedStyle] = useState<EmojiStyle>('Anim');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [modalItem, setModalItem] = useState<{ emoji: ExtendedEmoji; style: EmojiStyle } | null>(null);

    const filteredEmojis = useMemo(() => {
        return (allEmojis as ExtendedEmoji[])
            .filter(emoji => {
                const matchesSearch = searchTerm.length < 3 || 
                    emoji.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                    emoji.keywords.some(k => k.toLowerCase().includes(searchTerm.toLowerCase()));
                
                const matchesCategory = selectedCategory === 'All' || emoji.category === selectedCategory;

                // Only show emojis that have the currently selected style
                const hasStyle = emoji.styles[selectedStyle];

                return matchesSearch && matchesCategory && hasStyle;
            });
    }, [allEmojis, searchTerm, selectedCategory, selectedStyle]);

    const totalPages = Math.ceil(filteredEmojis.length / EMOJIS_PER_PAGE);
    
    const paginatedEmojis = useMemo(() => {
        const start = (currentPage - 1) * EMOJIS_PER_PAGE;
        const end = start + EMOJIS_PER_PAGE;
        return filteredEmojis.slice(start, end);
    }, [filteredEmojis, currentPage]);

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedCategory, selectedStyle]);


    const handleOpenModal = useCallback((emoji: ExtendedEmoji) => {
      setModalItem({ emoji, style: selectedStyle });
    }, [selectedStyle]);

    const handleCloseModal = useCallback(() => {
      setModalItem(null);
    }, []);
    
    const renderGridContent = () => {
        if (loading) {
            return (
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-3 sm:gap-4">
                    {Array.from({ length: EMOJIS_PER_PAGE }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
            );
        }

        if (error) {
            return <div className="text-red-500 text-center py-10">Error loading emojis: {error}</div>;
        }

        if (filteredEmojis.length === 0) {
            return <div className="text-text-secondary text-center py-10">No emojis found matching your criteria.</div>;
        }

        return (
            <>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-3 sm:gap-4">
                    {paginatedEmojis.map((emoji, index) => (
                        <EmojiCard 
                            key={emoji.name}
                            emoji={emoji as Emoji}
                            index={index}
                            style={selectedStyle}
                            onClick={() => handleOpenModal(emoji)}
                        />
                    ))}
                </div>
                {/* Pagination Controls */}
                <div className="flex justify-center items-center mt-8 space-x-2">
                    <button 
                        onClick={() => setCurrentPage(c => Math.max(1, c - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-bg-tertiary rounded-lg text-text-secondary disabled:opacity-50 hover:bg-bg-secondary transition"
                    >
                        Previous
                    </button>
                    <span className="text-text-primary">Page {currentPage} of {totalPages}</span>
                    <button 
                        onClick={() => setCurrentPage(c => Math.min(totalPages, c + 1))}
                        disabled={currentPage === totalPages || totalPages === 0}
                        className="px-4 py-2 bg-bg-tertiary rounded-lg text-text-secondary disabled:opacity-50 hover:bg-bg-secondary transition"
                    >
                        Next
                    </button>
                </div>
            </>
        );
    };


    return (
        <div className="min-h-screen bg-bg-primary text-text-primary font-sans antialiased">
            {/* Header/Filter Bar */}
            <div className="sticky top-0 z-10 bg-bg-primary/95 backdrop-blur-md border-b border-border-primary py-4">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        
                        {/* Search Bar and Style Tabs */}
                        <div className="flex-grow flex flex-col sm:flex-row gap-4">
                            <div className="relative w-full sm:max-w-xs">
                                <input
                                    type="text"
                                    placeholder="Search emojis (min 3 chars)..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full h-10 pl-10 pr-4 text-sm bg-bg-tertiary border border-border-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                />
                                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                            </div>

                            <Tabs 
                                tabs={emojiStyles}
                                selectedValue={selectedStyle}
                                onSelect={(value) => setSelectedStyle(value as EmojiStyle)}
                                className="hidden sm:block"
                            />
                            <div className="sm:hidden">
                                <select
                                    aria-label="Emoji style"
                                    value={selectedStyle}
                                    onChange={(e) => setSelectedStyle(e.target.value as EmojiStyle)}
                                    className="w-full h-10 pl-4 pr-10 text-sm bg-bg-tertiary border border-border-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none"
                                >
                                    {emojiStyles.map(s => (
                                        <option key={s.value} value={s.value}>{s.label}</option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-text-tertiary">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                </div>
                            </div>
                        </div>

                        {/* Category Filter */}
                        <div className="w-full md:w-auto">
                            <div className="hidden lg:block">
                                <select
                                    aria-label="Emoji category"
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="h-10 pl-4 pr-10 text-sm bg-bg-tertiary border border-border-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none"
                                >
                                    {emojiCategories.map(cat => (
                                        <option key={cat.value} value={cat.value}>
                                            {cat.icon} {cat.label}
                                        </option>
                                    ))}
                                </select>
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
            
            <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
                {renderGridContent()}
            </div>

            <AppModal isOpen={!!modalItem} onClose={handleCloseModal} title={modalItem?.emoji.name || ''}>
                {/* The EmojiDetail component will now use the WebP URL for display, 
                    and the animDownloadUrl for the download button when style is 'Anim' */}
                {modalItem && <EmojiDetail data={modalItem} />}
            </AppModal>
        </div>
    );
};

export default EmojiPage;
