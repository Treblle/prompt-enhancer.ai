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

            <main className="flex-1 flex flex-col overflow-hidden py-6 md:py-10">
                {children}

                {/* Footer - Original fixed position footer with mobile adjustments */}
                <div className="fixed bottom-8 sm:bottom-12 md:bottom-16 left-0 right-0 flex justify-center pointer-events-none">
                    <div className="bg-white dark:bg-gray-800 px-3 sm:px-8 py-1.5 sm:py-3 rounded-lg shadow-md inline-flex items-center space-x-2 sm:space-x-3 pointer-events-auto border border-neutral-200 dark:border-neutral-700 max-w-[95%] sm:max-w-none">
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
                                    <svg id="Layer_1" className="h-4 sm:h-6 hidden dark:block" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1735 500" width="100" fill="#fff" data-scope="icon"><g id="Treblle_Logo_-_Color" data-name="Treblle Logo - Color"><g id="Typo"><path class="cls-1" d="M751.02,313.35v54.06h-32.43c-23.11,0-41.14-5.65-54.06-16.96-12.93-11.31-19.39-29.76-19.39-55.36v-82.76h-25.35v-52.94h25.35v-14.55l63.75-48.25v62.8h41.75v52.94h-41.75v83.51c0,6.22,1.49,10.69,4.47,13.42,2.98,2.74,7.95,4.1,14.91,4.1h22.74Z"></path><path class="cls-1" d="M861.79,167.02c11.18-6.58,23.61-9.88,37.28-9.88v67.48h-17.52c-15.91,0-27.84,3.42-35.79,10.25-7.96,6.84-11.93,18.82-11.93,35.97v96.56h-63.75v-208.02h63.75v34.67c7.45-11.43,16.77-20.44,27.96-27.03Z"></path><path class="cls-1" d="M1108.29,278.67h-144.27c.99,12.93,5.15,22.81,12.49,29.64,7.33,6.84,16.34,10.25,27.03,10.25,15.9,0,26.96-6.71,33.18-20.13h67.85c-3.48,13.67-9.76,25.97-18.82,36.91-9.08,10.94-20.45,19.51-34.11,25.72-13.67,6.22-28.96,9.32-45.85,9.32-20.38,0-38.53-4.35-54.43-13.05-15.91-8.7-28.33-21.12-37.28-37.28-8.95-16.15-13.42-35.04-13.42-56.66s4.41-40.51,13.23-56.67c8.82-16.15,21.19-28.58,37.1-37.28,15.9-8.7,34.17-13.05,54.8-13.05s38.02,4.23,53.68,12.67c15.66,8.45,27.9,20.51,36.72,36.16,8.82,15.66,13.23,33.92,13.23,54.8,0,5.96-.37,12.18-1.12,18.64ZM1044.17,243.26c0-10.93-3.73-19.63-11.18-26.1-7.46-6.46-16.78-9.69-27.96-9.69s-19.7,3.11-27.03,9.32c-7.33,6.22-11.87,15.04-13.61,26.47h79.78Z"></path><path class="cls-1" d="M1214.4,165.34c11.18-5.97,23.98-8.95,38.4-8.95,17.15,0,32.68,4.35,46.6,13.05,13.91,8.7,24.91,21.13,32.99,37.28,8.07,16.16,12.12,34.92,12.12,56.29s-4.04,40.2-12.12,56.48c-8.08,16.28-19.08,28.84-32.99,37.65-13.92,8.82-29.45,13.23-46.6,13.23-14.67,0-27.46-2.92-38.4-8.76-10.94-5.84-19.51-13.61-25.72-23.3v29.08h-63.75V103.42h63.75v85.41c5.96-9.69,14.54-17.52,25.72-23.49ZM1266.41,225.55c-8.82-9.07-19.7-13.61-32.62-13.61s-23.43,4.6-32.25,13.79c-8.83,9.2-13.23,21.75-13.23,37.65s4.41,28.46,13.23,37.65c8.82,9.2,19.57,13.79,32.25,13.79s23.49-4.66,32.43-13.98c8.95-9.32,13.42-21.93,13.42-37.84s-4.42-28.39-13.23-37.47Z"></path><path class="cls-1" d="M1423.8,103.42v263.98h-63.75V103.42h63.75Z"></path><path class="cls-1" d="M1510.7,103.42v263.98h-63.75V103.42h63.75Z"></path><path class="cls-1" d="M1733.88,278.67h-144.27c.99,12.93,5.15,22.81,12.49,29.64,7.33,6.84,16.34,10.25,27.03,10.25,15.9,0,26.96-6.71,33.18-20.13h67.85c-3.48,13.67-9.76,25.97-18.82,36.91-9.08,10.94-20.45,19.51-34.11,25.72-13.67,6.22-28.96,9.32-45.85,9.32-20.38,0-38.53-4.35-54.43-13.05-15.91-8.7-28.33-21.12-37.28-37.28-8.95-16.15-13.42-35.04-13.42-56.66s4.41-40.51,13.23-56.67c8.82-16.15,21.19-28.58,37.1-37.28,15.9-8.7,34.17-13.05,54.8-13.05s38.02,4.23,53.68,12.67c15.66,8.45,27.9,20.51,36.72,36.16,8.82,15.66,13.23,33.92,13.23,54.8,0,5.96-.37,12.18-1.12,18.64ZM1669.76,243.26c0-10.93-3.73-19.63-11.18-26.1-7.46-6.46-16.78-9.69-27.96-9.69s-19.7,3.11-27.03,9.32c-7.33,6.22-11.87,15.04-13.61,26.47h79.78Z"></path></g><g id="Icon"><path class="cls-1" d="M0,0v252.23c0,136.91,111.7,247.77,249.82,247.77s250.18-110.98,250.18-247.89V0H0ZM380.2,186.84h-71.05v197.23h-108.2v-197.23h-108.2l108.2-90.47v90.47l108.2-90.47h71.05v90.47Z"></path></g></g></svg>
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
