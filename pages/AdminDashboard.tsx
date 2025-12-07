import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import LoadingSpinner from '../components/LoadingSpinner';
import { useMarkdownParser } from '../hooks/useMarkdownParser';
import AppModal from '../components/AppModal';
import { SaveIcon, SignOutIcon, HomeIcon } from '../components/Icons';
import UserProfileDropdown from '../components/UserProfileDropdown';

const AdminDashboard: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loadingUser, setLoadingUser] = useState(true);
    const { categories, loading: loadingApps, error: appsError } = useMarkdownParser();
    
    const [logoUrls, setLogoUrls] = useState<Record<string, string>>({});
    const [savingStatus, setSavingStatus] = useState<Record<string, 'idle' | 'saving' | 'saved' | 'error'>>({});
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setUser(session.user);
            } else {
                window.location.href = '/admin';
            }
            setLoadingUser(false);
        };
        checkSession();
    }, []);

    useEffect(() => {
        if (!loadingApps && categories.length > 0) {
            const initialUrls = categories
                .flatMap(c => c.apps)
                .reduce((acc, app) => {
                    acc[app.name] = app.logo_url || '';
                    return acc;
                }, {} as Record<string, string>);
            setLogoUrls(initialUrls);
        }
    }, [loadingApps, categories]);

    const allApps = categories.flatMap(cat => cat.apps).sort((a,b) => a.name.localeCompare(b.name));

    const handleLogoUrlChange = (appName: string, url: string) => {
        setLogoUrls(prev => ({ ...prev, [appName]: url }));
        setSavingStatus(prev => ({ ...prev, [appName]: 'idle' }));
    };

    const handleSaveLogo = async (appName: string) => {
        setSavingStatus(prev => ({ ...prev, [appName]: 'saving' }));
        const urlToSave = logoUrls[appName] || null;

        try {
            const { data: existing, error: selectError } = await supabase
                .from('app_metadata')
                .select('id')
                .eq('app_name', appName)
                .limit(1)
                .single();

            if (selectError && selectError.code !== 'PGRST116') {
                throw selectError;
            }

            let queryError;

            if (existing) {
                const { error } = await supabase
                    .from('app_metadata')
                    .update({ logo_url: urlToSave })
                    .eq('app_name', appName);
                queryError = error;
            } else {
                const { error } = await supabase
                    .from('app_metadata')
                    .insert({ app_name: appName, logo_url: urlToSave });
                queryError = error;
            }
            
            if (queryError) {
                throw queryError;
            }
            
            setSavingStatus(prev => ({ ...prev, [appName]: 'saved' }));
            setTimeout(() => {
                setSavingStatus(prev => ({ ...prev, [appName]: 'idle' }));
            }, 2000);

        } catch (error) {
            setSavingStatus(prev => ({ ...prev, [appName]: 'error' }));
            console.error("Error saving logo:", error);
        }
    };
    
    if (loadingUser) {
        return (
             <div className="bg-bg-primary text-text-secondary min-h-screen font-sans flex items-center justify-center">
                <LoadingSpinner text="Authenticating..." />
            </div>
        );
    }
    
    const SaveButton: React.FC<{ status: string | undefined, onClick: () => void }> = ({ status = 'idle', onClick }) => {
        const baseClasses = "w-28 flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md";
        switch (status) {
            case 'saving':
                return (
                    <button disabled className={`${baseClasses} bg-gray-500 dark:bg-gray-600 text-white`}>
                        <div className="h-5 w-5 flex items-center justify-center">
                            <LoadingSpinner />
                        </div>
                    </button>
                );
            case 'saved':
                return <button disabled className={`${baseClasses} bg-green-600 text-white`}>Saved!</button>;
            case 'error':
                return <button onClick={onClick} className={`${baseClasses} bg-red-600 hover:bg-red-700 text-white`}>Retry</button>;
            default:
                return (
                    <button onClick={onClick} className={`${baseClasses} bg-blue-600 hover:bg-blue-700 text-white`}>
                        <SaveIcon className="w-4 h-4 mr-2" />
                        Save
                    </button>
                );
        }
    };

    return (
        <div className="bg-bg-primary text-text-secondary min-h-screen font-sans">
            <div className="p-4 sm:p-6 lg:p-8">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-text-primary">Admin Dashboard</h1>
                        <p className="text-text-tertiary">Welcome, <span className="font-semibold text-blue-500 dark:text-blue-400">{user?.email}</span></p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <a
                            href="/"
                            className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-text-primary bg-bg-tertiary hover:bg-bg-active focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg-primary focus:ring-gray-500"
                        >
                            <HomeIcon className="w-4 h-4 mr-2" />
                            Return to Home
                        </a>
                        <UserProfileDropdown />
                    </div>
                </header>

                <div className="bg-bg-secondary rounded-xl border border-border-primary shadow-lg">
                    <div className="p-6 border-b border-border-primary">
                        <h2 className="text-xl font-semibold text-text-primary">Manage App Logos</h2>
                        <p className="text-text-tertiary mt-1 text-sm">Enter the URL for each app's logo. Leave blank to remove it.</p>
                    </div>
                    <div className="divide-y divide-border-primary">
                        {loadingApps ? (
                            <div className="p-8 flex justify-center"><LoadingSpinner text="Loading apps..." /></div>
                        ) : appsError ? (
                            <div className="p-8 text-center text-red-400">{appsError}</div>
                        ) : (
                            allApps.map(app => (
                                <div key={app.name} className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-4 gap-4 items-center render-fast-row">
                                    <div className="font-medium text-text-primary lg:col-span-1 flex items-center gap-4">
                                        <div className="w-10 h-10 flex-shrink-0 rounded-md flex items-center justify-center bg-bg-tertiary">
                                            {logoUrls[app.name] ? (
                                                <img src={logoUrls[app.name]} alt={`${app.name} logo`} className="w-8 h-8 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement?.querySelector('span')?.style.removeProperty('display')}} />
                                            ) : null}
                                            <span className="text-xl font-bold" style={{ display: logoUrls[app.name] ? 'none' : 'block' }}>{app.name.charAt(0).toUpperCase()}</span>
                                        </div>
                                        <a href={app.link} target="_blank" rel="noopener noreferrer" className="truncate hover:underline hover:text-blue-500 dark:hover:text-blue-400">{app.name}</a>
                                    </div>
                                    <div className="lg:col-span-3 flex items-center gap-4">
                                        <input
                                            type="url"
                                            placeholder="https://example.com/logo.png"
                                            value={logoUrls[app.name] || ''}
                                            onChange={(e) => handleLogoUrlChange(app.name, e.target.value)}
                                            className="flex-grow w-full py-2 px-3 bg-bg-tertiary border border-border-secondary rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        />
                                        <SaveButton status={savingStatus[app.name]} onClick={() => handleSaveLogo(app.name)} />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;