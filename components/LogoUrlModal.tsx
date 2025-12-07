import { FC, useState, useRef, useEffect } from 'react';
import { App } from '../types';
import { supabase } from '../lib/supabase';
import ButtonSpinner from './ButtonSpinner';
import { CloseIcon } from './Icons';

interface LogoUrlModalProps {
    app: App;
    onClose: () => void;
    onSave: (newUrl: string) => void;
}

const LogoUrlModal: FC<LogoUrlModalProps> = ({ app, onClose, onSave }) => {
    const [url, setUrl] = useState(app.logo_url || '');
    const [status, setStatus] = useState<'idle' | 'saving' | 'error'>('idle');
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Automatically focus and select the input text when the modal opens.
        if (inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, []);

    const handleSave = async () => {
        setStatus('saving');
        setError(null);
        // Treat empty or whitespace-only URL as null for database
        const urlToSave = url.trim() === '' ? null : url.trim();

        try {
            // 1. Check if an existing metadata entry exists for this app name
            const { data: existing, error: selectError } = await supabase
                .from('app_metadata')
                .select('id')
                .eq('app_name', app.name)
                .limit(1)
                .single();

            // PGRST116 is the error code for "no rows found" (PostgREST), which is fine for SELECT SINGLE
            if (selectError && selectError.code !== 'PGRST116') throw selectError;

            let queryError;
            if (existing) {
                // 2. If existing, update the record
                const { error } = await supabase.from('app_metadata').update({ logo_url: urlToSave }).eq('app_name', app.name);
                queryError = error;
            } else {
                // 3. If not existing, insert a new record
                const { error } = await supabase.from('app_metadata').insert({ app_name: app.name, logo_url: urlToSave });
                queryError = error;
            }
            
            if (queryError) throw queryError;
            
            // Success: update the parent state and close the modal
            onSave(urlToSave || '');
            onClose();

        } catch (e: any) {
            console.error("Error saving logo:", e);
            setError(e.message || 'An unknown error occurred.');
            setStatus('error');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center p-4 animate-fade-in-fast" onClick={onClose}>
            <div className="bg-bg-secondary rounded-xl border border-border-primary shadow-lg w-full max-w-md animate-scale-in" onClick={(e) => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-border-primary">
                    <h3 className="text-lg font-semibold text-text-primary">Change Logo for {app.name}</h3>
                    <button onClick={onClose} className="p-1 rounded-full text-text-tertiary hover:bg-bg-hover hover:text-text-primary transition-colors" aria-label="Close modal">
                        <CloseIcon />
                    </button>
                </header>
                <div className="p-6 space-y-4">
                    <div>
                        <label htmlFor="logo-url" className="block text-sm font-medium text-text-secondary mb-2">Logo URL</label>
                        <input
                            ref={inputRef}
                            id="logo-url"
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); }}
                            placeholder="https://example.com/logo.png (Leave blank to use default)"
                            className="w-full py-2 px-3 bg-bg-tertiary text-text-primary border border-border-secondary rounded-md focus:outline-none"
                        />
                    </div>
                    {status === 'error' && <p className="text-red-400 text-sm">{error}</p>}
                </div>
                <footer className="flex justify-end p-4 bg-bg-tertiary/50 border-t border-border-primary space-x-3 rounded-b-xl">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-md bg-bg-inset hover:bg-bg-active text-text-primary transition-colors">
                        Cancel
                    </button>
                    <button 
                        onClick={handleSave} 
                        disabled={status === 'saving'} 
                        className="flex justify-center items-center px-4 py-2 text-sm font-medium rounded-md bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-150 disabled:bg-blue-800/50 disabled:cursor-not-allowed w-24"
                    >
                        {status === 'saving' ? <ButtonSpinner /> : 'Save'}
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default LogoUrlModal;
