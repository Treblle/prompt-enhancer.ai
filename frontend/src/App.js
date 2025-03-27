import React, { useEffect } from 'react';
import PromptEnhancerApp from './components/PromptEnhancerApp';
import AppLayout from './components/AppLayout';
import './index.css';
import authService from './services/authService';

function App() {
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
    }, []);

    return (
        <AppLayout>
            <PromptEnhancerApp />
        </AppLayout>
    );
}

export default App;