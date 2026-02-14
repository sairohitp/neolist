import React, { useState } from 'react';
import { Icon } from './icons';

interface LoginProps {
    onSignIn: () => Promise<any>;
}

export const Login: React.FC<LoginProps> = ({ onSignIn }) => {
    const [isSigningIn, setIsSigningIn] = useState(false);

    const handleSignIn = async () => {
        setIsSigningIn(true);
        try {
            await onSignIn();
        } catch (error) {
            console.error("Google Sign-In failed:", error);
            setIsSigningIn(false);
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 p-4">
            <div className="w-full max-w-sm mx-auto">
                <div className="bg-white shadow-xl rounded-2xl p-8 sm:p-12 flex flex-col items-center text-center dark:bg-slate-800">
                    <header className="mb-8">
                        <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">neolist</h1>
                        <p className="text-slate-600 mt-1 dark:text-slate-400">Your Modern To-Do List</p>
                    </header>
                    <p className="mb-8 text-slate-600 dark:text-slate-400">Please sign in with your Google account to save and sync your tasks.</p>
                    <button
                        onClick={handleSignIn}
                        disabled={isSigningIn}
                        className="w-full flex items-center justify-center gap-3 bg-white text-slate-700 font-semibold py-3 px-4 border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-75 disabled:cursor-not-allowed dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-600"
                    >
                        {isSigningIn ? (
                            <>
                                <Icon name="spinner" className="w-6 h-6 animate-spin" />
                                <span>Signing in...</span>
                            </>
                        ) : (
                            <>
                                <Icon name="google" className="w-6 h-6 flex-shrink-0" />
                                <span>Sign in with Google</span>
                            </>
                        )}
                    </button>
                </div>
                <footer className="text-center mt-8 text-sm text-slate-500 dark:text-slate-400">
                    <p>Your data is securely synced across devices.</p>
                </footer>
            </div>
        </div>
    );
};