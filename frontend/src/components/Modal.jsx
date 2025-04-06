import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

/**
 * A reusable modal component with enhanced animations and fixed scrolling
 */
const Modal = ({ isOpen, onClose, title, children, className = '' }) => {
    const modalRef = useRef(null);
    const contentRef = useRef(null);
    const [animationState, setAnimationState] = useState('closed');

    // Handle opening and closing animations
    useEffect(() => {
        if (isOpen) {
            setAnimationState('opening');
            setTimeout(() => setAnimationState('open'), 50);
        } else {
            setAnimationState('closing');
            setTimeout(() => setAnimationState('closed'), 300);
        }
    }, [isOpen]);

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

    // Ensure proper overflow when modal opens
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (animationState === 'closed' && !isOpen) return null;

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center transition-colors duration-300 ${animationState === 'opening' || animationState === 'open'
                    ? 'bg-black bg-opacity-50 backdrop-blur-sm'
                    : 'bg-black bg-opacity-0'
                }`}
        >
            <div
                ref={modalRef}
                style={{ maxHeight: '90vh' }}
                className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl w-11/12 max-w-6xl overflow-hidden flex flex-col transform transition-all duration-300 ${animationState === 'opening'
                        ? 'scale-95 opacity-0'
                        : animationState === 'open'
                            ? 'scale-100 opacity-100'
                            : 'scale-95 opacity-0'
                    } ${className}`}
            >
                {/* Modal header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{title}</h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors group"
                        aria-label="Close"
                    >
                        <X className="h-6 w-6 text-gray-500 dark:text-gray-400 group-hover:rotate-90 transition-transform duration-300" />
                    </button>
                </div>

                {/* Modal content with optimized scrolling */}
                <div
                    ref={contentRef}
                    className="flex-1 overflow-y-auto p-4 will-change-scroll overscroll-contain"
                >
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;