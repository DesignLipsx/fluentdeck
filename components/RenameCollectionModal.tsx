import React, { useState, useEffect, useRef } from 'react';
import { XIcon } from './Icons';
import { BaseModal } from './BaseModal';

interface RenameCollectionModalProps {
	isOpen: boolean;
	onClose: () => void;
	onRename: (newName: string) => void;
	currentName: string;
}

export const RenameCollectionModal: React.FC<RenameCollectionModalProps> = ({ isOpen, onClose, onRename, currentName }) => {
	const [newName, setNewName] = useState(currentName);
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (isOpen) {
			setNewName(currentName);
			setTimeout(() => inputRef.current?.focus(), 100);
		}
	}, [isOpen, currentName]);

	const handleSave = (e: React.FormEvent) => {
		e.preventDefault();
		if (newName.trim() && newName.trim() !== currentName) {
			onRename(newName.trim());
		}
		onClose();
	};

	return (
		<BaseModal isOpen={isOpen} onClose={onClose} ariaLabelledBy="rename-collection-title">
			<form onSubmit={handleSave}>
				<div className="p-4 border-b border-gray-200 dark:border-border-primary flex items-center justify-between">
					<h2 id="rename-collection-title" className="font-semibold text-lg">Rename Collection</h2>
					<button type="button" onClick={onClose} className="p-1 rounded-full text-gray-500 dark:text-text-secondary hover:bg-gray-200 dark:hover:bg-white/10" aria-label="Close modal">
						<XIcon className="w-5 h-5" />
					</button>
				</div>
				<div className="p-6">
					<label htmlFor="collectionName" className="block text-sm font-medium text-gray-700 dark:text-text-secondary mb-2">
						Collection Name
					</label>
					<input
						ref={inputRef}
						id="collectionName"
						type="text"
						value={newName}
						onChange={(e) => setNewName(e.target.value)}
						className="w-full h-10 px-3 bg-white dark:bg-bg-primary border border-gray-300 dark:border-border-primary rounded-md focus:outline-none transition-colors"
						required
					/>
				</div>
				<div className="px-6 py-2 bg-gray-50 dark:bg-bg-active border-t border-gray-200 dark:border-border-primary rounded-b-xl flex justify-end gap-3">
					<button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-md border border-gray-300 dark:border-border-primary hover:bg-gray-100 dark:hover:bg-bg-active transition-colors">
						Cancel
					</button>
					<button
						type="submit"
						disabled={!newName.trim() || newName.trim() === currentName}
						className="px-4 py-2 text-sm font-medium text-white dark:text-black bg-gray-900 dark:bg-white rounded-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
					>
						Save
					</button>
				</div>
			</form>
		</BaseModal>
	);
};