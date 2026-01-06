import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { SearchIcon, XIcon, HistoryIcon } from '@/components/Icons';

interface SearchBarProps {
	searchTerm: string;
	onSearchTermChange: (value: string) => void;
	placeholder: string;
	isLoading?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchTerm, onSearchTermChange, placeholder, isLoading }) => {
	const [isFocused, setIsFocused] = useState(false);
	const [history, setHistory] = useState<string[]>([]);
	const containerRef = useRef<HTMLDivElement>(null);

	// Get current route to namespace the history (e.g. "/apps/", "/emoji/", etc.)
	const location = useLocation();
	const getHistoryKey = (pathname: string) => {
		if (pathname.startsWith('/emoji')) return 'search_history_/emoji/';
		if (pathname.startsWith('/icons')) return 'search_history_/icons/';
		if (pathname.startsWith('/apps')) return 'search_history_/apps/';
		return `search_history_${pathname}`;
	}
	const historyKey = getHistoryKey(location.pathname);

	// Load history specific to this page
	useEffect(() => {
		const savedHistory = localStorage.getItem(historyKey);
		if (savedHistory) {
			try {
				setHistory(JSON.parse(savedHistory));
			} catch (e) {
				console.error("Failed to parse search history", e);
			}
		} else {
			setHistory([]);
		}
	}, [historyKey]);

	const saveHistory = (newHistory: string[]) => {
		setHistory(newHistory);
		localStorage.setItem(historyKey, JSON.stringify(newHistory));
	};

	const addToHistory = (term: string) => {
		if (!term.trim()) return;
		// Keep unique, max 4 items
		const newHistory = [term, ...history.filter(h => h !== term)].slice(0, 4);
		saveHistory(newHistory);
	};

	const removeHistoryItem = (e: React.MouseEvent, termToRemove: string) => {
		e.stopPropagation(); // Prevent triggering the selection click
		e.preventDefault();
		const newHistory = history.filter(term => term !== termToRemove);
		saveHistory(newHistory);
	};

	const clearAllHistory = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		saveHistory([]);
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			addToHistory(searchTerm);
			(e.target as HTMLInputElement).blur();
			setIsFocused(false);
		}
	};

	// Handle clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
				setIsFocused(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const showHistory = isFocused && history.length > 0;

	return (
		<div className="relative w-full" ref={containerRef}>
			<div className="relative">
				<span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
					<SearchIcon className="h-5 w-5 text-text-secondary" />
				</span>
				<input
					id="global-search-bar"
					type="text"
					placeholder={placeholder}
					value={searchTerm}
					onFocus={() => setIsFocused(true)}
					onChange={(e) => onSearchTermChange(e.target.value)}
					onKeyDown={handleKeyDown}
					autoComplete="off"
					className={`
						w-full h-10 py-2 pl-10 pr-24
						bg-bg-primary
						border border-border-primary
						rounded-lg focus:outline-none
						text-text-primary
						placeholder:text-sm placeholder:opacity-75
						${showHistory ? 'rounded-b-none lg:rounded-b-none' : ''}
				`	}
					disabled={isLoading}
				/>

				{/* Desktop Shortcut Hint */}
				{!searchTerm && !isFocused && (
					<div className="absolute inset-y-0 right-0 hidden sm:flex items-center pr-3 pointer-events-none text-xs text-text-secondary">
						<kbd className="px-1.5 py-1 font-sans font-semibold text-text-secondary bg-bg-active border border-border-primary rounded-md">Ctrl</kbd>
						<span className="mx-1">+</span>
						<kbd className="px-1.5 py-1 font-sans font-semibold text-text-secondary bg-bg-active border border-border-primary rounded-md">K</kbd>
					</div>
				)}

				{/* Clear Input Button */}
				{searchTerm && (
					<button
						onClick={() => onSearchTermChange('')}
						className="absolute inset-y-0 right-0 flex items-center pr-3 text-text-secondary hover:text-text-primary transition-colors"
						aria-label="Clear search"
					>
						<XIcon className="w-5 h-5" />
					</button>
				)}
			</div>

			{/* History Dropdown (Desktop Only) */}
			{showHistory && (
				<div className="hidden lg:block absolute z-50 left-0 right-0 top-full bg-bg-primary border-x border-b border-border-primary rounded-b-lg shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
					<div className="py-2">
						<div className="px-4 py-2 flex items-center justify-between text-xs font-semibold text-text-secondary uppercase tracking-wider">
							<span>Recent</span>
							<button
								onClick={clearAllHistory}
								className="hover:text-red-500 transition-colors cursor-pointer"
							>
								Clear All
							</button>
						</div>
						<ul>
							{history.map((term, index) => (
								<li key={index} className="relative group">
									<button
										className="w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-bg-active transition-colors"
										onClick={() => {
											onSearchTermChange(term);
											addToHistory(term);
											setIsFocused(false);
										}}
									>
										<HistoryIcon className="w-4 h-4 text-text-secondary group-hover:text-text-primary" />
										<span className="text-sm text-text-secondary group-hover:text-text-primary truncate flex-1">
											{term}
										</span>
									</button>

									{/* Individual Delete Button */}
									<button
										onClick={(e) => removeHistoryItem(e, term)}
										className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-bg-active text-text-secondary hover:text-text-primary transition-all"
										title="Remove from history"
									>
										<XIcon className="w-3.5 h-3.5" />
									</button>
								</li>
							))}
						</ul>
					</div>
				</div>
			)}
		</div>
	);
};

export default SearchBar;