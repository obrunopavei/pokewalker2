/**
 * EXAMPLE: How to integrate Firebase Auth and Firestore Sync into App.tsx
 * 
 * This file shows the key changes needed to integrate Firebase authentication
 * and automatic data syncing into your existing App.tsx file.
 * 
 * IMPORTANT: This is an example file - do not import this directly.
 * Instead, use these patterns to update your actual App.tsx file.
 */

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from './lib/auth-context';
import { useFirestoreSync, useLoadProfileFromFirestore } from './lib/firestore-sync';
import { GoogleSignIn } from './components/GoogleSignIn';
import { UserProfile } from './components/UserProfile';

// ============================================================================
// EXAMPLE 1: Update the App component to use Firebase Auth
// ============================================================================

export default function AppWithFirebase() {
    const { user, userProfile, loading: authLoading } = useAuth();
    const { getInitialCaughtData, getInitialIsCompletionist, getInitialAutoCollapse } = useLoadProfileFromFirestore();

    // Initialize state from Firestore when user is logged in, otherwise from localStorage
    const [caughtData, setCaughtData] = useState<Record<string, number>>(() => {
        if (userProfile?.caughtData) {
            return userProfile.caughtData;
        }
        // Fallback to localStorage for users not signed in
        const saved = localStorage.getItem('pokewalker-caught');
        if (!saved) return {};
        try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) {
                const migratedData: Record<string, number> = {};
                parsed.forEach(id => {
                    migratedData[id] = Date.now();
                });
                return migratedData;
            }
            return parsed;
        } catch (e) {
            console.error("Failed to parse caught data", e);
            return {};
        }
    });

    const [isCompletionist, setIsCompletionist] = useState<boolean>(() => {
        if (userProfile?.isCompletionist !== undefined) {
            return userProfile.isCompletionist;
        }
        const saved = localStorage.getItem('pokewalker-mode');
        return saved ? JSON.parse(saved) : false;
    });

    const [autoCollapsePostNational, setAutoCollapsePostNational] = useState<boolean>(() => {
        if (userProfile?.autoCollapsePostNational !== undefined) {
            return userProfile.autoCollapsePostNational;
        }
        const saved = localStorage.getItem('pokewalker-auto-collapse');
        return saved ? JSON.parse(saved) : true;
    });

    // Sync to Firestore when user is logged in (debounced)
    const { isSyncing } = useFirestoreSync(
        caughtData,
        isCompletionist,
        autoCollapsePostNational
    );

    // Update local state when Firestore profile changes (for multi-device sync)
    useEffect(() => {
        if (userProfile && user) {
            // Only update if data is actually different to avoid loops
            if (userProfile.caughtData && JSON.stringify(userProfile.caughtData) !== JSON.stringify(caughtData)) {
                setCaughtData(userProfile.caughtData);
            }
            if (userProfile.isCompletionist !== undefined && userProfile.isCompletionist !== isCompletionist) {
                setIsCompletionist(userProfile.isCompletionist);
            }
            if (userProfile.autoCollapsePostNational !== undefined && 
                userProfile.autoCollapsePostNational !== autoCollapsePostNational) {
                setAutoCollapsePostNational(userProfile.autoCollapsePostNational);
            }
        }
    }, [userProfile?.caughtData, userProfile?.isCompletionist, userProfile?.autoCollapsePostNational, user]);

    // Persist to localStorage for users not signed in
    useEffect(() => {
        if (!user) {
            localStorage.setItem('pokewalker-caught', JSON.stringify(caughtData));
        }
    }, [caughtData, user]);

    useEffect(() => {
        if (!user) {
            localStorage.setItem('pokewalker-mode', JSON.stringify(isCompletionist));
        }
    }, [isCompletionist, user]);

    useEffect(() => {
        if (!user) {
            localStorage.setItem('pokewalker-auto-collapse', JSON.stringify(autoCollapsePostNational));
        }
    }, [autoCollapsePostNational, user]);

    // Show loading state while auth is initializing
    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading...</p>
                </div>
            </div>
        );
    }

    // Your existing view state management...
    const [currentView, setCurrentView] = useState<'home' | 'modes' | 'tracker' | 'guide' | 'milestones' | 'history'>(() => {
        if (typeof window !== 'undefined') {
            const hasStarted = localStorage.getItem('pokewalker-has-started') === 'true';
            return hasStarted ? 'tracker' : 'home';
        }
        return 'home';
    });

    // Rest of your existing code...
    // ... (your handlers, derived state, etc.)

    return (
        <div>
            {/* Show sync indicator */}
            {isSyncing && user && (
                <div className="fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span className="text-sm">Syncing...</span>
                </div>
            )}

            {/* Your existing app views */}
            {/* ... */}
        </div>
    );
}

// ============================================================================
// EXAMPLE 2: Add Google Sign-In to Landing Page
// ============================================================================

const LandingPageWithAuth: React.FC<{ onStart: () => void }> = ({ onStart }) => {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
            {/* Your existing background effects */}
            <div className="absolute inset-0 opacity-20">
                <div className="absolute top-10 left-10 w-64 h-64 bg-rose-600 rounded-full blur-[100px]" />
                <div className="absolute bottom-10 right-10 w-64 h-64 bg-blue-600 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 max-w-2xl animate-in fade-in zoom-in-90 duration-700">
                {/* Your existing content */}
                <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-6">
                    Pokéwalker Challenge
                </h1>

                <p className="text-lg md:text-xl text-slate-300 leading-relaxed mb-10">
                    Embark on a nostalgic journey to complete the National Dex.
                </p>

                <div className="flex flex-col gap-4 items-center">
                    <button 
                        onClick={onStart}
                        className="group relative inline-flex items-center gap-3 px-8 py-4 bg-rose-600 hover:bg-rose-500 text-white font-bold text-lg rounded-full transition-all hover:scale-105"
                    >
                        Begin Your Adventure
                    </button>

                    {/* Add Google Sign-In option */}
                    {!user && (
                        <div className="mt-6 pt-6 border-t border-slate-700 w-full">
                            <p className="text-sm text-slate-400 mb-4">
                                Sign in to sync your progress across devices
                            </p>
                            <GoogleSignIn variant="large" onSuccess={onStart} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ============================================================================
// EXAMPLE 3: Add User Profile to Header
// ============================================================================

const HeaderWithAuth: React.FC = () => {
    const { user } = useAuth();

    return (
        <header className="bg-white border-b border-gray-200">
            <div className="max-w-5xl mx-auto px-4 py-6 flex justify-between items-start">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-gray-900 flex items-center gap-3">
                        Pokéwalker Challenge
                    </h1>
                    <p className="mt-2 text-gray-500">Track your progress to Mt. Silver.</p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Show user profile if logged in, otherwise show sign-in button */}
                    {user ? (
                        <UserProfile />
                    ) : (
                        <GoogleSignIn variant="minimal" />
                    )}
                    {/* Your existing settings button */}
                </div>
            </div>
        </header>
    );
};

// ============================================================================
// EXAMPLE 4: Optional - Require Authentication for Tracker
// ============================================================================

const TrackerWithAuth: React.FC = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center max-w-md p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        Sign in Required
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Please sign in to access your Pokémon tracker and sync your progress.
                    </p>
                    <GoogleSignIn variant="large" />
                </div>
            </div>
        );
    }

    // Your existing tracker component code
    return (
        <div>
            {/* Tracker content */}
        </div>
    );
};

