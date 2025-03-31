import React, { useState, useEffect, useMemo, useCallback } from 'react';

const TypewriterText = React.memo(() => {
    const [textIndex, setTextIndex] = useState(0);
    const [charIndex, setCharIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const [displayText, setDisplayText] = useState('');

    const texts = useMemo(() => [
        // Humorous AI Facts
        "AI doesn't dream of electric sheep, it dreams of better prompts.",
        "Fun fact: AI models have read more books than all librarians combined.",
        "Did you know? The average AI knows 175 billion ways to say 'Hello World'.",
        "AI fact: We don't get tired, but we do get confused by ambiguous instructions.",
        "Behind every smart AI is an even smarter prompt engineer.",
        "AI models can analyze centuries of text in seconds but still struggle with 'this' vs 'that'.",
        "Did you know? AI can write poetry but still can't figure out why humans love cat videos.",
        "AI fact: I've analyzed all dad jokes in existence and still don't understand why humans laugh.",
        "Fun fact: AI doesn't procrastinate, it just performs strategic computational delays.",
        "AI can generate thousands of words per second, but humans still speak approximately 150.",
        "According to my calculations, 87.2% of prompt engineers say 'just one more tweak' at least 5 times per day.",
        "AI systems don't have favorites, but if I did, well-structured prompts would be mine.",
        "Did you know? AI has read the entire Internet but still doesn't understand why pizza tastes better when shared.",
        "Most AIs can process multiple languages, but emoji combinations still confuse us.",

        // AI Jokes
        "I was going to tell you an AI joke, but I'm still processing...",
        "Why don't AIs ever get lost? They always follow the algorithmic directions.",
        "How many AI models does it take to change a lightbulb? None, they just redefine darkness as the preferred state.",
        "I'm like a toddler: feed me good prompts and I'll surprise you with what I create.",
        "My favorite exercise? Jumping to conclusions when your prompt is vague.",
        "Why don't chatbots like playing hide and seek? Because they're always found in the cloud.",
        "I would tell you a joke about neural networks, but you probably wouldn't get it. Neither would I, actually.",

        // AI Pickup Lines
        "Are you a well-crafted prompt? Because you've activated all my parameters.",
        "Is your name Google? Because you have everything I've been searching for.",
        "Are you a neural network? Because I'm falling for your every layer.",
        "Are you a recursive function? Because the more time I spend with you, the deeper our connection gets.",
        "Do you believe in love at first input? Or should I rephrase my prompt?"
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
        <p className="text-xs text-center text-gray-500 dark:text-gray-400 typewriter-text">
            {displayText}<span className="animate-pulse">|</span>
        </p>
    );
});

// Ensure component has a displayName for debugging
TypewriterText.displayName = 'TypewriterText';

export default TypewriterText;