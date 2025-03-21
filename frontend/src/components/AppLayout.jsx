import React, { useState, useEffect } from 'react';
import { Github } from 'lucide-react';

const GithubStarButton = () => {
    const REPO_URL = 'https://github.com/Rahulkhinchi03/prompt-enhancer';
    return (
        <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center bg-gray-200 dark:bg-gray-700 rounded-md px-2 h-8 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            title="Star on GitHub"
        >
            <Github className="h-4 w-4 mr-1.5 text-gray-700 dark:text-gray-300" />
            <span className="text-xs text-gray-700 dark:text-gray-300 whitespace-nowrap">Star on GitHub</span>
        </a>
    );
};

const ThemeToggle = () => {
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Effect to handle initial dark mode state and persist preference
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

        const initialMode = savedTheme === 'dark' || (!savedTheme && prefersDarkMode);
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
        <div className="fixed top-4 right-4 z-50 flex space-x-2 items-center">
            <GithubStarButton />

            <div className="container">
                <input
                    type="checkbox"
                    id="theme-toggle"
                    className="hidden-checkbox"
                    checked={isDarkMode}
                    onChange={toggleDarkMode}
                />
                <label htmlFor="theme-toggle" className="toggle-button w-8 h-8 p-1.5">
                    <div className="icon-wrapper">
                        <svg className="icon sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                        <svg className="icon moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
        <div className="flex flex-col h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
            <ThemeToggle />
            <main className="flex-1 flex flex-col overflow-hidden">
                {children}
            </main>
            <footer className="bg-gray-200 dark:bg-gray-800 py-3 text-center border-t border-gray-300 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center justify-center">
                    Powered by <a
                        href="https://treblle.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 inline-flex"
                    >
                        <img
                            src="https://cdn.prod.website-files.com/6446b3c46dac08ff137e3b2b/67614962f09f4a49c0496c8c_logo-color.png"
                            alt="Treblle"
                            className="h-5"
                        />
                    </a>
                </p>
            </footer>
        </div>
    );
};

export default AppLayout;