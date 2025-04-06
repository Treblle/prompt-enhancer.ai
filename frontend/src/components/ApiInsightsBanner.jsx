import React, { useState, useRef } from 'react';
import { ExternalLink } from 'lucide-react';
import ApiInsightsTooltip from './ApiInsightsTooltip';

const ApiInsightsBanner = () => {
    const [showTooltip, setShowTooltip] = useState(false);
    const timeoutRef = useRef(null);
    const containerRef = useRef(null);

    // Longer delay before hiding the tooltip (1 second instead of 300ms)
    const HOVER_DELAY = 1000;

    const handleMouseEnter = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setShowTooltip(true);
    };

    const handleMouseLeave = (e) => {
        // Check if we're leaving the entire container (banner + tooltip)
        // or just moving between banner and tooltip
        if (containerRef.current && !containerRef.current.contains(e.relatedTarget)) {
            timeoutRef.current = setTimeout(() => {
                setShowTooltip(false);
            }, HOVER_DELAY);
        }
    };

    return (
        <div
            ref={containerRef}
            className="hover-card relative inline-block"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div className="hover-card__top rounded-full bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-700 overflow-hidden">
                <a
                    href="https://apiinsights.io/reports/f0761065-71b2-4f1a-8313-e287c9623dc3"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-bold text-gray-800 dark:text-gray-200 hover:text-gray-900 dark:hover:text-gray-100 transition-colors whitespace-nowrap px-3 py-1.5"
                >
                    <div className="flex items-center">
                        <img
                            src="/api-insights.svg"
                            alt="API Insights"
                            className="w-6 mr-1"
                        />
                        <span className="text-blue-800 dark:text-blue-400 font-bold">insights.io</span>
                    </div>
                    <span className="text-blue-800 dark:text-blue-300 text-[10px] font-bold">
                        Check API Governance Report
                    </span>
                    <ExternalLink className="h-3 w-3 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                </a>
            </div>

            {/* Animated Border Effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 via-blue-300 to-blue-600 bg-[length:200%_100%] animate-[gradient_3s_ease-in-out_infinite] -z-10"></div>

            {/* Tooltip/Expanded Content */}
            <ApiInsightsTooltip
                visible={showTooltip}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            />
        </div>
    );
};

export default ApiInsightsBanner;