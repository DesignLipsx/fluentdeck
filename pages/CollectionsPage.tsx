import React, { useState, useEffect, useRef, lazy, Suspense, useCallback } from 'react';
import { useApp } from '../contexts/AppContext';
import { useCollections } from '../contexts/CollectionsContext';

import { getEmojiOriginalUrl, getIconUrl, getItemId, runInChunks, slugify } from '../utils';
import { DropdownMenu, DropdownMenuItem } from '../components/Dropdown';
import { XIcon, DownloadIcon, EditIcon, TrashIcon, AddIcon, CollectionsIcon, HeartIcon, MoreVerticalIcon, ChevronDownIcon } from '../components/Icons';
import { ProcessingButton } from '../components/ProcessingButton';

import { EmojiDetailView } from '../components/EmojiDetailView';
import { IconDetailView } from '../components/IconDetailView';

// Reuse existing components
import AppCard from '../components/AppCard';
import EmojiCard from '../components/EmojiCard';
import IconCard from '../components/IconCard';
import { CollectionItem } from '../types';

// Lazy load modals and toast
const CreateCollectionModal = lazy(() => import('../components/CreateCollectionModal').then(m => ({ default: m.CreateCollectionModal })));
const ConfirmDeleteModal = lazy(() => import('../components/ConfirmDeleteModal').then(m => ({ default: m.ConfirmDeleteModal })));
const RenameCollectionModal = lazy(() => import('../components/RenameCollectionModal').then(m => ({ default: m.RenameCollectionModal })));

// Define toast types for the queue
type ToastMessage = { message: string; type: 'success' | 'error' | 'info' };
type UseToastReturn = { addToast: (message: string, type: 'success' | 'error' | 'info') => void; };

const useToast = () => {
	const [useToastHook, setUseToastHook] = useState<(() => UseToastReturn) | null>(null);
	const toastQueue = useRef<ToastMessage[]>([]);

	useEffect(() => {
		import('../contexts/ToastContext').then(m => {
			setUseToastHook(() => m.useToast);
		});
	}, []);

	const realToast = useToastHook ? useToastHook() : null;

	useEffect(() => {
		if (realToast && toastQueue.current.length > 0) {
			toastQueue.current.forEach(toast => realToast.addToast(toast.message, toast.type));
			toastQueue.current = []; // Clear queue
		}
	}, [realToast]);

	const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
		if (realToast) {
			realToast.addToast(message, type);
		} else {
			toastQueue.current.push({ message, type });
		}
	}, [realToast]);

	return { addToast };
};

// Remove wrapper component
interface RemoveWrapperProps {
	children: React.ReactNode;
	onRemove: () => void;
}

const RemoveWrapper: React.FC<RemoveWrapperProps> = ({ children, onRemove }) => (
	<div className="relative group">
		{children}
		<button
			onClick={(e) => { e.stopPropagation(); onRemove(); }}
			className="absolute -top-2 -right-2 z-10 p-1.5 rounded-full bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/50 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 shadow-sm"
			aria-label="Remove item"
		>
			<XIcon className="w-3.5 h-3.5" />
		</button>
	</div>
);

const CollectionsPage: React.FC = () => {
	const { collections, getCollectionNames, createCollection, deleteCollection, renameCollection, removeItemFromCollection } = useCollections();
	const { isSelectionMode } = useApp();
	const { addToast } = useToast();

	const [activeCollection, setActiveCollection] = useState<string>('Favorites');
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [showRenameModal, setShowRenameModal] = useState<string | null>(null);
	const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
	const [selectedItem, setSelectedItem] = useState<CollectionItem | null>(null);

	// Ensure active collection exists
	useEffect(() => {
		if (!collections[activeCollection]) {
			setActiveCollection('Favorites');
		}
	}, [collections, activeCollection]);

	// Close detail view if switching collections or entering selection mode
	useEffect(() => {
		if (selectedItem) {
			setSelectedItem(null);
		}
	}, [activeCollection, isSelectionMode]);

	const handleCreate = (name: string) => {
		if (createCollection(name)) {
			setActiveCollection(name);
		}
	};

	const handleRename = (newName: string) => {
		if (showRenameModal && renameCollection(showRenameModal, newName)) {
			setActiveCollection(newName);
		}
		setShowRenameModal(null);
	};

	const handleDelete = () => {
		if (showDeleteModal) {
			deleteCollection(showDeleteModal);
			setActiveCollection('Favorites');
		}
		setShowDeleteModal(null);
	};

	const handleDownloadProcess = async (): Promise<boolean> => {
		const items = collections[activeCollection];
		if (!items || items.some(i => i.itemType === 'app')) {
			addToast("Cannot download apps or empty collections.", 'error');
			return false;
		}

		try {
			const { zipSync, strToU8 } = await import('fflate');
			const filesToZip: Record<string, Uint8Array> = {};

			const processItem = async (item: CollectionItem) => {
				try {
					if (item.itemType === 'emoji') {
						const imageUrl = getEmojiOriginalUrl(item, item.style);
						if (!imageUrl) return;
			
						const response = await fetch(imageUrl);
						if (!response.ok) throw new Error('Fetch failed');
			
						const buffer = await response.arrayBuffer();
						const fileName = `emoji/${item.name.replace(/\s+/g, '_')}_${item.style}.webp`;
						filesToZip[fileName] = new Uint8Array(buffer);
					}
					else if (item.itemType === 'icon') {
						// For collections, we don't have a specific size, so we let getIconUrl decide the best one.
						const iconUrl = getIconUrl(item, item.style, null);
						const response = await fetch(iconUrl);
						if (!response.ok) throw new Error('Fetch failed');
			
						const text = await response.text();
						const iconId = (item.styles?.[item.style.toLowerCase() as keyof typeof item.styles]?.['24'] || item.name).replace('.svg', '');
						const fileName = `icon/${iconId}_${item.style}.svg`;
						filesToZip[fileName] = strToU8(text);
					}
				} catch (e) {
					console.error(`Failed to download ${item.name}`, e);
				}
			};
			
			await runInChunks(items, 5, processItem);

			const content = new Blob([zipSync(filesToZip) as BlobPart], { type: 'application/zip' });
			const url = window.URL.createObjectURL(content);
			const a = document.createElement('a');
			a.style.display = 'none';
			a.href = url;
			a.download = `fluent_deck_${slugify(activeCollection)}.zip`;
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);

			return true;
		} catch (error) {
			console.error("Zipping failed:", error);
			addToast("Failed to create zip file.", 'error');
			return false;
		}
	};

	const activeItems = collections[activeCollection] || [];
	const canDownload = activeItems.length > 0 && !activeItems.some(i => i.itemType === 'app');
	const collectionNames = getCollectionNames();

	const handleItemClick = (item: CollectionItem) => {
		setSelectedItem(item);
	};

	const handleDetailClose = () => {
		setSelectedItem(null);
	};

	const handleStyleChange = (newStyle: string) => {
		if (selectedItem && (selectedItem.itemType === 'emoji' || selectedItem.itemType === 'icon')) {
			setSelectedItem(prevItem => {
				if (!prevItem || (prevItem.itemType !== 'emoji' && prevItem.itemType !== 'icon')) return prevItem;
				return { ...prevItem, style: newStyle as any };
			});
		}
	};

	return (
		<>
			<div className="px-4 sm:px-6 lg:px-8 py-8">
				{/* Header Section */}
				<div className="mb-6">
					<div className="flex items-center justify-between gap-3 mb-3 md:mb-0">
						<div className="flex items-center gap-3 min-w-0">
							<HeartIcon className="w-7 h-7 sm:w-8 sm:h-8 text-gray-800 dark:text-gray-200 flex-shrink-0" />
							<h1 className="font-bold text-2xl sm:text-3xl text-gray-900 dark:text-text-primary truncate">Collections</h1>
						</div>

						{/* New Collection button - always visible on right */}
						<button
							onClick={() => setShowCreateModal(true)}
							className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-gray-900 text-white rounded-md hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200 flex-shrink-0"
						>
							<AddIcon className="w-4 h-4" />
							<span className="hidden md:inline">New Collection</span>
							<span className="md:hidden">New</span>
						</button>
					</div>

					{/* Mobile: Full-width dropdown only */}
					<div className="md:hidden">
						<DropdownMenu
							trigger={() => (
								<button className="w-full flex items-center justify-between gap-2 px-3 py-2 text-sm font-medium bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 dark:bg-bg-secondary dark:text-text-primary dark:hover:bg-bg-active">
									<span className="truncate">{activeCollection}</span>
									<ChevronDownIcon className="w-4 h-4 flex-shrink-0" />
								</button>
							)}
							menuClassName="w-full"
						>
							{collectionNames.map(name => (
								<DropdownMenuItem
									key={name}
									onClick={() => setActiveCollection(name)}
									className={activeCollection === name ? 'bg-gray-100 dark:bg-bg-active font-medium' : ''}
								>
									<span className="truncate">{name}</span>
									<span className="ml-auto text-xs text-gray-500 dark:text-text-secondary pl-2">
										{collections[name]?.length || 0}
									</span>
								</DropdownMenuItem>
							))}
						</DropdownMenu>
					</div>
				</div>

				<div className="flex flex-col md:flex-row gap-6">
					{/* Desktop Sidebar */}
					<aside className="hidden md:block w-64 flex-shrink-0">
						<div className="sticky top-24">
							<div className="space-y-1">
								{collectionNames.map(name => {
									const itemCount = collections[name]?.length || 0;
									return (
										<button
											key={name}
											onClick={() => setActiveCollection(name)}
											className={`w-full text-left group flex items-center justify-between gap-2 p-2 rounded-md text-sm ${activeCollection === name ? 'bg-gray-100 dark:bg-bg-active' : 'hover:bg-gray-50 dark:hover:bg-bg-active/50'}`}
										>
											<span className={`flex-grow truncate ${activeCollection === name ? 'font-semibold text-gray-900 dark:text-text-primary' : 'text-gray-600 dark:text-text-secondary'}`}>
												{name}
											</span>
											<span className="text-xs text-gray-500 dark:text-text-secondary flex-shrink-0">
												{itemCount}
											</span>
										</button>
									);
								})}
							</div>
						</div>
					</aside>

					{/* Main Content */}
					<main className="flex-grow min-w-0">
						<div className="pb-4 mb-4 border-b border-gray-200 dark:border-border-primary flex items-center justify-between gap-2">
							<h2 className="font-semibold text-xl sm:text-2xl text-gray-900 dark:text-text-primary truncate mr-2">{activeCollection}</h2>
							<div className="flex items-center gap-2">
								<ProcessingButton
									onProcess={handleDownloadProcess}
									disabled={!canDownload}
									className="h-9 px-3 text-sm whitespace-nowrap"
								>
									<DownloadIcon className="w-4 h-4" />
									<span className="ml-2">Download</span>
								</ProcessingButton>
								{activeCollection !== 'Favorites' && (
									<div className="flex-shrink-0">
										<DropdownMenu
											trigger={() => (
												<button className="flex items-center justify-center h-9 w-9 text-gray-500 dark:text-text-secondary hover:bg-gray-100 dark:hover:bg-bg-active rounded-md border border-gray-300 dark:border-border-primary" aria-label="Options">
													<MoreVerticalIcon className="w-4 h-4" />
												</button>
											)}
											menuClassName="w-40"
										>
											<DropdownMenuItem onClick={() => setShowRenameModal(activeCollection)}>
												<EditIcon className="w-4 h-4 mr-2" />Rename
											</DropdownMenuItem>
											<DropdownMenuItem onClick={() => setShowDeleteModal(activeCollection)} className="text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
												<TrashIcon className="w-4 h-4 mr-2" />Delete
											</DropdownMenuItem>
										</DropdownMenu>
									</div>
								)}
							</div>
						</div>

						{/* Content Grid - Fixed height to prevent jump */}
						<div className="min-h-[50vh]">
							{activeItems.length > 0 ? (
								<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-8 gap-4">
									{activeItems.map((item, index) => {
										const itemId = getItemId(item, item.itemType) + `-${index}`;
										const onRemove = () => removeItemFromCollection(activeCollection, item, item.itemType);

										if (item.itemType === 'emoji') {
											return (
												<RemoveWrapper key={itemId} onRemove={onRemove}>
													<EmojiCard
														emoji={item}
														selectedStyle={item.style}
														onCardClick={() => handleItemClick(item)}
														onCardContextMenu={() => { }} isSelectionMode={false} isSelected={false} onToggleSelection={function (): void {
															throw new Error('Function not implemented.');
														}} />
												</RemoveWrapper>
											);
										}
										if (item.itemType === 'icon') {
											return (
												<RemoveWrapper key={itemId} onRemove={onRemove}>
													<IconCard
														icon={item}
														selectedStyle={item.style}
														isSelectionMode={false}
														isSelected={false}
														onCardClick={() => handleItemClick(item)}
														onCardContextMenu={() => { }}
														onToggleSelection={() => { }}
													/>
												</RemoveWrapper>
											);
										}
										if (item.itemType === 'app') {
											return (
												<RemoveWrapper key={itemId} onRemove={onRemove}>
													<AppCard
														app={item}
														index={index}
														isSelectionMode={false}
														isSelected={false}
													/>
												</RemoveWrapper>
											);
										}
										return null;
									})}
								</div>
							) : (
								<div className="flex items-center justify-center text-gray-500 dark:text-text-secondary py-16">
									<div className="text-center">
										<CollectionsIcon className="w-12 h-12 mx-auto text-gray-500 dark:text-gray-500 mb-4" />
										<p className="text-lg font-semibold text-gray-700 dark:text-gray-200">Collection is empty</p>
										<p className="text-sm mt-1 text-gray-500 dark:text-gray-500">Right-click items to add them here</p>
									</div>
								</div>
							)}
						</div>
					</main>
				</div>
			</div>

			{/* Lazy-loaded modals with Suspense */}
			<Suspense fallback={null}>
				{showCreateModal && (
					<CreateCollectionModal
						isOpen={showCreateModal}
						onClose={() => setShowCreateModal(false)}
						onCreate={handleCreate}
					/>
				)}
				{showRenameModal && (
					<RenameCollectionModal
						isOpen={!!showRenameModal}
						onClose={() => setShowRenameModal(null)}
						onRename={handleRename}
						currentName={showRenameModal}
					/>
				)}
				{showDeleteModal && (
					<ConfirmDeleteModal
						isOpen={!!showDeleteModal}
						onClose={() => setShowDeleteModal(null)}
						onConfirm={handleDelete}
						collectionName={showDeleteModal}
					/>
				)}
			</Suspense>

			{selectedItem && selectedItem.itemType === 'emoji' && (
				<EmojiDetailView
					emoji={selectedItem}
					selectedStyle={selectedItem.style as any}
					onClose={handleDetailClose}
					showCollectionControls={false}
					onStyleChange={handleStyleChange}
				/>
			)}

			{selectedItem && selectedItem.itemType === 'icon' && (
				<IconDetailView
					icon={selectedItem}
					selectedStyle={selectedItem.style}
					showCollectionControls={false}
					onClose={handleDetailClose}
					onStyleChange={handleStyleChange}
				/>
			)}
		</>
	);
};

export default CollectionsPage;