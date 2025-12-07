import React, { useState, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeSwitchProps {
    modes: Theme[];
    icons: React.ReactNode[];
}

export const ThemeSwitch: React.FC<ThemeSwitchProps> = ({ modes, icons }) => {
    const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'dark');

    useEffect(() => {
        const root = window.document.documentElement;
        const isDark =
            theme === 'dark' ||
            (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
        
        if (isDark) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
    }, [theme]);

    useEffect(() => {
        localStorage.setItem('theme', theme);
    }, [theme]);
    
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            if (theme === 'system') {
                const root = window.document.documentElement;
                if (mediaQuery.matches) {
                    root.classList.add('dark');
                } else {
                    root.classList.remove('dark');
                }
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme]);

    return (
        <div className="bg-bg-tertiary border border-border-secondary rounded-full p-1 flex items-center justify-between">
            {modes.map((mode, index) => (
                <button
                    key={mode}
                    onClick={() => setTheme(mode)}
                    className={`p-1.5 rounded-full flex justify-center ${
                        theme === mode
                            ? 'bg-gray-600 text-white shadow-sm' // ✅ CHANGED: Lighter blue background with white text
                            : 'text-text-tertiary hover:bg-bg-secondary/50 hover:text-text-primary'
                    }`}
                    aria-label={`Switch to ${mode} theme`}
                    title={`Switch to ${mode.charAt(0).toUpperCase() + mode.slice(1)} theme`}
                >
                    {icons[index]}
                </button>
            ))}
        </div>
    );
};