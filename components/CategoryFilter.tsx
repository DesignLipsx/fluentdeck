import React, { useState, useEffect } from 'react';
import { emojiCategories } from '../constants';
import { Tabs, Dropdown } from './SegmentedControl';

const useMediaQuery = (query: string) => {
	const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

	useEffect(() => {
		const media = window.matchMedia(query);
		const listener = () => {
			setMatches(media.matches);
		};
		media.addEventListener('change', listener);
		return () => {
			media.removeEventListener('change', listener);
		};
	}, [query]);

	return matches;
};

interface CategoryFilterProps {
	selectedCategory: string;
	onCategoryChange: (category: string) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({ selectedCategory, onCategoryChange }) => {
	const isLg = useMediaQuery('(min-width: 1024px)');

	const categoryOptionsForTabs = emojiCategories.map(c => ({
		value: c.value,
		label: '',
		icon: <span className="text-lg">{c.icon}</span>,
		tooltip: c.label
	}));
	const categoryOptionsForDropdown = emojiCategories.map(c => ({
		value: c.value,
		label: c.label,
		icon: <span className="text-base">{c.icon}</span>
	}));

	return (
		<div className="w-full lg:w-auto">
			{isLg ? (
				<Tabs options={categoryOptionsForTabs} value={selectedCategory} onChange={onCategoryChange} />
			) : (
				<Dropdown
					label="Category"
					options={categoryOptionsForDropdown}
					value={selectedCategory}
					onChange={onCategoryChange}
					className="w-full"
				/>
			)}
		</div>
	);
};
