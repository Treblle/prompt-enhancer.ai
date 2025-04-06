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
            backgroundImage: {
                'gradient-border': 'linear-gradient(to right, #3b82f6, #10b981, #6366f1)',
                'conic-gradient': 'conic-gradient(from 90deg at 50% 50%, #0058ff 0%, #22263c50%, #0058ff 100%)'
            },
            animation: {
                'spin-slow': 'spin 10s linear infinite',
                'gradient': 'gradient 10s ease-in-out infinite'
            },
            keyframes: {
                gradient: {
                    '0%, 100%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                }
            },
            transitionProperty: {
                'background': 'background'
            }
        },
    },
    plugins: [],
};