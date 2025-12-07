import React, { useState, FormEvent, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import LoadingSpinner from '../components/LoadingSpinner';
import { EyeIcon, EyeOffIcon } from '../components/Icons';
import { useAuth } from '../hooks/useAuth';

const AdminPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { user, loading: authLoading } = useAuth();

    useEffect(() => {
        if (!authLoading && user) {
            window.location.href = '/dashboard';
        }
    }, [user, authLoading]);

    const handleLogin = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
        } else {
            window.location.href = '/dashboard';
        }
        setLoading(false);
    };

    if (authLoading || user) {
        return (
            <div className="bg-[#101011] text-gray-300 min-h-screen font-sans flex items-center justify-center">
                <LoadingSpinner text="Redirecting..." />
            </div>
        );
    }

    return (
        <div className="bg-[#101011] text-gray-300 min-h-screen font-sans flex items-center justify-center p-4">
            <div className="w-full max-w-md p-8 space-y-8 bg-[#18181B] border border-[#333538] rounded-2xl shadow-lg animate-scale-in">
                <div className="flex flex-col items-center space-y-4">
                    <div className="flex items-center space-x-3">
                        <img src="/assets/logo.png" alt="Fluent Deck Logo" className="h-10 w-10" />
                        <h1 className="text-3xl font-bold text-white">Fluent Deck</h1>
                    </div>
                    <p className="text-center text-sm text-gray-400">
                        Please sign in to access the admin dashboard
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    <div>
                        <label htmlFor="email-address" className="text-sm font-medium text-gray-300 block mb-2">Email</label>
                        <input
                            id="email-address"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            className="appearance-none relative block w-full px-4 py-3 border border-[#333538] bg-[#18181B] placeholder-gray-500 text-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="text-sm font-medium text-gray-300 block mb-2">Password</label>
                        <div className="relative">
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                autoComplete="current-password"
                                required
                                className="appearance-none relative block w-full px-4 py-3 border border-[#333538] bg-[#18181B] placeholder-gray-500 text-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors pr-10"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white"
                                aria-label="Toggle password visibility"
                            >
                                {showPassword ? (
                                    <EyeOffIcon className="h-5 w-5" />
                                ) : (
                                    <EyeIcon className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <p className="text-sm text-red-400 text-center">{error}</p>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#18181B] focus:ring-blue-500 disabled:bg-blue-800/50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? (
                                <div className="h-5 w-5 flex items-center justify-center">
                                    <LoadingSpinner />
                                </div>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminPage;