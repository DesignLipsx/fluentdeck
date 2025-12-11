import React, { useState, useContext, useCallback, useRef, useEffect } from 'react';
import { AddIcon, CheckmarkIcon } from './Icons';
import { CollectionsContext, AppContext } from '../App';
import { CollectionItem } from '../types';
import { useToast } from '../contexts/ToastContext';
import { ContextMenuItem } from './ContextMenu';
import { CreateCollectionModal } from './CreateCollectionModal';

interface CollectionMenuProps<T extends { name: string }> {
	item: T;
	selectedStyle: string;
	itemType: 'emoji' | 'icon' | 'app';
	onCloseDetail: () => void;
}

export const CollectionMenu = React.forwardRef<
	HTMLDivElement,
	CollectionMenuProps<any>
>(
	({ item, selectedStyle, itemType }, ref) => {
		const [isMenuOpen, setIsMenuOpen] = useState(false);
		const [showCreateCollectionModal, setShowCreateCollectionModal] = useState(false);
		const [itemForNewCollection, setItemForNewCollection] = useState<any>(null);

		const buttonRef = useRef<HTMLButtonElement>(null);
		const menuRef = useRef<HTMLDivElement>(null);

		const { addToast } = useToast();

		const collectionsContext = useContext(CollectionsContext);
		const appContext = useContext(AppContext);

		if (!collectionsContext || !appContext) throw new Error("Context not found in CollectionMenu");

		const {
			getCollectionNames,
			createCollection,
			addItemToCollection,
			removeItemFromCollection,
			isItemInCollection,
			getCollectionType,
		} = collectionsContext;

		const handleButtonClick = useCallback(() => {
			setIsMenuOpen((prev) => !prev);
		}, []);

		useEffect(() => {
			const handleClickOutside = (event: MouseEvent) => {
				if (
					menuRef.current && !menuRef.current.contains(event.target as Node) &&
					buttonRef.current && !buttonRef.current.contains(event.target as Node)
				) {
					setIsMenuOpen(false);
				}
			};

			document.addEventListener('mousedown', handleClickOutside);
			return () => {
				document.removeEventListener('mousedown', handleClickOutside);
			};
		}, []);

		const closeMenu = useCallback(() => setIsMenuOpen(false), []);

		const handleOpenCreateCollectionModal = useCallback(() => {
			setItemForNewCollection(item);
			closeMenu();
			setShowCreateCollectionModal(true);
		}, [closeMenu, item]);

		const handleCreateCollection = useCallback(
			(newName: string) => {
				if (newName && newName.trim() && itemForNewCollection) {
					if (createCollection(newName.trim())) {
						const newItem: CollectionItem = {
							...itemForNewCollection,
							style: selectedStyle,
							itemType,
						};
						addItemToCollection(newName.trim(), newItem, itemType);
						addToast(
							`Created collection "${newName.trim()}" and added item.`,
							'success'
						);
					} else {
						addToast(
							`Collection "${newName.trim()}" already exists.`,
							'error'
						);
					}
				}
				setShowCreateCollectionModal(false);
				setItemForNewCollection(null);
			},
			[
				itemForNewCollection,
				createCollection,
				selectedStyle,
				addItemToCollection,
				addToast,
				itemType,
			]
		);

		const handleToggleCollection = useCallback(
			(name: string, item: Omit<CollectionItem, 'itemType'>) => {
				if (isItemInCollection(name, item, itemType)) {
					removeItemFromCollection(name, item, itemType);
					addToast(`Removed from "${name}"`, 'info');
				} else {
					addItemToCollection(name, item, itemType);
					addToast(`Added to "${name}"`, 'success');
				}
				closeMenu();
			},
			[
				isItemInCollection,
				removeItemFromCollection,
				addItemToCollection,
				closeMenu,
				addToast,
				itemType,
			]
		);

		return (
			<div ref={ref} className="relative flex items-center">
				<button
					ref={buttonRef}
					onClick={handleButtonClick}
					className="p-1 rounded-full text-gray-500 dark:text-text-secondary hover:bg-gray-200 dark:hover:bg-bg-active"
					title="Add to Collection"
					aria-haspopup="menu"
					aria-expanded={isMenuOpen}
					aria-label="Add to Collection"
				>
					<AddIcon className="w-5 h-5" />
				</button>

				{isMenuOpen && (
					<div
						ref={menuRef}
						className="absolute right-0 top-full mt-2 z-50 w-48 rounded-md shadow-lg bg-white dark:bg-bg-secondary border border-gray-200 dark:border-border-primary focus:outline-none p-1 animate-scaleIn origin-top-right"
						role="menu"
						aria-orientation="vertical"
					>
						<p className="px-3 py-1 text-xs font-semibold text-gray-500 dark:text-text-secondary uppercase">
							Add to Collection
						</p>

						{getCollectionNames().map((name) => {
							const itemPayload = { ...item, style: selectedStyle };
							const isDisabled = getCollectionType(name) === 'app';
							const isInCollection = isItemInCollection(name, itemPayload, itemType);
							return (
								<ContextMenuItem
									key={name}
									onClick={() => handleToggleCollection(name, itemPayload)}
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
							<div className="flex items-center gap-2">
								<AddIcon className="w-4 h-4" />
								<span>New Collection...</span>
							</div>
						</ContextMenuItem>
					</div>
				)}

				{showCreateCollectionModal && (
					<CreateCollectionModal
						isOpen={showCreateCollectionModal}
						onClose={() => setShowCreateCollectionModal(false)}
						onCreate={handleCreateCollection}
					/>
				)}
			</div>
		);
	}
);

CollectionMenu.displayName = 'CollectionMenu';