const { OpenAI } = require('openai');
const path = require('path');
const promptDictionary = require(path.resolve(__dirname, '../../frontend/prompt-dictionary'));

// Try to load the mistralService if it's configured
let mistralService = null;
try {
    if (process.env.AI_PROVIDER === 'mistral' && process.env.MISTRAL_API_KEY) {
        mistralService = require('./mistralService');
    }
} catch (error) {
    console.error('Failed to initialize Mistral service:', error.message);
}

// Enhanced logging function
function logError(context, error) {
    console.error(`[PromptEnhancerService] ${context}`, {
        message: error.message,
        code: error.code,
        type: error.type,
        status: error.status,
        stack: error.stack
    });
}

// Validate OpenAI configuration
function validateOpenAIConfig() {
    const requiredEnvVars = ['OPENAI_API_KEY'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
        throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }
}

// Initialize OpenAI client with enhanced configuration
function createOpenAIClient() {
    try {
        validateOpenAIConfig();

        return new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
            organization: process.env.OPENAI_ORG_ID,
            timeout: 30000, // 30 seconds timeout
            maxRetries: 2 // Built-in retry mechanism
        });
    } catch (error) {
        logError('OpenAI Client Initialization', error);
        throw error;
    }
}

// Initialize OpenAI client if needed
let openai = null;
if (process.env.AI_PROVIDER === 'openai' || !process.env.AI_PROVIDER) {
    try {
        openai = createOpenAIClient();
    } catch (error) {
        console.error('Failed to initialize OpenAI client:', error.message);
    }
}

/**
 * Cleans Markdown formatting from text
 * @param {string} text - Text with Markdown formatting
 * @returns {string} - Clean text without Markdown
 */
function cleanMarkdownFormatting(text) {
    if (!text) return text;

    let cleanText = text
        .replace(/\*\*(.*?)\*\*/g, '$1')  // Remove bold **text**
        .replace(/\*(.*?)\*/g, '$1')      // Remove italic *text*
        .replace(/__(.*?)__/g, '$1')      // Remove underscore bold __text__
        .replace(/_(.*?)_/g, '$1');       // Remove underscore italic _text_

    return cleanText;
}

/**
 * Creates guidance for avoiding overused language and AI-sounding text
 * @param {string} originalPrompt - The original prompt for context
 * @returns {string} Guidance for creating better content
 */
function createContentGuidance(originalPrompt) {
    const lowercasePrompt = originalPrompt.toLowerCase();

    let domainSpecificAdvice = "";
    if (lowercasePrompt.includes("blog") || lowercasePrompt.includes("article")) {
        domainSpecificAdvice = "Focus on creating a natural narrative flow with varied sentence structures.";
    } else if (lowercasePrompt.includes("code") || lowercasePrompt.includes("programming")) {
        domainSpecificAdvice = "Prioritize clarity, include practical implementation details, and use specific examples.";
    } else if (lowercasePrompt.includes("story") || lowercasePrompt.includes("creative")) {
        domainSpecificAdvice = "Use specific sensory details and avoid predictable plot structures.";
    }

    const overusedTermsToAvoid = selectRandomItems(promptDictionary.overused_words, 3);
    const overusedPhrasesToAvoid = selectRandomItems(promptDictionary.overused_phrases, 2);

    return `
--------------------------
WRITING GUIDANCE:

1. SOUND NATURAL:
   - Vary sentence structure
   - Avoid excessive hedging
   - Use concrete language
   - Include specific examples

2. AVOID OVERUSED LANGUAGE:
   ${overusedTermsToAvoid.map(term => `   - "${term}"`).join('\n')}
   ${overusedPhrasesToAvoid.map(phrase => `   - "${phrase}"`).join('\n')}

3. BE SPECIFIC:
   - Provide concrete details
   - Use precise terminology
   - Explain complex ideas clearly
   ${domainSpecificAdvice ? `\n4. DOMAIN-SPECIFIC ADVICE:\n   ${domainSpecificAdvice}` : ''}
--------------------------
`;
}

/**
 * Enhance a prompt using OpenAI
 * @param {Object} params - Parameters for enhancement
 * @returns {Promise<string>} - Enhanced prompt
 * @private
 */
async function _enhanceWithOpenAI(params) {
    const { originalPrompt } = params;

    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
            {
                role: "system",
                content: `You are an expert prompt engineer. Enhance basic prompts to produce better AI responses by making them more specific, structured, and clear.

ENHANCEMENT GUIDELINES:
- Add clear structure and organization
- Include relevant context
- Specify precise response format
- Request specific, actionable examples
- Define clear constraints and parameters
- Clarify target audience and purpose

AVOID:
- AI-like language
- Corporate jargon
- Vague instructions
- Unnecessary complexity`
            },
            {
                role: "user",
                content: `Enhance this basic prompt to get better AI responses: "${originalPrompt}"`
            }
        ],
        temperature: 0.7,
        max_tokens: 800,
    });

    return response.choices[0]?.message?.content || '';
}

/**
 * Enhance a prompt using Mistral AI
 * @param {Object} params - Parameters for enhancement 
 * @returns {Promise<string>} - Enhanced prompt
 * @private
 */
async function _enhanceWithMistral(params) {
    const { originalPrompt } = params;

    const response = await mistralService.createChatCompletion({
        model: "mistral-medium",  // Use appropriate model based on your needs
        messages: [
            {
                role: "system",
                content: `You are an expert prompt engineer. Enhance basic prompts to produce better AI responses by making them more specific, structured, and clear.

ENHANCEMENT GUIDELINES:
- Add clear structure and organization
- Include relevant context
- Specify precise response format
- Request specific, actionable examples
- Define clear constraints and parameters
- Clarify target audience and purpose

AVOID:
- AI-like language
- Corporate jargon
- Vague instructions
- Unnecessary complexity`
            },
            {
                role: "user",
                content: `Enhance this basic prompt to get better AI responses: "${originalPrompt}"`
            }
        ],
        temperature: 0.7,
        maxTokens: 800
    });

    return response.choices[0]?.message?.content || '';
}

/**
 * Enhances a prompt using the configured AI provider
 * @param {Object} params - The parameters for enhancement
 * @param {string} params.originalPrompt - The original prompt text
 * @returns {Promise<string>} The enhanced prompt
 */
async function enhancePrompt(params) {
    const { originalPrompt } = params;

    // Validate input
    if (!originalPrompt || typeof originalPrompt !== 'string') {
        throw new Error('Invalid or missing original prompt');
    }

    try {
        let enhancedPrompt = '';

        // Choose AI provider based on configuration
        const aiProvider = process.env.AI_PROVIDER || 'openai';

        if (aiProvider === 'mistral' && mistralService) {
            console.log('Using Mistral AI for prompt enhancement');
            enhancedPrompt = await _enhanceWithMistral(params);
        } else if (openai) {
            console.log('Using OpenAI for prompt enhancement');
            enhancedPrompt = await _enhanceWithOpenAI(params);
        } else {
            throw new Error('No AI provider available. Check your configuration.');
        }

        // Clean the enhanced prompt
        enhancedPrompt = cleanMarkdownFormatting(enhancedPrompt);

        // Add content guidance
        const contentGuidance = createContentGuidance(originalPrompt);

        return enhancedPrompt + contentGuidance;

    } catch (error) {
        logError('Prompt Enhancement Error', error);

        // Provide a meaningful fallback
        const fallbackMessage = `Unable to enhance prompt. Error: ${error.message}. 

General Prompt Enhancement Guidelines:
1. Be specific about your request
2. Provide context
3. Define the desired output format
4. Include any relevant constraints or requirements`;

        return fallbackMessage;
    }
}

/**
 * Selects random items from an array
 * @param {Array} array - The array to select from
 * @param {number} count - Number of items to select
 * @returns {Array} Selected items
 */
function selectRandomItems(array, count) {
    if (!array || array.length === 0) return [];

    const result = [];
    const arrayCopy = [...array];
    const itemsToSelect = Math.min(count, arrayCopy.length);

    for (let i = 0; i < itemsToSelect; i++) {
        const randomIndex = Math.floor(Math.random() * arrayCopy.length);
        result.push(arrayCopy[randomIndex]);
        arrayCopy.splice(randomIndex, 1);
    }

    return result;
}

module.exports = {
    enhancePrompt
};