import React, { useState, useMemo, useEffect, useCallback, useRef, FC } from 'react';
import { useFluentIcons } from '../hooks/useFluentIcons';
import SkeletonCard from '../components/SkeletonCard';
import IconCard from '../components/IconCard';
import { SearchIcon, CloseIcon } from '../components/Icons';
import AppModal from '../components/AppModal';
import Tabs from '../components/Tabs';
import { IconStyle } from '../types';
import { useFavorites, HeartIcon, type FavoriteItem } from '../hooks/useFavorites';
import { ActionButtons } from '../components/ActionButtons';

const ICONS_PER_PAGE = 160;
const INITIAL_FILTER_HEIGHT = '112px';

const iconStyles: { value: IconStyle; label: string; tooltip?: string }[] = [
  { value: 'filled', label: 'Filled', tooltip: 'Solid filled icons' },
  { value: 'outlined', label: 'Outlined', tooltip: 'Outline style icons' },
  { value: 'color', label: 'Color', tooltip: 'Multi-colored icons' },
];

const IconsPageSEO: FC<{
  searchTerm: string;
  iconStyle: IconStyle;
  filteredIconsCount: number;
  totalIconsCount: number;
}> = ({ searchTerm, iconStyle, filteredIconsCount, totalIconsCount }) => {
  useEffect(() => {
    let title = `Fluent System Icons - ${totalIconsCount}+ ${iconStyle} Icons | Fluent Deck`;
    if (searchTerm) {
      title = `Search: "${searchTerm}" - Fluent ${iconStyle} Icons | Fluent Deck`;
    }
    document.title = title;
  }, [searchTerm, iconStyle, filteredIconsCount, totalIconsCount]);
  return null;
};

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

const IconDetail: FC<{ 
  data: { name: string; style: IconStyle; svgFileName?: string };
  isFavorite: boolean;
  onToggleFavorite: () => void;
}> = ({ data, isFavorite, onToggleFavorite }) => {
  const { name, style, svgFileName } = data;
  const [selectedFormat, setSelectedFormat] = useState<'svg' | 'html' | 'png' | 'react'>('svg');
  const [copyButtonText, setCopyButtonText] = useState('Copy');
  const [isAnimating, setIsAnimating] = useState(false);
  const [downloadState, setDownloadState] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  
  // Color customization state
  const [customColor, setCustomColor] = useState<string | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isColorSectionOpen, setIsColorSectionOpen] = useState(false);
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [svgPath, setSvgPath] = useState<string | null>(null);
  const [svgViewBox, setSvgViewBox] = useState<string>('0 0 24 24');

  // Refs for click outside handling
  const colorPickerRef = useRef<HTMLDivElement>(null);

  let fileName: string;
  let snakeCaseName: string;

  if (svgFileName) {
    const styleSuffix = style === 'outlined' ? 'regular' : style;
    fileName = svgFileName.replace(/_24_(filled|regular|color)\.svg$/, `_24_${styleSuffix}.svg`);
    snakeCaseName = svgFileName
      .replace('ic_fluent_', '')
      .replace(/_24_(filled|regular|color)\.svg$/, '');
  } else {
    snakeCaseName = name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/_$/, '').replace(/^_/, '');
    const styleSuffix = style === 'outlined' ? 'regular' : style;
    fileName = `ic_fluent_${snakeCaseName}_24_${styleSuffix}.svg`;
  }

  const folderName =
    style === 'outlined' ? 'icon_regular' : style === 'filled' ? 'icon_filled' : 'icon_color';
  const iconUrl = `/${folderName}/${fileName}`;

  // Load SVG content and extract path
  useEffect(() => {
    const loadSvg = async () => {
      try {
        const res = await fetch(iconUrl);
        if (res.ok) {
          const svgText = await res.text();
          setSvgContent(svgText);
          
          const parser = new DOMParser();
          const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
          const svgElement = svgDoc.querySelector('svg');
          
          if (svgElement) {
            const viewBox = svgElement.getAttribute('viewBox') || '0 0 24 24';
            setSvgViewBox(viewBox);
            
            const paths = svgElement.querySelectorAll('path');
            if (paths.length > 0) {
              const pathData = Array.from(paths).map(path => path.getAttribute('d')).filter(Boolean).join(' ');
              setSvgPath(pathData);
            }
          }
        }
      } catch (error) {
        console.error('Failed to load SVG:', error);
      }
    };
    
    loadSvg();
  }, [iconUrl]);

  // Reset custom color when style is color
  useEffect(() => {
    if (style === 'color' && customColor) {
      setCustomColor(null);
    }
  }, [style, customColor]);

  // Handle click outside to close color picker container only
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
        setShowColorPicker(false);
      }
    };

    if (showColorPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showColorPicker]);

  const handleFavoriteClick = () => {
    setIsAnimating(true);
    onToggleFavorite();
    setTimeout(() => setIsAnimating(false), 600);
  };

  // Enhanced color palette with optimized number for better layout
  const sampleColors = [
    // Grayscale
    '#000000', '#333333', '#666666', '#999999', '#CCCCCC', '#FFFFFF',
    // Blues
    '#0078D4', '#005A9E', '#106EBE', '#004578',
    // Greens
    '#107C10', '#0B6B0B', '#135013', '#054005',
    // Reds & Oranges
    '#D83B01', '#A52714', '#DA3B01', '#FF4343',
    // Purples & Pinks
    '#B4009E', '#881798', '#C239B3', '#E3008C',
    // Yellows & Golds
    '#FFB900', '#D29200', '#FFAA44', '#F2C811'
  ];

  // Handle color change - don't close picker
  const handleColorChange = (color: string) => {
    setCustomColor(color);
  };

  // Toggle color section
  const toggleColorSection = () => {
    setIsColorSectionOpen(!isColorSectionOpen);
  };

  // FIXED: Proper color application to SVG - don't apply color to color icons
  const getColoredSvg = (svgText: string, color: string): string => {
    // Don't apply custom colors to color icons
    if (style === 'color') {
      return svgText; // Return original SVG without color changes
    } else {
      const coloredSvg = svgText
        .replace(/fill="currentColor"/g, `fill="${color}"`)
        .replace(/stroke="currentColor"/g, `stroke="${color}"`)
        .replace(/<svg([^>]*)>/, `<svg$1 color="${color}">`);
      
      return coloredSvg
        .replace(/fill="(?!none)[^"]*"/g, `fill="${color}"`)
        .replace(/stroke="(?!none)[^"]*"/g, `stroke="${color}"`);
    }
  };

  // Copy PNG as image to clipboard
  const copyPngToClipboard = async (svgText: string): Promise<boolean> => {
    try {
      const image = new Image();
      
      return new Promise((resolve) => {
        image.onload = () => {
          const canvas = document.createElement('canvas');
          const scale = 4;
          canvas.width = 24 * scale;
          canvas.height = 24 * scale;
          const ctx = canvas.getContext('2d');
          
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
            
            canvas.toBlob(async (blob) => {
              if (blob) {
                try {
                  const item = new ClipboardItem({ 'image/png': blob });
                  await navigator.clipboard.write([item]);
                  resolve(true);
                } catch (error) {
                  console.error('Failed to copy PNG to clipboard:', error);
                  resolve(false);
                }
              } else {
                resolve(false);
              }
            });
          } else {
            resolve(false);
          }
        };
        
        image.onerror = () => {
          resolve(false);
        };
        
        image.src = `data:image/svg+xml;base64,${btoa(svgText)}`;
      });
    } catch (error) {
      console.error('Error copying PNG:', error);
      return false;
    }
  };

  // FIXED: Copy function with merged formats and PNG support
  const handleCopy = useCallback(async () => {
    setCopyButtonText('Copy');
    try {
      const res = await fetch(iconUrl);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      let svgText = await res.text();

      // Only apply custom color for non-color icons
      if (style !== 'color' && customColor) {
        svgText = getColoredSvg(svgText, customColor);
      }

      let success = false;

      if (selectedFormat === 'png') {
        success = await copyPngToClipboard(svgText);
      } else {
        let contentToCopy = '';

        if (selectedFormat === 'html') {
          const base64Svg = btoa(svgText);
          contentToCopy = `<img src="data:image/svg+xml;base64,${base64Svg}" alt="${name} icon" width="24" height="24">`;
        } else if (selectedFormat === 'react') {
          const styleSuffix = style === 'outlined' ? 'regular' : style;
          const exportName = `ic_fluent_${snakeCaseName}_24_${styleSuffix}`;
          contentToCopy = `export function ${exportName}(props) {\n  return (\n    ${svgText.replace(/<svg/, '<svg {...props}')}\n  )\n}\n`;
        } else {
          contentToCopy = svgText;
        }

        await navigator.clipboard.writeText(contentToCopy);
        success = true;
      }

      if (success) {
        setCopyButtonText('Copied!');
        setTimeout(() => setCopyButtonText('Copy'), 2000);
      } else {
        setCopyButtonText('Failed!');
        setTimeout(() => setCopyButtonText('Copy'), 2000);
      }
    } catch (error) {
      console.error('Failed to copy icon:', error);
      setCopyButtonText('Error!');
      setTimeout(() => setCopyButtonText('Copy'), 2000);
    }
  }, [selectedFormat, iconUrl, name, style, snakeCaseName, customColor]);

  // FIXED: Download function with processing states
    const handleDownload = useCallback(async () => {
      setDownloadState('processing');
      try {
        const res = await fetch(iconUrl);
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        let svgText = await res.text();

        // Only apply custom color for non-color icons
        if (style !== 'color' && customColor) {
          svgText = getColoredSvg(svgText, customColor);
        }

        if (selectedFormat === 'png') {
          const image = new Image();
          await new Promise((resolve, reject) => {
            image.onload = () => {
              const canvas = document.createElement('canvas');
              const scale = 4;
              canvas.width = 24 * scale;
              canvas.height = 24 * scale;
              const ctx = canvas.getContext('2d');
              if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
                canvas.toBlob((blob) => {
                  if (blob) {
                    // FIX: Use fileName without extension and add .png
                    const baseName = fileName.replace('.svg', '');
                    const pngFileName = `${baseName}${customColor && style !== 'color' ? `_${customColor.replace('#', '')}` : ''}.png`;
                    downloadFile(blob, pngFileName);
                    setDownloadState('success');
                    resolve(true);
                  } else {
                    setDownloadState('error');
                    reject(new Error('Failed to create PNG blob'));
                  }
                });
              } else {
                setDownloadState('error');
                reject(new Error('Canvas context not available'));
              }
            };
            image.onerror = () => {
              setDownloadState('error');
              reject(new Error('Failed to load image'));
            };
            image.src = `data:image/svg+xml;base64,${btoa(svgText)}`;
          });
        } else {
          let content: string = '';
          let filename = '';
          let mime = 'text/plain';

          if (selectedFormat === 'react') {
            const styleSuffix = style === 'outlined' ? 'regular' : style;
            const exportName = `ic_fluent_${snakeCaseName}_24_${styleSuffix}`;
            content = `export function ${exportName}(props) {\n  return (\n    ${svgText.replace(/<svg/, '<svg {...props}')}\n  )\n}\n`;
            // FIX: Use fileName and replace extension with .tsx
            filename = `${fileName.replace('.svg', '.tsx')}`;
            mime = 'application/typescript';
          } else if (selectedFormat === 'html') {
            const base64Svg = btoa(svgText);
            content = `<img src="data:image/svg+xml;base64,${base64Svg}" alt="${name} icon" width="24" height="24">`;
            // FIX: Use fileName and replace extension with .html
            filename = `${fileName.replace('.svg', '')}${customColor && style !== 'color' ? `_${customColor.replace('#', '')}` : ''}.html`;
            mime = 'text/html';
          } else {
            content = svgText;
            // FIX: Use the original fileName for SVG downloads
            filename = `${fileName.replace('.svg', '')}${customColor && style !== 'color' ? `_${customColor.replace('#', '')}` : ''}.svg`;
            mime = 'image/svg+xml';
          }
      
          downloadFile(content, filename, mime);
          setDownloadState('success');
        }

        setTimeout(() => setDownloadState('idle'), 2000);
      } catch (error) {
        console.error('Failed to download icon:', error);
        setDownloadState('error');
        setTimeout(() => setDownloadState('idle'), 2000);
      }
    }, [selectedFormat, iconUrl, name, snakeCaseName, style, fileName, customColor]);

  // Check if copy should be disabled (only for PNG in browsers that don't support Clipboard API)
  const isCopyDisabled = selectedFormat === 'png' && !navigator.clipboard;

  // Render SVG directly using path data
    const renderSvgIcon = () => {
      // Don't apply custom color to color icons
      const shouldApplyColor = style !== 'color' && customColor;
  
      // For color icons, use the original image to preserve multi-colors
      // For filled/outlined icons, use SVG path with proper color handling
      if (style === 'color') {
        return (
          <img
            src={iconUrl}
            alt={`${name} ${style} icon - Fluent System Icon`}
            className="w-32 h-32"
          />
        );
      } else if (svgPath) {
        return (
          <svg
            width="128"
            height="128"
            viewBox={svgViewBox}
            fill={shouldApplyColor ? customColor : 'currentColor'}
            className="text-gray-900 dark:text-gray-100"
          >
            <path d={svgPath} />
          </svg>
        );
      } else {
        return (
          <img
            src={iconUrl}
            alt={`${name} ${style} icon - Fluent System Icon`}
            className="w-32 h-32 filter-none"
          />
        );
      }
    };

  return (
    <>
      <div className="p-6 flex bg-white dark:bg-neutral-800 items-center justify-center relative" style={{ minHeight: '200px' }}>
        <div className="relative">
          {renderSvgIcon()}
        </div>
        
        <button
          onClick={handleFavoriteClick}
          className={`absolute top-4 right-4 p-2 rounded-full transition-all duration-300 ${
            isFavorite 
              ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' 
              : 'bg-bg-tertiary text-text-tertiary hover:bg-bg-hover hover:text-text-primary'
          } ${isAnimating ? 'animate-favorite' : ''}`}
          style={{
            animation: isAnimating ? 'favoriteAnimation 0.6s ease-out' : 'none'
          }}
        >
          <HeartIcon filled={isFavorite} className="w-6 h-6" />
        </button>
      </div>

      {/* Improved Color Customization Section - Only show for non-color icons */}
      {style !== 'color' && (
        <div className="border-b border-border-secondary">
          <button
            onClick={toggleColorSection}
            className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-bg-hover transition-colors border-b border-border-secondary"
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
                <div>
                  <h4 className="text-sm font-medium text-text-primary">Color Customization</h4>
                </div>
              </div>
              <svg
                className={`w-5 h-5 text-text-tertiary transition-transform duration-200 ${
                  isColorSectionOpen ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>

          {isColorSectionOpen && (
            <div className="px-6 pb-4 pt-2">
              <div className="grid grid-cols-8 sm:grid-cols-10 gap-2 w-full">
                {sampleColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorChange(color)}
                    className={`aspect-square w-full max-w-7 rounded border transition-transform hover:scale-110 relative ${
                      customColor === color ? 'border-blue-500 ring-2 ring-blue-500/30' : 'border-border-secondary'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  >
                    {customColor === color && (
                      <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">
                        ✓
                      </div>
                    )}
                  </button>
                ))}
                
                {customColor && !sampleColors.includes(customColor) && (
                  <button
                    onClick={() => setShowColorPicker(true)}
                    className={`aspect-square w-full max-w-7 rounded border transition-transform hover:scale-110 relative ${
                      customColor ? 'border-blue-500 ring-2 ring-blue-500/30' : 'border-border-secondary'
                    }`}
                    style={{ backgroundColor: customColor }}
                    title={customColor}
                  >
                    <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">
                      ✓
                    </div>
                  </button>
                )}
                
                <div className="relative" ref={colorPickerRef}>
                  <button
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    className="aspect-square w-full max-w-7 rounded border-2 border-dashed border-border-secondary flex items-center justify-center text-text-tertiary hover:text-text-primary hover:border-border-primary transition-colors bg-transparent"
                    title="Custom color"
                  >
                    +
                  </button>
                  
                  {showColorPicker && (
                    <div className="absolute top-9 left-0 z-20 p-3 bg-bg-secondary border border-border-primary rounded-lg shadow-lg min-w-[180px]">
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={customColor || '#000000'}
                          onChange={(e) => handleColorChange(e.target.value)}
                          className="w-10 h-10 cursor-pointer bg-transparent border-none rounded"
                          style={{ 
                            backgroundColor: 'transparent',
                            border: 'none'
                          }}
                        />
                        <div className="flex flex-col gap-1">
                          <input
                            type="text"
                            value={customColor || ''}
                            onChange={(e) => handleColorChange(e.target.value)}
                            placeholder="#000000"
                            className="w-24 px-2 py-1 text-sm bg-bg-tertiary border border-border-secondary rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                          <span className="text-xs text-text-tertiary">Hex color code</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Enhanced Format Selection and Action Buttons */}
        <div className="p-6">
          {/* Enhanced format selection with better alignment */}
          <div className="mb-4">
            <Tabs
              options={[
                { value: 'svg', label: 'SVG' },
                { value: 'html', label: 'HTML' },
                { value: 'png', label: 'PNG' },
                { value: 'react', label: 'React' }
              ]}
              value={selectedFormat}
              onChange={(value) => setSelectedFormat(value as any)}
              className="w-full"
              tabButtonClassName="flex-1 text-xs py-2"
              activeTabClassName="bg-neutral-600 text-white font-semibold"
              inactiveTabClassName="text-gray-400 hover:bg-gray-100 hover:text-gray-900"
            />
          </div>

          {/* Action buttons with better integration */}
          <div className="space-y-3">
            <ActionButtons
              copyAction={handleCopy}
              downloadAction={handleDownload}
              copyDisabled={isCopyDisabled}
              downloadDisabled={downloadState === 'processing'}
            />
          </div>
        </div>
    </>
  );
};

const IconsPage: React.FC<{ onFavoriteClickFromHeader?: FavoriteItem | null }> = ({ onFavoriteClickFromHeader }) => {
  const { icons, colorIcons, loading, error } = useFluentIcons();
  const [searchTerm, setSearchTerm] = useState('');
  const [iconStyle, setIconStyle] = useState<IconStyle>(
    () => (sessionStorage.getItem('iconStyle') as IconStyle) || 'filled'
  );
  const [visibleCount, setVisibleCount] = useState(ICONS_PER_PAGE);
  const [modalItem, setModalItem] = useState<{ name: string; style: IconStyle; svgFileName?: string } | null>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const { favorites, toggleFavorite, isFavorite } = useFavorites();

  // Handle favorite click from header
  useEffect(() => {
      if (onFavoriteClickFromHeader && onFavoriteClickFromHeader.type === 'icon') {
        setModalItem({
          name: onFavoriteClickFromHeader.name,
          style: onFavoriteClickFromHeader.style as IconStyle,
          svgFileName: onFavoriteClickFromHeader.svgFileName
        });
        // Optionally, you could clear the prop here if needed
      }
    }, [onFavoriteClickFromHeader]);

  useEffect(() => {
    sessionStorage.setItem('iconStyle', iconStyle);
  }, [iconStyle]);

  useEffect(() => {
    const styleTag = document.createElement('style');
    styleTag.innerHTML = `:root { --filter-height: ${INITIAL_FILTER_HEIGHT}; }`;
    document.head.appendChild(styleTag);

    const updateHeight = () => {
      window.requestAnimationFrame(() => {
        if (filterRef.current) {
          const headerHeight = 64; 
          const filterContentHeight = filterRef.current.offsetHeight;
          const totalHeight = `${headerHeight + filterContentHeight}px`;
          document.documentElement.style.setProperty('--filter-height', totalHeight);
        }
      });
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    
    return () => {
      window.removeEventListener('resize', updateHeight);
      document.documentElement.style.removeProperty('--filter-height');
      document.head.removeChild(styleTag);
    };
  }, []);

  const filteredIcons = useMemo(() => {
    const sourceList = iconStyle === 'color' ? colorIcons : icons;
    if (!searchTerm) return sourceList;
    return sourceList.filter((icon) => icon.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [icons, colorIcons, searchTerm, iconStyle]);

  const iconsToShow = useMemo(() => filteredIcons.slice(0, visibleCount), [filteredIcons, visibleCount]);

  const totalIconsCount = useMemo(() => {
    const sourceList = iconStyle === 'color' ? colorIcons : icons;
    return sourceList.length;
  }, [icons, colorIcons, iconStyle]);

  const renderGridContent = () => {
    if (loading && totalIconsCount === 0)
      return (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
          {Array.from({ length: 32 }).map((_, i) => (
            <SkeletonCard key={i} className="aspect-square" />
          ))}
        </div>
      );

    if (error) return <div className="text-center py-16 text-red-400">{error}</div>;

    if (filteredIcons.length > 0)
      return (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
            {iconsToShow.map((icon, i) => (
              <IconCard
                key={`${icon.name}-${iconStyle}`}
                iconName={icon.name}
                svgFileName={icon.svgFileName}
                style={iconStyle}
                index={i}
                onClick={() => setModalItem({ name: icon.name, style: iconStyle, svgFileName: icon.svgFileName })}
              />
            ))}
          </div>
          {filteredIcons.length > visibleCount && (
            <div className="mt-8 text-center">
              <button
                onClick={() => setVisibleCount((prev) => prev + ICONS_PER_PAGE)}
                className="px-6 py-2 font-semibold text-text-secondary bg-bg-tertiary rounded-lg hover:bg-bg-active"
              >
                Load More
              </button>
            </div>
          )}
        </>
      );

    return (
      <div className="text-center py-16 text-text-tertiary">
        <h3 className="text-xl font-semibold">No icons found</h3>
        <p>Try adjusting your search term.</p>
      </div>
    );
  };

  return (
    <>
      <IconsPageSEO
        searchTerm={searchTerm}
        iconStyle={iconStyle}
        filteredIconsCount={filteredIcons.length}
        totalIconsCount={totalIconsCount}
      />

      <div className="min-h-screen flex flex-col">
        <div
          ref={filterRef}
          className="fixed top-16 left-0 right-0 z-20 bg-bg-backdrop backdrop-blur-md border-b border-border-primary"
        >
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative w-full flex-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <SearchIcon />
                </span>
                <input
                  type="text"
                  placeholder={loading ? 'Loading icons...' : `Search ${totalIconsCount} icons...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full py-2 pl-10 pr-10 bg-bg-tertiary border border-border-secondary rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                  disabled={loading}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-text-tertiary hover:text-text-primary"
                  >
                    <CloseIcon className="w-5 h-5" />
                  </button>
                )}
              </div>
              <div className="w-full md:w-auto flex-shrink-0">
                <Tabs options={iconStyles} value={iconStyle} onChange={(v) => setIconStyle(v as IconStyle)} />
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1" style={{ paddingTop: 'var(--filter-height)' }}>
          <main>
            <div className="p-4 sm:p-6 lg:p-8">{renderGridContent()}</div>
          </main>
          <AppModal
            isOpen={!!modalItem}
            onClose={() => setModalItem(null)}
            title={modalItem?.name || ''}
          >
            {modalItem && (
              <IconDetail 
                data={modalItem} 
                isFavorite={isFavorite(modalItem.name, modalItem.style, 'icon')}
                onToggleFavorite={() => toggleFavorite({
                  name: modalItem.name,
                  style: modalItem.style,
                  svgFileName: modalItem.svgFileName,
                  type: 'icon'
                })}
              />
            )}
          </AppModal>
        </div>
      </div>
    </>
  );
};

export default IconsPage;