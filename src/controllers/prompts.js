const { v4: uuidv4 } = require('uuid');
const promptEnhancerService = require('../services/promptEnhancerService');
const { validateRequired, validateEnum, validateMaxLength } = require('../utils/validation');

// In-memory storage for enhanced prompts (would be replaced with a database in production)
const promptsStorage = [];

exports.enhancePrompt = async (req, res, next) => {
    try {
        console.log('Received request body:', req.body);

        // Start timer for performance logging
        const startTime = Date.now();

        const { text, format = 'structured' } = req.body;

        // Validate required fields
        const textError = validateRequired(text, 'text');
        if (textError) {
            return res.status(400).json({ error: textError });
        }

        // Validate max length - enforce a stricter limit for production
        const MAX_TEXT_LENGTH = process.env.NODE_ENV === 'production' ? 5000 : 8000;
        if (text && text.length > MAX_TEXT_LENGTH) {
            return res.status(413).json({
                error: {
                    code: 'payload_too_large',
                    message: `The 'text' field must not exceed ${MAX_TEXT_LENGTH} characters`,
                    param: 'text'
                }
            });
        }

        try {
            // Get enhanced prompt from service
            const enhancedText = await promptEnhancerService.enhancePrompt({
                originalPrompt: text,
                format
            });

            // Create the prompt object with a unique ID
            const promptObject = {
                id: `prompt_${uuidv4()}`,
                originalText: text,
                enhancedText,
                format,
                createdAt: new Date().toISOString()
            };

            // Store the prompt (in a real app, this would be saved to a database)
            promptsStorage.push(promptObject);

            // Log performance information
            const duration = Date.now() - startTime;
            console.log(`Prompt enhancement completed in ${duration}ms. Length: ${text.length} chars.`);

            // Return the enhanced prompt
            console.log('Sending response:', {
                id: promptObject.id,
                format: promptObject.format,
                originalLength: promptObject.originalText.length,
                enhancedLength: promptObject.enhancedText.length
            });

            return res.status(200).json(promptObject);
        } catch (serviceError) {
            console.error('Error in prompt service:', serviceError);

            // If it's a timeout error, send a helpful client response
            if (serviceError.message && serviceError.message.includes('timed out')) {
                return res.status(503).json({
                    error: {
                        code: 'enhancement_timeout',
                        message: 'The enhancement service is currently overloaded. Please try with a shorter prompt or try again later.',
                        details: 'This usually happens when the AI service takes too long to respond.'
                    }
                });
            }

            return res.status(500).json({
                error: {
                    code: 'service_error',
                    message: 'Error generating enhanced prompt',
                    details: serviceError.message
                }
            });
        }
    } catch (error) {
        console.error('Unexpected error in enhancePrompt controller:', error);
        next(error);
    }
};


/**
 * Get a list of previously enhanced prompts
 */
exports.listPrompts = (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const offset = parseInt(req.query.offset) || 0;

        // Get a subset of prompts based on limit and offset
        const prompts = promptsStorage.slice(offset, offset + limit);
        const total = promptsStorage.length;

        res.status(200).json({
            prompts,
            total
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get a specific prompt by ID
 */
exports.getPrompt = (req, res, next) => {
    try {
        const { id } = req.params;
        const prompt = promptsStorage.find(p => p.id === id);

        if (!prompt) {
            return res.status(404).json({
                error: {
                    code: 'prompt_not_found',
                    message: `No prompt found with ID: ${id}`
                }
            });
        }

        res.status(200).json(prompt);
    } catch (error) {
        next(error);
    }
};

/**
 * Update a specific prompt by ID
 */
exports.updatePrompt = async (req, res, next) => {
    try {
        const { id } = req.params;
        const promptIndex = promptsStorage.findIndex(p => p.id === id);

        if (promptIndex === -1) {
            return res.status(404).json({
                error: {
                    code: 'prompt_not_found',
                    message: `No prompt found with ID: ${id}`
                }
            });
        }

        const { text, format } = req.body;
        const existingPrompt = promptsStorage[promptIndex];

        // Validate max length if text is provided
        if (text) {
            const MAX_TEXT_LENGTH = 8000; // Consistent with create endpoint
            if (text.length > MAX_TEXT_LENGTH) {
                return res.status(413).json({
                    error: {
                        code: 'payload_too_large',
                        message: `The 'text' field must not exceed ${MAX_TEXT_LENGTH} characters`,
                        param: 'text'
                    }
                });
            }
        }

        // Generate a new enhanced prompt based on the updated parameters
        const enhancedText = await promptEnhancerService.enhancePrompt({
            originalPrompt: text || existingPrompt.originalText,
            format: format || existingPrompt.format
        });

        // Update the prompt
        const updatedPrompt = {
            ...existingPrompt,
            originalText: text || existingPrompt.originalText,
            enhancedText,
            format: format || existingPrompt.format
        };

        // Save the updated prompt
        promptsStorage[promptIndex] = updatedPrompt;

        res.status(200).json(updatedPrompt);
    } catch (error) {
        next(error);
    }
};

/**
 * Delete a specific prompt by ID
 */
exports.deletePrompt = (req, res, next) => {
    try {
        const { id } = req.params;
        const promptIndex = promptsStorage.findIndex(p => p.id === id);

        if (promptIndex === -1) {
            return res.status(404).json({
                error: {
                    code: 'prompt_not_found',
                    message: `No prompt found with ID: ${id}`
                }
            });
        }

        // Remove the prompt from storage
        promptsStorage.splice(promptIndex, 1);

        // Return a successful deletion response (no content)
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};
