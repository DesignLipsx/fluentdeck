import React, { useState, useEffect, useRef } from 'react';
import { XIcon } from './Icons';
import { BaseModal } from './BaseModal';

interface CreateCollectionModalProps {
	isOpen: boolean;
	onClose: () => void;
	onCreate: (collectionName: string) => void;
}

export const CreateCollectionModal: React.FC<CreateCollectionModalProps> = ({ isOpen, onClose, onCreate }) => {
	const [collectionName, setCollectionName] = useState('');
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (isOpen) {
			setCollectionName('');
			setTimeout(() => inputRef.current?.focus(), 100);
		}
	}, [isOpen]);

	const handleCreate = (e: React.FormEvent) => {
		e.preventDefault();
		if (collectionName.trim()) {
			onCreate(collectionName.trim());
			onClose();
		}
	};

	return (
		<BaseModal isOpen={isOpen} onClose={onClose} ariaLabelledBy="create-collection-title">
			<form onSubmit={handleCreate}>
				<div className="p-4 border-b border-gray-200 dark:border-border-primary flex items-center justify-between">
					<h2 id="create-collection-title" className="font-semibold text-lg">Create New Collection</h2>
					<button type="button" onClick={onClose} className="p-1 rounded-full text-gray-500 dark:text-text-secondary hover:bg-gray-200 dark:hover:bg-white/10" aria-label="Close modal">
						<XIcon className="w-5 h-5" />
					</button>
				</div>
				<div className="px-6 pt-6">
					<label htmlFor="collectionName" className="block text-sm font-medium text-gray-700 dark:text-text-secondary mb-2">
						Collection Name
					</label>
					<input
						ref={inputRef}
						id="collectionName"
						type="text"
						value={collectionName}
						onChange={(e) => setCollectionName(e.target.value)}
						placeholder="e.g., Project X Assets"
						className="w-full h-10 px-3 bg-white dark:bg-bg-primary border border-gray-300 dark:border-border-primary rounded-md focus:outline-none"
						required
					/>
				</div>
				<div className="px-6 py-4 bg-gray-50 dark:bg-bg-active border-t border-gray-200 dark:border-border-primary rounded-b-xl flex justify-end gap-3 mt-6">
					<button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-md border border-gray-300 dark:border-border-primary hover:bg-gray-100 dark:hover:bg-border-primary">
						Cancel
					</button>
					<button
						type="submit"
						disabled={!collectionName.trim()}
						className="px-4 py-2 text-sm font-medium text-white dark:text-black bg-gray-900 dark:bg-white rounded-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						Create
					</button>
				</div>
			</form>
		</BaseModal>
	);
};