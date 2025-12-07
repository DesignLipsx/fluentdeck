import React, { useState, useEffect, useContext, createContext, FC, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';
import ConfirmationModal from '../components/ConfirmationModal';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    requestSignOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: FC<{children: ReactNode}> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    useEffect(() => {
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        };

        getSession();

        const { data: authListener } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                setSession(session);
                setUser(session?.user ?? null);
                setLoading(false);
            }
        );

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    const handleSignOut = async () => {
        setShowLogoutConfirm(false);
        await supabase.auth.signOut();
        window.location.href = '/';
    };

    const requestSignOut = () => {
        setShowLogoutConfirm(true);
    };

    const value: AuthContextType = {
        session,
        user,
        loading,
        requestSignOut
    };

    const modalProps = {
        isOpen: showLogoutConfirm,
        onClose: () => setShowLogoutConfirm(false),
        onConfirm: handleSignOut,
        title: "Confirm Sign Out",
        message: "Are you sure you want to sign out of your account?",
        confirmText: "Sign Out",
    };

    return React.createElement(AuthContext.Provider, { value }, 
        React.createElement(React.Fragment, null,
            !loading ? children : null,
            React.createElement(ConfirmationModal, modalProps)
        )
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};