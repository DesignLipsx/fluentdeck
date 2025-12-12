import React, { useState, useMemo, useEffect, useContext, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { EmojiData, emojiStyles, EmojiStyle } from "../constants";
import { CheckmarkIcon, EmojiIcon, AddIcon } from "../components/Icons";
import { AppContext, usePersistentState, CollectionsContext } from "../App";
import { CategoryFilter } from "../components/CategoryFilter";
import { ContextMenu, ContextMenuItem, ContextSubMenuTrigger } from "../components/ContextMenu";
import EmojiCard from "../components/EmojiCard";
import { CreateCollectionModal } from "../components/CreateCollectionModal";
import { CollectionItem } from "../types";
import FilterLayout from "../components/FilterLayout";
import { EmojiDetailView } from "../components/EmojiDetailView";
import GridSkeleton from "../components/GridSkeleton";
import GalleryFilterBar from "../components/GalleryFilterBar";
import { 
    useGallerySearch, 
    useInfiniteScroll, 
    useDeepLinkHandler, 
    useScrollToItem, 
    useSelectionShortcut 
} from "../hooks/useGallery";

type StyleKey = keyof EmojiStyle;

const EmojiPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = usePersistentState<string>("emoji-searchTerm", "");
    const [selectedStyle, setSelectedStyle] = usePersistentState<StyleKey>("emoji-selectedStyle", emojiStyles[0].value);
    const [selectedCategory, setSelectedCategory] = usePersistentState<string>("emoji-selectedCategory", "All");
    
    // UI State
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, item: EmojiData & { name: string } } | null>(null);
    const [showCreateCollectionModal, setShowCreateCollectionModal] = useState(false);
    const [itemForNewCollection, setItemForNewCollection] = useState<(EmojiData & { name: string }) | null>(null);
    
    // Selection & Detail View
    const [selectedEmoji, setSelectedEmoji] = useState<(EmojiData & { name: string }) | null>(null);
    const [detailViewStyle, setDetailViewStyle] = useState<StyleKey>(selectedStyle);

    const appContext = useContext(AppContext);
    if (!appContext) throw new Error("AppContext not found");
    const { emojiMap: emojis, isLoadingEmojis, isSelectionMode, startSelectionMode, selectAll, isItemSelected, toggleSelection } = appContext;

    const collectionsContext = useContext(CollectionsContext);
    if (!collectionsContext) throw new Error("CollectionsContext not found");
    const { getCollectionNames, createCollection, addItemToCollection, removeItemFromCollection, isItemInCollection, getCollectionType } = collectionsContext;

    const location = useLocation();

    // --- Meta Tags ---
    useEffect(() => {
        document.title = 'Fluent Deck | Fleunt Emoji';
        let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
        if (!link) { link = document.createElement('link'); link.rel = 'canonical'; document.head.appendChild(link); }
        link.href = `${window.location.origin}/emoji`;
        let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement;
        if (!meta) { meta = document.createElement('meta'); meta.name = 'description'; document.head.appendChild(meta); }
        meta.content = "Explore Microsoft's open-source Fluent Emojis.";
        return () => { document.title = 'Fluent Deck'; };
    }, []);

    // --- Data Prep ---
    const emojiArray = useMemo(() => Object.entries(emojis).map(([name, data]) => ({ name, ...(data as EmojiData), styles: (data as EmojiData).styles || {} })), [emojis]);
    
    const hasData = emojiArray.length > 0;
    const showSkeleton = isLoadingEmojis && !hasData;

    // --- Filtering Logic (Hook) ---
    const baseFiltered = useMemo(() => emojiArray.filter(emoji => {
        const styleUrl = emoji.styles?.[selectedStyle];
        if (!styleUrl) return false;
        if (selectedCategory !== 'All' && emoji.group !== selectedCategory) return false;
        return true;
    }), [emojiArray, selectedStyle, selectedCategory]);

    const emojiMatcher = useCallback((emoji: EmojiData & { name: string }, term: string, exact: boolean) => {
        const lowerName = emoji.name.toLowerCase();
        const lowerKeywords = emoji.keywords?.map(k => k.toLowerCase()) || [];
        if (exact) return lowerName === term;
        return lowerName.includes(term) || lowerKeywords.some(k => k.includes(term));
    }, []);

    const { filteredItems: filteredEmojis, searchAnalysis } = useGallerySearch(
        baseFiltered,
        searchTerm,
        emojiMatcher
    );

    // --- Infinite Scroll (Hook) ---
    useEffect(() => setDisplayCount(50), [searchTerm, selectedStyle, selectedCategory]);

    const { displayCount, setDisplayCount, loadMoreRef } = useInfiniteScroll(
        showSkeleton,
        filteredEmojis.length,
        50
    );

    const emojisToDisplay = useMemo(() => filteredEmojis.slice(0, displayCount), [filteredEmojis, displayCount]);

    // --- Deep Link Logic (Hook) ---
    const findEmojiByName = useCallback((name: string) => {
        const found = emojiArray.find(e => e.name === name);
        if (!found) return null;
        
        let style = selectedStyle;
        if (!found.styles[style]) {
             const keys = Object.keys(found.styles) as StyleKey[];
             if (keys.length > 0) style = keys[0];
        }
        return { item: found, style };
    }, [emojiArray, selectedStyle]);

    // Validates if the requested style exists for this emoji
    const onDeepLinkFound = useCallback((emoji: EmojiData & { name: string }, style?: string) => {
        let validStyle = style as StyleKey;

        // Validation: If style is missing or not supported by this emoji, fallback
        if (!style || !emoji.styles[validStyle]) {
            const availableStyles = Object.keys(emoji.styles) as StyleKey[];
            // Prefer currently selected style if available, otherwise first available
            validStyle = availableStyles.includes(selectedStyle) ? selectedStyle : availableStyles[0];
        }

        if (validStyle) setDetailViewStyle(validStyle);
        setSelectedEmoji(emoji);
    }, [selectedStyle]);

    useDeepLinkHandler(
        "/hooks/emoji_url.json",
        "/emoji/",
        hasData,
        findEmojiByName,
        onDeepLinkFound
    );

    // --- Scroll & Highlight Logic (Hook) ---
    useScrollToItem(
        selectedEmoji,
        filteredEmojis,
        displayCount,
        setDisplayCount,
        'data-emoji-name'
    );

    // --- Selection Shortcut (Hook) ---
    const allItemsForSelection = useMemo(() => 
        filteredEmojis.map(e => ({ ...e, style: selectedStyle, itemType: 'emoji' as const } as CollectionItem)), 
    [filteredEmojis, selectedStyle]);

    useSelectionShortcut(allItemsForSelection, selectAll);

    // --- Event Handlers ---
    const handleEmojiClick = useCallback((emoji: EmojiData & { name: string }) => {
        if (!isSelectionMode) {
            if (selectedEmoji?.name === emoji.name) setSelectedEmoji(null);
            else { setDetailViewStyle(selectedStyle); setSelectedEmoji(emoji); }
        }
    }, [selectedEmoji, selectedStyle, isSelectionMode]);

    const handleContextMenu = useCallback((e: React.MouseEvent, emoji: any) => { e.preventDefault(); setContextMenu({ x: e.clientX, y: e.clientY, item: emoji }); }, []);
    
    const handleCreateCollection = useCallback((newName: string) => {
        if (newName?.trim() && itemForNewCollection) {
            if (createCollection(newName.trim())) {
                const newItem = { ...itemForNewCollection, style: selectedStyle, itemType: 'emoji' as const };
                addItemToCollection(newName.trim(), newItem, 'emoji');
            } else alert(`Collection exists.`);
        }
        setShowCreateCollectionModal(false); setItemForNewCollection(null);
    }, [itemForNewCollection, createCollection, selectedStyle, addItemToCollection]);

    const styleOptions = useMemo(() => emojiStyles.map(s => ({ value: s.value, label: s.label, tooltip: s.tooltip })), []);

    return (
        <>
            <FilterLayout
                titleIcon={<EmojiIcon className="w-8 h-8 text-gray-900 dark:text-text-primary" />}
                title="Fluent Emojis"
                description="Explore the full collection of Microsoft's open-source Fluent Emojis."
                filterBarContent={
                    <GalleryFilterBar
                        searchTerm={searchTerm}
                        onSearchTermChange={setSearchTerm}
                        isLoading={showSkeleton}
                        itemCount={baseFiltered.length}
                        objectName="emojis"
                        searchAnalysis={searchAnalysis}
                        selectedStyle={selectedStyle}
                        onStyleChange={(s) => setSelectedStyle(s as StyleKey)}
                        styleOptions={styleOptions}
                    >
                        <CategoryFilter selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} />
                    </GalleryFilterBar>
                }
                isLoading={showSkeleton}
                skeleton={<GridSkeleton />}
                loadMoreRef={loadMoreRef as any}
            >
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-8 gap-4">
                    {emojisToDisplay.map((emoji, index) => {
                        const item = { ...emoji, style: selectedStyle, itemType: 'emoji' as const };
                        return (
                            <div key={`${emoji.name}-${selectedStyle}`} data-emoji-name={emoji.name}>
                                <EmojiCard
                                    emoji={emoji}
                                    selectedStyle={selectedStyle}
                                    isActive={selectedEmoji?.name === emoji.name}
                                    onCardClick={handleEmojiClick}
                                    onCardContextMenu={handleContextMenu}
                                    isSelectionMode={isSelectionMode}
                                    isSelected={isItemSelected(item, 'emoji')}
                                    onToggleSelection={() => toggleSelection(item, 'emoji')}
                                    isPriority={index < 20}
                                />
                            </div>
                        );
                    })}
                </div>
                {!showSkeleton && filteredEmojis.length === 0 && (
                    <div className="text-center py-10"><p className="text-gray-500">No emojis found.</p></div>
                )}
            </FilterLayout>

            {contextMenu && (
                <ContextMenu x={contextMenu.x} y={contextMenu.y} onClose={() => setContextMenu(null)}>
                    <ContextMenuItem onClick={() => { 
                        const item = { ...contextMenu.item, style: selectedStyle };
                        startSelectionMode(item, 'emoji', location.pathname); 
                        setContextMenu(null); 
                    }}>
                        <div className="flex items-center gap-2"><CheckmarkIcon className="w-4 h-4" /><span>Select</span></div>
                    </ContextMenuItem>
                    
                    <ContextSubMenuTrigger subMenu={
                        <>
                            {getCollectionNames().map((name: string) => {
                                const item = { ...contextMenu.item, style: selectedStyle };
                                const isDisabled = getCollectionType(name) === 'app';
                                const isChecked = isItemInCollection(name, item, 'emoji');

                                return (
                                    <ContextMenuItem 
                                        key={name} 
                                        disabled={isDisabled} 
                                        onClick={() => {
                                            if (isChecked) removeItemFromCollection(name, item, 'emoji');
                                            else addItemToCollection(name, item, 'emoji');
                                        }}
                                    >
                                        <div className="flex items-center justify-between w-full">
                                            <span>{name}</span>
                                            {isChecked && <CheckmarkIcon className="w-4 h-4 text-blue-500" />}
                                        </div>
                                    </ContextMenuItem>
                                );
                            })}
                            <div className="h-px my-1 bg-gray-200 dark:bg-border-primary" />
                            <ContextMenuItem onClick={() => { setItemForNewCollection(contextMenu.item); setContextMenu(null); setShowCreateCollectionModal(true); }}>
                                <div className="flex items-center gap-2"><AddIcon className="w-4 h-4" /><span>New Collection...</span></div>
                            </ContextMenuItem>
                        </>
                    }>
                        <div className="flex items-center gap-2"><AddIcon className="w-4 h-4" /><span>Add to Collection</span></div>
                    </ContextSubMenuTrigger>
                </ContextMenu>
            )}

            <CreateCollectionModal isOpen={showCreateCollectionModal} onClose={() => setShowCreateCollectionModal(false)} onCreate={handleCreateCollection} />

            {selectedEmoji && (
                <EmojiDetailView emoji={selectedEmoji} selectedStyle={detailViewStyle} onClose={() => setSelectedEmoji(null)} onStyleChange={setDetailViewStyle} />
            )}
        </>
    );
};

export default EmojiPage;