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
  { name: 'Quick Pad', link: '#', description: '', tags: [], category: '', pricing: 'Paid', logo_url: 'https://store-images.s-microsoft.com/image/apps.15480.14151964118482152.1099fd14-ee83-4b92-9250-80114f6946c9.eef9c3e4-683e-4c5e-9aac-920d498d693e?h=115' },
  { name: 'Files', link: '#', description: '', tags: [], category: '', pricing: 'FOSS', logo_url: 'https://store-images.s-microsoft.com/image/apps.5536.13649428968955623.bcfc493a-7fd6-4231-9ddd-1c511b1330ad.11150fa3-6915-4039-b262-6be82a9c440a?h=210' },
  { name: 'Rodel Player', link: '#', description: '', tags: [], category: '', pricing: 'Free', logo_url: 'https://store-images.s-microsoft.com/image/apps.512.13527064089703327.46cf99a8-a763-4f87-9b3c-d85c248443e2.b0ecdd8b-69ef-412c-be73-a73709b7bcdb?h=210' },
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
  const totalApps = useMemo(() => categories.reduce((sum, category) => sum + category.apps.length, 0), [categories]);

  const featuresRef = useRef<HTMLDivElement>(null);
  const personalInfoRef = useRef<HTMLDivElement>(null);
  const communityRef = useRef<HTMLDivElement>(null);
  const isFeaturesVisible = useIntersectionObserver(featuresRef, { threshold: 0.2, triggerOnce: true });
  const isPersonalInfoVisible = useIntersectionObserver(personalInfoRef, { threshold: 0.1, triggerOnce: true });
  const isCommunityVisible = useIntersectionObserver(communityRef, { threshold: 0.2, triggerOnce: true });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const parallaxItems = container.querySelectorAll('.parallax-item');

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      
      const { left, top } = container.getBoundingClientRect();
      container.style.setProperty('--mouse-x', `${clientX - left}px`);
      container.style.setProperty('--mouse-y', `${clientY - top}px`);

      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const moveX = (clientX - centerX) / centerX;
      const moveY = (clientY - centerY) / centerY;

      parallaxItems.forEach(item => {
        const el = item as HTMLElement;
        const depth = parseFloat(el.dataset.depth || '0');
        const x = moveX * depth;
        const y = moveY * depth;
        el.style.transform = `translateX(${x}px) translateY(${y}px)`;
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const handleContributorClick = () => {
    onNavigate('Contribute', () => {
      document.getElementById('contributors-section')?.scrollIntoView({ behavior: 'smooth' });
    });
};

  return (
    <div>
        <div ref={containerRef} className="h-screen overflow-hidden flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 animate-background-pan relative hero-section-fade">
            <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                <div className="text-center lg:text-left animate-fade-in relative z-10">
                <h1 className="text-5xl md:text-7xl font-bold text-text-primary leading-tight">
                    Fluent Deck
                </h1>
                <p className="mt-4 text-lg md:text-xl text-text-tertiary max-w-xl mx-auto lg:mx-0">
                    A curated showcase of beautiful WinUI 3 apps, a comprehensive library of Fluent System Icons, and a vibrant collection of Fluent Emojis.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                    <button
                    onClick={() => onNavigate('Apps')}
                    className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 font-semibold text-accent-primary-text bg-accent-primary rounded-lg hover:bg-accent-primary-hover shadow-lg shadow-gray-500/10 dark:shadow-gray-900/20 transform hover:scale-105"
                    >
                    <AppsIcon />
                    <span className="ml-2">Explore Apps</span>
                    </button>
                    <button
                    onClick={() => onNavigate('Icons')}
                    className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 font-semibold text-text-secondary bg-bg-tertiary rounded-lg hover:bg-bg-active transform hover:scale-105"
                    >
                    <FluentIconsIcon />
                    <span className="ml-2">Browse Icons</span>
                    </button>
                    <button
                    onClick={() => onNavigate('Emoji')}
                    className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 font-semibold text-text-secondary bg-bg-tertiary rounded-lg hover:bg-bg-active transform hover:scale-105"
                    >
                    <EmojiIcon />
                    <span className="ml-2">Discover Emojis</span>
                    </button>
                </div>
                </div>
                
                <div className="hidden lg:block animate-fade-in" style={{ animationDelay: '200ms' }}>
                    <div className="relative h-[450px] w-full flex items-center justify-center perspective-[1000px]">
                        <div className="absolute inset-0 grid grid-cols-4 gap-6 opacity-10 filter blur-[1px] parallax-item" data-depth="5">
                            {showcaseIcons.map((icon, i) => (
                                <img key={i} src={getIconUrl(icon)} alt={icon} className="w-12 h-12 filter dark:invert opacity-50" style={{ animation: `fade-in 0.5s ease-out ${0.3 + i * 0.05}s forwards`, opacity: 0 }}/>
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
                                        top: `${10 + Math.random() * 80}%`,
                                        left: `${10 + Math.random() * 80}%`,
                                    }}
                                    >
                                    <img 
                                        src={imageUrl} 
                                        alt={emojiInfo.name} 
                                        className="w-16 h-16 emoji-float"
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
                            <div className="absolute w-48 parallax-item" data-depth="15" style={{ top: '20%', left: '5%'}}>
                                <div style={{ transform: 'rotate(-10deg) translateZ(0)' }}>
                                    <AppCard app={showcaseApps[0]} index={0} onClick={() => onNavigate('Apps')} />
                                </div>
                            </div>
                            <div className="absolute w-48 z-10" style={{ top: '35%', left: '50%', transform: 'translateX(-50%)' }}>
                                <div className="parallax-item" data-depth="-5">
                                    <div style={{ transform: 'scale(1.1) translateZ(0)' }}>
                                        <AppCard app={showcaseApps[1]} index={1} onClick={() => onNavigate('Apps')} />
                                    </div>
                                </div>
                            </div>
                            <div className="absolute w-48 parallax-item" data-depth="15" style={{ top: '20%', right: '5%'}}>
                                <div style={{ transform: 'rotate(10deg) translateZ(0)' }}>
                                    <AppCard app={showcaseApps[2]} index={2} onClick={() => onNavigate('Apps')} />
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
            <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
                <div className={`transition-all duration-500 ease-out ${isFeaturesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <FeatureCard 
                        icon={<AppsIcon />} 
                        title="Apps" 
                        count={isFeaturesVisible ? totalApps : 0} 
                        countSuffix="+" 
                        description="A curated list of beautiful and functional WinUI 3 applications."
                        onClick={() => onNavigate('Apps')}
                    />
                </div>
                <div className={`transition-all duration-500 ease-out delay-150 ${isFeaturesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <FeatureCard 
                        icon={<FluentIconsIcon />} 
                        title="Icons" 
                        count={isFeaturesVisible ? 4000 : 0} 
                        countSuffix="+" 
                        description="Explore thousands of Fluent System Icons in three unique styles."
                        onClick={() => onNavigate('Icons')}
                    />
                </div>
                <div className={`transition-all duration-500 ease-out delay-300 ${isFeaturesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <FeatureCard 
                        icon={<EmojiIcon />} 
                        title="Emojis" 
                        count={isFeaturesVisible ? emojis.length : 0}
                        countSuffix="" 
                        description="Discover a vibrant collection of animated and static Fluent Emojis."
                        onClick={() => onNavigate('Emoji')}
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
            <div className={`mt-12 flex justify-center transition-all duration-700 ease-out delay-200 ${isCommunityVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-95'}`}>
                <NetworkVisualization onNavigate={handleContributorClick} />
            </div>
             <div className={`text-center transition-all duration-700 ease-out delay-300 ${isCommunityVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <button
                    onClick={() => onNavigate('Contribute')}
                    className="inline-flex items-center px-6 py-3 font-semibold text-accent-primary-text bg-accent-primary rounded-lg hover:bg-accent-primary-hover shadow-lg shadow-gray-500/10 dark:shadow-gray-900/20 transform hover:scale-105"
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