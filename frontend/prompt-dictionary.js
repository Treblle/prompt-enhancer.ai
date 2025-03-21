/**
 * Dictionary of overused words, phrases, and structures to avoid in enhanced prompts
 * This helps create more original, effective, and precise prompts
 */

const promptDictionary = {
    // Overused buzzwords that dilute meaning and credibility
    "overused_words": [
        "cutting-edge",
        "seamless",
        "revolutionary",
        "transformative",
        "game-changing",
        "state-of-the-art",
        "best-in-class",
        "unparalleled",
        "next-gen",
        "future-proof",
        "synergy",
        "disruptive",
        "robust",
        "scalable",
        "holistic",
        "dynamic",
        "turnkey",
        "end-to-end",
        "comprehensive",
        "AI-powered",
        "innovative",
        "unprecedented",
        "remarkable",
        "extraordinary",
        "incredible",
        "phenomenal",
        "amazing",
        "exceptional",
        "superior",
        "tremendous",
        "leverage",
        "facilitate",
        "drive engagement",
        "unlock potential",
        "empower users",
        "enhance productivity",
        "monetize opportunities",
        "streamline operations"
    ],

    // Clichéd phrases that make content feel generic
    "overused_phrases": [
        "In today's fast-paced world...",
        "Are you tired of struggling with...",
        "Looking to take your [X] to the next level?",
        "Imagine a world where...",
        "Let's dive in and explore...",
        "Now, more than ever...",
        "In this article, we will discuss...",
        "Harness the power of...",
        "With the rise of [tech/trend]...",
        "In an era of constant change...",
        "Don't miss out!",
        "Act now!",
        "Sign up today!",
        "Limited time offer!",
        "Click below to learn more!",
        "The future is here!",
        "Join the revolution!",
        "As you may already know...",
        "We all know that...",
        "You won't believe what happens next!",
        "Have you ever wondered...?",
        "Trust me, you'll love this!",
        "Picture this...",
        "Guaranteed results!",
        "100% success rate!",
        "The only tool you'll ever need!",
        "This will change your life!",
        "The ultimate guide to...",
        "Effortlessly boost your [skill]!",
        "I hope this message finds you well.",
        "It is important to note that...",
        "One might say that...",
        "It goes without saying that...",
        "Without further ado, let's begin.",
        "This begs the question...",
        "If you're like most people...",
        "At the end of the day..."
    ],

    // Formulaic sentence constructions that make writing feel stiff
    "bad_sentence_structures": [
        "It is worth mentioning that...",
        "In order to...",
        "With that being said...",
        "For all intents and purposes...",
        "Without a doubt...",
        "Thus, it can be concluded that...",
        "Consequently, this leads to...",
        "Hence, it is clear that..."
    ],

    // Generic or ineffective blog post introductions
    "bad_blog_intros": [
        "Content marketing is an essential strategy for businesses in today's digital world.",
        "API observability refers to the ability to monitor and understand API behavior in real time.",
        "Imagine you're running a business, and suddenly your revenue skyrockets.",
        "Meet Sarah, a developer who struggled with debugging APIs—until she found this solution!"
    ],

    // Weak, predictable blog post conclusions
    "bad_blog_conclusions": [
        "And that's all you need to know about [topic]!",
        "Now that you've learned X, you're ready to take on Y!",
        "We hope this guide helps you on your journey.",
        "Now it's your turn—go out and apply these insights!",
        "By following these steps, you'll be well on your way to success."
    ],

    // Empty corporate language that lacks specificity
    "corporate_jargon": [
        "At [Company Name], we believe in...",
        "Our mission is to empower users with...",
        "We're passionate about helping businesses achieve...",
        "Our solution is tailored to meet your needs...",
        "We're committed to providing unparalleled service...",
        "Experience the difference with..."
    ],

    // Alternative words to suggest instead of overused terms
    "alternative_words": {
        "cutting-edge": ["innovative", "advanced", "pioneering", "modern", "leading", "novel"],
        "seamless": ["smooth", "fluid", "integrated", "cohesive", "unified", "streamlined"],
        "revolutionary": ["groundbreaking", "radical", "transformative", "novel", "pioneering"],
        "robust": ["strong", "reliable", "durable", "resilient", "powerful", "sturdy"],
        "innovative": ["creative", "novel", "original", "inventive", "imaginative", "resourceful"],
        "leverage": ["use", "apply", "employ", "utilize", "harness", "implement"],
        "enhance": ["improve", "upgrade", "refine", "augment", "boost", "optimize"]
    },

    // Suggestions for more specific language replacements
    "specific_replacements": {
        "improve performance": ["reduce load times by X%", "increase throughput", "decrease error rates", "optimize resource usage"],
        "user experience": ["navigation flow", "readability", "interface response time", "accessibility compliance"],
        "cost-effective": ["reduces expenses by X%", "lower total cost of ownership", "higher ROI", "reduced operational costs"],
        "high quality": ["meets ISO standards", "exceeds industry benchmarks", "achieves 99.9% uptime", "maintains strict quality controls"]
    }
};

module.exports = promptDictionary;