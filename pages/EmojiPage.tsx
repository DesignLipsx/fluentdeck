import React, { useState, useMemo, useEffect, useContext, useRef, useCallback, memo } from "react";
import { useLocation } from "react-router-dom";
import { EmojiData, emojiStyles, EmojiStyle } from "../constants";
import { CheckmarkIcon, EmojiIcon, AddIcon } from "../components/Icons";
import { Tabs } from "../components/SegmentedControl";
import { AppContext, usePersistentState, CollectionsContext } from "../App";
import { CategoryFilter } from "../components/CategoryFilter";
import { ContextMenu, ContextMenuItem, ContextSubMenuTrigger } from "../components/ContextMenu";
import EmojiCard from "../components/EmojiCard";
import { CreateCollectionModal } from "../components/CreateCollectionModal";
import SearchBar from "../components/SearchBar";
import { CollectionItem } from "../types";
import FilterLayout from "../components/FilterLayout";
import { EmojiDetailView } from "../components/EmojiDetailView";
import GridSkeleton from "../components/GridSkeleton";

type StyleKey = keyof EmojiStyle;

const FilterBar = memo(({
	searchTerm,
	onSearchTermChange,
	isLoading,
	emojiCount,
	searchAnalysis,
	selectedStyle,
	onStyleChange,
	selectedCategory,
	onCategoryChange,
	styleOptions
}: {
	searchTerm: string;
	onSearchTermChange: (term: string) => void;
	isLoading: boolean;
	emojiCount: number;
	searchAnalysis: Array<{ term: string; found: boolean }>;
	selectedStyle: StyleKey;
	onStyleChange: (style: StyleKey) => void;
	selectedCategory: string;
	onCategoryChange: (category: string) => void;
	styleOptions: Array<{ value: string; label: string }>;
}) => (
	<div className="flex flex-col lg:flex-row gap-4 lg:items-start">
		<div className="w-full lg:flex-1">
			<SearchBar
				searchTerm={searchTerm}
				onSearchTermChange={onSearchTermChange}
				placeholder={isLoading ? 'Loading emojis...' : `Search ${emojiCount} emojis...`}
				isLoading={isLoading}
			/>
			{searchTerm.includes(',') && searchAnalysis.length > 0 && (
				<div className="flex flex-wrap gap-2 mt-2" aria-live="polite">
					{searchAnalysis.map(({ term, found }) => (
						<span
							key={term}
							className={`px-2 py-1 text-xs rounded-full ${found ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 line-through'}`}
						>
							{term}
						</span>
					))}
				</div>
			)}
		</div>

		<div className="w-full lg:w-auto flex flex-col sm:flex-row gap-4">
			<div className="w-full sm:w-auto flex-shrink-0">
				<Tabs options={styleOptions} value={selectedStyle} onChange={onStyleChange} />
			</div>
			<CategoryFilter selectedCategory={selectedCategory} onCategoryChange={onCategoryChange} />
		</div>
	</div>
));
FilterBar.displayName = 'FilterBar';

const EmojiPage: React.FC = () => {
	const [searchTerm, setSearchTerm] = usePersistentState<string>("emoji-searchTerm", "");
	const [selectedStyle, setSelectedStyle] = usePersistentState<StyleKey>("emoji-selectedStyle", emojiStyles[0].value);
	const [selectedCategory, setSelectedCategory] = usePersistentState<string>("emoji-selectedCategory", "All");
	const [contextMenu, setContextMenu] = useState<{ x: number, y: number, item: EmojiData & { name: string } } | null>(null);
	const [showCreateCollectionModal, setShowCreateCollectionModal] = useState(false);
	const [itemForNewCollection, setItemForNewCollection] = useState<(EmojiData & { name: string }) | null>(null);
	const [displayCount, setDisplayCount] = useState(50); // Reduced from 100 to 50
	const [selectedEmoji, setSelectedEmoji] = useState<(EmojiData & { name: string }) | null>(null);
	const [detailViewStyle, setDetailViewStyle] = useState<StyleKey>(selectedStyle);

	const appContext = useContext(AppContext);
	if (!appContext) throw new Error("AppContext not found");
	const { emojiMap: emojis, isLoadingEmojis, isSelectionMode, startSelectionMode, selectAll, isItemSelected, toggleSelection } = appContext;

	const collectionsContext = useContext(CollectionsContext);
	if (!collectionsContext) throw new Error("CollectionsContext not found");
	const { getCollectionNames, createCollection, addItemToCollection, removeItemFromCollection, isItemInCollection, getCollectionType } = collectionsContext;

	const location = useLocation();

	const hasData = Object.keys(emojis).length > 0;
	const showSkeleton = isLoadingEmojis && !hasData;

	// Set document metadata
	useEffect(() => {
		document.title = 'Fluent Deck | Emoji';
		
		// Set or update canonical link
		let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
		if (!canonicalLink) {
			canonicalLink = document.createElement('link');
			canonicalLink.rel = 'canonical';
			document.head.appendChild(canonicalLink);
		}
		canonicalLink.href = `${window.location.origin}/emoji`;

		// Set or update meta description
		let metaDescription = document.querySelector('meta[name="description"]') as HTMLMetaElement;
		if (!metaDescription) {
			metaDescription = document.createElement('meta');
			metaDescription.name = 'description';
			document.head.appendChild(metaDescription);
		}
		metaDescription.content = "Explore the full collection of Microsoft's open-source Fluent Emojis in 3D, Color, Flat, and High Contrast styles.";

		return () => {
			document.title = 'Fluent Deck';
		};
	}, []);

	// convert emoji map to array
	const emojiArray = useMemo(() => Object.entries(emojis).map(([name, data]) => ({ name, ...(data as EmojiData), styles: (data as EmojiData).styles || {} })), [emojis]);

	// Calculate the number of emojis available for the currently selected style
	const availableEmojiCount = useMemo(() => {
		return emojiArray.filter(emoji => emoji.styles?.[selectedStyle]).length;
	}, [emojiArray, selectedStyle]);

	// filter + multi-term logic
	const { filteredEmojis, searchAnalysis } = useMemo(() => {
		const baseFiltered = emojiArray.filter(emoji => {
			const styleUrl = emoji.styles?.[selectedStyle];
			if (!styleUrl) return false;
			if (selectedCategory !== 'All' && emoji.group !== selectedCategory) return false;
			return true;
		});

		const trimmedSearchTerm = searchTerm.trim();
		if (!trimmedSearchTerm) return { filteredEmojis: baseFiltered, searchAnalysis: [] };

		const lowercasedSearchTerm = trimmedSearchTerm.toLowerCase();
		const hasTrailingComma = lowercasedSearchTerm.endsWith(',');
		const searchTerms = lowercasedSearchTerm.split(',').map(t => t.trim()).filter(Boolean);

		if (searchTerms.length === 0) return { filteredEmojis: baseFiltered, searchAnalysis: [] };

		const analysis = searchTerms.map((term, idx) => {
			const isLastTerm = idx === searchTerms.length - 1;
			const found = baseFiltered.some(emoji => {
				const lowerName = emoji.name.toLowerCase();
				const lowerKeywords = emoji.keywords?.map(k => k.toLowerCase()) || [];
				if (isLastTerm && !hasTrailingComma) return lowerName.includes(term) || lowerKeywords.some(k => k.includes(term));
				return lowerName === term;
			});
			return { term, found };
		});

		const searchFiltered = baseFiltered.filter(emoji => {
			const lowerName = emoji.name.toLowerCase();
			const lowerKeywords = emoji.keywords?.map(k => k.toLowerCase()) || [];
			if (!searchTerm.includes(',')) {
				return lowerName.includes(lowercasedSearchTerm) || lowerKeywords.some(k => k.includes(lowercasedSearchTerm));
			}
			return searchTerms.some((term, index) => {
				const isLastTerm = index === searchTerms.length - 1;
				if (isLastTerm && !hasTrailingComma) {
					return lowerName.includes(term) || lowerKeywords.some(k => k.includes(term));
				} else {
					return lowerName === term;
				}
			});
		});

		return { filteredEmojis: searchFiltered, searchAnalysis: analysis };
	}, [searchTerm, emojiArray, selectedStyle, selectedCategory]);

	const allItemsForSelection = useMemo(() => filteredEmojis.map(e => ({ ...e, style: selectedStyle, itemType: 'emoji' } as CollectionItem)), [filteredEmojis, selectedStyle]);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			const target = event.target as HTMLElement;
			if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;
			if ((event.ctrlKey || event.metaKey) && event.key === 'a') {
				event.preventDefault();
				selectAll(allItemsForSelection);
			}
		};
		document.addEventListener('keydown', handleKeyDown);
		return () => document.removeEventListener('keydown', handleKeyDown);
	}, [selectAll, allItemsForSelection]);

	useEffect(() => setDisplayCount(50), [searchTerm, selectedStyle, selectedCategory]); // Reset to 50
	
	const emojisToDisplay = useMemo(() => filteredEmojis.slice(0, displayCount), [filteredEmojis, displayCount]);

	const observer = useRef<IntersectionObserver | null>(null);
	const loadMoreRef = useCallback((node: HTMLDivElement | null) => {
		if (showSkeleton) return;
		if (observer.current) observer.current.disconnect();
		observer.current = new IntersectionObserver(entries => {
			if (entries[0].isIntersecting && displayCount < filteredEmojis.length) {
				setDisplayCount(prev => prev + 50); // Load 50 at a time
			}
		});
		if (node) observer.current.observe(node);
	}, [showSkeleton, displayCount, filteredEmojis.length]);

	const handleEmojiClick = useCallback((emoji: EmojiData & { name: string }) => {
		if (!isSelectionMode) {
			if (selectedEmoji?.name === emoji.name) {
				setSelectedEmoji(null);
			} else {
				setDetailViewStyle(selectedStyle);
				setSelectedEmoji(emoji);
			}
		}
	}, [selectedEmoji, selectedStyle, isSelectionMode]);

	const handleDetailViewStyleChange = useCallback((newStyle: StyleKey) => {
		setDetailViewStyle(newStyle);
	}, []);

	useEffect(() => {
		if (selectedEmoji) {
			setDetailViewStyle(selectedStyle);
		}
	}, [selectedStyle, selectedEmoji]);

	const handleContextMenu = useCallback((event: React.MouseEvent, emoji: EmojiData & { name: string }) => { 
		event.preventDefault(); 
		setContextMenu({ x: event.clientX, y: event.clientY, item: emoji }); 
	}, []);

	const closeContextMenu = useCallback(() => setContextMenu(null), []);

	const handleOpenCreateCollectionModal = useCallback(() => { 
		if (contextMenu) setItemForNewCollection(contextMenu.item); 
		closeContextMenu(); 
		setShowCreateCollectionModal(true); 
	}, [contextMenu, closeContextMenu]);

	const handleCreateCollection = useCallback((newName: string) => {
		if (newName && newName.trim() && itemForNewCollection) {
			if (createCollection(newName.trim())) {
				const newItem: CollectionItem = {
					...itemForNewCollection,
					style: selectedStyle,
					itemType: 'emoji'
				};
				addItemToCollection(newName.trim(), newItem, 'emoji');
			}
			else alert(`Collection "${newName.trim()}" already exists.`);
		}
		setShowCreateCollectionModal(false);
		setItemForNewCollection(null);
	}, [itemForNewCollection, createCollection, selectedStyle, addItemToCollection]);

	const handleStyleChange = useCallback((v: string) => setSelectedStyle(v as StyleKey), [setSelectedStyle]);
	const styleOptions = useMemo(() => emojiStyles.map(s => ({ value: s.value, label: s.label, tooltip: s.tooltip })), []);

	return (
		<>
			<FilterLayout
				titleIcon={<EmojiIcon className="w-8 h-8 text-gray-900 dark:text-text-primary" />}
				title="Fluent Emojis"
				description="Explore the full collection of Microsoft's open-source Fluent Emojis. Search by name or keyword, and filter by style to find the perfect emoji for your project."
				filterBarContent={
					<FilterBar
						searchTerm={searchTerm}
						onSearchTermChange={setSearchTerm}
						isLoading={showSkeleton}
						emojiCount={availableEmojiCount}
						searchAnalysis={searchAnalysis}
						selectedStyle={selectedStyle}
						onStyleChange={handleStyleChange}
						selectedCategory={selectedCategory}
						onCategoryChange={setSelectedCategory}
						styleOptions={styleOptions}
					/>
				}
				isLoading={showSkeleton}
				skeleton={<GridSkeleton />}
				loadMoreRef={loadMoreRef as unknown as React.RefObject<HTMLDivElement>}
			>
				{/* Remove PageReveal wrapper to eliminate render delay */}
				<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-8 gap-4">
					{emojisToDisplay.map((emoji, index) => {
						const item = { ...emoji, style: selectedStyle, itemType: 'emoji' as const };
						const isPriority = index < 20;
						return (
							<EmojiCard
								key={`${emoji.name}-${selectedStyle}`}
								emoji={emoji}
								selectedStyle={selectedStyle}
								onCardClick={handleEmojiClick}
								onCardContextMenu={handleContextMenu}
								isSelectionMode={isSelectionMode}
								isSelected={isItemSelected(item, 'emoji')}
								onToggleSelection={() => toggleSelection(item, 'emoji')}
								isPriority={isPriority}
							/>
						);
					})}
				</div>

				{!showSkeleton && filteredEmojis.length === 0 && (
					<div className="text-center py-10">
						<p className="text-gray-500 dark:text-text-secondary">No emojis found. Try adjusting your filters.</p>
					</div>
				)}
			</FilterLayout>

			{contextMenu && (
				<ContextMenu x={contextMenu.x} y={contextMenu.y} onClose={closeContextMenu}>
					<ContextMenuItem onClick={() => { 
						const item = { ...contextMenu.item, style: selectedStyle }; 
						startSelectionMode(item, 'emoji', location.pathname); 
						closeContextMenu(); 
					}}>
						<div className="flex items-center gap-2"><CheckmarkIcon className="w-4 h-4" /><span>Select</span></div>
					</ContextMenuItem>

					<ContextSubMenuTrigger subMenu={
						<>
							{getCollectionNames().map(name => {
								const collectionItem = { ...contextMenu.item, style: selectedStyle };
								const collectionType = getCollectionType(name);
								const isDisabled = collectionType === 'app';
								const isInCollection = isItemInCollection(name, collectionItem, 'emoji');
								return (
									<ContextMenuItem 
										key={name} 
										onClick={() => { 
											if (isInCollection) removeItemFromCollection(name, collectionItem, 'emoji'); 
											else addItemToCollection(name, collectionItem, 'emoji'); 
										}} 
										disabled={isDisabled}
									>
										<div className="flex items-center justify-between w-full">
											<span>{name}</span>
											{isInCollection && <CheckmarkIcon className="w-4 h-4 text-blue-500" />}
										</div>
									</ContextMenuItem>
								);
							})}
							<div className="h-px my-1 bg-gray-200 dark:bg-border-primary" />
							<ContextMenuItem onClick={handleOpenCreateCollectionModal}>
								<div className="flex items-center gap-2"><AddIcon className="w-4 h-4" /><span>New Collection...</span></div>
							</ContextMenuItem>
						</>
					}>
						<div className="flex items-center gap-2"><AddIcon className="w-4 h-4" /><span>Add to Collection</span></div>
					</ContextSubMenuTrigger>
				</ContextMenu>
			)}

			{showCreateCollectionModal && (
				<CreateCollectionModal 
					isOpen={showCreateCollectionModal} 
					onClose={() => setShowCreateCollectionModal(false)} 
					onCreate={handleCreateCollection} 
				/>
			)}

			{selectedEmoji && (
				<EmojiDetailView
					emoji={selectedEmoji}
					selectedStyle={detailViewStyle}
					onClose={() => setSelectedEmoji(null)}
					onStyleChange={handleDetailViewStyleChange}
				/>
			)}
		</>
	);
};

export default EmojiPage;