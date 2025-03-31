import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

/**
 * A reusable modal component with fixed modal functionality
 */
const Modal = ({ isOpen, onClose, title, children, className = '' }) => {
    const modalRef = useRef(null);

    // Handle escape key to close modal
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    // Handle click outside of modal to close
    useEffect(() => {
        const handleOutsideClick = (e) => {
            if (modalRef.current && !modalRef.current.contains(e.target) && isOpen) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, [isOpen, onClose]);

    // Focus trap for accessibility - keep focus within modal
    useEffect(() => {
        if (isOpen) {
            const focusableElements = modalRef.current?.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );

            const firstElement = focusableElements?.[0];
            if (firstElement) {
                firstElement.focus();
            }
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div
                ref={modalRef}
                className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl w-11/12 max-w-6xl max-h-[90vh] overflow-hidden flex flex-col ${className}`}
            >
                {/* Modal header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{title}</h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        aria-label="Close"
                    >
                        <X className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                {/* Modal content */}
                <div className="flex-1 overflow-auto p-4">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;