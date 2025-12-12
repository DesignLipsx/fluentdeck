import React, { memo } from 'react';
import SearchBar from './SearchBar';
import { Tabs } from './SegmentedControl';

interface GalleryFilterBarProps {
    searchTerm: string;
    onSearchTermChange: (term: string) => void;
    isLoading: boolean;
    itemCount: number;
    objectName: string; // "icons" or "emojis"
    searchAnalysis: Array<{ term: string; found: boolean }>;
    selectedStyle: string;
    onStyleChange: (style: string) => void;
    styleOptions: Array<{ value: string; label: string; tooltip?: string }>;
    children?: React.ReactNode;
}

const GalleryFilterBar = memo(({
    searchTerm,
    onSearchTermChange,
    isLoading,
    itemCount,
    objectName,
    searchAnalysis,
    selectedStyle,
    onStyleChange,
    styleOptions,
    children
}: GalleryFilterBarProps) => (
    <div className="w-full flex flex-col lg:flex-row gap-4 lg:items-start">
        <div className="w-full lg:flex-1">
            <SearchBar
                searchTerm={searchTerm}
                onSearchTermChange={onSearchTermChange}
                placeholder={isLoading ? `Loading ${objectName}...` : `Search ${itemCount} ${objectName}...`}
                isLoading={isLoading}
            />
            {searchTerm.includes(',') && searchAnalysis.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                    {searchAnalysis.map(({ term, found }) => (
                        <span
                            key={term}
                            className={`px-2 py-1 text-xs rounded-full ${found ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 line-through'}`}
                        >
                            {term}
                        </span>
                    ))}
                </div>
            )}
        </div>
        <div className="flex-shrink-0 w-full lg:w-auto flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-auto flex-shrink-0">
                <Tabs options={styleOptions} value={selectedStyle} onChange={onStyleChange} />
            </div>
            {children}
        </div>
    </div>
));

GalleryFilterBar.displayName = 'GalleryFilterBar';

export default GalleryFilterBar;