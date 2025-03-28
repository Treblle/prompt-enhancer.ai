import React, { useState, useEffect } from 'react';
import { Github } from 'lucide-react';

const GithubStarButton = () => {
    const REPO_URL = 'https://github.com/Treblle/prompt-enhancer.ai';
    return (
        <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-1.5 border border-neutral-200 dark:border-neutral-700 shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Star on GitHub"
        >
            <Github className="h-4 w-4 mr-1.5 text-indigo-800 dark:text-indigo-300" />
            <span className="text-xs text-indigo-800 dark:text-indigo-300 whitespace-nowrap font-bold">Star on GitHub</span>
        </a>
    );
};

const ThemeToggle = () => {
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Effect to handle initial dark mode state and persist preference
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');

        // Set default to light mode instead of checking system preference
        const initialMode = savedTheme === 'dark';
        setIsDarkMode(initialMode);

        if (initialMode) {
            document.documentElement.classList.add('dark');
            document.body.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
            document.body.classList.remove('dark');
        }
    }, []);

    // Toggle dark mode
    const toggleDarkMode = () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);

        if (newMode) {
            document.documentElement.classList.add('dark');
            document.body.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            document.body.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    return (
        <div className="flex items-center">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-1.5 border border-neutral-200 dark:border-neutral-700 shadow-sm">
                <input
                    type="checkbox"
                    id="theme-toggle"
                    className="hidden-checkbox"
                    checked={isDarkMode}
                    onChange={toggleDarkMode}
                />
                <label htmlFor="theme-toggle" className="flex items-center cursor-pointer">
                    <div className="icon-wrapper relative h-4 w-4">
                        <svg className="icon sun absolute inset-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="5"></circle>
                            <line x1="12" y1="1" x2="12" y2="3"></line>
                            <line x1="12" y1="21" x2="12" y2="23"></line>
                            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                            <line x1="1" y1="12" x2="3" y2="12"></line>
                            <line x1="21" y1="12" x2="23" y2="12"></line>
                            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                        </svg>
                        <svg className="icon moon absolute inset-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"></path>
                        </svg>
                    </div>
                </label>
            </div>
        </div>
    );
};

const AppLayout = ({ children }) => {
    return (
        <div className="flex flex-col h-full min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
            {/* Fixed header with controls - updated to match footer style */}
            <header className="bg-gray-100 dark:bg-gray-800 py-2 px-4 flex justify-end items-center gap-2 shadow-sm z-10">
                <div className="flex gap-3">
                    <GithubStarButton />
                    <ThemeToggle />
                </div>
            </header>

            <main className="flex-1 flex flex-col overflow-hidden">
                {children}

                {/* Footer - Original fixed position footer with mobile adjustments */}
                <div className="fixed bottom-4 sm:bottom-8 left-0 right-0 flex justify-center pointer-events-none">
                    <div className="bg-gray-50 dark:bg-gray-800 px-3 sm:px-8 py-1.5 sm:py-3 rounded-lg shadow-md inline-flex items-center space-x-2 sm:space-x-3 pointer-events-auto border border-neutral-200 dark:border-neutral-700 max-w-[95%] sm:max-w-none">
                        <div className="flex items-center space-x-1 sm:space-x-3">
                            <span className="text-black dark:text-gray-200 text-[10px] sm:text-base font-bold">Powered by</span>
                            <a
                                href="https://treblle.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center"
                            >
                                <div className="flex items-center transition-transform duration-300 hover:scale-110 origin-center ml-1 mr-1">
                                    <img
                                        src="https://cdn.prod.website-files.com/6446b3c46dac08ff137e3b2b/67614962f09f4a49c0496c8c_logo-color.png"
                                        alt="Treblle"
                                        className="h-4 sm:h-6 dark:hidden"
                                    />
                                    <img
                                        src="https://treblle.com/treblle-white.svg"
                                        alt="Treblle"
                                        className="h-4 sm:h-6 hidden dark:block"
                                    />
                                </div>
                            </a>
                        </div>
                        <div className="h-3 sm:h-4 w-px bg-neutral-300 dark:bg-neutral-600"></div>
                        <span className="text-black dark:text-gray-200 text-[10px] sm:text-base font-bold">
                            Vibe Coded by{' '}
                            <a
                                href="https://www.linkedin.com/in/rahulkhinchi03/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline transition-transform duration-300 hover:scale-110 inline-block ml-1 text-indigo-800 dark:text-indigo-300"
                            >
                                Rahul Khinchi
                            </a>
                        </span>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AppLayout;