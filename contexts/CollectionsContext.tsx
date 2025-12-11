import React, { useEffect, useCallback } from 'react';
import { usePersistentState } from '../hooks/usePersistentState';
import { useToast } from './ToastContext';
import { CollectionItem, Collections } from '../types';
import { getItemId } from '../utils';

// --- Collections Context ---
interface CollectionsContextType {
	collections: Collections;
	getCollectionNames: () => string[];
	createCollection: (name: string) => boolean;
	deleteCollection: (name: string) => void;
	renameCollection: (oldName: string, newName: string) => boolean;
	addItemToCollection: (collectionName: string, item: Omit<CollectionItem, 'itemType'>, itemType: CollectionItem['itemType']) => void;
	removeItemFromCollection: (collectionName: string, item: Omit<CollectionItem, 'itemType'>, itemType: CollectionItem['itemType']) => void;
	isItemInCollection: (collectionName: string, item: Omit<CollectionItem, 'itemType'>, itemType: CollectionItem['itemType']) => boolean;
	getItemCollections: (item: Omit<CollectionItem, 'itemType'>, itemType: CollectionItem['itemType']) => string[];
	getCollectionType: (collectionName: string) => 'app' | 'media' | 'empty';
	importCollection: (name: string, items: CollectionItem[]) => boolean;
}

export const CollectionsContext = React.createContext<CollectionsContextType | undefined>(undefined);

export const useCollections = () => {
	const context = React.useContext(CollectionsContext);
	if (context === undefined) {
		throw new Error('useCollections must be used within a CollectionsProvider');
	}
	return context;
};

export const CollectionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [collections, setCollections] = usePersistentState<Collections>('fluentdeck-collections', { 'Favorites': [] });
	const { addToast } = useToast();

	useEffect(() => {
		const oldEmojiFavoritesRaw = localStorage.getItem('fluentdeck-favorites');
		const oldIconFavoritesRaw = localStorage.getItem('fluentdeck-icon-favorites');

		if (oldEmojiFavoritesRaw || oldIconFavoritesRaw) {
			const emojiItems: CollectionItem[] = oldEmojiFavoritesRaw ? JSON.parse(oldEmojiFavoritesRaw).map((item: any) => ({ ...item, itemType: 'emoji' })) : [];
			const iconItems: CollectionItem[] = oldIconFavoritesRaw ? JSON.parse(oldIconFavoritesRaw).map((item: any) => ({ ...item, itemType: 'icon' })) : [];

			setCollections(prev => (({
				...prev,
				'Favorites': [...(prev['Favorites'] || []), ...emojiItems, ...iconItems]
			})));
			localStorage.removeItem('fluentdeck-favorites');
			localStorage.removeItem('fluentdeck-icon-favorites');
		} else if (Object.keys(collections).length === 0) {
			setCollections({ 'Favorites': [] });
		}
	}, []);

	const getCollectionType = useCallback((name: string): 'app' | 'media' | 'empty' => {
		const collection = collections[name];
		if (!collection || collection.length === 0) return 'empty';
		const firstItemType = collection[0].itemType;
		if (firstItemType === 'app') return 'app';
		return 'media';
	}, [collections]);

	const getCollectionNames = useCallback(() => Object.keys(collections).sort((a, b) => {
		if (a === 'Favorites') return -1;
		if (b === 'Favorites') return 1;
		return a.localeCompare(b);
	}), [collections]);

	const createCollection = (name: string) => {
		if (collections[name]) {
			addToast(`Collection "${name}" already exists.`, 'error');
			return false;
		}
		setCollections(prev => ({ ...prev, [name]: [] }));
		addToast(`Collection "${name}" created`, 'success');
		return true;
	};

	const deleteCollection = (name: string) => {
		if (name === 'Favorites') return;
		setCollections(prev => {
			const newCollections = { ...prev };
			delete newCollections[name];
			return newCollections;
		});
		addToast(`Collection "${name}" deleted`, 'info');
	};

	const renameCollection = (oldName: string, newName: string) => {
		if (oldName === 'Favorites' || !newName.trim() || collections[newName]) {
			addToast(`Collection name "${newName}" is invalid or already exists.`, 'error');
			return false;
		}
		setCollections(prev => {
			const newCollections = { ...prev };
			newCollections[newName] = newCollections[oldName];
			delete newCollections[oldName];
			return newCollections;
		});
		addToast(`Renamed "${oldName}" to "${newName}"`, 'success');
		return true;
	};

	const addItemToCollection = (collectionName: string, item: Omit<CollectionItem, 'itemType'>, itemType: CollectionItem['itemType']) => {
		const fullItem = { ...item, itemType } as CollectionItem;
		const itemId = getItemId(item, itemType);

		setCollections(prev => {
			const collection = prev[collectionName] || [];

			if (collection.length > 0) {
				const existingItemTypeIsApp = collection[0].itemType === 'app';
				const newItemTypeIsApp = itemType === 'app';
				if (existingItemTypeIsApp !== newItemTypeIsApp) {
					addToast("Collections cannot mix Apps with Emojis or Icons.", 'error');
					return prev;
				}
			}

			if (collection.some(i => getItemId(i, i.itemType) === itemId)) {
				return prev;
			}

			return {
				...prev,
				[collectionName]: [...collection, fullItem]
			};
		});
	};

	const removeItemFromCollection = (collectionName: string, item: Omit<CollectionItem, 'itemType'>, itemType: CollectionItem['itemType']) => {
		const itemId = getItemId(item, itemType);
		setCollections(prev => ({
			...prev,
			[collectionName]: (prev[collectionName] || []).filter(i => getItemId(i, i.itemType) !== itemId)
		}));
	};

	const isItemInCollection = (collectionName: string, item: Omit<CollectionItem, 'itemType'>, itemType: CollectionItem['itemType']) => {
		const itemId = getItemId(item, itemType);
		return (collections[collectionName] || []).some(i => getItemId(i, i.itemType) === itemId);
	};

	const getItemCollections = (item: Omit<CollectionItem, 'itemType'>, itemType: CollectionItem['itemType']): string[] => {
		const itemId = getItemId(item, itemType);
		return Object.entries(collections)
			.filter(([, items]) => items.some(i => getItemId(i, i.itemType) === itemId))
			.map(([name]) => name);
	};

	const importCollection = (name: string, items: CollectionItem[]) => {
		if (collections[name]) {
			addToast(`Collection "${name}" already exists. Rename it before importing.`, 'error');
			return false;
		}

		// Validation Logic
		if (!Array.isArray(items)) {
			addToast("Invalid file: Root must be an array of items.", 'error');
			return false;
		}

		const validItems = items.filter(item =>
			item && typeof item === 'object' && 'name' in item && 'itemType' in item
		);

		if (validItems.length === 0 && items.length > 0) {
			addToast("Invalid file: No valid items found.", 'error');
			return false;
		}

		setCollections(prev => ({
			...prev,
			[name]: validItems
		}));

		addToast(`Imported "${name}" with ${validItems.length} items.`, 'success');
		return true;
	};

	return (
		<CollectionsContext.Provider value={{ collections, getCollectionNames, createCollection, deleteCollection, renameCollection, addItemToCollection, removeItemFromCollection, isItemInCollection, getItemCollections, getCollectionType, importCollection }}>
			{children}
		</CollectionsContext.Provider>
	);
};