import React, { useMemo } from 'react';
import { App, Category } from '../types';
import AppCard from '../components/AppCard';

interface CategoriesPageProps {
  categories: Category[];
  onAppClick: (app: App) => void;
  searchTerm: string;
}

const CategoriesPage: React.FC<CategoriesPageProps> = ({ categories, onAppClick, searchTerm }) => {

  const filteredCategories = useMemo(() => {
    if (!searchTerm) return categories;

    return categories
      .map(category => {
        const filteredApps = category.apps.filter(app =>
          app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        return { ...category, apps: filteredApps };
      })
      .filter(category => category.apps.length > 0);
  }, [categories, searchTerm]);

  return (
    <div className="space-y-12">
      {filteredCategories.map(category => (
        <section key={category.name}>
          <h2 className="text-3xl font-bold mb-6 text-text-primary border-l-4 border-accent-primary pl-4">{category.name}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {category.apps.map((app, index) => (
              <AppCard key={`${app.name}-${index}`} app={app} onClick={() => onAppClick(app)} index={index} />
            ))}
          </div>
        </section>
      ))}
      {filteredCategories.length === 0 && (
         <div className="text-center py-16 text-text-tertiary">
          <h3 className="text-xl font-semibold">No categories or apps found</h3>
          <p>Try adjusting your search term.</p>
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;