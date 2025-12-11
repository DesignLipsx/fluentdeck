import React, { useContext, useState } from 'react';
import { AppContext, CollectionsContext } from '../App';
import { AddIcon, DownloadIcon, XIcon } from './Icons';
import { DropdownMenu, DropdownMenuItem } from './Dropdown';
import { CreateCollectionModal } from './CreateCollectionModal';
import { getEmojiOriginalUrl, getIconUrl } from '../utils';
import { ProcessingButton } from './ProcessingButton';
import { useToast } from '../contexts/ToastContext';
import JSZip from 'jszip';

const SelectionActionBar: React.FC = () => {
	const appContext = useContext(AppContext);
	const collectionsContext = useContext(CollectionsContext);

	if (!appContext || !collectionsContext) return null;

	const { selection, stopSelectionMode } = appContext;
	const { getCollectionNames, addItemToCollection, createCollection, getCollectionType } = collectionsContext;
	const { addToast } = useToast();

	const [showCreateModal, setShowCreateModal] = useState(false);

	const handleAddToCollection = (collectionName: string) => {
		selection.forEach(item => {
			addItemToCollection(collectionName, item, item.itemType);
		});
		addToast(`${selection.length} item(s) added to "${collectionName}"`, 'success');
		stopSelectionMode();
	};

	const handleCreateAndAdd = (newName: string) => {
		if (createCollection(newName)) {
			handleAddToCollection(newName);
		}
	};

	const handleDownload = async (): Promise<boolean> => {
		const items = selection.filter(item => item.itemType === 'emoji' || item.itemType === 'icon');
		if (typeof JSZip === 'undefined' || items.length === 0) return false;

		try {
			const zip = new JSZip();

			const downloadPromises = items.map(item => {
				if (item.itemType === 'emoji') {
					const imageUrl = getEmojiOriginalUrl(item, item.style)!;
					const fileExtension = 'webp';
					const fileName = `emoji/${item.name.replace(/\s+/g, '_')}_${item.style}.${fileExtension}`;

					return fetch(imageUrl)
						.then(response => response.ok ? response.blob() : Promise.reject(`Failed to fetch ${imageUrl}`))
						.then(blob => zip.file(fileName, blob))
						.catch(error => console.error('Error downloading image for zipping:', error, imageUrl));
				} else if (item.itemType === 'icon') {
					const iconUrl = getIconUrl(item, item.style);
					const iconId = item.name.replace(/\.svg$/, ''); const fileName = `icon/${iconId}_${item.style}.svg`;

					return fetch(iconUrl)
						.then(response => response.ok ? response.text() : Promise.reject(`Failed to fetch ${iconUrl}`))
						.then(svgText => zip.file(fileName, svgText))
						.catch(error => console.error('Error downloading icon for zipping:', error));
				}
				return Promise.resolve();
			});

			await Promise.all(downloadPromises);

			const content = await zip.generateAsync({ type: 'blob' });

			const url = window.URL.createObjectURL(content);
			const a = document.createElement('a');
			a.style.display = 'none';
			a.href = url;
			a.download = `fluent_deck_selection.zip`;
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);

			stopSelectionMode();
			return true;
		} catch (error) {
			console.error(error);
			stopSelectionMode();
			return false;
		}
	};

	const canDownload = selection.some(item => item.itemType === 'emoji' || item.itemType === 'icon');
	if (selection.length === 0) return null;

	const selectionType = selection.length > 0 ? (selection[0].itemType === 'app' ? 'app' : 'media') : 'empty';

	return (
		<>
			<div className="fixed z-50 bottom-4 inset-x-0 pointer-events-none animate-slide-up-fade">
				<div className="px-4 sm:px-6 lg:px-8 flex justify-center sm:justify-end">
					<div className="bg-white dark:bg-bg-secondary border border-gray-200 dark:border-border-primary rounded-lg shadow-2xl flex items-center gap-2 p-2 pointer-events-auto w-full justify-center sm:w-auto sm:justify-start max-w-md sm:max-w-none">
						<button onClick={stopSelectionMode} className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-tab-active" aria-label="Cancel selection">
							<XIcon className="w-5 h-5" />
						</button>

						<span className="text-sm font-semibold pr-2 flex-shrink-0">{selection.length}</span>

						<div className="h-8 w-px bg-gray-200 dark:bg-border-primary"></div>

						<DropdownMenu
							direction="up"
							menuClassName="w-56"
							trigger={() => (
								<button className="flex items-center justify-center gap-2 h-9 px-3 text-sm rounded-md bg-gray-100 dark:bg-bg-active hover:bg-gray-200 dark:hover:bg-tab-active">
									<AddIcon className="w-4 h-4" />
									<span>Add to Collection</span>
								</button>
							)}>
							{getCollectionNames().map(name => {
								const collectionType = getCollectionType(name);
								const isDisabled = selectionType === 'app' ? collectionType === 'media' : selectionType === 'media' ? collectionType === 'app' : false;
								return (
									<DropdownMenuItem key={name} onClick={() => handleAddToCollection(name)} disabled={isDisabled}>
										<div className="flex items-center justify-between w-full">
											<span>{name}</span>
										</div>
									</DropdownMenuItem>
								);
							})}
							<div className="h-px my-1 bg-gray-200 dark:bg-border-primary" />
							<DropdownMenuItem onClick={() => setShowCreateModal(true)}>
								Create New Collection...
							</DropdownMenuItem>
						</DropdownMenu>

						<ProcessingButton onProcess={handleDownload} disabled={!canDownload} className="h-9 px-3">
							<DownloadIcon className="w-4 h-4" />
							<span>Download</span>
						</ProcessingButton>
					</div>
				</div>
			</div>
			{showCreateModal && (
				<CreateCollectionModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onCreate={handleCreateAndAdd} />
			)}
		</>
	);
};

export default SelectionActionBar;