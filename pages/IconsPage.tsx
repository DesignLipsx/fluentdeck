import React, { useState, useMemo, useEffect, useContext, useRef, useCallback, memo } from 'react';
import { useLocation } from 'react-router-dom';
import { iconStyles, ICON_METADATA_URL } from '../constants';
import { CheckmarkIcon, FluentIconsIcon, AddIcon } from '../components/Icons';
import { Tabs } from '../components/SegmentedControl';
import { AppContext, usePersistentState, CollectionsContext } from '../App';
import { fetchWithCache } from '../utils';
import { IconStyleType, IconType, CollectionItem } from '../types';
import { ContextMenu, ContextMenuItem, ContextSubMenuTrigger } from '../components/ContextMenu';
import IconCard from '../components/IconCard';
import { CreateCollectionModal } from '../components/CreateCollectionModal';
import SearchBar from '../components/SearchBar';
import { IconDetailView } from '../components/IconDetailView';
import FilterLayout from '../components/FilterLayout';
import PageReveal from "../components/PageReveal";
import GridSkeleton from '../components/GridSkeleton';

const FilterBar = memo(({
	searchTerm,
	onSearchTermChange,
	isLoading,
	iconCount,
	searchAnalysis,
	selectedStyle,
	onStyleChange,
	styleOptions
}: {
	searchTerm: string;
	onSearchTermChange: (term: string) => void;
	isLoading: boolean;
	iconCount: number;
	searchAnalysis: Array<{ term: string; found: boolean }>;
	selectedStyle: IconStyleType;
	onStyleChange: (style: IconStyleType) => void;
	styleOptions: Array<{ value: string; label: string }>;
}) => (
	<div className="w-full flex flex-col lg:flex-row gap-4 lg:items-start">
		<div className="w-full lg:flex-1">
			<SearchBar
				searchTerm={searchTerm}
				onSearchTermChange={onSearchTermChange}
				placeholder={isLoading ? 'Loading icons...' : `Search ${iconCount} icons...`}
				isLoading={isLoading}
			/>
			{searchTerm.includes(',') && searchAnalysis.length > 0 && (
				<div className="flex flex-wrap gap-2 mt-2">
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
		<div className="flex-shrink-0 w-full lg:w-auto">
			<Tabs options={styleOptions} value={selectedStyle} onChange={onStyleChange} />
		</div>
	</div>
));
FilterBar.displayName = 'FilterBar';

const IconsPage: React.FC = () => {
	const [searchTerm, setSearchTerm] = usePersistentState<string>('icons-searchTerm', '');
	const [allIcons, setAllIcons] = useState<{ [key: string]: IconType[] }>({ Filled: [], Regular: [], Color: [] });
	const [isLoading, setIsLoading] = useState(true);
	const [selectedStyle, setSelectedStyle] = usePersistentState<IconStyleType>('icons-selectedStyle', 'Filled');
	const [contextMenu, setContextMenu] = useState<{ x: number, y: number, item: IconType } | null>(null);
	const [showCreateCollectionModal, setShowCreateCollectionModal] = useState(false);
	const [itemForNewCollection, setItemForNewCollection] = useState<IconType | null>(null);
	const [selectedIcon, setSelectedIcon] = useState<IconType | null>(null);
	const [detailViewStyle, setDetailViewStyle] = useState<IconStyleType>(selectedStyle);
	const [displayCount, setDisplayCount] = useState(50); // Reduced initial load from 100 to 50

	const appContext = useContext(AppContext);
	if (!appContext) throw new Error("AppContext not found");
	const { isSelectionMode, toggleSelection, startSelectionMode, isItemSelected, selectAll } = appContext;

	const collectionsContext = useContext(CollectionsContext);
	if (!collectionsContext) throw new Error('CollectionsContext not found');
	const { getCollectionNames, createCollection, addItemToCollection, removeItemFromCollection, isItemInCollection, getCollectionType } = collectionsContext;

	const location = useLocation();

	// Set document metadata
	useEffect(() => {
		document.title = 'Fluent Deck | Icons';
		
		// Set or update canonical link
		let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
		if (!canonicalLink) {
			canonicalLink = document.createElement('link');
			canonicalLink.rel = 'canonical';
			document.head.appendChild(canonicalLink);
		}
		canonicalLink.href = `${window.location.origin}/icons`;

		// Set or update meta description
		let metaDescription = document.querySelector('meta[name="description"]') as HTMLMetaElement;
		if (!metaDescription) {
			metaDescription = document.createElement('meta');
			metaDescription.name = 'description';
			document.head.appendChild(metaDescription);
		}
		metaDescription.content = "Browse Microsoft's Fluent System Icons. Explore thousands of high-quality icons in Filled, Regular, and Color styles.";

		return () => {
			// Cleanup on unmount
			document.title = 'Fluent Deck';
		};
	}, []);

	// fetch icons metadata with priority
	useEffect(() => {
		const fetchIcons = async () => {
			setIsLoading(true);
			try {
				const iconMetadata = await fetchWithCache('icon-metadata', ICON_METADATA_URL);
				if (!iconMetadata || !Array.isArray(iconMetadata.icons) || !Array.isArray(iconMetadata.columns)) { setIsLoading(false); return; }
				const iconsByStyle: { [k: string]: IconType[] } = { Filled: [], Regular: [], Color: [] };
				const { columns, icons } = iconMetadata;
				const nameIndex = columns.indexOf('name');
				const regularIndex = columns.indexOf('Regular');
				const filledIndex = columns.indexOf('Filled');
				const colorIndex = columns.indexOf('Color');

				icons.forEach((iconData: string[]) => {
					const icon: IconType = {
						name: iconData[nameIndex],
						styles: {},
						filename: undefined,
						svgFileName: undefined
					};
					if (iconData[filledIndex]) icon.styles.Filled = iconData[filledIndex];
					if (iconData[regularIndex]) icon.styles.Regular = iconData[regularIndex];
					if (iconData[colorIndex]) icon.styles.Color = iconData[colorIndex];
					if (icon.styles.Filled) iconsByStyle.Filled.push(icon);
					if (icon.styles.Regular) iconsByStyle.Regular.push(icon);
					if (icon.styles.Color) iconsByStyle.Color.push(icon);
				});

				setAllIcons(iconsByStyle);
			} catch (err) {
				console.error('Failed to fetch icon metadata:', err);
			} finally {
				setIsLoading(false);
			}
		};
		fetchIcons();
	}, []);

	useEffect(() => setDisplayCount(50), [searchTerm, selectedStyle]); // Reset to 50

	const { filteredIcons, searchAnalysis } = useMemo(() => {
		const iconsForStyle = allIcons[selectedStyle] || [];
		const trimmed = searchTerm.trim();
		if (trimmed === '') return { filteredIcons: iconsForStyle, searchAnalysis: [] };

		const lower = trimmed.toLowerCase();
		const hasTrailingComma = lower.endsWith(',');
		const terms = lower.split(',').map(t => t.trim()).filter(Boolean);
		if (terms.length === 0) return { filteredIcons: iconsForStyle, searchAnalysis: [] };

		const iconMatchesTerm = (icon: IconType, term: string, exact: boolean) => {
			const name = icon.name.toLowerCase();
			if (exact) return name === term;
			return name.includes(term);
		};

		const analysis = terms.map((term, idx) => {
			const isLast = idx === terms.length - 1;
			const exact = !(isLast && !hasTrailingComma);
			const found = iconsForStyle.some(icon => iconMatchesTerm(icon, term, exact));
			return { term, found };
		});

		const filtered = iconsForStyle.filter(icon => {
			if (!searchTerm.includes(',')) return iconMatchesTerm(icon, lower, false);
			return terms.some((term, idx) => {
				const isLast = idx === terms.length - 1;
				const exact = !(isLast && !hasTrailingComma);
				return iconMatchesTerm(icon, term, exact);
			});
		});

		return { filteredIcons: filtered, searchAnalysis: analysis };
	}, [searchTerm, allIcons, selectedStyle]);

	const allItemsForSelection = useMemo(() => filteredIcons.map(icon => ({ ...icon, style: selectedStyle, itemType: 'icon' } as CollectionItem)), [filteredIcons, selectedStyle]);

	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			const target = e.target as HTMLElement;
			if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;
			if ((e.ctrlKey || e.metaKey) && e.key === 'a') { e.preventDefault(); selectAll(allItemsForSelection); }
		};
		document.addEventListener('keydown', onKey);
		return () => document.removeEventListener('keydown', onKey);
	}, [selectAll, allItemsForSelection]);

	const iconsToDisplay = useMemo(() => filteredIcons.slice(0, displayCount), [filteredIcons, displayCount]);

	const observer = useRef<IntersectionObserver | null>(null);
	const loadMoreRef = useCallback((node: HTMLDivElement | null) => {
		if (isLoading) return;
		if (observer.current) observer.current.disconnect();
		observer.current = new IntersectionObserver(entries => {
			if (entries[0].isIntersecting && displayCount < filteredIcons.length) setDisplayCount(prev => prev + 50); // Load 50 at a time
		});
		if (node) observer.current.observe(node);
	}, [isLoading, displayCount, filteredIcons.length]);

	const handleIconClick = useCallback((icon: IconType) => {
		if (selectedIcon?.name === icon.name) {
			setSelectedIcon(null);
		} else {
			setDetailViewStyle(selectedStyle);
			setSelectedIcon(icon);
		}
	}, [selectedIcon, selectedStyle]);

	const handleContextMenu = useCallback((e: React.MouseEvent, icon: IconType) => { e.preventDefault(); setContextMenu({ x: e.clientX, y: e.clientY, item: icon }); }, []);
	const closeContextMenu = useCallback(() => setContextMenu(null), []);

	const handleDetailViewStyleChange = useCallback((newStyle: IconStyleType) => {
		if (selectedIcon && selectedIcon.styles[newStyle]) {
			setDetailViewStyle(newStyle);
		}
	}, [selectedIcon]);

	const handleOpenCreateCollectionModal = useCallback(() => { if (contextMenu) setItemForNewCollection(contextMenu.item); closeContextMenu(); setShowCreateCollectionModal(true); }, [contextMenu, closeContextMenu]);
	const handleCreateCollection = useCallback((newName: string) => {
		if (newName && newName.trim() && itemForNewCollection) {
			if (createCollection(newName.trim())) {
				const newItem: CollectionItem = {
					...itemForNewCollection,
					style: selectedStyle,
					itemType: 'icon'
				};

				addItemToCollection(newName.trim(), newItem, 'icon');
			}
			else alert(`Collection "${newName.trim()}" already exists.`);
		}
		setShowCreateCollectionModal(false);
		setItemForNewCollection(null);
	}, [itemForNewCollection, createCollection, selectedStyle, addItemToCollection]);

	const handleStyleChange = useCallback((v: string) => setSelectedStyle(v as IconStyleType), [setSelectedStyle]);
	const styleOptions = useMemo(() => iconStyles.map(s => ({ value: s.value, label: s.label, tooltip: s.tooltip })), []);

	return (
		<>
			<FilterLayout
				titleIcon={<FluentIconsIcon className="w-8 h-8 text-gray-900 dark:text-text-primary" />}
				title="Fluent System Icons"
				description="Browse Microsoft's Fluent System Icons. Use commas to search multiple names (exact matches for earlier terms, partial for the last)."
				filterBarContent={
					<FilterBar
						searchTerm={searchTerm}
						onSearchTermChange={setSearchTerm}
						isLoading={isLoading}
						iconCount={(allIcons[selectedStyle] || []).length}
						searchAnalysis={searchAnalysis}
						selectedStyle={selectedStyle}
						onStyleChange={handleStyleChange}
						styleOptions={styleOptions}
					/>
				}
				isLoading={isLoading}
				skeleton={<GridSkeleton />}
				loadMoreRef={loadMoreRef as unknown as React.RefObject<HTMLDivElement>}
			>
				{/* Remove PageReveal wrapper to eliminate render delay */}
				<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-8 gap-4">
					{iconsToDisplay.map((icon, index) => (
						<IconCard
							key={`${icon.name}-${index}`}
							icon={icon}
							selectedStyle={selectedStyle}
							onCardClick={handleIconClick}
							onCardContextMenu={handleContextMenu}
							isSelectionMode={isSelectionMode}
							isSelected={isItemSelected({ ...icon, style: selectedStyle } as Omit<CollectionItem, 'itemType'>, 'icon')}
							onToggleSelection={toggleSelection}
							isPriority={index < 20}
						/>
					))}
				</div>

				{!isLoading && filteredIcons.length === 0 && (
					<div className="text-center py-10"><p className="text-gray-500 dark:text-text-secondary">No icons found. Try adjusting your search.</p></div>
				)}
			</FilterLayout>
			
			{contextMenu && (
				<ContextMenu x={contextMenu.x} y={contextMenu.y} onClose={closeContextMenu}>
					<ContextMenuItem onClick={() => { const item = { ...contextMenu.item, style: selectedStyle } as Omit<CollectionItem, 'itemType'>; startSelectionMode(item, 'icon', location.pathname); closeContextMenu(); }}>
						<div className="flex items-center gap-2"><CheckmarkIcon className="w-4 h-4" /><span>Select</span></div>
					</ContextMenuItem>

					<ContextSubMenuTrigger subMenu={
						<>
							{getCollectionNames().map(name => {
								const collectionItem = { ...contextMenu.item, style: selectedStyle } as Omit<CollectionItem, 'itemType'>;
								const isDisabled = getCollectionType(name) === 'app';
								const isInCollection = isItemInCollection(name, collectionItem, 'icon');
								return (
									<ContextMenuItem key={name} onClick={() => { if (isInCollection) removeItemFromCollection(name, collectionItem, 'icon'); else addItemToCollection(name, collectionItem, 'icon'); }} disabled={isDisabled}>
										<div className="flex items-center justify-between w-full"><span>{name}</span>{isInCollection && <CheckmarkIcon className="w-4 h-4 text-blue-500" />}</div>
									</ContextMenuItem>
								);
							})}
							<div className="h-px my-1 bg-gray-200 dark:bg-border-primary" />
							<ContextMenuItem onClick={handleOpenCreateCollectionModal}><div className="flex items-center gap-2"><AddIcon className="w-4 h-4" /><span>New Collection...</span></div></ContextMenuItem>
						</>
					}>
						<div className="flex items-center gap-2"><AddIcon className="w-4 h-4" /><span>Add to Collection</span></div>
					</ContextSubMenuTrigger>
				</ContextMenu>
			)}

			{showCreateCollectionModal && <CreateCollectionModal isOpen={showCreateCollectionModal} onClose={() => setShowCreateCollectionModal(false)} onCreate={handleCreateCollection} />}

			{selectedIcon && (
				<IconDetailView
					icon={selectedIcon}
					selectedStyle={detailViewStyle}
					onClose={() => setSelectedIcon(null)}
					onStyleChange={handleDetailViewStyleChange}
				/>
			)}
		</>
	);
};

export default IconsPage;