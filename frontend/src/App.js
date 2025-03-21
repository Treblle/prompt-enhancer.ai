import React from 'react';
import PromptEnhancerApp from './components/PromptEnhancerApp';
import AppLayout from './components/AppLayout';
import './index.css';

function App() {
    return (
        <AppLayout>
            <PromptEnhancerApp />
        </AppLayout>
    );
}

export default App;