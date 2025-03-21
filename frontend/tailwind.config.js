/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class', // Enable class-based dark mode
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#000000',
                    dark: '#ffffff',
                },
                background: {
                    DEFAULT: '#ffffff',
                    dark: '#0a0a0a'
                },
                foreground: {
                    DEFAULT: '#000000',
                    dark: '#ffffff'
                },
                accent: {
                    DEFAULT: '#f5f5f5',
                    dark: '#1f1f1f',
                },
                muted: {
                    DEFAULT: '#f1f5f9',
                    dark: '#334155'
                },
                border: {
                    DEFAULT: '#e2e8f0',
                    dark: '#374151'
                }
            },
            backgroundColor: {
                DEFAULT: 'var(--background)',
                dark: 'var(--background-dark)'
            },
            textColor: {
                DEFAULT: 'var(--text)',
                dark: 'var(--text-dark)'
            }
        },
    },
    plugins: [],
};