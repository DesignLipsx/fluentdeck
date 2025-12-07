import React, { useState, useEffect, useMemo, FC, useCallback } from 'react';
import { App, Category } from '../types';
import AppCard from '../components/AppCard';
import { useAuth } from '../hooks/useAuth';
import ContextMenu from '../components/ContextMenu';
import LogoUrlModal from '../components/LogoUrlModal';
import { SearchIcon, CloseIcon, FilterListIcon } from '../components/Icons';
import Tabs, { Dropdown } from '../components/Tabs'; // <-- UPDATED: Import Dropdown

const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-');

// --- Category Sidebar Components ---
interface FileTreeItem {
  name: string;
  fullName: string;
  type: "file" | "folder";
  children?: FileTreeItem[];
  emoji?: string;
}
const ChevronIcon: FC<{ isOpen: boolean }> = ({ isOpen }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-4 h-4 text-text-tertiary transition-transform duration-200 shrink-0 ${isOpen ? "rotate-90" : ""}`} >
      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
    </svg>
);
const TreeNode: FC<{ item: FileTreeItem; selectedCat: string; onCatSelect: (catName: string) => void;}> = ({ item, selectedCat, onCatSelect }) => {
    const isFolder = item.type === "folder";
    const [isOpen, setIsOpen] = useState(false);

    const isSelected = selectedCat === item.fullName;

    return (
        <div className="relative">
            <div className={`flex items-center py-1.5 px-2 rounded-md cursor-pointer text-text-primary ${ isSelected ? "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-white" : "hover:bg-bg-hover"}`} >
                <div className="flex items-center flex-grow" onClick={() => onCatSelect(item.fullName)}>
                    {isFolder ? <div className="w-4 shrink-0" onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}><ChevronIcon isOpen={isOpen} /></div> : <div className="w-4 shrink-0" />}
                    <div className="flex items-center ml-1">
                        {item.emoji && <span className="mr-2 text-base">{item.emoji}</span>}
                        <span className="text-sm">{item.name}</span>
                    </div>
                </div>
            </div>
            <div className={`pl-4 relative overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-[1000px]" : "max-h-0"}`}>
                {isFolder && isOpen && item.children && item.children.map((child) => ( <TreeNode key={child.fullName} item={child} selectedCat={selectedCat} onCatSelect={onCatSelect} />))}
            </div>
        </div>
    );
};
const CategorySidebar: FC<{isOpen: boolean; onClose: () => void; categories: Category[]; selectedCategory: string; onCategorySelect: (filter: string) => void;}> = ({ isOpen, onClose, categories, selectedCategory, onCategorySelect }) => {
    const categoryTreeData = useMemo(() => {
        const tree: FileTreeItem[] = [];
        const folders: Record<string, FileTreeItem> = {};

        // Pass 1: Create all main categories.
        categories.forEach(cat => {
            if (!cat.name.includes(' / ')) {
                const node: FileTreeItem = {
                    name: cat.name,
                    fullName: cat.name,
                    type: 'folder', // Temp type
                    children: [],
                    emoji: cat.emoji,
                };
                folders[cat.name] = node;
                tree.push(node);
            }
        });

        // Pass 2: Add sub-categories to parents.
        categories.forEach(cat => {
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

        // Pass 3: Finalize types and add "Overview" nodes.
        tree.forEach(node => {
            const mainCategoryWithApps = categories.find(c => c.name === node.fullName);
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
    
    if(!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 z-30 animate-fade-in-fast" onClick={onClose}>
            <div className="fixed inset-y-0 left-0 z-40 w-72 bg-bg-primary border-r border-border-primary p-4 transform animate-slide-in-left" onClick={e => e.stopPropagation()}>
                 <h3 className="text-lg font-semibold text-text-primary px-2 mb-2">Categories</h3>
                 <div className="space-y-1">
                    {categoryTreeData.map((item) => <TreeNode key={item.fullName} item={item} selectedCat={selectedCategory} onCatSelect={onCategorySelect} />)}
                 </div>
            </div>
        </div>
    );
};

// --- Apps Page ---
interface AppsPageProps {
  categories: Category[];
  onLogoUpdate: (appName: string, newLogoUrl: string) => void;
}
interface FilterOption {
    value: string;
    label: string;
    tooltip?: string;
}

export const pricingOptions: FilterOption[] = [
    { value: 'All', label: 'All Pricing', tooltip: 'Show all apps' },
    { value: 'Free', label: 'Free', tooltip: 'Show only apps that are free to download and use' },
    { value: 'FOSS', label: 'FOSS', tooltip: 'Show only apps that are Free and Open Source Software' },
    { value: 'Paid', label: 'Paid', tooltip: 'Show only apps that require a one-time purchase or subscription' }
];
const tagOptions: FilterOption[] = [
    { value: 'All', label: 'All Tags' },
    { value: 'WD', label: 'WD', tooltip: 'Apps that follow WinUI 3 Design Only' },
    { value: 'WDM', label: 'WDM', tooltip: 'Apps that have both WinUI 3 design and Mica Material' },
    { value: 'WDA', label: 'WDA', tooltip: 'Apps that have both WinUI 3 design and Acrylic Material' },
];

const AppsPage: React.FC<AppsPageProps> = ({ categories, onLogoUpdate }) => {
  const { user } = useAuth();
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, app: App } | null>(null);
  const [modalApp, setModalApp] = useState<App | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [pricingFilter, setPricingFilter] = useState('All');
  const [tagFilter, setTagFilter] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isSidebarOpen, setSidebarOpen] = useState(false);

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
            const headerOffset = 80; // height of header (64px) + some padding
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          
            window.scrollTo({
                 top: offsetPosition,
                 behavior: "smooth"
            });
        }
    }, 0);
  };

  const filteredCategories = useMemo(() => {
    // Check if any filters are active
    const hasActiveFilters = searchTerm || pricingFilter !== 'All' || tagFilter !== 'All';
    
    return categories
      .map(category => {
        // Exclude "Newly Added Apps" section when filters are active
        if (hasActiveFilters && category.name.toLowerCase().includes('newly added')) {
          return { ...category, apps: [] };
        }
        
        const filteredApps = category.apps.filter(app => {
          const pricingMatch = pricingFilter === 'All' || app.pricing === pricingFilter;
          const tagMatch = tagFilter === 'All' || app.tags.includes(tagFilter);
          const searchMatch = !searchTerm ||
            app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
          
          return pricingMatch && tagMatch && searchMatch;
        });
        return { ...category, apps: filteredApps };
      })
      .filter(category => category.apps.length > 0);
  }, [categories, searchTerm, pricingFilter, tagFilter]);
  
  const groupedCategories = useMemo(() => {
      const mainCategoriesMap: Map<string, { main: Category, subs: Category[] }> = new Map();
      const mainCategoriesInOrder: Category[] = [];
  
      categories.forEach(cat => {
          if (!cat.name.includes(' / ')) {
              mainCategoriesMap.set(cat.name, { main: cat, subs: [] });
              mainCategoriesInOrder.push(cat);
          }
      });
  
      categories.forEach(cat => {
          if (cat.name.includes(' / ')) {
              const parts = cat.name.split(' / ');
              const mainName = parts[0];
              
              if (mainCategoriesMap.has(mainName)) {
                  const subName = parts.slice(1).join(' / ');
                  mainCategoriesMap.get(mainName)!.subs.push({ ...cat, name: subName });
              }
          }
      });

      for(const group of mainCategoriesMap.values()) {
        group.subs.sort((a,b) => a.name.localeCompare(b.name));
      }
  
      return mainCategoriesInOrder
          .map(mainCat => {
              const group = mainCategoriesMap.get(mainCat.name)!;
              
              const filteredMainApps = filteredCategories.find(c => c.name === mainCat.name)?.apps || [];
              const filteredSubCategories = group.subs
                  .map(sub => {
                      const fullSubName = `${mainCat.name} / ${sub.name}`;
                      const filteredCat = filteredCategories.find(c => c.name === fullSubName);
                      return filteredCat && filteredCat.apps.length > 0 ? { ...sub, apps: filteredCat.apps, fullName: fullSubName } : null;
                  })
                  .filter((c): c is (Category & { fullName: string }) => c !== null);
  
              if (filteredMainApps.length === 0 && filteredSubCategories.length === 0) {
                  return null;
              }
  
              return {
                  name: mainCat.name,
                  emoji: mainCat.emoji,
                  apps: filteredMainApps,
                  subCategories: filteredSubCategories,
              };
          })
          .filter((g): g is NonNullable<typeof g> => g !== null);
  }, [filteredCategories, categories]);

  const currentCategoryLabel = useMemo(() => {
    if (selectedCategory === 'All') return 'All Categories';
    return selectedCategory;
  }, [selectedCategory]);

  return (
    <div>
      <style>{`
          @keyframes slide-in-left {
              from { transform: translateX(-100%); }
              to { transform: translateX(0); }
          }
          .animate-slide-in-left { animation: slide-in-left 0.3s ease-out forwards; }
      `}</style>
      <CategorySidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} categories={categories} selectedCategory={selectedCategory} onCategorySelect={handleCategorySelectAndJump} />
      <div className="sticky top-16 z-10 bg-bg-backdrop backdrop-blur-md border-b border-border-primary">
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
                <Dropdown // <-- CHANGED: Replaced Tabs with Dropdown
                  label="Pricing" // <-- ADDED: Label for the dropdown
                  options={pricingOptions}
                  value={pricingFilter}
                  onChange={setPricingFilter}
                  className="h-10 w-full"
                />
              </div>
              <div className="w-full">
                <Dropdown // <-- CHANGED: Replaced Tabs with Dropdown
                  label="Tags" // <-- ADDED: Label for the dropdown
                  options={tagOptions}
                  value={tagFilter}
                  onChange={setTagFilter}
                  className="h-10 w-full"
                />
              </div>
            </div>
        </div>
      </div>

      <div className="space-y-12 px-4 sm:px-6 lg:px-8 py-8">
        {groupedCategories.length > 0 ? groupedCategories.map((group, index) => (
          <section key={group.name} id={slugify(group.name)} className={index > 0 ? 'pt-8' : ''}>
            <h2 className="text-3xl font-bold text-text-primary mb-6 flex items-center">
              {group.emoji && <span className="mr-3">{group.emoji}</span>}
              {group.name}
            </h2>
            
            {group.apps.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-4">
                    {group.apps.map((app, index) => (
                        <AppCard key={`${app.name}-${index}`} app={app} index={index} onContextMenu={(e) => handleContextMenu(e, app)} />
                    ))}
                </div>
            )}

            <div className={`space-y-8 ${(group.apps.length > 0 && group.subCategories.length > 0) ? 'mt-8' : ''}`}>
                {group.subCategories.map(subCat => {
                    const nameParts = subCat.name.split(' / ');
                    const displayName = nameParts[nameParts.length - 1];
                    const depth = nameParts.length;

                    const headingClass = depth > 1 ? "text-lg font-semibold text-text-secondary mb-4" : "text-xl font-semibold text-text-primary mb-4";
                    const containerClass = "";

                    return (
                      <div key={subCat.fullName} className={containerClass}>
                        <h3 className={headingClass}>
                            {subCat.emoji && <span className="mr-2">{subCat.emoji}</span>}
                            {displayName}
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-4">
                          {subCat.apps.map((app, index) => (
                            <AppCard key={`${app.name}-${index}-sub`} app={app} index={index} onContextMenu={(e) => handleContextMenu(e, app)} />
                          ))}
                        </div>
                      </div>
                    );
                })}
            </div>
          </section>
        )) : (
          <div className="text-center py-16 text-text-tertiary">
            <h3 className="text-xl font-semibold">No apps found</h3>
            <p>Try adjusting your search or filters.</p>
          </div>
        )}
      </div>
      
      {contextMenu && (
        <ContextMenu x={contextMenu.x} y={contextMenu.y} actions={[{ label: 'Edit Logo URL', onClick: () => { setModalApp(contextMenu.app); setContextMenu(null); }}]} />
      )}
      {modalApp && (
          <LogoUrlModal
              app={modalApp}
              onClose={() => setModalApp(null)}
              onSave={(newUrl) => {
                  onLogoUpdate(modalApp.name, newUrl);
                  setModalApp(prev => prev ? {...prev, logo_url: newUrl} : null);
              }}
          />
      )}
    </div>
  );
};

export default AppsPage;