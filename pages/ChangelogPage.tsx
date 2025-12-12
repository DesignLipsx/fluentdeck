import React, { useState, useEffect, JSX } from 'react';
import { fetchWithCache } from '../utils';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { HistoryIcon } from '../components/Icons';

interface ChangelogEntry {
    version: string;
    date: string;
    content: string;
}

const parseChangelog = (text: string): ChangelogEntry[] => {
    const entries: ChangelogEntry[] = [];
    const lines = text.split('\n');

    let currentEntry: ChangelogEntry | null = null;
    let contentLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Match version headers like: ## Version 2.0.0 (2025-12-10)
        const versionMatch = line.match(/^##\s+Version\s+([\d.]+)\s+\((\d{2}-\d{2}-\d{4})\)/);

        if (versionMatch) {
            // Save previous entry if exists
            if (currentEntry) {
                currentEntry.content = contentLines.join('\n').trim();
                entries.push(currentEntry);
            }

            // Start new entry
            currentEntry = {
                version: `v${versionMatch[1]}`,
                date: versionMatch[2],
                content: ''
            };
            contentLines = [];
        } else if (currentEntry && line.trim() !== '' && !line.startsWith('# Changelog')) {
            // Add content to current entry
            contentLines.push(line);
        }
    }

    // Don't forget the last entry
    if (currentEntry) {
        currentEntry.content = contentLines.join('\n').trim();
        entries.push(currentEntry);
    }

    return entries;
};

// Simple markdown renderer for changelog content
const renderMarkdown = (content: string) => {
    const lines = content.split('\n');
    const elements: JSX.Element[] = [];
    let listItems: string[] = [];
    let inTable = false;
    let tableRows: string[][] = [];

    const flushList = () => {
        if (listItems.length > 0) {
            elements.push(
                <ul key={elements.length} className="mt-4 space-y-2.5 list-none">
                    {listItems.map((item, idx) => (
                        <li key={idx} className="flex items-start">
                            <span className="text-neutra-400 dark:text-neutral-500 mr-3 mt-0.5 flex-shrink-0">•</span>
                            <span className="text-neutral-600 dark:text-text-secondary leading-relaxed">
                                {item}
                            </span>
                        </li>
                    ))}
                </ul>
            );
            listItems = [];
        }
    };

    const flushTable = () => {
        if (tableRows.length > 0) {
            const headers = tableRows[0];
            const dataRows = tableRows.slice(2); // Skip header separator row

            elements.push(
                <div key={elements.length} className="mt-6 mb-6 overflow-x-auto rounded-lg border border-neutral-200 dark:border-border-primary">
                    <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
                        <thead className="bg-neutral-100 dark:bg-neutral-800">
                            <tr>
                                {headers.map((header, idx) => (
                                    <th
                                        key={idx}
                                        className="px-6 py-3.5 text-left text-sm font-semibold text-neutral-700 dark:text-neutral-300"
                                    >
                                        {header.trim().replace(/\*\*/g, '')}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-bg-secondary divide-y divide-neutral-200 dark:divide-neutral-700">
                            {dataRows.map((row, rowIdx) => (
                                <tr key={rowIdx} className="hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
                                    {row.map((cell, cellIdx) => (
                                        <td
                                            key={cellIdx}
                                            className={`px-6 py-4 text-sm ${cellIdx === 0
                                                ? 'font-medium text-neutral-900 dark:text-text-primary'
                                                : 'text-neutral-600 dark:text-text-secondary'
                                                }`}
                                        >
                                            {cell.trim().replace(/\*\*/g, '')}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
            tableRows = [];
            inTable = false;
        }
    };

    lines.forEach((line) => {
        // Handle headers
        if (line.startsWith('### ')) {
            flushList();
            flushTable();
            elements.push(
                <h3 key={elements.length} className="text-lg font-bold text-neutral-900 dark:text-text-primary mt-6 mb-3">
                    {line.replace('### ', '')}
                </h3>
            );
        }
        // Handle tables
        else if (line.includes('|')) {
            flushList();
            inTable = true;
            const cells = line.split('|').map(cell => cell.trim()).filter(cell => cell);
            tableRows.push(cells);
        }
        // Handle list items
        else if (line.startsWith('- ')) {
            if (inTable) flushTable();
            listItems.push(line.substring(2));
        }
        // Handle horizontal rules
        else if (line.trim() === '---') {
            flushList();
            flushTable();
            elements.push(
                <hr key={elements.length} className="my-6 border-neutral-200 dark:border-border-primary" />
            );
        }
        // Handle paragraphs
        else if (line.trim() && !line.startsWith('|')) {
            if (inTable) flushTable();
            flushList();
            elements.push(
                <p key={elements.length} className="text-neutral-600 dark:text-text-secondary mt-3 leading-relaxed">
                    {line}
                </p>
            );
        }
    });

    flushList();
    flushTable();

    return elements;
};

const ChangelogPage: React.FC = () => {
    const [changelog, setChangelog] = useState<ChangelogEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        document.title = 'Fluent Deck | Changelog';

        const fetchChangelog = async () => {
            setIsLoading(true);
            try {
                const markdown = await fetchWithCache('changelog-md', '/CHANGELOG.md', 'text');
                const parsed = parseChangelog(markdown);
                setChangelog(parsed);
            } catch (error) {
                console.error("Failed to fetch changelog:", error);
                setChangelog([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchChangelog();
    }, []);

    return (
        <div className="py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">

                {/* Header */}
                <div className="flex items-center space-x-3">
                    <HistoryIcon className="w-8 h-8 text-neutral-900 dark:text-text-primary" />
                    <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-text-primary">
                        Changelog
                    </h1>
                </div>

                <p className="mt-4 text-base text-neutral-500 dark:text-text-secondary">
                    Track the latest updates, improvements, and new features added to Fluent Deck.
                </p>

                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <LoadingSpinner text="Loading changelog..." />
                    </div>
                ) : (
                    <div className="mt-8 space-y-6">
                        {changelog.map((entry, index) => (
                            <div
                                key={index}
                                className="bg-white dark:bg-bg-secondary border border-neutral-200 dark:border-border-primary rounded-xl p-4 sm:p-6 lg:p-8"
                            >
                                {/* Version and Date */}
                                <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
                                    <h2 className="text-2xl font-bold text-neutral-900 dark:text-text-primary">
                                        {entry.version}
                                    </h2>
                                    {entry.date && (
                                        <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 uppercase tracking-wide">
                                            {entry.date}
                                        </p>
                                    )}
                                </div>

                                {/* Content */}
                                <div>
                                    {renderMarkdown(entry.content)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
};

export default ChangelogPage;