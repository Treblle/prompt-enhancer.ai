import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Copy, Check } from 'lucide-react';

import apiService from '../services/apiService';

const TypewriterText = () => {
    const [textIndex, setTextIndex] = useState(0);
    const [charIndex, setCharIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const [displayText, setDisplayText] = useState('');

    const texts = [
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
    ];

    // Function to get a random text different from the current one
    const getRandomText = () => {
        if (texts.length <= 1) return 0;

        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * texts.length);
        } while (newIndex === textIndex);

        return newIndex;
    };

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
    }, [charIndex, isDeleting, textIndex, texts]);

    return (
        <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2 h-5 italic">
            {displayText}<span className="animate-pulse">|</span>
        </p>
    );
};

const PromptEnhancerApp = () => {
    const [originalPrompt, setOriginalPrompt] = useState('');
    const [enhancedPrompt, setEnhancedPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState('');

    // Copy enhanced prompt to clipboard
    const copyToClipboard = () => {
        navigator.clipboard.writeText(enhancedPrompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
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
                setEnhancedPrompt(response.enhancedText);
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

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-950 p-4">
            <div className="w-full max-w-3xl bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden h-[700px] flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-800 px-8 py-6 relative">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold text-white">AI Prompt Enhancer</h1>
                        <Sparkles className="text-yellow-300 h-7 w-7" />
                    </div>
                    <p className="text-blue-100 mt-2">
                        Transform basic prompts into optimized instructions for better AI responses
                    </p>
                </div>

                {/* Main Content */}
                <div className="p-6 flex-1 flex flex-col overflow-hidden">
                    {/* Original Prompt */}
                    <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Original Prompt
                            </label>
                        </div>
                        <textarea
                            value={originalPrompt}
                            onChange={(e) => setOriginalPrompt(e.target.value)}
                            className="w-full h-[100px] p-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                            placeholder="Write your basic prompt here..."
                        />
                    </div>

                    {/* Enhance Button */}
                    <div className="flex justify-center mb-4">
                        <button
                            onClick={enhancePrompt}
                            disabled={isLoading}
                            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-800 text-white font-medium rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-150 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Enhancing...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="mr-2 h-5 w-5" />
                                    Enhance Prompt
                                </>
                            )}
                        </button>
                    </div>

                    {error && (
                        <div className="mt-2 mb-4 flex justify-center">
                            <div className="px-4 py-2 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg flex items-center">
                                <span className="text-sm">{error}</span>
                            </div>
                        </div>
                    )}

                    {/* Enhanced Prompt Result - Always visible */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Enhanced Prompt
                                </label>
                            </div>
                            {enhancedPrompt && (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={copyToClipboard}
                                        className={`text-sm flex items-center px-3 py-1 rounded transition-colors ${copied
                                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                            }`}
                                    >
                                        {copied ? (
                                            <>
                                                <Check className="h-4 w-4 mr-1" />
                                                Copied
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="h-4 w-4 mr-1" />
                                                Copy
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="flex-1 p-4 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg whitespace-pre-wrap overflow-y-auto text-gray-800 dark:text-gray-200">
                            {enhancedPrompt ? enhancedPrompt : (
                                <div className="h-full flex items-center justify-center text-gray-400 dark:text-gray-600">
                                    Enhanced prompt will appear here after clicking the "Enhance Prompt" button
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer with Typewriter Effect */}
                <div className="bg-gray-50 dark:bg-gray-800 px-6 py-3 border-t border-gray-200 dark:border-gray-700">
                    <TypewriterText />
                </div>
            </div>
        </div>
    );
};

export default PromptEnhancerApp;