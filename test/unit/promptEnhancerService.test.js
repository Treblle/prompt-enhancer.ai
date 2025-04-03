const { enhancePrompt } = require('../../src/services/promptEnhancerService');
const assert = require('assert');

describe('AI Prompt Enhancer Service', () => {
    it('should enhance a basic prompt', async () => {
        // Given
        const originalPrompt = "Write about quantum computing";

        // When
        const result = await enhancePrompt({ originalPrompt });

        // Then
        assert(result, 'Should return an enhanced prompt');
        assert(result.length > originalPrompt.length, 'Enhanced prompt should be longer than original');
        assert(!result.includes('undefined'), 'Should not contain undefined values');
    });

    it('should handle empty input', async () => {
        try {
            await enhancePrompt({ originalPrompt: '' });
            assert.fail('Should have thrown an error');
        } catch (error) {
            assert(error.message.includes('Invalid or missing original prompt'), 'Should throw appropriate error');
        }
    });

    it('should add content guidance', async () => {
        // Given
        const originalPrompt = "Write about APIs";

        // When
        const result = await enhancePrompt({ originalPrompt });

        // Then
        assert(result.includes('WRITING GUIDANCE'), 'Should include writing guidance section');
    });
});
