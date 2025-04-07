const { v4: uuidv4 } = require('uuid');
const promptEnhancerService = require('../services/promptEnhancerService');
const { validateRequired, validateMaxLength } = require('../utils/validation');

// In-memory storage for prompts (replace with database in production)
const promptsStorage = [];

/**
 * Validate incoming prompt request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {boolean} - Whether validation passed
 */
function validatePromptRequest(req, res) {
    const { text, format = 'structured' } = req.body;

    // Check if text is provided
    const textError = validateRequired(text, 'text');
    if (textError) {
        res.status(400).json({
            error: {
                code: 'validation_error',
                message: textError
            }
        });
        return false;
    }

    // Validate max length
    const MAX_TEXT_LENGTH = process.env.NODE_ENV === 'production' ? 5000 : 8000;
    const lengthError = validateMaxLength(text, MAX_TEXT_LENGTH, 'text');
    if (lengthError) {
        res.status(413).json({
            error: {
                code: 'payload_too_large',
                message: lengthError
            }
        });
        return false;
    }

    // Additional validation for format
    const allowedFormats = ['structured', 'concise', 'detailed', 'creative'];
    if (format && !allowedFormats.includes(format)) {
        res.status(400).json({
            error: {
                code: 'invalid_format',
                message: `Invalid format. Allowed formats are: ${allowedFormats.join(', ')}`
            }
        });
        return false;
    }

    return true;
}

/**
 * Log request details for debugging
 * @param {Object} req - Express request object
 */
function logRequestDetails(req) {
    console.log('Prompt Enhancement Request Details:', {
        timestamp: new Date().toISOString(),
        body: {
            // Mask the actual text to prevent logging sensitive information
            textLength: req.body.text ? req.body.text.length : 0,
            format: req.body.format
        },
        user: req.user ? {
            id: req.user.id,
            email: req.user.email
        } : 'Unauthenticated',
        ip: req.ip,
        headers: {
            userAgent: req.get('User-Agent'),
            contentType: req.get('Content-Type')
        }
    });
}

exports.enhancePrompt = async (req, res, next) => {
    try {
        // Log request details
        logRequestDetails(req);

        // Validate the request
        if (!validatePromptRequest(req, res)) {
            return;
        }

        const { text, format = 'structured' } = req.body;

        try {
            // Start timing the enhancement process
            const startTime = Date.now();
            console.log(`Starting prompt enhancement for text: ${text.substring(0, 50)}...`);

            // Set a longer timeout for the response
            res.setTimeout(120000, () => {
                console.error('Request timed out at controller level after 120 seconds');
                if (!res.headersSent) {
                    res.status(408).json({
                        error: {
                            code: 'request_timeout',
                            message: 'Request timed out. Your prompt might be too complex or the system is experiencing high load.',
                            details: 'Try with a shorter or simpler prompt'
                        }
                    });
                }
            });

            // Enhance the prompt with improved error handling
            const enhancedText = await promptEnhancerService.enhancePrompt({
                originalPrompt: text,
                format
            });

            // Calculate enhancement duration
            const duration = Date.now() - startTime;

            // Check if we got a fallback response (usually much shorter or has telltale phrases)
            const isFallbackResponse =
                (enhancedText.length < 200 && text.length > 50) ||
                enhancedText.includes('I need you to create') ||
                (enhancedText.split('\n').length < 5 && text.length > 100);

            // If it looks like a fallback when we shouldn't need one, try again with longer timeout
            if (isFallbackResponse && text.length < 500 && duration < 30000) {
                console.log('Detected potential fallback response, retrying with longer timeout...');

                // Try one more time with longer timeout
                const retryStartTime = Date.now();
                const retryEnhancedText = await promptEnhancerService.enhancePrompt({
                    originalPrompt: text,
                    format,
                    retryAttempt: true // Signal this is a retry
                });

                // Use retry result if it's better (longer and not a fallback pattern)
                if (retryEnhancedText.length > enhancedText.length * 1.5 &&
                    !retryEnhancedText.includes('I need you to create')) {

                    const retryDuration = Date.now() - retryStartTime;
                    console.log(`Retry successful in ${retryDuration}ms. Got better response.`);

                    // Create prompt object with retry result
                    const promptObject = createPromptObject(req, text, retryEnhancedText, format, retryDuration);
                    return res.status(200).json(promptObject);
                }
            }

            // Create prompt object
            const promptObject = createPromptObject(req, text, enhancedText, format, duration);

            // Log successful enhancement
            console.log('Prompt Enhancement Successful:', {
                promptId: promptObject.id,
                duration: duration,
                inputLength: text.length,
                outputLength: enhancedText.length,
                isFallback: isFallbackResponse
            });

            // Return the enhanced prompt
            return res.status(200).json(promptObject);

        } catch (serviceError) {
            // If this is a timeout error, handle gracefully
            if (serviceError.message.includes('timeout') || serviceError.message.includes('aborted')) {
                console.warn('Prompt enhancement timed out, providing descriptive error to client');
                return res.status(504).json({
                    error: {
                        code: 'enhancement_timeout',
                        message: 'The server took too long to enhance your prompt',
                        details: 'Try with a shorter or less complex prompt'
                    }
                });
            }

            // For other service errors, return a structured error response
            console.error('Prompt Enhancement Service Error:', serviceError);
            return res.status(500).json({
                error: {
                    code: 'enhancement_failed',
                    message: 'Failed to enhance prompt',
                    details: serviceError.message
                }
            });
        }
    } catch (error) {
        // Catch any unexpected errors
        console.error('Unexpected Error in Prompt Enhancement:', error);
        next(error);
    }
};

function createPromptObject(req, originalText, enhancedText, format, duration) {
    return {
        id: `prompt_${uuidv4()}`,
        originalText,
        enhancedText,
        format,
        metadata: {
            createdAt: new Date().toISOString(),
            userId: req.user?.id,
            enhancementDuration: duration,
            inputLength: originalText.length,
            outputLength: enhancedText.length
        }
    };
}

/**
 * List enhanced prompts
 * @route GET /v1/prompts
 * @access Private (requires authentication)
 */
exports.listPrompts = (req, res, next) => {
    try {
        // Parse pagination parameters
        const limit = Math.min(parseInt(req.query.limit) || 10, 100);
        const offset = parseInt(req.query.offset) || 0;

        // Filter prompts for the authenticated user if applicable
        const userPrompts = req.user
            ? promptsStorage.filter(p => p.metadata?.userId === req.user.id)
            : promptsStorage;

        // Paginate prompts
        const prompts = userPrompts.slice(offset, offset + limit);
        const total = userPrompts.length;

        // Log listing action
        console.log('Prompt Listing:', {
            timestamp: new Date().toISOString(),
            user: req.user?.id || 'unauthenticated',
            totalPrompts: total,
            requestedLimit: limit,
            requestedOffset: offset
        });

        res.status(200).json({
            prompts,
            total,
            limit,
            offset
        });
    } catch (error) {
        console.error('Error listing prompts:', {
            message: error.message,
            stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
        });
        next(error);
    }
};

/**
 * Get a specific prompt
 * @route GET /v1/prompts/:id
 * @access Private (requires authentication)
 */
exports.getPrompt = (req, res, next) => {
    try {
        const { id } = req.params;

        // Find the prompt, ensuring user can only access their own prompts
        const prompt = promptsStorage.find(p =>
            p.id === id &&
            (!req.user || p.metadata?.userId === req.user.id)
        );

        if (!prompt) {
            return res.status(404).json({
                error: {
                    code: 'prompt_not_found',
                    message: `No prompt found with ID: ${id}`
                }
            });
        }

        // Log prompt retrieval
        console.log('Prompt Retrieved:', {
            promptId: id,
            userId: req.user?.id || 'unauthenticated'
        });

        res.status(200).json(prompt);
    } catch (error) {
        console.error('Error retrieving prompt:', {
            message: error.message,
            stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
        });
        next(error);
    }
};

/**
 * Update a prompt
 * @route PUT /v1/prompts/:id
 * @access Private (requires authentication)
 */
exports.updatePrompt = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { text, format } = req.body;

        // Find the prompt index, ensuring user can only update their own prompts
        const promptIndex = promptsStorage.findIndex(p =>
            p.id === id &&
            (!req.user || p.metadata?.userId === req.user.id)
        );

        if (promptIndex === -1) {
            return res.status(404).json({
                error: {
                    code: 'prompt_not_found',
                    message: `No prompt found with ID: ${id}`
                }
            });
        }

        // Validate the update request
        if (!text && !format) {
            return res.status(400).json({
                error: {
                    code: 'no_update_data',
                    message: 'No update data provided'
                }
            });
        }

        // Validate max length if text is provided
        if (text) {
            const MAX_TEXT_LENGTH = 8000;
            if (text.length > MAX_TEXT_LENGTH) {
                return res.status(413).json({
                    error: {
                        code: 'payload_too_large',
                        message: `The 'text' field must not exceed ${MAX_TEXT_LENGTH} characters`
                    }
                });
            }
        }

        // Start timing the enhancement process
        const startTime = Date.now();

        // Enhance the updated prompt
        const enhancedText = await promptEnhancerService.enhancePrompt({
            originalPrompt: text || promptsStorage[promptIndex].originalText,
            format: format || promptsStorage[promptIndex].format
        });

        // Calculate enhancement duration
        const duration = Date.now() - startTime;

        // Update the prompt
        const updatedPrompt = {
            ...promptsStorage[promptIndex],
            originalText: text || promptsStorage[promptIndex].originalText,
            enhancedText,
            format: format || promptsStorage[promptIndex].format,
            metadata: {
                ...promptsStorage[promptIndex].metadata,
                updatedAt: new Date().toISOString(),
                enhancementDuration: duration,
                inputLength: (text || promptsStorage[promptIndex].originalText).length,
                outputLength: enhancedText.length
            }
        };

        promptsStorage[promptIndex] = updatedPrompt;

        // Log prompt update
        console.log('Prompt Updated:', {
            promptId: id,
            userId: req.user?.id,
            duration: duration
        });

        res.status(200).json(updatedPrompt);
    } catch (error) {
        console.error('Error updating prompt:', {
            message: error.message,
            stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
        });
        next(error);
    }
};

/**
 * Delete a prompt
 * @route DELETE /v1/prompts/:id
 * @access Private (requires authentication)
 */
exports.deletePrompt = (req, res, next) => {
    try {
        const { id } = req.params;

        // Find the prompt index, ensuring user can only delete their own prompts
        const promptIndex = promptsStorage.findIndex(p =>
            p.id === id &&
            (!req.user || p.metadata?.userId === req.user.id)
        );

        if (promptIndex === -1) {
            return res.status(404).json({
                error: {
                    code: 'prompt_not_found',
                    message: `No prompt found with ID: ${id}`
                }
            });
        }

        // Remove the prompt
        const deletedPrompt = promptsStorage.splice(promptIndex, 1)[0];

        // Log prompt deletion
        console.log('Prompt Deleted:', {
            promptId: id,
            userId: req.user?.id
        });

        // Return no content
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting prompt:', {
            message: error.message,
            stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
        });
        next(error);
    }
};