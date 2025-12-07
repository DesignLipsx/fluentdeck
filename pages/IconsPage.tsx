import React, { useState, useMemo, useEffect, useCallback, FC } from 'react';
import { useFluentIcons } from '../hooks/useFluentIcons';
import SkeletonCard from '../components/SkeletonCard';
import IconCard from '../components/IconCard';
import { SearchIcon, CopyIcon, DownloadIcon, CloseIcon } from '../components/Icons';
import AppModal from '../components/AppModal';
import Tabs from '../components/Tabs';
import { IconStyle } from '../types';


const ICONS_PER_PAGE = 160;

const iconStyles: {value: IconStyle, label: string, tooltip?: string}[] = [
    { 
        value: 'filled', 
        label: 'Filled', 
        tooltip: 'Solid filled icons' 
    },
    { 
        value: 'outlined', 
        label: 'Outlined', 
        tooltip: 'Outline style icons' 
    },
    { 
        value: 'color', 
        label: 'Color', 
        tooltip: 'Multi-colored icons' 
    },
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

const IconDetail: FC<{ data: { name: string, style: IconStyle, svgFileName?: string } }> = ({ data }) => {
    const { name, style, svgFileName } = data;
    const [copyFormat, setCopyFormat] = useState('svg');
    const [downloadFormat, setDownloadFormat] = useState('svg');
    const [copyButtonText, setCopyButtonText] = useState('Copy');

    // Use the provided svgFileName if available, otherwise construct it
    let fileName: string;
    let snakeCaseName: string;
    
    if (svgFileName) {
      // Replace the style suffix in the filename to match the current style
      const styleSuffix = style === 'outlined' ? 'regular' : style;
      fileName = svgFileName.replace(/_24_(filled|regular|color)\.svg$/, `_24_${styleSuffix}.svg`);
      // Extract the snake_case name from the filename
      snakeCaseName = svgFileName.replace('ic_fluent_', '').replace(/_24_(filled|regular|color)\.svg$/, '');
    } else {
      snakeCaseName = name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/_$/, '').replace(/^_/, '');
      const styleSuffix = style === 'outlined' ? 'regular' : style;
      fileName = `ic_fluent_${snakeCaseName}_24_${styleSuffix}.svg`;
    }
    
    // Use local icon folders
    const folderName = style === 'outlined' ? 'icon_regular' : style === 'filled' ? 'icon_filled' : 'icon_color';
    const iconUrl = `/${folderName}/${fileName}`;

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
                const styleSuffix = style === 'outlined' ? 'regular' : style;
                const exportName = `ic_fluent_${snakeCaseName}_24_${styleSuffix}`;
            
                contentToCopy = `export function ${exportName}(props) {\n  return (\n    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>\n      ${svgText.match(/<svg.*?>(.*)<\/svg>/s)?.[1] || ''}\n    </svg>\n  )\n}\n`;
            } else {
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
    }, [copyFormat, iconUrl, name, style, snakeCaseName]); 
    
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
                    const scale = 4;
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
                const styleSuffix = style === 'outlined' ? 'regular' : style;
                const exportName = `ic_fluent_${snakeCaseName}_24_${styleSuffix}`;
                content = `export function ${exportName}(props) {\n  return (\n    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"${' {...props}'}>\n      ${svgText.match(/<svg.*?>(.*)<\/svg>/s)?.[1] || ''}\n    </svg>\n  )\n}\n`;
                filename = `${fileName.replace('.svg', '.tsx')}`;
                mime = 'application/typescript';
            } else {
                content = svgText;
                filename = `${snakeCaseName}_${style}.svg`;
                mime = 'image/svg+xml';
            }
            downloadFile(content, filename, mime);
        } catch (error) {
            console.error('Failed to download icon:', error);
        }
    }, [downloadFormat, iconUrl, name, snakeCaseName, style, fileName]);

    return (
        <>
            <div className="p-6 flex bg-[#1e1f22] items-center justify-center bg-bg-inset" style={{minHeight: '200px'}}>
                <img src={iconUrl} alt={name} className={`w-32 h-32 ${style !== 'color' ? 'dark:filter dark:invert' : ''}`} />
            </div>
            <div className="p-6">
                <div className="grid grid-cols-3 gap-2 items-center h-12 mb-3">
                    <div className="col-span-2 h-full flex items-center">
                        <div className="w-full flex">
                            <Tabs
                                options={[{ value: 'svg', label: 'SVG' }, { value: 'html', label: 'HTML' }, { value: 'react', label: 'React Component' }]}
                                value={copyFormat}
                                onChange={setCopyFormat}
                                className="w-full"
                                tabButtonClassName="flex-1" 
                            />
                        </div>
                    </div>
                    <button
                        onClick={handleCopy}
                        className="flex items-center justify-center w-full h-full px-4 py-2 bg-bg-tertiary hover:bg-bg-hover rounded-lg text-text-primary"
                    >
                        <CopyIcon className="mr-2" />
                        {copyButtonText}
                    </button>
                </div>
                <div className="grid grid-cols-3 gap-2 items-center justify-center h-12">
                    <div className="col-span-2 h-full flex items-center">
                        <div className="w-full flex">
                            <Tabs
                                options={[{ value: 'svg', label: 'SVG' }, { value: 'png', label: 'PNG' }, { value: 'react', label: 'React Component' }]}
                                value={downloadFormat}
                                onChange={setDownloadFormat}
                                className="w-full"
                                tabButtonClassName="flex-1" 
                            />
                        </div>
                    </div>
                    <button
                        onClick={handleDownload}
                        className="flex items-center justify-center w-full h-full px-4 py-2  text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                        <DownloadIcon className="mr-2" />
                        Download
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
  const [modalItem, setModalItem] = useState<{name: string, style: IconStyle, svgFileName?: string} | null>(null);

  const handleIconClick = (icon: { name: string, style: IconStyle, svgFileName?: string }) => {
    setModalItem(icon);
  };
  const handleCloseModal = () => setModalItem(null);

  useEffect(() => {
    sessionStorage.setItem('iconStyle', iconStyle);
  }, [iconStyle]);

  const filteredIcons = useMemo(() => {
    const sourceList = iconStyle === 'color' ? colorIcons : icons;
    if (!searchTerm) return sourceList;

    return sourceList.filter(icon =>
      icon.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [icons, colorIcons, searchTerm, iconStyle]);

  useEffect(() => {
    setVisibleCount(ICONS_PER_PAGE);
  }, [searchTerm, iconStyle]);

  const iconsToShow = useMemo(() => {
    return filteredIcons.slice(0, visibleCount);
  }, [filteredIcons, visibleCount]);

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
    if (filteredIcons.length > 0) {
      return (
        <>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
              {iconsToShow.map((icon, index) => (
                <IconCard 
                    key={`${icon.name}-${iconStyle}`} 
                    iconName={icon.name}
                    svgFileName={icon.svgFileName}
                    style={iconStyle} 
                    index={index} 
                    onClick={() => handleIconClick({ name: icon.name, style: iconStyle, svgFileName: icon.svgFileName })}
                />
              ))}
            </div>
            {filteredIcons.length > visibleCount && (
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
                      className="w-full py-2 pl-10 pr-10 bg-bg-tertiary border border-border-secondary rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/10"
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