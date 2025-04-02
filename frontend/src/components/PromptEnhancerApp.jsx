import React, { useState } from 'react';
import { Sparkles, ExternalLink, Copy, Check, Maximize2 } from 'lucide-react';

import apiService from '../services/apiService';
import Modal from './Modal';
import TypewriterText from './TypewriterText';

const PromptEnhancerApp = () => {
    const [originalPrompt, setOriginalPrompt] = useState('');
    const [enhancedPrompt, setEnhancedPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    // Modal states
    const [inputModalOpen, setInputModalOpen] = useState(false);
    const [resultModalOpen, setResultModalOpen] = useState(false);

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

    // Open Claude in new window
    const openClaude = () => {
        try {
            window.open('https://claude.ai', '_blank');
        } catch (err) {
            console.error('Error opening Claude:', err);
        }
    };

    // Open ChatGPT in new window
    const openChatGPT = () => {
        try {
            window.open('https://chat.openai.com', '_blank');
        } catch (err) {
            console.error('Error opening ChatGPT:', err);
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
                let decodedText = response.enhancedText
                    .replace(/&quot;/g, '"')
                    .replace(/&#039;/g, "'")
                    .replace(/&apos;/g, "'")
                    .replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>')
                    .replace(/&amp;/g, '&');

                setEnhancedPrompt(decodedText);

            } else {
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
                <div className="h-full w-full flex items-center justify-center text-gray-400 dark:text-gray-600">
                    <p className="text-center px-4">
                        Enhanced prompt will appear here after clicking the "Enhance Prompt" button
                    </p>
                </div>
            );
        }

        return enhancedPrompt;
    };

    return (
        <div className="flex justify-center items-start bg-white dark:bg-gray-950 p-2 pt-4">
            <div className="w-full max-w-4xl bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-800 px-4 sm:px-6 py-2 sm:py-3 relative">
                    <div className="flex items-center justify-between">
                        <h1 className="text-xl sm:text-2xl font-bold text-white">AI Prompt Enhancer</h1>
                        <Sparkles className="text-yellow-300 h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <h2 className="text-blue-100 text-xs sm:text-sm mt-1">
                        Transform basic prompts into optimized instructions for better AI responses
                    </h2>
                </div>

                {/* Main Content */}
                <div className="p-2 sm:p-4 flex flex-col">
                    {/* Original Prompt */}
                    <div className="mb-2">
                        <div className="flex items-center justify-between mb-1">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Original Prompt
                            </label>
                            <button
                                onClick={() => setInputModalOpen(true)}
                                className="p-1 rounded-md transition-colors bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                                aria-label="Maximize input"
                                title="Maximize"
                            >
                                <Maximize2 className="h-3 w-3 sm:h-4 sm:w-4" />
                            </button>
                        </div>
                        <textarea
                            value={originalPrompt}
                            onChange={(e) => setOriginalPrompt(e.target.value)}
                            className="w-full h-[70px] sm:h-[80px] p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-1 focus:ring-gray-500 dark:focus:ring-gray-600 focus:border-gray-500 dark:focus:border-gray-600 resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
                            placeholder="Write a blog post about AI → Detailed, structured guidance for creating an engaging article"
                        />
                    </div>

                    {/* Enhance Button */}
                    <div className="flex justify-center mb-2">
                        <button
                            onClick={enhancePrompt}
                            disabled={isLoading}
                            className="px-3 sm:px-4 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-800 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-150 flex items-center disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Enhancing...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="mr-1.5 h-3 w-3 sm:h-4 sm:w-4" />
                                    Enhance Prompt
                                </>
                            )}
                        </button>
                    </div>

                    {error && (
                        <div className="mb-2 flex justify-center">
                            <div className="px-2 py-1 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg flex items-center text-xs">
                                <span>{error}</span>
                            </div>
                        </div>
                    )}

                    {/* Enhanced Prompt Result - Always shown, even when empty */}
                    <div className="flex flex-col mt-1">
                        {/* Enhanced Prompt Label + Action Buttons */}
                        <div className="flex flex-row justify-between items-center mb-1">
                            <div className="flex items-center">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Enhanced Prompt
                                </label>
                            </div>
                            <div className="flex items-center space-x-1 sm:space-x-2">
                                {/* Only show buttons if enhancedPrompt exists */}
                                {enhancedPrompt && (
                                    <>
                                        <button
                                            onClick={() => setResultModalOpen(true)}
                                            className="text-xs flex items-center px-1.5 py-0.5 rounded transition-colors bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                                            aria-label="Maximize result"
                                            title="Maximize"
                                        >
                                            <Maximize2 className="h-3 w-3" />
                                        </button>
                                        <button
                                            onClick={copyToClipboard}
                                            className="text-xs flex items-center px-1.5 py-0.5 rounded transition-colors bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                                            aria-label="Copy to clipboard"
                                            title="Copy to clipboard"
                                        >
                                            {copied ? (
                                                <>
                                                    <Check className="h-3 w-3 mr-1" />
                                                    <span>Copied</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="h-3 w-3 mr-1" />
                                                    <span>Copy</span>
                                                </>
                                            )}
                                        </button>
                                        <button
                                            onClick={openClaude}
                                            className="text-xs flex items-center px-1.5 py-0.5 rounded transition-colors bg-gradient-to-r from-blue-600 to-indigo-800 text-white hover:from-blue-700 hover:to-indigo-900"
                                            aria-label="Open in Claude"
                                            title="Open in Claude"
                                        >
                                            <ExternalLink className="h-3 w-3 mr-1" />
                                            <span>Claude</span>
                                        </button>
                                        <button
                                            onClick={openChatGPT}
                                            className="text-xs flex items-center px-1.5 py-0.5 rounded transition-colors bg-gradient-to-r from-blue-600 to-indigo-800 text-white hover:from-blue-700 hover:to-indigo-900"
                                            aria-label="Open in ChatGPT"
                                            title="Open in ChatGPT"
                                        >
                                            <ExternalLink className="h-3 w-3 mr-1" />
                                            <span>ChatGPT</span>
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Result area with full corners and borders */}
                        <div className="h-[250px] p-2 mb-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg whitespace-pre-wrap overflow-y-auto text-gray-800 dark:text-gray-200 text-sm shadow-sm">
                            {renderEnhancedPrompt()}
                        </div>
                    </div>

                    {/* Typewriter Footer */}
                    <div className="mt-1 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <div className="typewriter-wrapper">
                            <TypewriterText />
                        </div>
                    </div>
                </div>
            </div>

            {/* Treblle footer */}
            <div className="w-full fixed bottom-3 flex justify-center z-10">
                <div className="bg-white dark:bg-gray-900 px-4 sm:px-6 py-2 sm:py-3 rounded-lg shadow-md inline-flex items-center border border-neutral-200 dark:border-neutral-700 max-w-[95%] sm:max-w-none">
                    {/* Light mode */}
                    <div className="flex items-center">
                        <span className="text-black dark:text-gray-200 text-xs sm:text-sm font-bold">Powered by</span>
                        <a
                            href="https://treblle.com/?utm_source=referral&utm_medium=banner&utm_campaign=prompt_enhancer"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center ml-2 mr-4 dark:ml-1 dark:mr-3"
                        >
                            <div className="flex items-center transition-transform duration-300 hover:scale-110 origin-center">
                                <img
                                    src="https://cdn.prod.website-files.com/6446b3c46dac08ff137e3b2b/67614962f09f4a49c0496c8c_logo-color.png"
                                    alt="Treblle"
                                    className="h-5 sm:h-6 dark:hidden"
                                />
                                <svg id="Layer_1" className="h-5 sm:h-6 hidden dark:block" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1735 500" width="100" fill="#fff"><g id="Treblle_Logo_-_Color" data-name="Treblle Logo - Color"><g id="Typo"><path className="cls-1" d="M751.02,313.35v54.06h-32.43c-23.11,0-41.14-5.65-54.06-16.96-12.93-11.31-19.39-29.76-19.39-55.36v-82.76h-25.35v-52.94h25.35v-14.55l63.75-48.25v62.8h41.75v52.94h-41.75v83.51c0,6.22,1.49,10.69,4.47,13.42,2.98,2.74,7.95,4.1,14.91,4.1h22.74Z"></path><path className="cls-1" d="M861.79,167.02c11.18-6.58,23.61-9.88,37.28-9.88v67.48h-17.52c-15.91,0-27.84,3.42-35.79,10.25-7.96,6.84-11.93,18.82-11.93,35.97v96.56h-63.75v-208.02h63.75v34.67c7.45-11.43,16.77-20.44,27.96-27.03Z"></path><path className="cls-1" d="M1108.29,278.67h-144.27c.99,12.93,5.15,22.81,12.49,29.64,7.33,6.84,16.34,10.25,27.03,10.25,15.9,0,26.96-6.71,33.18-20.13h67.85c-3.48,13.67-9.76,25.97-18.82,36.91-9.08,10.94-20.45,19.51-34.11,25.72-13.67,6.22-28.96,9.32-45.85,9.32-20.38,0-38.53-4.35-54.43-13.05-15.91-8.7-28.33-21.12-37.28-37.28-8.95-16.15-13.42-35.04-13.42-56.66s4.41-40.51,13.23-56.67c8.82-16.15,21.19-28.58,37.1-37.28,15.9-8.7,34.17-13.05,54.8-13.05s38.02,4.23,53.68,12.67c15.66,8.45,27.9,20.51,36.72,36.16,8.82,15.66,13.23,33.92,13.23,54.8,0,5.96-.37,12.18-1.12,18.64ZM1044.17,243.26c0-10.93-3.73-19.63-11.18-26.1-7.46-6.46-16.78-9.69-27.96-9.69s-19.7,3.11-27.03,9.32c-7.33,6.22-11.87,15.04-13.61,26.47h79.78Z"></path><path className="cls-1" d="M1214.4,165.34c11.18-5.97,23.98-8.95,38.4-8.95,17.15,0,32.68,4.35,46.6,13.05,13.91,8.7,24.91,21.13,32.99,37.28,8.07,16.16,12.12,34.92,12.12,56.29s-4.04,40.2-12.12,56.48c-8.08,16.28-19.08,28.84-32.99,37.65-13.92,8.82-29.45,13.23-46.6,13.23-14.67,0-27.46-2.92-38.4-8.76-10.94-5.84-19.51-13.61-25.72-23.3v29.08h-63.75V103.42h63.75v85.41c5.96-9.69,14.54-17.52,25.72-23.49ZM1266.41,225.55c-8.82-9.07-19.7-13.61-32.62-13.61s-23.43,4.6-32.25,13.79c-8.83,9.2-13.23,21.75-13.23,37.65s4.41,28.46,13.23,37.65c8.82,9.2,19.57,13.79,32.25,13.79s23.49-4.66,32.43-13.98c8.95-9.32,13.42-21.93,13.42-37.84s-4.42-28.39-13.23-37.47Z"></path><path className="cls-1" d="M1423.8,103.42v263.98h-63.75V103.42h63.75Z"></path><path className="cls-1" d="M1510.7,103.42v263.98h-63.75V103.42h63.75Z"></path><path className="cls-1" d="M1733.88,278.67h-144.27c.99,12.93,5.15,22.81,12.49,29.64,7.33,6.84,16.34,10.25,27.03,10.25,15.9,0,26.96-6.71,33.18-20.13h67.85c-3.48,13.67-9.76,25.97-18.82,36.91-9.08,10.94-20.45,19.51-34.11,25.72-13.67,6.22-28.96,9.32-45.85,9.32-20.38,0-38.53-4.35-54.43-13.05-15.91-8.7-28.33-21.12-37.28-37.28-8.95-16.15-13.42-35.04-13.42-56.66s4.41-40.51,13.23-56.67c8.82-16.15,21.19-28.58,37.1-37.28,15.9-8.7,34.17-13.05,54.8-13.05s38.02,4.23,53.68,12.67c15.66,8.45,27.9,20.51,36.72,36.16,8.82,15.66,13.23,33.92,13.23,54.8,0,5.96-.37,12.18-1.12,18.64ZM1669.76,243.26c0-10.93-3.73-19.63-11.18-26.1-7.46-6.46-16.78-9.69-27.96-9.69s-19.7,3.11-27.03,9.32c-7.33,6.22-11.87,15.04-13.61,26.47h79.78Z"></path></g><g id="Icon"><path className="cls-1" d="M0,0v252.23c0,136.91,111.7,247.77,249.82,247.77s250.18-110.98,250.18-247.89V0H0ZM380.2,186.84h-71.05v197.23h-108.2v-197.23h-108.2l108.2-90.47v90.47l108.2-90.47h71.05v90.47Z"></path></g></g></svg>
                            </div>
                        </a>
                    </div>
                    <div className="h-4 sm:h-5 w-px bg-neutral-300 dark:bg-neutral-700 mx-4 dark:mx-3"></div>
                    <span className="text-black dark:text-gray-200 text-xs sm:text-sm font-bold">
                        Vibe Coded by{' '}
                        <a
                            href="https://www.linkedin.com/in/rahulkhinchi03/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline transition-transform hover:scale-110 inline-block ml-1 text-indigo-800 dark:text-indigo-300"
                        >
                            Rahul Khinchi
                        </a>
                    </span>
                </div>
            </div>

            {/* Modal for Original Prompt */}
            <Modal
                isOpen={inputModalOpen}
                onClose={() => setInputModalOpen(false)}
                title="Edit Original Prompt"
            >
                <div className="flex flex-col h-full">
                    <textarea
                        value={originalPrompt}
                        onChange={(e) => setOriginalPrompt(e.target.value)}
                        className="w-full h-96 p-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-1 focus:ring-gray-500 dark:focus:ring-gray-600 focus:border-gray-500 dark:focus:border-gray-600 resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        placeholder="Write a blog post about AI → Detailed, structured guidance for creating an engaging article"
                    />
                    <div className="mt-4 flex justify-end">
                        <button
                            onClick={() => setInputModalOpen(false)}
                            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-800 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-150"
                        >
                            Apply Changes
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Modal for Enhanced Prompt */}
            <Modal
                isOpen={resultModalOpen}
                onClose={() => setResultModalOpen(false)}
                title="Enhanced Prompt"
            >
                <div className="flex flex-col h-full">
                    <div className="flex justify-end mb-2 space-x-2">
                        {enhancedPrompt && (
                            <>
                                <button
                                    onClick={copyToClipboard}
                                    className="text-sm flex items-center px-3 py-1.5 rounded transition-colors bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                                    title="Copy to clipboard"
                                >
                                    {copied ? (
                                        <>
                                            <Check className="h-4 w-4 mr-1.5" />
                                            <span>Copied</span>
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="h-4 w-4 mr-1.5" />
                                            <span>Copy</span>
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={openClaude}
                                    className="text-sm flex items-center px-3 py-1.5 rounded transition-colors bg-gradient-to-r from-blue-600 to-indigo-800 text-white hover:from-blue-700 hover:to-indigo-900"
                                    title="Open in Claude"
                                >
                                    <ExternalLink className="h-4 w-4 mr-1.5" />
                                    <span>Claude</span>
                                </button>
                                <button
                                    onClick={openChatGPT}
                                    className="text-sm flex items-center px-3 py-1.5 rounded transition-colors bg-gradient-to-r from-blue-600 to-indigo-800 text-white hover:from-blue-700 hover:to-indigo-900"
                                    title="Open in ChatGPT"
                                >
                                    <ExternalLink className="h-4 w-4 mr-1.5" />
                                    <span>ChatGPT</span>
                                </button>
                            </>
                        )}
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-4 whitespace-pre-wrap overflow-y-auto flex-1 min-h-[400px] text-gray-800 dark:text-gray-200">
                        {enhancedPrompt || "No enhanced prompt available yet."}
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default PromptEnhancerApp;
