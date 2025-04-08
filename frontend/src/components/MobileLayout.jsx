import React, { useState, useEffect } from 'react';
import { Github, Moon, Sun, Menu, X } from 'lucide-react';

const MobileLayout = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Effect to handle initial dark mode state and persist preference
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');

        // Set default to light mode
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

    // Mobile menu toggle
    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <div className="mobile-layout min-h-screen flex flex-col bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
            {/* Mobile Header */}
            <header className="mobile-header sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-sm">
                <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                    {/* Logo or App Title */}
                    <div className="flex items-center">
                        <img
                            src="/logo.png"
                            alt="Prompt Enhancer"
                            className="h-8 w-8 mr-2"
                        />
                        <h1 className="text-lg font-bold text-indigo-800 dark:text-indigo-300">
                            Prompt Enhancer
                        </h1>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <div className="flex items-center space-x-3">
                        {/* Theme Toggle */}
                        <button
                            onClick={toggleDarkMode}
                            className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            aria-label="Toggle dark mode"
                        >
                            {isDarkMode ? (
                                <Sun className="h-5 w-5 text-yellow-500" />
                            ) : (
                                <Moon className="h-5 w-5 text-indigo-800" />
                            )}
                        </button>

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={toggleMobileMenu}
                            className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            aria-label="Toggle mobile menu"
                        >
                            {isMobileMenuOpen ? (
                                <X className="h-5 w-5" />
                            ) : (
                                <Menu className="h-5 w-5" />
                            )}
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Menu Slide-out */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-40 bg-white dark:bg-gray-950 pt-16 overflow-y-auto">
                    <div className="px-4 py-6 space-y-4">
                        <a
                            href="https://apiinsights.io/reports/f0761065-71b2-4f1a-8313-e287c9623dc3"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block py-2 px-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-800 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                        >
                            API Insights Report
                        </a>
                        <a
                            href="https://github.com/Treblle/prompt-enhancer.ai"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block py-2 px-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-indigo-800 dark:text-indigo-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center"
                        >
                            <Github className="h-5 w-5 mr-2" />
                            Star on GitHub
                        </a>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto px-4 py-6">
                {children}
            </main>

            {/* Mobile Footer */}
            <footer className="mobile-footer bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 py-4 px-4">
                <div className="container mx-auto flex flex-col items-center text-center">
                    <div className="flex items-center mb-2">
                        <span className="text-xs text-gray-600 dark:text-gray-400 mr-2">Powered by</span>
                        <img
                            src="https://cdn.prod.website-files.com/6446b3c46dac08ff137e3b2b/67614962f09f4a49c0496c8c_logo-color.png"
                            alt="Treblle"
                            className="h-5 dark:hidden"
                        />
                        <svg
                            className="h-5 hidden dark:block"
                            id="Layer_1"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 1735 500"
                            fill="#fff"
                        >
                            {/* Treblle logo SVG path */}
                            <path className="cls-1" d="M751.02,313.35v54.06h-32.43c-23.11,0-41.14-5.65-54.06-16.96-12.93-11.31-19.39-29.76-19.39-55.36v-82.76h-25.35v-52.94h25.35v-14.55l63.75-48.25v62.8h41.75v52.94h-41.75v83.51c0,6.22,1.49,10.69,4.47,13.42,2.98,2.74,7.95,4.1,14.91,4.1h22.74Z" />
                            {/* Rest of the Treblle logo paths */}
                        </svg>
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                        Vibe Coded by{' '}
                        <a
                            href="https://www.linkedin.com/in/rahulkhinchi03/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-800 dark:text-indigo-300 hover:underline"
                        >
                            Rahul Khinchi
                        </a>
                    </span>
                </div>
            </footer>
        </div>
    );
};

export default MobileLayout;