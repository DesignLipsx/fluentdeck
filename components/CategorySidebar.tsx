import React, { useState, useMemo } from 'react';
import { FolderTree } from './FolderTree';
import { CategoryNode } from '../types';

interface CategorySidebarProps {
	categories: CategoryNode[];
	onSelectCategory: (id: string | null) => void;
}

export const CategorySidebar: React.FC<CategorySidebarProps> = ({ categories, onSelectCategory }) => {
	const [selectedId, setSelectedId] = useState<string | null>(null);

	const handleSelect = (id: string | null) => {
		setSelectedId(id);
		onSelectCategory(id);
	};

	const renderTree = useMemo(() => {
		const renderNodes = (nodes: CategoryNode[]): React.ReactNode => {
			return nodes.map(node => {
				const hasChildren = node.children && node.children.length > 0;
				return (
					<FolderTree.Item key={node.id} id={node.id} label={node.label} icon={node.icon} hasChildren={hasChildren}>
						{hasChildren && (
							<FolderTree.Content>
								{renderNodes(node.children)}
							</FolderTree.Content>
						)}
					</FolderTree.Item>
				);
			});
		};
		return renderNodes(categories);
	}, [categories]);

	return (
		<div className="p-4 overflow-y-auto h-full pb-20 custom-scrollbar">
			<FolderTree.Root onSelect={handleSelect} selectedId={selectedId}>
				<FolderTree.Item id={null} label="All Apps" hasChildren={false} />
				{renderTree}
			</FolderTree.Root>
		</div>
	);
};