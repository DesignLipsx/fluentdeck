import React from 'react';
import { TrashIcon } from './Icons';
import { BaseModal } from './BaseModal';

interface ConfirmDeleteModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	collectionName: string;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({ isOpen, onClose, onConfirm, collectionName }) => {

	const handleConfirm = () => {
		onConfirm();
		onClose();
	};

	return (
		<BaseModal isOpen={isOpen} onClose={onClose} ariaLabelledBy="confirm-delete-title">
			<>
				<div className="px-6 pt-6 pb-4 text-center">
					<div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center mx-auto mb-4">
						<TrashIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
					</div>
					<h2 id="confirm-delete-title" className="font-semibold text-lg text-gray-900 dark:text-text-primary">Delete Collection</h2>
					<p className="mt-2 text-sm text-gray-600 dark:text-text-secondary">
						Are you sure you want to delete the "{collectionName}" collection? This action cannot be undone.
					</p>
				</div>
				<div className="px-6 py-4 bg-gray-50 dark:bg-bg-active border-t border-gray-200 dark:border-border-primary rounded-b-xl grid grid-cols-2 gap-3">
					<button onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-md border border-gray-300 dark:border-border-primary hover:bg-gray-100 dark:hover:bg-border-primary">
						Cancel
					</button>
					<button
						onClick={handleConfirm}
						className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
					>
						Delete
					</button>
				</div>
			</>
		</BaseModal>
	);
};