import React, { useState, useEffect, useMemo, useCallback } from 'react';

const TypewriterText = React.memo(() => {
    const [textIndex, setTextIndex] = useState(0);
    const [charIndex, setCharIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const [displayText, setDisplayText] = useState('');

    const texts = useMemo(() => [
        // Humorous AI Facts (SEO-optimized but still fact-based)
        "AI doesn't dream of electric sheep, it dreams of better prompts for ChatGPT and Claude.",
        "Fun fact: AI models like GPT-4 have read more books than all librarians combined.",
        "Did you know? The average AI knows 175 billion ways to say 'Hello World' in different programming languages.",
        "AI fact: Models like Claude and ChatGPT don't get tired, but they do get confused by ambiguous instructions.",
        "Behind every smart AI is an even smarter prompt engineer using effective techniques.",
        "AI models can analyze centuries of text in seconds but still struggle with 'this' vs 'that'.",
        "Did you know? AI can write poetry but still can't figure out why humans love cat videos.",
        "AI fact: Claude and ChatGPT have analyzed all dad jokes in existence and still don't understand why humans laugh.",
        "Fun fact: AI doesn't procrastinate, it just performs strategic computational delays.",
        "ChatGPT can generate thousands of words per second, but humans still speak approximately 150.",
        "According to my calculations, 87.2% of prompt engineers say 'just one more tweak' at least 5 times per day.",
        "AI systems don't have favorites, but if they did, well-structured prompts would be theirs.",
        "Did you know? AI has read the entire Internet but still doesn't understand why pizza tastes better when shared.",
        "Most AIs like ChatGPT can process multiple languages, but emoji combinations still confuse them.",

        // AI Jokes (with SEO-friendly terms)
        "I was going to tell you a ChatGPT joke, but I'm still processing...",
        "Why don't AIs ever get lost? They always follow the algorithmic directions in their prompts.",
        "How many AI models does it take to change a lightbulb? None, they just redefine darkness as the preferred state.",
        "I'm like a toddler: feed me good prompts and I'll surprise you with what I create.",
        "My favorite exercise? Jumping to conclusions when your prompt is vague or ambiguous.",
        "Why don't chatbots like playing hide and seek? Because they're always found in the cloud.",
        "I would tell you a joke about neural networks, but you probably wouldn't get it. Neither would I, actually."
    ], []);

    // Memoize getRandomText to prevent unnecessary recreation
    const getRandomText = useCallback(() => {
        if (texts.length <= 1) return 0;

        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * texts.length);
        } while (newIndex === textIndex);

        return newIndex;
    }, [textIndex, texts.length]);

    useEffect(() => {
        const currentText = texts[textIndex];
        const typingSpeed = isDeleting ? 30 : 70;
        const pauseDelay = 2000;

        // Type or delete characters
        const timer = setTimeout(() => {
            if (!isDeleting) {
                // Still typing
                if (charIndex < currentText.length) {
                    setDisplayText(currentText.substring(0, charIndex + 1));
                    setCharIndex(charIndex + 1);
                }
                // Finished typing, pause before deleting
                else {
                    setTimeout(() => setIsDeleting(true), pauseDelay);
                }
            } else {
                // Still deleting
                if (charIndex > 0) {
                    setDisplayText(currentText.substring(0, charIndex - 1));
                    setCharIndex(charIndex - 1);
                }
                // Finished deleting, move to next text randomly
                else {
                    setIsDeleting(false);
                    setTextIndex(getRandomText());
                }
            }
        }, typingSpeed);

        return () => clearTimeout(timer);
    }, [charIndex, isDeleting, textIndex, getRandomText, texts]);

    return (
        <div>
            <p className="text-xs text-center text-gray-500 dark:text-gray-400 typewriter-text">
                {displayText}<span className="animate-pulse">|</span>
            </p>
            {/* Hidden SEO-friendly text - not displayed but indexed by search engines */}
            <div className="hidden">
                <h2>AI Facts & Knowledge</h2>
                <p>Discover interesting facts about artificial intelligence, language models, and prompt engineering principles. Learn about ChatGPT, Claude, and other AI assistants.</p>
                <ul>
                    <li>How large language models process information</li>
                    <li>The evolution of prompt engineering techniques</li>
                    <li>Comparing capabilities of different AI models</li>
                    <li>Understanding AI limitations and strengths</li>
                    <li>The science behind effective AI interactions</li>
                </ul>
            </div>
        </div>
    );
});

// Ensure component has a displayName for debugging
TypewriterText.displayName = 'TypewriterText';

export default TypewriterText;