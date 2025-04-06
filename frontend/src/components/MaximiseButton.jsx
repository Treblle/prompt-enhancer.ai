import React from 'react';
import { Maximize2 } from 'lucide-react';

/**
 * Enhanced Maximize Button with animations
 */
const MaximizeButton = ({ onClick, size = 'sm', label = 'Maximize', className = '' }) => {
    const sizeClasses = {
        sm: 'h-3 w-3',
        md: 'h-4 w-4',
        lg: 'h-5 w-5'
    };

    return (
        <button
            onClick={onClick}
            className={`maximize-btn p-1 rounded-md transition-all duration-300 bg-gray-200 dark:bg-gray-700 
                text-gray-700 dark:text-gray-300 hover:bg-indigo-500 hover:text-white 
                hover:shadow-md active:shadow-inner group ${className}`}
            aria-label={label}
            title={label}
        >
            <Maximize2
                className={`${sizeClasses[size]} transform transition-transform duration-300 group-hover:rotate-90`}
            />
        </button>
    );
};

export default MaximizeButton;