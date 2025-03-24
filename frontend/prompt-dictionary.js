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

    // Content type patterns for different domains
    "content_type_patterns": {
        "linkedin_post": {
            "bad_patterns": [
                "🚀 Excited to share",
                "I'm thrilled to announce",
                "Game-changer alert!",
                "What are your thoughts? Let me know in the comments!",
                "Like if you agree!",
                "Who else is excited about this trend?",
                "Has anyone else experienced this?",
                "Tag someone who needs to see this!",
                "Hot take: [obvious statement]",
                "I'm humbled and honored to...",
                "#MondayMotivation",
                "Agree or disagree?",
                "Share this with your network!"
            ],
            "good_guidance": [
                "Share a specific observation from your professional experience that challenges conventional wisdom",
                "Focus on a single insight rather than multiple trends or bullet points",
                "Connect your perspective to broader industry implications",
                "End with a thoughtful implication rather than asking for engagement",
                "Use natural professional language without forced enthusiasm",
                "Include a specific data point or research finding that adds credibility",
                "Reference a particular project or case that illustrates your point",
                "Acknowledge nuance or limitations in your perspective",
                "Structure your post with an attention-grabbing hook that challenges assumptions",
                "Use bold text sparingly to emphasize 1-2 key concepts"
            ]
        },
        "technical_writing": {
            "bad_patterns": [
                "Easy-to-follow guide",
                "Simple steps to",
                "Anyone can learn",
                "Master [X] in just minutes",
                "The ultimate guide to",
                "Complete walkthrough",
                "Everything you need to know",
                "The only tutorial you'll ever need",
                "As we all know",
                "Obviously",
                "Clearly",
                "It goes without saying",
                "Simply put"
            ],
            "good_guidance": [
                "Provide context about why certain technical approaches are preferred",
                "Include code examples that demonstrate best practices, not just functionality",
                "Address common edge cases and how to handle them",
                "Explain the reasoning behind technical decisions",
                "Balance technical precision with practical usability",
                "Begin with a conceptual overview before diving into implementation details",
                "Structure documentation with clear headings and subheadings for navigability",
                "Use code blocks with appropriate syntax highlighting",
                "Include real-world examples that illustrate practical applications",
                "Acknowledge limitations or potential issues with the approach",
                "Provide troubleshooting guidance for common problems",
                "Use technical terminology accurately and consistently"
            ]
        },
        "blog_post": {
            "bad_patterns": [
                "In this article, we will",
                "Without further ado",
                "In conclusion",
                "Let's dive in",
                "As you may already know",
                "Before we begin",
                "In today's fast-paced world",
                "Needless to say",
                "It goes without saying",
                "First and foremost",
                "Last but not least",
                "The fact of the matter is"
            ],
            "good_guidance": [
                "Begin with a specific observation or insight that frames the topic",
                "Develop ideas through concrete examples rather than generalities",
                "Address counterarguments or limitations to build credibility",
                "Use subheadings that promise and deliver specific value",
                "Conclude with implications rather than summaries",
                "Create clear paragraph breaks between different thoughts for readability",
                "Use bold text to highlight key concepts or phrases, not entire sentences",
                "Include specific data points or research findings to support claims",
                "Reference particular cases or examples that illustrate key points",
                "Maintain a consistent tone throughout the piece",
                "Use transitions that connect ideas naturally rather than formulaically",
                "Incorporate relevant quotes or insights from credible sources"
            ]
        },
        "marketing_content": {
            "bad_patterns": [
                "Revolutionary product",
                "Game-changing solution",
                "Industry-leading",
                "Best-in-class",
                "Cutting-edge technology",
                "Disrupting the industry",
                "Unparalleled quality",
                "One-stop solution",
                "Streamline your workflow",
                "Unlock your potential",
                "Take your [X] to the next level",
                "Don't miss out",
                "Limited time offer"
            ],
            "good_guidance": [
                "Focus on specific user problems and how the product addresses them",
                "Use precise language about capabilities instead of superlatives",
                "Include specific details that build credibility (materials, processes, metrics)",
                "Describe specific usage scenarios rather than generic benefits",
                "Acknowledge ideal use cases rather than claiming universal superiority",
                "Structure with clear sections for different aspects of the product/service",
                "Use bullet points for features or specifications for easy scanning",
                "Include specific measurements, dimensions, or performance metrics",
                "Highlight key differentiators with bold text for emphasis",
                "Incorporate specific customer experiences or testimonials",
                "Address potential concerns or questions directly",
                "Use natural language that speaks to the target audience specifically"
            ]
        },
        "educational_content": {
            "bad_patterns": [
                "Simply put",
                "As we all know",
                "It goes without saying",
                "Obviously",
                "Clearly",
                "As I mentioned earlier",
                "Needless to say",
                "In other words",
                "To put it simply",
                "Basically",
                "This goes to show",
                "Long story short"
            ],
            "good_guidance": [
                "Build understanding through familiar analogies before introducing technical concepts",
                "Anticipate and address common points of confusion",
                "Progress from concrete examples to abstract principles",
                "Use specific examples that illustrate concepts in action",
                "Acknowledge complexity where appropriate rather than oversimplifying",
                "Create clear section headings for different concepts or topics",
                "Use bold text for key terms or important concepts",
                "Include visual elements or diagrams for complex concepts",
                "Break down difficult ideas into manageable steps or components",
                "Provide practical applications or exercises to reinforce learning",
                "Acknowledge different learning styles with varied explanations",
                "Use consistent terminology throughout the explanation"
            ]
        },
        "email_communication": {
            "bad_patterns": [
                "I hope this email finds you well",
                "I am writing to",
                "As per our conversation",
                "Please find attached",
                "I would like to",
                "Don't hesitate to contact me",
                "Looking forward to your response",
                "As discussed",
                "Pursuant to our discussion",
                "Kindly advise",
                "As mentioned earlier",
                "Please revert at your earliest convenience"
            ],
            "good_guidance": [
                "Start with a clear, specific subject line that summarizes the purpose",
                "Begin the email body with the key message or request",
                "Use bullet points for multiple items or steps for clarity",
                "Keep paragraphs short (2-3 sentences) for readability",
                "Bold important dates, deadlines, or action items",
                "Use descriptive headers for different sections in longer emails",
                "Maintain a professional but conversational tone",
                "Include specific next steps or calls to action",
                "Be explicit about response expectations and timelines",
                "Use specific examples or references when appropriate",
                "Address potential questions or concerns proactively",
                "End with a clear, specific closing rather than a generic one"
            ]
        },
        "case_study": {
            "bad_patterns": [
                "Revolutionary results",
                "Game-changing outcomes",
                "Incredible success",
                "Dramatic improvement",
                "Massive ROI",
                "Extraordinary transformation",
                "Unprecedented growth",
                "Wildly successful",
                "Remarkable achievement",
                "Astounding performance",
                "Industry-disrupting implementation",
                "Exceptional client satisfaction"
            ],
            "good_guidance": [
                "Begin with a specific, measurable challenge the client faced",
                "Include precise metrics from the initial situation",
                "Structure with clear sections: Challenge, Approach, Implementation, Results",
                "Use specific numbers and percentages for outcomes",
                "Include a timeline of key milestones or decision points",
                "Describe specific obstacles encountered and how they were addressed",
                "Bold key metrics or results for emphasis",
                "Include direct quotes from stakeholders with their specific roles",
                "Acknowledge limitations or areas for future improvement",
                "Use technical terminology appropriate to the industry",
                "Include specific tools, methodologies, or frameworks used",
                "End with concrete lessons learned or best practices identified"
            ]
        },
        "executive_summary": {
            "bad_patterns": [
                "In a nutshell",
                "To make a long story short",
                "The bottom line is",
                "At the end of the day",
                "When all is said and done",
                "Cutting to the chase",
                "In essence",
                "Suffice it to say",
                "To sum up",
                "Moving forward",
                "Going forward",
                "On a go-forward basis"
            ],
            "good_guidance": [
                "Begin with the single most important finding or recommendation",
                "Structure with clear, concise sections for different aspects of the topic",
                "Use bullet points for key findings or recommendations",
                "Include specific metrics, timelines, and financial implications",
                "Bold critical numbers or decision points for emphasis",
                "Keep paragraphs very short (1-2 sentences) for scannability",
                "Focus on implications rather than explanations",
                "Include a brief context section to frame the summary",
                "Acknowledge key risks or contingencies",
                "Use precise business terminology rather than jargon",
                "Include specific next steps with owners and deadlines",
                "Maintain a direct, factual tone without unnecessary qualifiers"
            ]
        }
    },

    // Content frameworks for different content types
    "content_frameworks": {
        "social_media": "Focus on sharing a single specific insight rather than general observations. Use natural language without forced enthusiasm or excessive formatting. Structure with a counterintuitive hook, specific observation, supporting evidence, and thoughtful implication.",

        "technical": "Prioritize clarity and accuracy over simplification. Include context about why approaches are recommended and address edge cases. Structure with conceptual overview, implementation details, common issues, and advanced applications.",

        "marketing": "Focus on specific user problems and concrete benefits rather than superlatives. Use precise language about capabilities. Structure with problem statement, solution overview, specific benefits, usage scenarios, and clear next steps.",

        "educational": "Build understanding through familiar concepts before introducing technical terms. Anticipate points of confusion. Structure with relatable analogy, core concept explanation, practical examples, edge cases, and application suggestions.",

        "business": "Focus on specific business outcomes rather than generic capabilities. Use precise language that demonstrates domain knowledge. Structure with key finding, context, implications, recommendations, and implementation considerations.",

        "email": "Start with the key message or request. Use bullet points for multiple items. Keep paragraphs short for readability. Bold important dates or action items. Structure with purpose, details, specific request, and clear next steps.",

        "case_study": "Begin with a specific, measurable challenge. Include precise metrics throughout. Structure with initial situation, approach, implementation details, specific outcomes, and lessons learned.",

        "executive": "Lead with the most important finding or recommendation. Use bullet points for key points. Include specific metrics and implications. Structure with key message, context, findings, recommendations, and next steps.",

        "blog": "Start with a specific observation that frames the topic. Use subheadings that promise specific value. Structure with engaging hook, problem/opportunity overview, key insights, practical applications, and meaningful conclusion."
    },

    // Alternative words to suggest instead of overused terms
    "alternative_words": {
        "cutting-edge": ["innovative", "advanced", "pioneering", "modern", "leading", "novel"],
        "seamless": ["smooth", "fluid", "integrated", "cohesive", "unified", "streamlined"],
        "revolutionary": ["groundbreaking", "radical", "transformative", "novel", "pioneering"],
        "robust": ["strong", "reliable", "durable", "resilient", "powerful", "sturdy"],
        "innovative": ["creative", "novel", "original", "inventive", "imaginative", "resourceful"],
        "leverage": ["use", "apply", "employ", "utilize", "harness", "implement"],
        "enhance": ["improve", "upgrade", "refine", "augment", "boost", "optimize"],
        "optimize": ["refine", "improve", "fine-tune", "perfect", "streamline", "enhance"],
        "empower": ["enable", "equip", "support", "help", "assist", "strengthen"],
        "synergy": ["cooperation", "collaboration", "coordination", "combined effect", "teamwork"],
        "disruptive": ["transformative", "game-changing", "groundbreaking", "revolutionary", "innovative"],
        "streamline": ["simplify", "optimize", "make efficient", "improve", "refine", "organize"],
        "next-level": ["improved", "advanced", "enhanced", "superior", "upgraded", "better"],
        "bleeding-edge": ["pioneering", "innovative", "advanced", "state-of-the-art", "leading", "newest"],
        "mission-critical": ["essential", "vital", "crucial", "key", "important", "necessary"],
        "paradigm-shift": ["fundamental change", "major breakthrough", "transformation", "evolution", "reimagining"]
    },

    // Suggestions for more specific language replacements
    "specific_replacements": {
        "improve performance": ["reduce load times by X%", "increase throughput", "decrease error rates", "optimize resource usage"],
        "user experience": ["navigation flow", "readability", "interface response time", "accessibility compliance"],
        "cost-effective": ["reduces expenses by X%", "lower total cost of ownership", "higher ROI", "reduced operational costs"],
        "high quality": ["meets ISO standards", "exceeds industry benchmarks", "achieves 99.9% uptime", "maintains strict quality controls"],
        "innovative solution": ["patent-pending approach", "novel implementation of [specific technology]", "first-of-its-kind application", "unique combination of [specific methodologies]"],
        "industry leader": ["ranked #X in market share", "holds X patents in the field", "pioneered [specific innovation]", "first to market with [specific feature]"],
        "customer satisfaction": ["95% retention rate", "NPS score of X", "average review rating of X/5", "X% reduction in support tickets"],
        "easy to use": ["requires no training for basic functions", "reduces task completion time by X%", "achieves X% success rate for first-time users", "minimizes clicks required for common tasks"],
        "scalable architecture": ["handles X concurrent users", "processes X transactions per second", "maintains performance with X% more data", "supports horizontal scaling across X nodes"]
    },

    // Structural recommendations for different content types
    "structural_recommendations": {
        "linkedin_post": {
            "formatting": [
                "Use **bold text** to emphasize 2-3 key concepts or phrases",
                "Create clear paragraph breaks between different thoughts",
                "Keep paragraphs short (2-4 sentences) for mobile reading",
                "Use occasional *italics* for subtle emphasis or contrasting ideas"
            ],
            "structure": [
                "Begin with an attention-grabbing hook that challenges assumptions",
                "Focus on a single core insight rather than multiple points",
                "Include a brief supporting example or data point",
                "Conclude with an implication or forward-looking thought"
            ]
        },
        "blog_post": {
            "formatting": [
                "Use clear, descriptive headings and subheadings",
                "Keep paragraphs under 3-4 sentences for readability",
                "Use bullet points for related items or steps",
                "Bold key concepts or important takeaways"
            ],
            "structure": [
                "Begin with a specific insight or question that frames the topic",
                "Organize with 3-5 main sections with descriptive headings",
                "Include specific examples, case studies, or data points",
                "Conclude with implications or applications rather than summary"
            ]
        },
        "technical_documentation": {
            "formatting": [
                "Use consistent heading levels for hierarchy",
                "Include code blocks with proper syntax highlighting",
                "Use tables for parameter references or comparisons",
                "Create clear sections for different aspects (setup, usage, etc.)"
            ],
            "structure": [
                "Begin with a conceptual overview and purpose",
                "Include prerequisites and setup instructions",
                "Provide usage examples from basic to advanced",
                "Document common errors and troubleshooting steps"
            ]
        }
    }
};

module.exports = promptDictionary;
