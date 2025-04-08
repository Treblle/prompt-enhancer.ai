import React, { useEffect, useState } from 'react';
import PromptEnhancerApp from './components/PromptEnhancerApp';
import AppLayout from './components/AppLayout';
import MobileLayout from './components/MobileLayout';
import './index.css';
import authService from './services/authService';

function App() {
    // State to track screen size
    const [isMobile, setIsMobile] = useState(false);

    // Initialize authentication on app load
    useEffect(() => {
        const initAuth = async () => {
            try {
                await authService.initializeAuth();
            } catch (error) {
                console.error('Auth initialization failed:', error);
            }
        };

        initAuth();

        // Function to check screen size
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth <= 768); // Adjust breakpoint as needed
        };

        // Check initial screen size
        checkScreenSize();

        // Add event listener for window resize
        window.addEventListener('resize', checkScreenSize);

        // Cleanup event listener
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    // Choose layout based on screen size
    const Layout = isMobile ? MobileLayout : AppLayout;

    return (
        <Layout>
            <PromptEnhancerApp />
        </Layout>
    );
}

export default App;