import React, { useEffect, useRef, useState } from 'react';

interface FilterLayoutProps {
  titleIcon?: React.ReactNode;
  title: string;
  description?: string;
  filterBarContent: React.ReactNode;
  isLoading: boolean;
  skeleton?: React.ReactNode;
  children: React.ReactNode;
  stickyTopOffset?: number;
  stickyZ?: string;
  stickyBorder?: boolean;
  loadMoreRef?: React.RefObject<HTMLDivElement> | null;
}

const FilterLayout: React.FC<FilterLayoutProps> = ({
  titleIcon,
  title,
  description,
  filterBarContent,
  isLoading,
  skeleton,
  children,
  stickyTopOffset = 64,
  stickyZ = 'z-30',
  stickyBorder = true,
  loadMoreRef = null
}) => {
  const filterBarRef = useRef<HTMLDivElement | null>(null);
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const observerTarget = filterBarRef.current;
    if (!observerTarget) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsSticky(!entry.isIntersecting),
      { threshold: [0], rootMargin: `-${stickyTopOffset}px 0px 0px 0px` }
    );

    observer.observe(observerTarget);
    return () => {
      if (observerTarget) observer.unobserve(observerTarget);
    };
  }, [stickyTopOffset]);

  const stickyWrapperClass = isSticky
    ? `translate-y-0 opacity-100 pointer-events-auto ${stickyBorder ? 'border-b border-gray-200 dark:border-border-primary' : ''}`
    : '-translate-y-full opacity-0 pointer-events-none border-transparent';

  return (
    <div>
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-3">
          {titleIcon}
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-text-primary">{title}</h1>
        </div>
        {description && <p className="mt-4 text-base text-gray-500 dark:text-text-secondary">{description}</p>}

        <div ref={filterBarRef} className="mt-8">
          <div className={`rounded-lg p-4 bg-white dark:bg-bg-secondary ${isSticky ? 'invisible opacity-0' : 'visible opacity-100'} border border-gray-200 dark:border-border-primary`}>
            {filterBarContent}
          </div>
        </div>

        <div className={`fixed top-16 left-0 right-0 ${stickyZ} bg-white dark:bg-bg-secondary shadow-sm ${stickyWrapperClass}`}>
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            {filterBarContent}
          </div>
        </div>

        <div className="relative pt-6">
          {isLoading ? (
            skeleton ?? (
              <div className="text-center py-10">
                <p className="text-gray-500 dark:text-text-secondary">Loading...</p>
              </div>
            )
          ) : (
            <>{children}</>
          )}

          {loadMoreRef && <div ref={loadMoreRef} />}
        </div>
      </div>
    </div>
  );
};

export default FilterLayout;
