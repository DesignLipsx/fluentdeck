import React, { useRef, useEffect, useMemo, FC, useState, RefObject } from 'react';
import { NavItem, App, Emoji, Category } from '../types';
import { AppsIcon, EmojiIcon, FluentIconsIcon, GithubIcon } from '../components/Icons';
import AppCard from '../components/AppCard';
import NumberTicker from '../components/NumberTicker';
import NetworkVisualization from '../components/NetworkVisualization';
import PersonalInfo from '../components/PersonalInfo';

const useIntersectionObserver = (
  elementRef: RefObject<Element>,
  {
    threshold = 0.1,
    root = null,
    rootMargin = '0px',
    triggerOnce = true,
  }: {
    threshold?: number;
    root?: Element | null;
    rootMargin?: string;
    triggerOnce?: boolean;
  } = {}
): boolean => {
  const [isIntersecting, setIntersecting] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIntersecting(true);
          if (triggerOnce) {
            observer.unobserve(element);
          }
        }
      },
      { threshold, root, rootMargin }
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [elementRef, threshold, root, rootMargin, triggerOnce]);

  return isIntersecting;
};

const showcaseApps: App[] = [
  { name: 'Fluent Flyouts', link: 'https://apps.microsoft.com/detail/9ppcm05rw87x', description: '', tags: ["WDA"], category: '', pricing: 'Free', logo_url: 'https://store-images.s-microsoft.com/image/apps.19875.14331478230436449.53e27400-8d7d-4075-ac87-3924b0f6bc90.e7a67f05-999b-4b76-a2bb-edac42939e08?h=115' },
  { name: 'Files', link: 'https://github.com/files-community/files', description: '', tags: ["WDA"], category: '', pricing: 'FOSS', logo_url: 'https://store-images.s-microsoft.com/image/apps.5536.13649428968955623.bcfc493a-7fd6-4231-9ddd-1c511b1330ad.11150fa3-6915-4039-b262-6be82a9c440a?h=210' },
  { name: 'Calendar Flyout', link: 'https://apps.microsoft.com/detail/9p2b3pljxh3v', description: '', tags: ["WDA"], category: '', pricing: 'Paid', logo_url: 'https://store-images.s-microsoft.com/image/apps.39692.14565777777550263.7df61f39-036f-43aa-b940-c9bfee302b20.8a6daf5c-dc21-451b-a97e-3a16f5572a23?h=210' },
];

const showcaseIcons: string[] = [
  'Home', 'Settings', 'Heart', 'Camera', 'Apps', 'Cloud', 'Search', 'Link', 'Edit', 'Filter', 'Flag', 'Gift', 'Mail', 'People', 'Pin', 'Share'
];

const showcaseEmojis: {name: string, depth: number}[] = [
  { name: 'Smiling face with sunglasses', depth: 20 },
  { name: 'Rocket', depth: -15 },
  { name: 'Laptop', depth: 10 },
  { name: 'Red heart', depth: -25 },
  { name: 'Sparkles', depth: 18 },
  { name: 'Clinking glasses', depth: -12 },
  { name: 'Doughnut', depth: 22 },
  { name: 'Party popper', depth: -8 }
];

const getIconUrl = (iconName: string) => {
    const snakeCaseName = iconName.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/_$/, '').replace(/^_/, '');
    const fileName = `ic_fluent_${snakeCaseName}_24_regular.svg`;
    const encodedIconDir = encodeURIComponent(iconName);
    return `https://cdn.jsdelivr.net/gh/microsoft/fluentui-system-icons@main/assets/${encodedIconDir}/SVG/${fileName}`;
};

interface HomePageProps {
    onNavigate: (page: NavItem, callback?: () => void) => void;
    emojis: Emoji[];
    categories: Category[];
}

const FeatureCard: FC<{icon: React.ReactNode; title: string; count: number; countSuffix: string; description: string; onClick: () => void}> = ({ icon, title, count, countSuffix, description, onClick }) => (
    <div className="bg-bg-secondary p-8 rounded-2xl border border-border-primary transform hover:-translate-y-2 transition-transform duration-300 cursor-pointer" onClick={onClick}>
        <div className="flex items-center text-blue-500 dark:text-blue-400 space-x-3">
            {icon}
            <h3 className="text-xl font-semibold text-text-primary">{title}</h3>
        </div>
        <p className="text-5xl font-bold text-text-primary mt-4">
            <NumberTicker value={count} />
            {countSuffix}
        </p>
        <p className="text-text-tertiary mt-2">{description}</p>
    </div>
);

const HomePage: React.FC<HomePageProps> = ({ onNavigate, emojis, categories }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const emojiMap = useMemo(() => new Map(emojis.map(e => [e.name, e])), [emojis]);
  
  // Calculate totalApps, excluding the 'Newly Added Apps!' category.
  const totalApps = useMemo(() => {
    const countedCategories = categories.filter(
        category => category.name.trim() !== 'Newly Added Apps!'
    );
    return countedCategories.reduce((sum, category) => sum + category.apps.length, 0);
  }, [categories]);

  const featuresRef = useRef<HTMLDivElement>(null);
  const personalInfoRef = useRef<HTMLDivElement>(null);
  const communityRef = useRef<HTMLDivElement>(null);
  const isFeaturesVisible = useIntersectionObserver(featuresRef, { threshold: 0.2, triggerOnce: true });
  const isPersonalInfoVisible = useIntersectionObserver(personalInfoRef, { threshold: 0.1, triggerOnce: true });
  const isCommunityVisible = useIntersectionObserver(communityRef, { threshold: 0.2, triggerOnce: true });

  // ✅ FIXED: Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ✅ FIXED: Navigation handlers with scroll reset
  const handleNavigate = (page: NavItem, callback?: () => void) => {
    scrollToTop();
    onNavigate(page, callback);
  };

  const handleContributorClick = () => {
    handleNavigate('Contribute', () => {
      // Small delay to ensure page has rendered before scrolling
      setTimeout(() => {
        document.getElementById('contributors-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    });
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const parallaxItems = container.querySelectorAll('.parallax-item');

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      
      const centerX = container.offsetLeft + container.offsetWidth / 2;
      const centerY = container.offsetTop + container.offsetHeight / 2;
      
      const moveX = (clientX - centerX) / container.offsetWidth;
      const moveY = (clientY - centerY) / container.offsetHeight;

      parallaxItems.forEach(item => {
        const el = item as HTMLElement;
        const depth = parseFloat(el.dataset.depth || '0');
        const x = moveX * depth;
        const y = moveY * depth;
        el.style.transform = `translateX(${x}px) translateY(${y}px)`;
      });
    };

    // Initialize with center position
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    handleMouseMove({ clientX: centerX, clientY: centerY } as MouseEvent);

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const showcaseEmojiPositions = useMemo(() => {
    return showcaseEmojis.map(() => ({
      top: `${10 + Math.random() * 80}%`,
      left: `${10 + Math.random() * 80}%`
    }));
  }, []);

  return (
    <div className="overflow-x-hidden relative w-full max-w-[100vw]">
        <div ref={containerRef} className="h-screen overflow-hidden flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 animate-background-pan relative hero-section-fade w-full max-w-[100vw]">
            <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                <div className="text-center lg:text-left animate-fade-in relative z-10">
                <h1 className="text-5xl md:text-7xl font-bold text-text-primary leading-tight">
                    Fluent Deck
                </h1>
                <p className="mt-4 text-lg md:text-xl text-text-tertiary max-w-xl mx-auto lg:mx-0">
                    A curated showcase of beautiful WinUI 3 apps, a comprehensive library of Fluent System Icons, and a vibrant collection of Fluent Emojis.
                </p>
                {/* Hero Button Container: flex-col with items-stretch for full-width buttons on mobile, sm:flex-row for desktop. */}
                <div className="mt-8 flex w-full flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-4">
                    {/* Buttons: w-full on mobile, w-auto on tablet/desktop. */}
                    <button
                    onClick={() => handleNavigate('Apps')}
                    className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 font-semibold text-accent-primary-text bg-accent-primary rounded-lg hover:bg-accent-primary-hover shadow-lg shadow-gray-500/10 dark:shadow-gray-900/20"
                    >
                    <AppsIcon />
                    <span className="ml-2">Explore Apps</span>
                    </button>
                    <button
                    onClick={() => handleNavigate('Icons')}
                    className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 font-semibold text-text-secondary bg-bg-tertiary rounded-lg hover:bg-bg-active"
                    >
                    <FluentIconsIcon />
                    <span className="ml-2">Browse Icons</span>
                    </button>
                    <button
                    onClick={() => handleNavigate('Emoji')}
                    className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 font-semibold text-text-secondary bg-bg-tertiary rounded-lg hover:bg-bg-active"
                    >
                    <EmojiIcon />
                    <span className="ml-2">Discover Emojis</span>
                    </button>
                </div>
                </div>
                
                <div className="hidden lg:block animate-fade-in overflow-hidden" style={{ animationDelay: '200ms', maxWidth: '100%' }}>
                  <div className="relative h-[450px] w-full max-w-full flex items-center justify-center perspective-[1000px] overflow-x-visible">
                    <div className="absolute inset-0 grid grid-cols-4 gap-6 opacity-10 filter blur-[1px] parallax-item" data-depth="3">
                      {showcaseIcons.map((icon, i) => (
                          <img
                            key={i}
                            src={getIconUrl(icon)}
                            alt={icon}
                            className="w-12 h-12 filter dark:invert opacity-50"
                            style={{ animation: `fade-in 0.5s ease-out ${0.3 + i * 0.05}s forwards`, opacity: 0 }}
                          />
                      ))}
                    </div>
    
                    <div className="absolute inset-0">
                      {showcaseEmojis.map((emojiInfo, i) => {
                        const emoji = emojiMap.get(emojiInfo.name);
                        const imageUrl = emoji?.styles['3D'];
                        if (!imageUrl) return null;
    
                        return (
                          <div
                            key={i}
                            className="absolute parallax-item"
                            data-depth={emojiInfo.depth}
                            style={{
                              ...showcaseEmojiPositions[i],
                              width: '64px',
                              maxWidth: '16vw',
                              minWidth: '48px',
                            }}
                          >
                            <img
                              src={imageUrl}
                              alt={emojiInfo.name}
                              className="w-full h-auto emoji-float"
                              style={{
                                animationDuration: `${10 + Math.random() * 10}s`,
                                animationDelay: `${Math.random() * 5}s`,
                              }}
                            />
                          </div>
                        );
                      })}
                    </div>
    
                    <div className="relative w-full h-full">
                      <div className="absolute parallax-item" data-depth="30" style={{ top: '20%', left: '5%', width: '18vw', minWidth: '120px', maxWidth: '200px' }}>
                        <div style={{ transform: 'rotate(-10deg) translateZ(0)' }}>
                          <AppCard app={showcaseApps[0]} index={0} onClick={() => handleNavigate('Apps')} />
                        </div>
                      </div>
                      <div className="absolute z-10 parallax-item" data-depth="45" style={{ top: '35%', left: '50%', marginLeft: 'calc(-5vw)', width: '18vw', minWidth: '120px', maxWidth: '200px' }}>
                        <div style={{ transform: 'scale(1.1) translateZ(0)' }}>
                          <AppCard app={showcaseApps[1]} index={1} onClick={() => handleNavigate('Apps')} />
                        </div>
                      </div>
                      <div className="absolute parallax-item" data-depth="35" style={{ top: '20%', right: '5%', width: '18vw', minWidth: '120px', maxWidth: '200px' }}>
                        <div style={{ transform: 'rotate(10deg) translateZ(0)' }}>
                          <AppCard app={showcaseApps[2]} index={2} onClick={() => handleNavigate('Apps')} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
            </div>
        </div>
        
        <div ref={featuresRef} className="py-32 px-4 sm:px-6 lg:px-8 bg-bg-primary">
            <div className={`max-w-5xl mx-auto text-center mb-16 transition-all duration-700 ease-out ${isFeaturesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <h2 className="text-4xl font-bold text-text-primary">Explore Our Collections</h2>
                <p className="mt-4 text-lg text-text-tertiary">
                    Dive into a curated world of Fluent Design, from applications to the smallest emoji.
                </p>
            </div>
            {/* Feature Cards: grid-cols-1 for mobile, sm:grid-cols-2 for tablets, md:grid-cols-3 for desktop. */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                <div className={`transition-all duration-500 ease-out ${isFeaturesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <FeatureCard 
                        icon={<AppsIcon />} 
                        title="Apps" 
                        count={isFeaturesVisible ? totalApps : 0} 
                        countSuffix="+" 
                        description="A curated list of beautiful and functional WinUI 3 applications."
                        onClick={() => handleNavigate('Apps')}
                    />
                </div>
                <div className={`transition-all duration-500 ease-out delay-150 ${isFeaturesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <FeatureCard 
                        icon={<FluentIconsIcon />} 
                        title="Icons" 
                        count={isFeaturesVisible ? 4000 : 0} 
                        countSuffix="+" 
                        description="Explore thousands of Fluent System Icons in three unique styles."
                        onClick={() => handleNavigate('Icons')}
                    />
                </div>
                <div className={`transition-all duration-500 ease-out delay-300 ${isFeaturesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <FeatureCard 
                        icon={<EmojiIcon />} 
                        title="Emojis" 
                        count={isFeaturesVisible ? emojis.length : 0}
                        countSuffix="" 
                        description="Discover a vibrant collection of animated and static Fluent Emojis."
                        onClick={() => handleNavigate('Emoji')}
                    />
                </div>
            </div>
        </div>

        <div ref={personalInfoRef} className="py-24 px-4 sm:px-6 lg:px-8 bg-bg-primary">
            <div className={`max-w-6xl mx-auto transition-all duration-700 ease-out ${isPersonalInfoVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <PersonalInfo />
            </div>
        </div>

        <div ref={communityRef} className="py-24 px-4 sm:px-6 lg:px-8 bg-bg-primary overflow-hidden">
            <div className={`transition-all duration-700 ease-out ${isCommunityVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <div className="max-w-5xl mx-auto text-center">
                    <h2 className="text-4xl font-bold text-text-primary">Powered by the Community</h2>
                    <p className="mt-4 text-lg text-text-tertiary">
                        This project thrives on community contributions. A huge thank you to everyone who has submitted apps and helped grow this collection.
                    </p>
                </div>
            </div>
            <div className={`flex justify-center transition-all duration-700 ease-out delay-200 lg:scale-100 ${isCommunityVisible ? 'opacity-100 translate-y-10' : 'opacity-0 translate-y-10'}`}>
                <NetworkVisualization onNavigate={handleContributorClick} />
            </div>
            <div className={`text-center transition-all duration-700 ease-out delay-300 ${isCommunityVisible ? 'opacity-100 translate-y-20' : 'opacity-0 translate-y-20'}`}>
                <button
                    onClick={() => handleNavigate('Contribute')}
                    className="inline-flex items-center px-6 py-3 font-semibold text-accent-primary-text bg-accent-primary rounded-lg hover:bg-accent-primary-hover shadow-lg shadow-gray-500/10 dark:shadow-gray-900/20"
                >
                    <GithubIcon className="w-5 h-5" />
                    <span className="ml-2">Become a Contributor</span>
                </button>
            </div>
        </div>

    </div>
  );
};

export default HomePage;