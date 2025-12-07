import React, { useState, useEffect, useMemo, FC, useRef } from 'react';
import { App, Category } from '../types';
import AppCard from '../components/AppCard';
import { useAuth } from '../hooks/useAuth';
import ContextMenu from '../components/ContextMenu';
import LogoUrlModal from '../components/LogoUrlModal';
import { SearchIcon, CloseIcon, FilterListIcon } from '../components/Icons';
import Tabs, { Dropdown } from '../components/Tabs';

// --- SEOHead Component ---
const SEOHead: FC<{ title: string; description: string; url: string; image?: string }> = ({ title, description, url, image }) => {
    return (
        <React.Fragment>
            <title>{title}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={url} />

            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:url" content={url} />
            <meta property="og:type" content="website" />
            {image && <meta property="og:image" content={image} />}

            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            {image && <meta name="twitter:image" content={image} />}

            <script type="application/ld+json">
                {`
                    {
                        "@context": "https://schema.org",
                        "@type": "WebSite",
                        "url": "${url.split('?')[0]}",
                        "name": "Windows Apps Catalog",
                        "description": "A curated catalog of modern Windows apps, organized by category, pricing, and design tags."
                    }
                `}
            </script>
        </React.Fragment>
    );
};

const slugify = (text: string) =>
    text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-');

// --- Category Sidebar Components ---
interface FileTreeItem {
    name: string;
    fullName: string;
    type: 'file' | 'folder';
    children?: FileTreeItem[];
    emoji?: string;
}

const ChevronIcon: FC<{ isOpen: boolean }> = ({ isOpen }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className={`w-4 h-4 text-text-tertiary transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-90' : ''
            }`}
    >
        <path
            fillRule="evenodd"
            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
            clipRule="evenodd"
        />
    </svg>
);

const TreeNode: FC<{ item: FileTreeItem; selectedCat: string; onCatSelect: (catName: string) => void }> = ({
    item,
    selectedCat,
    onCatSelect,
}) => {
    const isFolder = item.type === 'folder';
    const [isOpen, setIsOpen] = useState(false);

    const isSelected = selectedCat === item.fullName;

    return (
        <div className="relative">
            <div
                className={`flex items-center py-1.5 px-2 rounded-md cursor-pointer text-text-primary ${isSelected
                    ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-white'
                    : 'hover:bg-bg-hover'
                    }`}
            >
                <div className="flex items-center flex-grow" onClick={() => onCatSelect(item.fullName)}>
                    {isFolder ? (
                        <div
                            className="w-4 shrink-0"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsOpen(!isOpen);
                            }}
                        >
                            <ChevronIcon isOpen={isOpen} />
                        </div>
                    ) : (
                        <div className="w-4 shrink-0" />
                    )}
                    <div className="flex items-center ml-1">
                        {item.emoji && <span className="mr-2 text-base">{item.emoji}</span>}
                        <span className="text-sm">{item.name}</span>
                    </div>
                </div>
            </div>
            <div
                className={`pl-4 relative overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[1000px]' : 'max-h-0'
                    }`}
            >
                {isFolder &&
                    isOpen &&
                    item.children &&
                    item.children.map((child) => (
                        <TreeNode
                            key={child.fullName}
                            item={child}
                            selectedCat={selectedCat}
                            onCatSelect={onCatSelect}
                        />
                    ))}
            </div>
        </div>
    );
};

const CategorySidebar: FC<{
    isOpen: boolean;
    onClose: () => void;
    categories: Category[];
    selectedCategory: string;
    onCategorySelect: (filter: string) => void;
}> = ({ isOpen, onClose, categories, selectedCategory, onCategorySelect }) => {
    const categoryTreeData = useMemo(() => {
        const tree: FileTreeItem[] = [];
        const folders: Record<string, FileTreeItem> = {};

        categories.forEach((cat) => {
            if (!cat.name.includes(' / ')) {
                const node: FileTreeItem = {
                    name: cat.name,
                    fullName: cat.name,
                    type: 'folder',
                    children: [],
                    emoji: cat.emoji,
                };
                folders[cat.name] = node;
                tree.push(node);
            }
        });

        categories.forEach((cat) => {
            if (cat.name.includes(' / ')) {
                const parts = cat.name.split(' / ');
                const subCatName = parts.pop() || '';
                const mainCatName = parts.join(' / ');

                if (folders[mainCatName]) {
                    folders[mainCatName].children!.push({
                        name: subCatName,
                        fullName: cat.name,
                        type: 'file',
                        emoji: cat.emoji,
                    });
                }
            }
        });

        tree.forEach((node) => {
            const mainCategoryWithApps = categories.find((c) => c.name === node.fullName);
            const hasSubCategories = node.children!.length > 0;

            if (mainCategoryWithApps && mainCategoryWithApps.apps.length > 0) {
                if (hasSubCategories) {
                    node.children?.unshift({ name: 'Overview', fullName: node.fullName, type: 'file' });
                }
            }

            if (hasSubCategories) {
                node.type = 'folder';
            } else {
                node.type = 'file';
                delete node.children;
            }
        });

        const allCategoriesItem: FileTreeItem = { name: 'All Categories', fullName: 'All', type: 'file' };
        return [allCategoriesItem, ...tree];
    }, [categories]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-30 animate-fade-in-fast" onClick={onClose}>
            <div
                className="fixed inset-y-0 left-0 z-40 w-72 bg-bg-primary border-r border-border-primary p-4 transform animate-slide-in-left"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="text-lg font-semibold text-text-primary px-2 mb-2">Categories</h3>
                <div className="space-y-1">
                    {categoryTreeData.map((item) => (
                        <TreeNode
                            key={item.fullName}
                            item={item}
                            selectedCat={selectedCategory}
                            onCatSelect={onCategorySelect}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- Filters ---
interface FilterOption {
    value: string;
    label: string;
    tooltip?: string;
}

export const pricingOptions: FilterOption[] = [
    { value: 'All', label: 'All Pricing' },
    { value: 'Free', label: 'Free' },
    { value: 'FOSS', label: 'FOSS', tooltip: 'Free and Open Source Software' },
    { value: 'Paid', label: 'Paid' },
];

const tagOptions: FilterOption[] = [
    { value: 'All', label: 'All Tags' },
    { value: 'WD', label: 'WD', tooltip: 'Apps that follow WinUI 3 Design Only' },
    { value: 'WDM', label: 'WDM', tooltip: 'Apps that have both WinUI 3 design and Mica Material' },
    { value: 'WDA', label: 'WDA', tooltip: 'Apps that have both WinUI 3 design and Acrylic Material' },
];

// --- Apps Page ---
interface AppsPageProps {
    categories: Category[];
    onLogoUpdate: (appName: string, newLogoUrl: string) => void;
}

const AppsPage: React.FC<AppsPageProps> = ({ categories = [], onLogoUpdate }) => {
    const { user } = useAuth();

    // ✅ Sample fallback categories
    const sampleCategories: Category[] = useMemo(
        () => [
            {
                name: 'Productivity',
                emoji: '💼',
                apps: [
                    {
                        name: 'NotepadX',
                        description: 'A modern Notepad replacement with dark mode.',
                        logo_url: 'https://cdn-icons-png.flaticon.com/512/2107/2107957.png',
                        pricing: 'Free',
                        tags: ['WD', 'Mica'],
                    },
                    {
                        name: 'Taskify',
                        description: 'Minimal to-do manager for Windows.',
                        logo_url: 'https://cdn-icons-png.flaticon.com/512/1828/1828817.png',
                        pricing: 'Paid',
                        tags: ['WDM'],
                    },
                ],
            },
            {
                name: 'Media / Audio',
                emoji: '🎧',
                apps: [
                    {
                        name: 'WavePlay',
                        description: 'Lightweight music player with Fluent Design.',
                        logo_url: 'https://cdn-icons-png.flaticon.com/512/727/727245.png',
                        pricing: 'FOSS',
                        tags: ['WDA'],
                    },
                ],
            },
        ],
        []
    );

    // ✅ Use real categories if available, otherwise fallback to sample data
    const effectiveCategories = categories.length > 0 ? categories : sampleCategories;

    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; app: App } | null>(null);
    const [modalApp, setModalApp] = useState<App | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [pricingFilter, setPricingFilter] = useState('All');
    const [tagFilter, setTagFilter] = useState('All');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    const filterRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const updateHeight = () => {
            window.requestAnimationFrame(() => {
                if (filterRef.current) {
                    const height = filterRef.current.offsetHeight;
                    // Add 12px extra spacing
                    document.documentElement.style.setProperty('--filter-height', `${height + 15}px`);
                }
            });
        };
        updateHeight();
        window.addEventListener('resize', updateHeight);
        return () => {
            window.removeEventListener('resize', updateHeight);
            document.documentElement.style.removeProperty('--filter-height');
        };
    }, [searchTerm, pricingFilter, tagFilter]);

    const handleContextMenu = (event: React.MouseEvent, app: App) => {
        if (!user) return;
        event.preventDefault();
        setContextMenu({ x: event.clientX, y: event.clientY, app });
    };

    const closeContextMenu = () => setContextMenu(null);
    useEffect(() => {
        window.addEventListener('click', closeContextMenu);
        return () => window.removeEventListener('click', closeContextMenu);
    }, []);

    const handleCategorySelectAndJump = (fullName: string) => {
        setSelectedCategory(fullName);
        setSidebarOpen(false);
        setTimeout(() => {
            if (fullName === 'All') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return;
            }
            const mainCatName = fullName.split(' / ')[0];
            const element = document.getElementById(slugify(mainCatName));
            if (element) {
                const headerOffset =
                    parseInt(
                        getComputedStyle(document.documentElement)
                            .getPropertyValue('--filter-height')
                            .replace('px', '')
                    ) || 112;
                const elementPosition = element.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth',
                });
            }
        }, 0);
    };

    const filteredCategories = useMemo(() => {
        const hasActiveFilters = searchTerm || pricingFilter !== 'All' || tagFilter !== 'All';
        return effectiveCategories
            .map((category) => {
                if (hasActiveFilters && category.name.toLowerCase().includes('newly added')) {
                    return { ...category, apps: [] };
                }
                const filteredApps = category.apps.filter((app) => {
                    const pricingMatch = pricingFilter === 'All' || app.pricing === pricingFilter;
                    const tagMatch = tagFilter === 'All' || app.tags.includes(tagFilter);
                    const searchMatch =
                        !searchTerm ||
                        app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        app.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));
                    return pricingMatch && tagMatch && searchMatch;
                });
                return { ...category, apps: filteredApps };
            })
            .filter((category) => category.apps.length > 0);
    }, [effectiveCategories, searchTerm, pricingFilter, tagFilter]);

    const groupedCategories = useMemo(() => {
        const mainCategoriesMap: Map<string, { main: Category; subs: Category[] }> = new Map();
        const mainCategoriesInOrder: Category[] = [];

        effectiveCategories.forEach((cat) => {
            if (!cat.name.includes(' / ')) {
                mainCategoriesMap.set(cat.name, { main: cat, subs: [] });
                mainCategoriesInOrder.push(cat);
            }
        });

        effectiveCategories.forEach((cat) => {
            if (cat.name.includes(' / ')) {
                const parts = cat.name.split(' / ');
                const mainName = parts[0];
                if (mainCategoriesMap.has(mainName)) {
                    const subName = parts.slice(1).join(' / ');
                    mainCategoriesMap.get(mainName)!.subs.push({ ...cat, name: subName });
                }
            }
        });

        for (const group of mainCategoriesMap.values()) {
            group.subs.sort((a, b) => a.name.localeCompare(b.name));
        }

        return mainCategoriesInOrder
            .map((mainCat) => {
                const group = mainCategoriesMap.get(mainCat.name)!;
                const filteredMainApps = filteredCategories.find((c) => c.name === mainCat.name)?.apps || [];
                const filteredSubCategories = group.subs
                    .map((sub) => {
                        const fullSubName = `${mainCat.name} / ${sub.name}`;
                        const filteredCat = filteredCategories.find((c) => c.name === fullSubName);
                        return filteredCat && filteredCat.apps.length > 0
                            ? { ...sub, apps: filteredCat.apps, fullName: fullSubName }
                            : null;
                    })
                    .filter((c): c is Category & { fullName: string } => c !== null);

                if (filteredMainApps.length === 0 && filteredSubCategories.length === 0) return null;

                return {
                    name: mainCat.name,
                    emoji: mainCat.emoji,
                    apps: filteredMainApps,
                    subCategories: filteredSubCategories,
                };
            })
            .filter((g): g is NonNullable<typeof g> => g !== null);
    }, [filteredCategories, effectiveCategories]);

    const currentCategoryLabel = useMemo(() => {
        if (selectedCategory === 'All') return 'All Categories';
        return selectedCategory;
    }, [selectedCategory]);

    const seoTitle = useMemo(() => {
        const baseTitle = 'Windows Apps Catalog - Modern Apps for Windows';
        if (selectedCategory === 'All') return baseTitle;
        return `${selectedCategory} Apps - Windows Apps Catalog`;
    }, [selectedCategory]);

    const seoDescription = useMemo(() => {
        if (selectedCategory === 'All') {
            return 'Discover and find the best modern Windows apps. Browse by category, pricing (Free, FOSS, Paid), and design tags (WinUI 3, Mica, Acrylic).';
        }
        return `Explore modern Windows apps in the ${selectedCategory} category. Find productivity tools, utilities, and more with the latest WinUI design.`;
    }, [selectedCategory]);

    return (
        <div className="min-h-screen flex flex-col">
            <SEOHead
                title={seoTitle}
                description={seoDescription}
                url={
                    selectedCategory === 'All'
                        ? 'https://your-site.com/apps'
                        : `https://your-site.com/apps?category=${slugify(selectedCategory)}`
                }
                image="https://your-site.com/social-share-image.png"
            />

            <style>{`
                :root { --filter-height: 112px; }
            `}</style>

            <CategorySidebar
                isOpen={isSidebarOpen}
                onClose={() => setSidebarOpen(false)}
                categories={effectiveCategories}
                selectedCategory={selectedCategory}
                onCategorySelect={handleCategorySelectAndJump}
            />

            <div
                ref={filterRef} // Reference for height measurement
                className="fixed top-0 left-0 right-0 z-20 bg-bg-backdrop backdrop-blur-md border-b border-border-primary pt-16"
            >
                <div className="px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-col lg:flex-row gap-4 items-center">
                        <div className="relative w-full flex-1">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                <SearchIcon />
                            </span>
                            <input
                                type="text"
                                placeholder="Search apps by name or tag..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full h-10 pl-10 pr-10 bg-bg-secondary border border-border-secondary rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-text-tertiary hover:text-text-primary"
                                    aria-label="Clear search"
                                >
                                    <CloseIcon className="w-5 h-5" />
                                </button>
                            )}
                        </div>

                        <div className="w-full lg:w-auto flex flex-col lg:flex-row items-center gap-4">
                            {/* Category button (Logic is now fully connected) */}
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="w-full flex items-center lg:justify-start bg-bg-secondary border border-border-secondary rounded-full h-10 px-3 text-sm hover:bg-bg-hover"
                            >
                                <span className="text-text-tertiary">Category:</span>
                                <span className="mx-1" />
                                <span className="text-text-primary font-medium truncate">{currentCategoryLabel}</span>
                                <span className="flex-1" />
                                <FilterListIcon className="w-6 h-6 p-1 bg-bg-active rounded-full shrink-0 lg:ml-2" />
                            </button>
                            {/* Desktop Tabs */}
                            <div className="hidden md:block w-full lg:w-auto">
                                <Tabs
                                    options={pricingOptions}
                                    value={pricingFilter}
                                    onChange={setPricingFilter}
                                    className="h-10 w-full"
                                />
                            </div>
                            <div className="hidden md:block w-full lg:w-auto">
                                <Tabs
                                    options={tagOptions}
                                    value={tagFilter}
                                    onChange={setTagFilter}
                                    className="h-10 w-full"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Mobile layout for filters: Now using Dropdown */}
                    <div className="grid grid-cols-2 md:hidden gap-4 mt-4 w-full">
                        <div className="w-full">
                            <Dropdown
                                label="Pricing"
                                options={pricingOptions}
                                value={pricingFilter}
                                onChange={setPricingFilter}
                                className="h-10 w-full"
                            />
                        </div>
                        <div className="w-full">
                            <Dropdown
                                label="Tags"
                                options={tagOptions}
                                value={tagFilter}
                                onChange={setTagFilter}
                                className="h-10 w-full"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <main className="pt-[var(--filter-height)] pb-10 px-4 sm:px-6 md:px-8">
              {groupedCategories.length === 0 ? (
                <div className="text-center text-text-secondary py-20">No apps found.</div>
              ) : (
                groupedCategories.map((group) => (
                  <section key={group.name} id={slugify(group.name)} className="mb-12">
                    <h2 className="text-2xl font-semibold flex items-center gap-2 mb-6">
                      {group.emoji && <span>{group.emoji}</span>}
                      {group.name}
                    </h2>
                    {group.apps.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 2xl:grid-cols-7 gap-4 mb-8">
                        {group.apps.map((app) => (
                          <AppCard
                            key={app.name}
                            app={app}
                            onContextMenu={(e) => handleContextMenu(e, app)}
                          />
                        ))}
                      </div>
                    )}
                    {group.subCategories.map((sub) => (
                      <div key={sub.fullName} className="mb-8">
                        <h3 className="text-lg font-medium text-text-secondary mb-3 ml-1">
                          {sub.name}
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
                          {sub.apps.map((app) => (
                            <AppCard
                              key={app.name}
                              app={app}
                              onContextMenu={(e) => handleContextMenu(e, app)}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </section>
                ))
              )}
            </main>

            {contextMenu && (
                <ContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    app={contextMenu.app}
                    onClose={closeContextMenu}
                    onLogoChange={() => setModalApp(contextMenu.app)}
                />
            )}

            {modalApp && (
                <LogoUrlModal
                    app={modalApp}
                    onClose={() => setModalApp(null)}
                    onSave={(newUrl) => {
                        onLogoUpdate(modalApp.name, newUrl);
                        setModalApp(null);
                    }}
                />
            )}
        </div>
    );
};

export default AppsPage;
