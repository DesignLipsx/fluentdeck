import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { CollectionItem } from '../types';

/**
 * Hook for handling the comma-separated search logic.
 */
export function useGallerySearch<T extends { name: string }>(
    items: T[],
    searchTerm: string,
    matcher: (item: T, term: string, exact: boolean) => boolean
) {
    return useMemo(() => {
        const trimmed = searchTerm.trim();
        if (trimmed === '') return { filteredItems: items, searchAnalysis: [] };

        const lower = trimmed.toLowerCase();
        const hasTrailing = lower.endsWith(',');
        const terms = lower.split(',').map(t => t.trim()).filter(Boolean);

        if (terms.length === 0) return { filteredItems: items, searchAnalysis: [] };

        // 1. Generate Analysis Tags
        const analysis = terms.map((t, idx) => {
            const isLast = idx === terms.length - 1;
            const exact = !(isLast && !hasTrailing);
            const found = items.some(i => matcher(i, t, exact));
            return { term: t, found };
        });

        // 2. Filter Items
        const filtered = items.filter(item => {
            if (!lower.includes(',')) return matcher(item, lower, false);
            
            return terms.some((t, idx) => {
                const isLast = idx === terms.length - 1;
                const exact = !(isLast && !hasTrailing);
                return matcher(item, t, exact);
            });
        });

        return { filteredItems: filtered, searchAnalysis: analysis };
    }, [items, searchTerm, matcher]);
}

/**
 * Hook for Infinite Scroll logic.
 */
export function useInfiniteScroll(
    isLoading: boolean,
    totalFilteredCount: number,
    step: number = 50
) {
    const [displayCount, setDisplayCount] = useState(step);
    const observer = useRef<IntersectionObserver | null>(null);

    const loadMoreRef = useCallback((node: HTMLElement | null) => {
        if (isLoading) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && displayCount < totalFilteredCount) {
                setDisplayCount(prev => prev + step);
            }
        });
        
        if (node) observer.current.observe(node);
    }, [isLoading, displayCount, totalFilteredCount, step]);

    return { displayCount, setDisplayCount, loadMoreRef };
}

/**
 * Hook for handling Deep Links (URL -> Item)
 */
export function useDeepLinkHandler<T>(
    idMapUrl: string,
    urlPrefix: string,
    isDataReady: boolean,
    findItemByName: (name: string) => { item: T; style?: string } | null,
    onFound: (item: T, style?: string) => void
) {
    const [idMap, setIdMap] = useState<{ name: string; id: string }[]>([]);
    const location = useLocation();

    // Load ID Map
    useEffect(() => {
        fetch(idMapUrl)
            .then(res => res.ok ? res.json() : Promise.reject(res.statusText))
            .then(data => Array.isArray(data) && setIdMap(data))
            .catch(() => console.error(`Failed to load ${idMapUrl}`));
    }, [idMapUrl]);

    // Handle URL Parsing
    useEffect(() => {
        if (!idMap.length || !isDataReady) return;

        const path = location.pathname;
        if (!path.startsWith(urlPrefix)) return;

        const id = decodeURIComponent(path.split('/')[2] || "");
        if (!id) return;

        const entry = idMap.find(e => e.id === id);
        if (!entry) return;

        const found = findItemByName(entry.name);
        if (found) {
            const params = new URLSearchParams(location.search);
            const urlStyle = params.get('style');

            // Pass the URL style if present, otherwise fall back to the found item's default style
            onFound(found.item, urlStyle || found.style);
        }
    }, [location.pathname, location.search, idMap, isDataReady, findItemByName, onFound, urlPrefix]);
}

/**
 * Hook for handling the "Scroll to Item" logic with the fix for auto-scroll fighting.
 */
export function useScrollToItem<T extends { name: string }>(
    selectedItem: T | null,
    filteredItems: T[],
    displayCount: number,
    setDisplayCount: (n: number | ((prev: number) => number)) => void,
    dataAttribute: string // e.g., 'data-icon-name' or 'data-emoji-name'
) {
    const hasScrolledRef = useRef<string | null>(null);

    useEffect(() => {
        if (!selectedItem) {
            hasScrolledRef.current = null;
            return;
        }

        const index = filteredItems.findIndex(i => i.name === selectedItem.name);
        if (index === -1) return;

        // If item is outside rendered range, expand range
        if (index >= displayCount) {
            setDisplayCount(index + 20);
            return; // Wait for re-render
        }

        // Stop if we already scrolled for this item
        if (hasScrolledRef.current === selectedItem.name) return;

        setTimeout(() => {
            const el = document.querySelector(`[${dataAttribute}="${selectedItem.name}"]`) as HTMLElement;
            
            if (el) {
                // Calculate position to center the item + offset
                const elementRect = el.getBoundingClientRect();
                const absoluteElementTop = elementRect.top + window.scrollY;
                const centerPosition = absoluteElementTop - (window.innerHeight / 2) + (elementRect.height / 2);
                
                // Custom offset: Positive (+) scrolls DOWN (Item moves UP)
                const extraScroll = 115; 

                window.scrollTo({
                    top: centerPosition + extraScroll,
                    behavior: 'smooth'
                });

                // Mark as scrolled so we don't scroll again for this selection
                hasScrolledRef.current = selectedItem.name;
            }
        }, 80);

    }, [selectedItem, filteredItems, displayCount, setDisplayCount, dataAttribute]);
}

/**
 * Hook for Ctrl+A selection shortcut
 */
export function useSelectionShortcut(
    items: CollectionItem[],
    selectAll: (items: CollectionItem[]) => void
) {
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;
            if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;
            
            if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
                e.preventDefault();
                selectAll(items);
            }
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [selectAll, items]);
}