import React, { useState, useMemo, useEffect, useCallback, FC } from 'react';
import { useFluentIcons } from '../hooks/useFluentIcons';
import SkeletonCard from '../components/SkeletonCard';
import IconCard from '../components/IconCard';
import { SearchIcon, CopyIcon, DownloadIcon, CloseIcon } from '../components/Icons';
import AppModal from '../components/AppModal';
import Tabs from '../components/Tabs';
import { IconStyle } from '../types';


const ICONS_PER_PAGE = 72;

const iconStyles: {value: IconStyle, label: string}[] = [
    { value: 'filled', label: 'Filled' },
    { value: 'outlined', label: 'Outlined' },
    { value: 'color', label: 'Color' },
];

const downloadFile = (content: string | Blob, fileName: string, mimeType?: string) => {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};


const IconDetail: FC<{ data: { name: string, style: IconStyle } }> = ({ data }) => {
    const { name, style } = data;
    const [copyFormat, setCopyFormat] = useState('svg');
    const [downloadFormat, setDownloadFormat] = useState('svg');
    const [copyButtonText, setCopyButtonText] = useState('Copy');

    const snakeCaseName = name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/_$/, '').replace(/^_/, '');
    const styleSuffix = style === 'outlined' ? 'regular' : style;
    const fileName = `ic_fluent_${snakeCaseName}_24_${styleSuffix}.svg`;
    const encodedIconDir = encodeURIComponent(name);
    const iconUrl = `https://cdn.jsdelivr.net/gh/microsoft/fluentui-system-icons@main/assets/${encodedIconDir}/SVG/${fileName}`;

    const handleCopy = useCallback(async () => {
        setCopyButtonText('Copy');
        try {
            const res = await fetch(iconUrl);
            if (!res.ok) throw new Error(`HTTP error ${res.status}`);
            const svgText = await res.text();
            let contentToCopy = '';
            if (copyFormat === 'html') {
                contentToCopy = `<img src="${iconUrl}" alt="${name} icon" width="24" height="24">`;
            } else if (copyFormat === 'react') {
                const componentName = name.replace(/[^a-zA-Z0-9]/g, '') + 'Icon';
                contentToCopy = `import React from 'react';\n\nconst ${componentName} = (props) => (\n  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>\n    ${svgText.match(/<svg.*?>(.*)<\/svg>/s)?.[1] || ''}\n  </svg>\n);\n\nexport default ${componentName};`;
            } else { // svg
                contentToCopy = svgText;
            }
            await navigator.clipboard.writeText(contentToCopy);
            setCopyButtonText('Copied!');
            setTimeout(() => setCopyButtonText('Copy'), 2000);
        } catch (error) {
            console.error('Failed to copy icon:', error);
            setCopyButtonText('Error!');
            setTimeout(() => setCopyButtonText('Copy'), 2000);
        }
    }, [copyFormat, iconUrl, name]);
    
    const handleDownload = useCallback(async () => {
        try {
            if (downloadFormat === 'png') {
                const res = await fetch(iconUrl);
                if (!res.ok) throw new Error(`HTTP error ${res.status}`);
                const svgText = await res.text();
                
                let coloredSvgText = svgText;
                if (style !== 'color') {
                    coloredSvgText = svgText.replace(/currentColor/g, 'white');
                }

                const image = new Image();
                image.onload = () => {
                    const canvas = document.createElement('canvas');
                    const scale = 4; // for 96x96 png
                    canvas.width = 24 * scale;
                    canvas.height = 24 * scale;
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
                        canvas.toBlob((blob) => {
                            if (blob) downloadFile(blob, `${snakeCaseName}_${style}.png`);
                        });
                    }
                };
                image.src = 'data:image/svg+xml;base64,' + btoa(coloredSvgText);
                return;
            }

            const res = await fetch(iconUrl);
            if (!res.ok) throw new Error(`HTTP error ${res.status}`);
            const svgText = await res.text();
            
            let content: string = '';
            let filename = '';
            let mime = 'text/plain';

            if (downloadFormat === 'react') {
                const componentName = name.replace(/[^a-zA-Z0-9]/g, '') + 'Icon';
                content = `import React from 'react';\n\nconst ${componentName} = (props) => (\n  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>\n    ${svgText.match(/<svg.*?>(.*)<\/svg>/s)?.[1] || ''}\n  </svg>\n);\n\nexport default ${componentName};`;
                filename = `${componentName}.tsx`;
                mime = 'application/typescript';
            } else { // svg
                content = svgText;
                filename = `${snakeCaseName}_${style}.svg`;
                mime = 'image/svg+xml';
            }
            downloadFile(content, filename, mime);
        } catch (error) {
            console.error('Failed to download icon:', error);
        }
    }, [downloadFormat, iconUrl, name, snakeCaseName, style]);

    return (
        <>
            <div className="p-6 flex items-center justify-center bg-bg-inset" style={{minHeight: '200px'}}>
                <img src={iconUrl} alt={name} className={`w-32 h-32 ${style !== 'color' ? 'dark:filter dark:invert' : ''}`} />
            </div>
            <div className="p-6 space-y-4">
                 <div className="grid grid-cols-3 gap-2 items-center">
                    <div className="col-span-2">
                         <Tabs options={[{value: 'svg', label: 'SVG'}, {value: 'html', label: 'HTML'}, {value: 'react', label: 'React Component'}]} value={copyFormat} onChange={setCopyFormat} />
                    </div>
                    <button onClick={handleCopy} className="flex items-center justify-center w-full h-full px-4 py-2 bg-bg-tertiary hover:bg-bg-hover rounded-lg text-text-primary">
                        <CopyIcon className="mr-2" />{copyButtonText}
                    </button>
                 </div>
                 <div className="grid grid-cols-3 gap-2 items-center">
                    <div className="col-span-2">
                         <Tabs options={[{value: 'svg', label: 'SVG'}, {value: 'png', label: 'PNG'}, {value: 'react', label: 'React Component'}]} value={downloadFormat} onChange={setDownloadFormat} />
                    </div>
                    <button onClick={handleDownload} className="flex items-center justify-center w-full h-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white">
                        <DownloadIcon className="mr-2"/> Download
                    </button>
                 </div>
            </div>
        </>
    );
};


const IconsPage: React.FC = () => {
  const { icons, colorIcons, loading, error } = useFluentIcons();
  const [searchTerm, setSearchTerm] = useState('');
  const [iconStyle, setIconStyle] = useState<IconStyle>(() => (sessionStorage.getItem('iconStyle') as IconStyle) || 'filled');
  const [visibleCount, setVisibleCount] = useState(ICONS_PER_PAGE);
  const [modalItem, setModalItem] = useState<{name: string, style: IconStyle} | null>(null);

  const handleIconClick = (icon: { name: string, style: IconStyle }) => {
    setModalItem(icon);
  };
  const handleCloseModal = () => setModalItem(null);


  useEffect(() => {
    sessionStorage.setItem('iconStyle', iconStyle);
  }, [iconStyle]);

  const filteredIconNames = useMemo(() => {
    const sourceList = iconStyle === 'color' ? colorIcons : icons;
    if (!searchTerm) return sourceList;

    return sourceList.filter(name =>
      name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [icons, colorIcons, searchTerm, iconStyle]);

  useEffect(() => {
    setVisibleCount(ICONS_PER_PAGE);
  }, [searchTerm, iconStyle]);

  const iconsToShow = useMemo(() => {
    return filteredIconNames.slice(0, visibleCount);
  }, [filteredIconNames, visibleCount]);

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + ICONS_PER_PAGE);
  };

  const renderGridContent = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
          {Array.from({ length: 24 }).map((_, index) => (
            <SkeletonCard key={index} className="aspect-square" />
          ))}
        </div>
      );
    }
    if (error) {
      return <div className="text-center py-16 text-red-400">{error}</div>;
    }
    if (filteredIconNames.length > 0) {
      return (
        <>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
              {iconsToShow.map((name, index) => (
                <IconCard 
                    key={`${name}-${iconStyle}`} 
                    iconName={name} style={iconStyle} 
                    index={index} 
                    onClick={() => handleIconClick({ name, style: iconStyle })}
                />
              ))}
            </div>
            {filteredIconNames.length > visibleCount && (
              <div className="mt-8 text-center">
                <button
                    onClick={handleLoadMore}
                    className="px-6 py-2 font-semibold text-text-secondary bg-bg-tertiary rounded-lg hover:bg-bg-active"
                >
                    Load More
                </button>
              </div>
          )}
        </>
      );
    }
    return (
      <div className="text-center py-16 text-text-tertiary">
        <h3 className="text-xl font-semibold">No icons found</h3>
        <p>Try adjusting your search term.</p>
      </div>
    );
  };

  return (
    <div>
      <div className="sticky top-16 z-10 bg-bg-backdrop backdrop-blur-md border-b border-border-primary">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative w-full flex-1">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                      <SearchIcon />
                  </span>
                  <input
                      type="text"
                      placeholder={loading ? 'Loading icons...' : `Search icons...`}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full py-2 pl-10 pr-10 bg-bg-tertiary border border-border-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      disabled={loading}
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
              <div className="w-full md:w-auto flex-shrink-0">
                <Tabs 
                    options={iconStyles} 
                    value={iconStyle} 
                    onChange={(v) => setIconStyle(v as IconStyle)} 
                />
              </div>
          </div>
        </div>
      </div>
      
      <div className="p-4 sm:p-6 lg:p-8">
        {renderGridContent()}
      </div>

      <AppModal isOpen={!!modalItem} onClose={handleCloseModal} title={modalItem?.name || ''}>
        {modalItem && <IconDetail data={modalItem} />}
      </AppModal>
    </div>
  );
};

export default IconsPage;