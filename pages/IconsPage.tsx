import React, { useState, useMemo, useEffect, useContext, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { iconStyles, ICON_METADATA_URL } from '../constants';
import { CheckmarkIcon, FluentIconsIcon, AddIcon } from '../components/Icons';
import { AppContext, usePersistentState, CollectionsContext } from '../App';
import { fetchWithCache } from '../utils';
import { IconStyleType, IconType, CollectionItem } from '../types';
import { ContextMenu, ContextMenuItem, ContextSubMenuTrigger } from '../components/ContextMenu';
import IconCard from '../components/IconCard';
import { CreateCollectionModal } from '../components/CreateCollectionModal';
import { IconDetailView } from '../components/IconDetailView';
import FilterLayout from '../components/FilterLayout';
import GridSkeleton from '../components/GridSkeleton';
import GalleryFilterBar from '../components/GalleryFilterBar';
import { 
    useGallerySearch, 
    useInfiniteScroll, 
    useDeepLinkHandler, 
    useScrollToItem, 
    useSelectionShortcut 
} from '../hooks/useGallery';

const IconsPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = usePersistentState<string>('icons-searchTerm', '');
    const [selectedStyle, setSelectedStyle] = usePersistentState<IconStyleType>('icons-selectedStyle', 'Filled');
    
    const [allIcons, setAllIcons] = useState<{ [key: string]: IconType[] }>({ Filled: [], Regular: [], Color: [] });
    const [isLoading, setIsLoading] = useState(true);
    
    // Context Menu & Modals
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, item: IconType } | null>(null);
    const [showCreateCollectionModal, setShowCreateCollectionModal] = useState(false);
    const [itemForNewCollection, setItemForNewCollection] = useState<IconType | null>(null);
    
    // Selection & Detail View
    const [selectedIcon, setSelectedIcon] = useState<IconType | null>(null);
    const [detailViewStyle, setDetailViewStyle] = useState<IconStyleType>(selectedStyle);

    const appContext = useContext(AppContext);
    if (!appContext) throw new Error("AppContext not found");
    const { isSelectionMode, toggleSelection, startSelectionMode, isItemSelected, selectAll } = appContext;

    const collectionsContext = useContext(CollectionsContext);
    if (!collectionsContext) throw new Error('CollectionsContext not found');
    const { getCollectionNames, createCollection, addItemToCollection, removeItemFrom_collection: removeItemFromCollection, isItemInCollection, getCollectionType } = collectionsContext as any;

    const location = useLocation();

    // --- Meta Tags ---
    useEffect(() => {
        document.title = 'Fluent Deck | Fluent System Icons';
        let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
        if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
        canonical.href = `${window.location.origin}/icons`;
        let desc = document.querySelector('meta[name="description"]') as HTMLMetaElement;
        if (!desc) { desc = document.createElement('meta'); desc.name = 'description'; document.head.appendChild(desc); }
        desc.content = "Browse Microsoft's Fluent System Icons in Filled, Regular, and Color styles.";
        return () => { document.title = 'Fluent Deck'; };
    }, []);

    // --- Fetch Data ---
    useEffect(() => {
        const fetchIcons = async () => {
            setIsLoading(true);
            try {
                const data = await fetchWithCache('icon-metadata', ICON_METADATA_URL);
                if (!data || !Array.isArray(data.icons) || !Array.isArray(data.columns)) return;

                const iconsByStyle: Record<string, IconType[]> = { Filled: [], Regular: [], Color: [] };
                const { columns, icons } = data;
                const nameIndex = columns.indexOf('name');
                const regularIndex = columns.indexOf('Regular');
                const filledIndex = columns.indexOf('Filled');
                const colorIndex = columns.indexOf('Color');

                icons.forEach((row: string[]) => {
                    const icon: IconType = { name: row[nameIndex], styles: {}, filename: undefined, svgFileName: undefined };
                    if (row[filledIndex]) icon.styles.Filled = row[filledIndex];
                    if (row[regularIndex]) icon.styles.Regular = row[regularIndex];
                    if (row[colorIndex]) icon.styles.Color = row[colorIndex];
                    
                    if (icon.styles.Filled) iconsByStyle.Filled.push(icon);
                    if (icon.styles.Regular) iconsByStyle.Regular.push(icon);
                    if (icon.styles.Color) iconsByStyle.Color.push(icon);
                });
                setAllIcons(iconsByStyle);
            } catch { console.error("Failed to fetch icon metadata"); } 
            finally { setIsLoading(false); }
        };
        fetchIcons();
    }, []);

    // --- Filtering Logic (Hook) ---
    const iconsForStyle = useMemo(() => allIcons[selectedStyle] || [], [allIcons, selectedStyle]);
    
    const iconMatcher = useCallback((icon: IconType, term: string, exact: boolean) => {
        const name = icon.name.toLowerCase();
        return exact ? name === term : name.includes(term);
    }, []);

    const { filteredItems: filteredIcons, searchAnalysis } = useGallerySearch(
        iconsForStyle, 
        searchTerm, 
        iconMatcher
    );

    // --- Infinite Scroll Logic (Hook) ---
    useEffect(() => setDisplayCount(50), [searchTerm, selectedStyle]);

    const { displayCount, setDisplayCount, loadMoreRef } = useInfiniteScroll(
        isLoading, 
        filteredIcons.length, 
        50
    );

    const iconsToDisplay = useMemo(() => filteredIcons.slice(0, displayCount), [filteredIcons, displayCount]);

    // --- Deep Link Logic (Hook) ---
    const findIconByName = useCallback((name: string) => {
        const styles: IconStyleType[] = ['Filled', 'Regular', 'Color'];
        for (const s of styles) {
            const list = allIcons[s] || [];
            const found = list.find(i => i.name === name);
            if (found) return { item: found, style: s };
        }
        return null;
    }, [allIcons]);

    // Validate style param
    const onDeepLinkFound = useCallback((icon: IconType, style?: string) => {
        let validStyle = style as IconStyleType;
        
        // If style is invalid or not available, use selectedStyle or first available
        if (!style || !icon.styles[validStyle]) {
             const available = Object.keys(icon.styles) as IconStyleType[];
             validStyle = available.includes(selectedStyle) ? selectedStyle : available[0];
        }
        
        if (validStyle) setDetailViewStyle(validStyle);
        setSelectedIcon(icon);
    }, [selectedStyle]);

    const isDataReady = useMemo(() => Object.values(allIcons).some(arr => arr.length > 0), [allIcons]);

    useDeepLinkHandler(
        "/hooks/icon_url.json",
        "/icons/",
        isDataReady,
        findIconByName,
        onDeepLinkFound
    );

    // --- Scroll & Highlight Logic (Hook) ---
    useScrollToItem(
        selectedIcon,
        filteredIcons,
        displayCount,
        setDisplayCount,
        'data-icon-name'
    );

    // --- Selection Logic (Hook) ---
    const allItemsForSelection = useMemo(() => 
        filteredIcons.map(icon => ({ ...icon, style: selectedStyle, itemType: 'icon' as const } as CollectionItem)), 
    [filteredIcons, selectedStyle]);

    useSelectionShortcut(allItemsForSelection, selectAll);

    // --- Event Handlers ---
    const handleIconClick = useCallback((icon: IconType) => {
        if (selectedIcon?.name === icon.name) {
            setSelectedIcon(null);
        } else {
            setDetailViewStyle(selectedStyle);
            setSelectedIcon(icon);
        }
    }, [selectedIcon, selectedStyle]);

    const handleContextMenu = useCallback((e: React.MouseEvent, icon: IconType) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY, item: icon });
    }, []);

    const handleCreateCollection = useCallback((newName: string) => {
        if (newName?.trim() && itemForNewCollection) {
            if (createCollection(newName.trim())) {
                const newItem = { ...itemForNewCollection, style: selectedStyle, itemType: 'icon' as const };
                addItemToCollection(newName.trim(), newItem, 'icon');
            } else {
                alert(`Collection "${newName.trim()}" already exists.`);
            }
        }
        setShowCreateCollectionModal(false);
        setItemForNewCollection(null);
    }, [itemForNewCollection, createCollection, selectedStyle, addItemToCollection]);

    const styleOptions = useMemo(() => iconStyles.map(s => ({ value: s.value, label: s.label, tooltip: s.tooltip })), []);

    return (
        <>
            <FilterLayout
                titleIcon={<FluentIconsIcon className="w-8 h-8 text-gray-900 dark:text-text-primary" />}
                title="Fluent System Icons"
                description="Browse Microsoft's Fluent System Icons. Use commas to search multiple names."
                filterBarContent={
                    <GalleryFilterBar
                        searchTerm={searchTerm}
                        onSearchTermChange={setSearchTerm}
                        isLoading={isLoading}
                        itemCount={iconsForStyle.length}
                        objectName="icons"
                        searchAnalysis={searchAnalysis}
                        selectedStyle={selectedStyle}
                        onStyleChange={(s) => setSelectedStyle(s as IconStyleType)}
                        styleOptions={styleOptions}
                    />
                }
                isLoading={isLoading}
                skeleton={<GridSkeleton />}
                loadMoreRef={loadMoreRef as any}
            >
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-8 gap-4">
                    {iconsToDisplay.map((icon, index) => {
                        const item = { ...icon, style: selectedStyle, itemType: 'icon' as const };
                        return (
                            <div key={`${icon.name}-${index}`} data-icon-name={icon.name}>
                                <IconCard
                                    icon={icon}
                                    selectedStyle={selectedStyle}
                                    isActive={selectedIcon?.name === icon.name}
                                    onCardClick={handleIconClick}
                                    onCardContextMenu={handleContextMenu}
                                    isSelectionMode={isSelectionMode}
                                    isSelected={isItemSelected(item, 'icon')}
                                    onToggleSelection={toggleSelection}
                                    isPriority={index < 20}
                                />
                            </div>
                        );
                    })}
                </div>
                {!isLoading && filteredIcons.length === 0 && (
                    <div className="text-center py-10"><p className="text-gray-500">No icons found.</p></div>
                )}
            </FilterLayout>

            {contextMenu && (
                <ContextMenu x={contextMenu.x} y={contextMenu.y} onClose={() => setContextMenu(null)}>
                    <ContextMenuItem onClick={() => {
                        const item = { ...contextMenu.item, style: selectedStyle };
                        startSelectionMode(item, 'icon', location.pathname);
                        setContextMenu(null);
                    }}>
                        <div className="flex items-center gap-2"><CheckmarkIcon className="w-4 h-4" /><span>Select</span></div>
                    </ContextMenuItem>
                    <ContextSubMenuTrigger subMenu={
                        <>
                            {getCollectionNames().map((name: string) => {
                                const item = { ...contextMenu.item, style: selectedStyle };
                                const isDisabled = getCollectionType(name) === 'app';
                                const isChecked = isItemInCollection(name, item, 'icon');
                                
                                return (
                                    <ContextMenuItem key={name} disabled={isDisabled} onClick={() => {
                                        if (isChecked) removeItemFromCollection(name, item, 'icon');
                                        else addItemToCollection(name, item, 'icon');
                                    }}>
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
            
            {selectedIcon && (
                <IconDetailView icon={selectedIcon} selectedStyle={detailViewStyle} onClose={() => setSelectedIcon(null)} onStyleChange={(s) => { if (selectedIcon.styles[s]) setDetailViewStyle(s); }} />
            )}
        </>
    );
};

export default IconsPage;