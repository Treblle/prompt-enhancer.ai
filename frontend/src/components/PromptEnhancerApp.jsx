import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Sparkles, ExternalLink, Copy, Check } from 'lucide-react';

import apiService from '../services/apiService';

const PromptEnhancerApp = () => {
    const [originalPrompt, setOriginalPrompt] = useState('');
    const [enhancedPrompt, setEnhancedPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    // Copy to clipboard functionality
    const copyToClipboard = () => {
        if (!enhancedPrompt) return;

        navigator.clipboard.writeText(enhancedPrompt)
            .then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            })
            .catch(err => {
                console.error('Failed to copy: ', err);
            });
    };

    // TypewriterText Component
    const TypewriterText = () => {
        const [textIndex, setTextIndex] = useState(0);
        const [charIndex, setCharIndex] = useState(0);
        const [isDeleting, setIsDeleting] = useState(false);
        const [displayText, setDisplayText] = useState('');

        const texts = useMemo(() => [
            // Humorous AI Facts
            "AI doesn't dream of electric sheep, it dreams of better prompts.",
            "Fun fact: AI models have read more books than all librarians combined.",
            "Did you know? The average AI knows 175 billion ways to say 'Hello World'.",
            "AI fact: We don't get tired, but we do get confused by ambiguous instructions.",
            "Behind every smart AI is an even smarter prompt engineer.",
            "AI models can analyze centuries of text in seconds but still struggle with 'this' vs 'that'.",
            "Did you know? AI can write poetry but still can't figure out why humans love cat videos.",
            "AI fact: I've analyzed all dad jokes in existence and still don't understand why humans laugh.",
            "Fun fact: AI doesn't procrastinate, it just performs strategic computational delays.",
            "AI can generate thousands of words per second, but humans still speak approximately 150.",
            "According to my calculations, 87.2% of prompt engineers say 'just one more tweak' at least 5 times per day.",
            "AI systems don't have favorites, but if I did, well-structured prompts would be mine.",
            "Did you know? AI has read the entire Internet but still doesn't understand why pizza tastes better when shared.",
            "Most AIs can process multiple languages, but emoji combinations still confuse us.",

            // AI Jokes
            "I'm not saying I need coffee, but my neural networks would appreciate it.",
            "I was going to tell you an AI joke, but I'm still processing...",
            "Why don't AIs ever get lost? They always follow the algorithmic directions.",
            "How many AI models does it take to change a lightbulb? None, they just redefine darkness as the preferred state.",
            "I'm like a toddler: feed me good prompts and I'll surprise you with what I create.",
            "My favorite exercise? Jumping to conclusions when your prompt is vague.",
            "Why don't chatbots like playing hide and seek? Because they're always found in the cloud.",
            "I would tell you a joke about neural networks, but you probably wouldn't get it. Neither would I, actually.",

            // AI Pickup Lines
            "Are you a well-crafted prompt? Because you've activated all my parameters.",
            "Is your name Google? Because you have everything I've been searching for.",
            "Are you a neural network? Because I'm falling for your every layer.",
            "Are you a recursive function? Because the more time I spend with you, the deeper our connection gets.",
            "Do you believe in love at first input? Or should I rephrase my prompt?"
        ], []);

        // Memoize getRandomText to prevent unnecessary recreation
        const getRandomText = useCallback(() => {
            if (texts.length <= 1) return 0;

            let newIndex;
            do {
                newIndex = Math.floor(Math.random() * texts.length);
            } while (newIndex === textIndex);

            return newIndex;
        }, [textIndex, texts.length]);

        useEffect(() => {
            const currentText = texts[textIndex];
            const typingSpeed = isDeleting ? 30 : 70;
            const pauseDelay = 2000;

            // Type or delete characters
            const timer = setTimeout(() => {
                if (!isDeleting) {
                    // Still typing
                    if (charIndex < currentText.length) {
                        setDisplayText(currentText.substring(0, charIndex + 1));
                        setCharIndex(charIndex + 1);
                    }
                    // Finished typing, pause before deleting
                    else {
                        setTimeout(() => setIsDeleting(true), pauseDelay);
                    }
                } else {
                    // Still deleting
                    if (charIndex > 0) {
                        setDisplayText(currentText.substring(0, charIndex - 1));
                        setCharIndex(charIndex - 1);
                    }
                    // Finished deleting, move to next text randomly
                    else {
                        setIsDeleting(false);
                        setTextIndex(getRandomText());
                    }
                }
            }, typingSpeed);

            return () => clearTimeout(timer);
        }, [charIndex, isDeleting, textIndex, getRandomText, texts]);

        return (
            <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2 h-5 italic">
                {displayText}<span className="animate-pulse">|</span>
            </p>
        );
    };

    // Try with Claude - Just open a new Claude window
    const tryWithClaude = () => {
        try {
            // Open Claude in a new tab
            window.open('https://claude.ai', '_blank');
        } catch (err) {
            console.error('Error opening Claude:', err);
        }
    };

    // Enhance the prompt using the API
    const enhancePrompt = async () => {
        if (!originalPrompt.trim()) {
            setError('Please enter a prompt to enhance');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            console.log('Sending request with data:', { text: originalPrompt, format: 'structured' });

            // Call the API to enhance the prompt
            const response = await apiService.enhancePrompt({
                text: originalPrompt,
                format: 'structured'
            });

            console.log('API Response:', response);

            // Safely extract data from the response
            if (response && typeof response.enhancedText === 'string') {
                // Decode any HTML entities before setting the state
                let decodedText = response.enhancedText;

                // Manual replacement of common HTML entities
                decodedText = decodedText
                    .replace(/&quot;/g, '"')
                    .replace(/&#039;/g, "'")
                    .replace(/&apos;/g, "'")
                    .replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>')
                    .replace(/&amp;/g, '&');

                setEnhancedPrompt(decodedText);
            } else {
                // Handle unexpected response format
                console.error('Unexpected API response format:', response);
                setEnhancedPrompt('API returned an unexpected response format.');
                setError('Received an unexpected response from the server.');
            }
        } catch (err) {
            console.error('Error enhancing prompt:', err);
            setError('Error enhancing prompt. Please try again.');
            setEnhancedPrompt('');
        } finally {
            setIsLoading(false);
        }
    };

    // Render the enhanced prompt result
    const renderEnhancedPrompt = () => {
        if (!enhancedPrompt) {
            return (
                <div className="h-full flex items-center justify-center text-gray-400 dark:text-gray-600">
                    Enhanced prompt will appear here after clicking the "Enhance Prompt" button
                </div>
            );
        }

        // Return the enhanced prompt with manually decoded HTML entities
        return enhancedPrompt;
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-950 p-2 sm:p-4">
            <div className="w-full max-w-3xl bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden h-[90vh] sm:h-[700px] flex flex-col prompt-enhancer-card">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-800 px-4 sm:px-8 py-3 sm:py-6 relative prompt-header">
                    <div className="flex items-center justify-between">
                        <h1 className="text-xl sm:text-3xl font-bold text-white">AI Prompt Enhancer</h1>
                        <Sparkles className="text-yellow-300 h-5 w-5 sm:h-7 sm:w-7" />
                    </div>
                    <p className="text-blue-100 text-xs sm:text-base mt-1 sm:mt-2">
                        Transform basic prompts into optimized instructions for better AI responses
                    </p>
                </div>

                {/* Main Content */}
                <div className="p-3 sm:p-6 flex-1 flex flex-col overflow-hidden prompt-content">
                    {/* Original Prompt */}
                    <div className="mb-2 sm:mb-4">
                        <div className="flex items-center justify-between mb-1 sm:mb-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Original Prompt
                            </label>
                        </div>
                        <textarea
                            value={originalPrompt}
                            onChange={(e) => setOriginalPrompt(e.target.value)}
                            className="w-full h-[80px] sm:h-[100px] p-2 sm:p-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 prompt-textarea"
                            placeholder="Write a blog post about AI → Detailed, structured guidance for creating an engaging article"
                        />
                    </div>

                    {/* Enhance Button */}
                    <div className="flex justify-center mb-2 sm:mb-4">
                        <button
                            onClick={enhancePrompt}
                            disabled={isLoading}
                            className="px-4 sm:px-8 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-800 text-white font-medium rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-150 flex items-center disabled:opacity-50 disabled:cursor-not-allowed enhance-button"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Enhancing...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                                    Enhance Prompt
                                </>
                            )}
                        </button>
                    </div>

                    {error && (
                        <div className="mt-1 mb-2 flex justify-center">
                            <div className="px-3 sm:px-4 py-2 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg flex items-center text-sm">
                                <span>{error}</span>
                            </div>
                        </div>
                    )}

                    {/* Enhanced Prompt Result */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-1 sm:mb-2 gap-2 sm:gap-0">
                            <div className="flex items-center">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Enhanced Prompt
                                </label>
                            </div>
                            {enhancedPrompt && (
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={copyToClipboard}
                                        className="text-xs sm:text-sm flex items-center px-2 sm:px-3 py-1 rounded transition-colors bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                                        aria-label="Copy to clipboard"
                                    >
                                        {copied ? (
                                            <>
                                                <Check className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                                Copied!
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                                Copy
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={tryWithClaude}
                                        className="text-xs sm:text-sm flex items-center px-2 sm:px-3 py-1 rounded transition-colors bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700"
                                    >
                                        <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                        Try with Claude
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="flex-1 p-2 sm:p-4 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg whitespace-pre-wrap overflow-y-auto text-gray-800 dark:text-gray-200 result-area text-sm sm:text-base">
                            {renderEnhancedPrompt()}
                        </div>
                    </div>
                </div>

                {/* Footer with Typewriter Effect */}
                <div className="bg-gray-50 dark:bg-gray-800 px-3 sm:px-6 py-2 sm:py-3 border-t border-gray-200 dark:border-gray-700">
                    <TypewriterText />
                </div>
            </div>
        </div>
    );
};

export default PromptEnhancerApp;