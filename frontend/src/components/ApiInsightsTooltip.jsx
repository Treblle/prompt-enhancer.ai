import React from 'react';
import { Award, ShieldCheck, Zap, CheckCircle, ExternalLink } from 'lucide-react';

const ApiInsightsTooltip = ({ visible, onMouseEnter, onMouseLeave }) => {
    if (!visible) return null;

    return (
        <div
            className="hover-card__bottom absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 w-60 sm:w-72 transition-all duration-500 overflow-hidden"
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            <div className="p-3">
                <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                        <img
                            src="/api-insights.svg"
                            alt="API Insights"
                            className="h-5 w-5 mr-1"
                        />
                        <h3 className="text-sm font-bold text-blue-800 dark:text-blue-400">
                            insights.io
                        </h3>
                    </div>
                    <Award className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-md mb-2 flex justify-between items-center">
                    <span className="text-blue-800 dark:text-blue-300 font-bold text-sm">API Score:</span>
                    <span className="bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-md px-2 py-0.5 text-sm font-bold">
                        84/100
                    </span>
                </div>

                <div className="space-y-1.5 text-xs">
                    <div className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-500 dark:text-green-400" />
                        <span className="text-gray-800 dark:text-gray-200">AI Ready</span>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Award className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                            <span className="text-gray-800 dark:text-gray-200">Design:</span>
                        </div>
                        <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-md px-1.5 py-0.5 text-xs font-bold">
                            B - 86
                        </span>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Zap className="h-3 w-3 text-yellow-600 dark:text-yellow-400" />
                            <span className="text-gray-800 dark:text-gray-200">Performance:</span>
                        </div>
                        <span className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-md px-1.5 py-0.5 text-xs font-bold">
                            D - 68
                        </span>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                            <span className="text-gray-800 dark:text-gray-200">Security:</span>
                        </div>
                        <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-md px-1.5 py-0.5 text-xs font-bold">
                            B - 84
                        </span>
                    </div>
                </div>

                <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <a
                        href="https://apiinsights.io/reports/f0761065-71b2-4f1a-8313-e287c9623dc3"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block w-full text-center bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white py-2 px-4 rounded-md text-xs font-medium transition-colors"
                    >
                        View the full API Governance Report <ExternalLink className="h-3 w-3 text-white inline ml-1" />
                    </a>
                </div>
            </div>
        </div>
    );
};

export default ApiInsightsTooltip;