import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { ChevronDownIcon, ChevronRightIcon } from './Icons';

interface FolderTreeContextType {
	selectedId: string | null;
	expandedIds: Set<string>;
	handleSelect: (id: string | null) => void;
	toggleExpand: (id: string) => void;
}

const FolderTreeContext = createContext<FolderTreeContextType | undefined>(undefined);

const useFolderTree = () => {
	const context = useContext(FolderTreeContext);
	if (!context) {
		throw new Error('useFolderTree must be used within a FolderTree.Root');
	}
	return context;
};

const Root: React.FC<{ children: ReactNode; onSelect: (id: string | null) => void; selectedId: string | null }> = ({ children, onSelect, selectedId }) => {
	const [expandedIds, setExpandedIds] = useState(new Set<string>());

	const toggleExpand = useCallback((id: string) => {
		setExpandedIds(prev => {
			const newIds = new Set(prev);
			if (newIds.has(id)) {
				newIds.delete(id);
			} else {
				newIds.add(id);
			}
			return newIds;
		});
	}, []);

	const value = { selectedId, handleSelect: onSelect, expandedIds, toggleExpand };

	return (
		<FolderTreeContext.Provider value={value}>
			<div className="space-y-1">{children}</div>
		</FolderTreeContext.Provider>
	);
};

const Content: React.FC<{ children: ReactNode }> = ({ children }) => <div className="pl-6 space-y-1">{children}</div>;

interface ItemProps {
	id: string | null;
	label: string;
	icon?: string;
	children?: ReactNode;
	hasChildren: boolean;
}

const Item: React.FC<ItemProps> = ({ id, label, icon, children, hasChildren }) => {
	const { selectedId, handleSelect, expandedIds, toggleExpand } = useFolderTree();
	const isSelected = selectedId === id;
	const isExpanded = id ? expandedIds.has(id) : false;

	const handleItemClick = () => {
		handleSelect(id);
	};

	const handleChevronClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (hasChildren && id) {
			toggleExpand(id);
		}
	};

	return (
		<div>
			<div
				onClick={handleItemClick}
				className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors text-sm ${isSelected
						? 'bg-blue-100 dark:bg-accent/20 text-blue-600 dark:text-accent font-medium'
						: 'text-gray-600 dark:text-text-secondary hover:bg-gray-100 dark:hover:bg-bg-active'
					}`}
			>
				<div onClick={hasChildren ? handleChevronClick : undefined} className="flex-shrink-0">
					{hasChildren ? (isExpanded ? <ChevronDownIcon className="w-4 h-4" /> : <ChevronRightIcon className="w-4 h-4" />) : <div className="w-4 h-4" />}
				</div>
				{icon && <img src={icon} alt="" className="w-5 h-5 flex-shrink-0" />}
				<span className="flex-1 truncate">{label}</span>
			</div>
			{isExpanded && children}
		</div>
	);
};

export const FolderTree = { Root, Item, Content };