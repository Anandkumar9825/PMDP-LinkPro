// High-Accuracy Contextual Content Synthesis Engine for LinkPro

function detectIntent(text) {
    const lower = (text || '').toLowerCase();
    if (/(certif|passed|exam|course|bootcamp|specialization|graduat|diploma|license|accred|completed|score|scored)/i.test(lower)) {
        return 'CERTIFICATION';
    }
    if (/(promot|new role|joined|position as|hired as|started at|offer from|intern at|internship|new job)/i.test(lower)) {
        return 'JOB_PROMOTION';
    }
    if (/(built|launched|developed|project|created|repo|github|portfolio|shipped|deploy|app|application)/i.test(lower)) {
        return 'PROJECT_LAUNCH';
    }
    return 'GENERAL';
}

// -------------------------------------------------------------
// 1. CERTIFICATION / COURSE / EXAM DETAILS & SYNTHESIS
// -------------------------------------------------------------
function extractCertDetails(text) {
    const raw = (text || '').trim();
    const lower = raw.toLowerCase();

    // Score extraction
    let score = null;
    const scoreMatch = raw.match(/(?:with\s+)?(?:a\s+)?score\s*(?:of|:)?\s*(\d{2,4}(?:\/\d{2,4})?%?)/i) ||
                       raw.match(/(\d{2,4}%|\d{3,4}\/\d{3,4})\s*(?:score|marks|result)?/i) ||
                       raw.match(/(\d{3,4})\s*(?:score|marks)/i);
    if (scoreMatch) {
        score = scoreMatch[1];
    }

    // Provider / Platform
    let provider = null;
    if (/aws|amazon web services/i.test(raw)) provider = "AWS (Amazon Web Services)";
    else if (/azure|microsoft/i.test(raw)) provider = "Microsoft Azure";
    else if (/gcp|google cloud/i.test(raw)) provider = "Google Cloud";
    else if (/coursera/i.test(raw)) provider = "Coursera";
    else if (/udemy/i.test(raw)) provider = "Udemy";
    else if (/meta|facebook/i.test(raw)) provider = "Meta";
    else if (/cisco/i.test(raw)) provider = "Cisco";
    else if (/oracle/i.test(raw)) provider = "Oracle";
    else if (/ibm/i.test(raw)) provider = "IBM";
    else if (/harvard|edx/i.test(raw)) provider = "edX / Harvard";
    else if (/comptia/i.test(raw)) provider = "CompTIA";

    // Clean title
    let title = raw
        .replace(/^(i'm|i am|i have|i|just|proud to share that|thrilled to share that|excited to announce that|happy to share that|i just)\s+/gi, '')
        .replace(/^(completed|earned|passed|achieved|received|got certified in|got certified as|certified in|finished)\s+/gi, '')
        .replace(/(?:with|having|got)?\s*(?:a\s+)?score\s*(?:of|:)?\s*\d{2,4}.*$/gi, '')
        .replace(/\bwith\s+\d{2,4}(?:%|\/\d{2,4})?.*$/gi, '')
        .replace(/(?:from|by|on)\s+(coursera|udemy|aws|google|microsoft|meta|cisco|edx|ibm).*$/gi, '')
        .replace(/\b(exam|examination|test)\b.*$/gi, '')
        .replace(/[\.\,\!]+$/g, '')
        .trim();

    if (title.length > 3) {
        title = title.split(' ')
            .map(word => {
                if (/^(and|in|of|for|the|on|with|to|a|an|as)$/i.test(word)) return word.toLowerCase();
                if (/^(aws|gcp|ai|ml|ui|ux|api|sql|db|ibm|pmp|it|cka|ckad|ceh)$/i.test(word)) return word.toUpperCase();
                return word.charAt(0).toUpperCase() + word.slice(1);
            })
            .join(' ');
    } else {
        title = "Professional Certification";
    }

    const tags = new Set();
    let topicName = "Professional Skills";
    let bullets = [
        "Mastering real-world architectural principles and practical implementation",
        "Deepening expertise in high-availability, scalable, and resilient systems",
        "Applying industry best practices for optimization and robust performance"
    ];

    if (/cloud|aws|azure|gcp/i.test(lower)) {
        topicName = "Cloud Computing & Architecture";
        tags.add('#CloudComputing');
        if (/aws/i.test(lower)) { tags.add('#AWSCertified'); tags.add('#AWS'); tags.add('#SolutionsArchitect'); }
        if (/azure/i.test(lower)) { tags.add('#Azure'); tags.add('#MicrosoftCertified'); }
        if (/gcp|google/i.test(lower)) { tags.add('#GoogleCloud'); tags.add('#GCP'); }
        bullets = [
            "Designing resilient, fault-tolerant, and highly available cloud architectures",
            "Implementing security best practices, IAM governance, and cost optimization",
            "Deploying scalable multi-tier infrastructure and modern cloud services"
        ];
    } else if (/kubernetes|docker|container|devops|terraform|ansible/i.test(lower)) {
        topicName = "DevOps & Cloud Native Architecture";
        tags.add('#DevOps'); tags.add('#Kubernetes'); tags.add('#CloudNative'); tags.add('#Docker');
        bullets = [
            "Architecting declarative cluster deployments and automated autoscaling",
            "Implementing robust zero-downtime CI/CD pipelines and infrastructure as code",
            "Hardening cluster security, network policies, and observability telemetry"
        ];
    } else if (/react|frontend|front-end|javascript|typescript|web|angular|vue|next/i.test(lower)) {
        topicName = "Frontend Engineering";
        tags.add('#WebDevelopment'); tags.add('#Frontend'); tags.add('#JavaScript'); tags.add('#ReactJS');
        bullets = [
            "Building responsive, high-performance UI components with modern design standards",
            "State management, lifecycle optimization, and clean architectural patterns",
            "Delivering intuitive, accessible, and seamless end-user experiences"
        ];
    } else if (/ai|ml|machine learning|deep learning|data science|python/i.test(lower)) {
        topicName = "AI & Machine Learning";
        tags.add('#ArtificialIntelligence'); tags.add('#MachineLearning'); tags.add('#DataScience'); tags.add('#Python');
        bullets = [
            "Developing predictive models and fine-tuning neural network architectures",
            "Feature engineering, data preprocessing, and model evaluation benchmarks",
            "Translating algorithmic insights into deployable, production-ready systems"
        ];
    } else if (/backend|node|express|api|database|sql|mongodb|java|spring/i.test(lower)) {
        topicName = "Backend Engineering";
        tags.add('#BackendDevelopment'); tags.add('#SoftwareEngineering'); tags.add('#APIs'); tags.add('#Database');
        bullets = [
            "Developing high-throughput RESTful and microservice APIs",
            "Optimizing database schema indexing, queries, and caching mechanisms",
            "Ensuring robust security, JWT authentication, and resilient server architecture"
        ];
    }

    tags.add('#ContinuousLearning');
    tags.add('#Certification');
    tags.add('#ProfessionalGrowth');

    const hashtagLine = Array.from(tags).slice(0, 5).join(' ');
    return { title, score, provider, topicName, bullets, hashtagLine };
}

function synthesizeCertPost(details, style, variationIndex) {
    const { title, score, provider, topicName, bullets, hashtagLine } = details;
    const v = Math.abs(parseInt(variationIndex, 10) || 0) % 4;
    const scoreText = score ? ` with a score of ${score}` : '';
    const providerText = provider ? ` through ${provider}` : '';

    switch (style) {
        case 'Academic': {
            const variations = [
                `Formally awarded certification: ${title}${scoreText}${providerText}.\n\n` +
                `The curriculum provided a rigorous theoretical and applied evaluation across ${topicName}:\n` +
                `1. Foundational Architecture: ${bullets[0]}.\n` +
                `2. Empirical Application: ${bullets[1]}.\n` +
                `3. Production Standards: ${bullets[2]}.\n\n` +
                `Continuous validation of domain methodologies remains essential for advancing technical standards.\n\n` +
                hashtagLine,

                `Academic milestone: Completed examination requirements for ${title}${scoreText}.\n\n` +
                `Key competencies assessed:\n` +
                `• Analytical problem formulation and algorithmic problem-solving\n` +
                `• Comparative analysis of architectural paradigms and performance tradeoffs\n` +
                `• Systematic implementation following industry reference frameworks\n\n` +
                `Looking forward to applying these empirical insights to ongoing research and engineering initiatives.\n\n` +
                hashtagLine,

                `Technical Certification Assessment: ${title}.\n\n` +
                `Successfully demonstrated formal domain mastery${scoreText}${providerText}.\n\n` +
                `Primary Evaluation Criteria:\n` +
                `🔹 Systematic understanding of ${topicName} principles\n` +
                `🔹 Practical design validation against real-world constraints\n` +
                `🔹 Rigorous adherence to security, efficiency, and scalability benchmarks\n\n` +
                `Eager to collaborate with fellow practitioners and researchers in this domain.\n\n` +
                hashtagLine,

                `Milestone Update: Awarded ${title}${scoreText}.\n\n` +
                `This comprehensive assessment evaluated both conceptual depth and practical execution across modern ${topicName}.\n\n` +
                `Core takeaways:\n` +
                `→ Structural clarity dramatically reduces implementation complexity.\n` +
                `→ Continuous validation ensures reproducibility and operational excellence.\n\n` +
                hashtagLine
            ];
            return variations[v];
        }

        case 'Casual': {
            const variations = [
                `Officially certified! 🚀 Super excited to share that I just passed ${title}${scoreText}${providerText}! ✨\n\n` +
                `The preparation was definitely intense, but every hour spent studying and running hands-on labs was totally worth it.\n\n` +
                `Top 3 things I loved diving into:\n` +
                `• ${bullets[0]}\n` +
                `• ${bullets[1]}\n` +
                `• ${bullets[2]}\n\n` +
                `Huge thanks to everyone who shared study tips and cheered me on along the way! ☕\n\n` +
                `What’s the next cert or skill you're working toward? Drop it in the comments below! 👇\n\n` +
                hashtagLine,

                `Big personal win today! 🎉 Just earned my ${title} credential${scoreText}!\n\n` +
                `Honestly, balancing preparation alongside regular work wasn't easy, but setting daily study goals made all the difference.\n\n` +
                `Favorite takeaways from this journey:\n` +
                `1. Hands-on practice beats just reading theory every single time.\n` +
                `2. Breaking complex topics into bite-sized pieces removes the overwhelm.\n` +
                `3. Consistency compounds faster than you think.\n\n` +
                `Excited to put these skills to work on some awesome projects! Let's connect if you're in the same field! 👋\n\n` +
                hashtagLine,

                `Celebration time! 🥳 Just wrapped up and passed ${title}${scoreText}!\n\n` +
                `What a journey this was—lots of late-night study sessions, coffee mugs, and "aha!" moments when complex concepts finally clicked.\n\n` +
                `Can't wait to leverage these insights to build even cooler stuff.\n\n` +
                `To anyone currently prepping for their next exam: keep pushing, you've got this! 💪\n\n` +
                hashtagLine,

                `So pumped to share that I'm now officially certified in ${title}! 🎯\n\n` +
                `The exam definitely tested real-world scenario thinking${score ? ` (thrilled to finish with a ${score}!)` : ''}.\n\n` +
                `Key focus areas:\n` +
                `✨ ${bullets[0]}\n` +
                `✨ ${bullets[1]}\n` +
                `✨ ${bullets[2]}\n\n` +
                `Onward and upward to the next milestone! 🚀\n\n` +
                hashtagLine
            ];
            return variations[v];
        }

        case 'Storytelling': {
            const variations = [
                `When I first registered for the ${title} exam, I knew it would demand serious commitment.\n\n` +
                `There were evenings after long days where opening documentation and practice exams felt like an uphill battle. Moments where complex scenarios seemed overwhelming.\n\n` +
                `But that process taught me something invaluable: growth never happens when you stay inside your comfort zone.\n\n` +
                `Today, receiving my passing score${scoreText} and earning this certification feels like proof that showing up every day—even when motivation is low—leads to real breakthroughs.\n\n` +
                `To anyone currently grinding toward a certification or new career chapter: stay patient, trust your preparation, and keep moving forward. 🌟\n\n` +
                hashtagLine,

                `A few months ago, I set a clear target: master ${topicName} and pass ${title}.\n\n` +
                `It wasn't a straight line. I failed practice quizzes, revisited difficult documentation, and rebuilt lab setups until I understood the underlying logic.\n\n` +
                `And that's the beauty of deep learning—it transforms confusion into confidence.\n\n` +
                `Thrilled to share that I officially passed${scoreText}${providerText}! 🎓\n\n` +
                `Grateful for the mentors, communities, and colleagues who inspired me along the way.\n\n` +
                hashtagLine,

                `Every milestone has a backstory that doesn't show up on the certificate.\n\n` +
                `For me, earning the ${title}${scoreText} was about proving to myself that disciplined focus can conquer any learning curve.\n\n` +
                `What I gained wasn't just a badge, but a refined approach to:\n` +
                `• Tackling ambiguous problems under pressure\n` +
                `• Designing systems with scalability and security from day one\n` +
                `• Staying curious in a rapidly advancing tech landscape\n\n` +
                `Excited for the doors this opens and the impact ahead!\n\n` +
                hashtagLine,

                `The journey to becoming certified in ${title} began with a simple question: "How can I level up my impact?"\n\n` +
                `Diving into the material challenged my assumptions and sharpened my technical perspective across ${topicName}.\n\n` +
                `Today marks the completion of that chapter${scoreText}, and the beginning of putting these insights into live production systems.\n\n` +
                `Never stop investing in your craft.\n\n` +
                hashtagLine
            ];
            return variations[v];
        }

        case 'Inspirational': {
            const variations = [
                `Your only limit is the one you place on yourself. 💡\n\n` +
                `Proud to share that I have officially earned the ${title} certification${scoreText}! 🎯\n\n` +
                `This journey was a powerful reminder of three timeless truths:\n` +
                `✨ When you dedicate focused time every single day, the results take care of themselves.\n` +
                `✨ Discomfort is not a sign to quit—it is the exact moment real growth begins.\n` +
                `✨ Investing in your knowledge always yields the highest return.\n\n` +
                `If there's an exam, certification, or skill you've been putting off: consider this your sign to start today. Believe in yourself and take the leap! 🚀\n\n` +
                hashtagLine,

                `Every expert was once a beginner who refused to give up. 🌟\n\n` +
                `Thrilled to announce that I have successfully achieved ${title}${scoreText}${providerText}!\n\n` +
                `Behind this achievement are hundreds of hours of reading, experimenting, and persistent curiosity. It's a reminder that dedication will always outshine talent.\n\n` +
                `Keep setting the bar higher for yourself. Celebrate how far you've come, but stay hungry for where you're going!\n\n` +
                hashtagLine,

                `Do not wait for the "perfect time" to level up. The perfect time is right now. ✨\n\n` +
                `Milestone unlocked: Officially certified in ${title}${scoreText}!\n\n` +
                `Key lessons from the process:\n` +
                `→ Progress is built through small, unglamorous daily habits.\n` +
                `→ Trusting yourself through uncertainty is where confidence is born.\n` +
                `→ The tech industry rewards those who never stop learning.\n\n` +
                `To everyone striving toward their next breakthrough: keep going. Your hard work will speak for itself!\n\n` +
                hashtagLine,

                `Celebrate your growth, no matter how steep the climb was. 🏆\n\n` +
                `Extremely proud to have earned ${title}${scoreText}.\n\n` +
                `This accomplishment reinforces my belief that with the right mindset and relentless consistency, any complex domain can be mastered.\n\n` +
                `Ready to bring this energy and expertise to my team and our next big challenges! 🚀\n\n` +
                hashtagLine
            ];
            return variations[v];
        }

        case 'Concise': {
            const variations = [
                `🎯 Milestone Unlocked: Successfully earned ${title}${scoreText}${providerText}!\n\n` +
                `Core competencies mastered:\n` +
                `• ${bullets[0]}\n` +
                `• ${bullets[1]}\n` +
                `• ${bullets[2]}\n\n` +
                `Ready to apply these skills to deliver high-impact engineering solutions.\n\n` +
                hashtagLine,

                `Proud to share that I've completed ${title}${scoreText}.\n\n` +
                `Key Focus Areas:\n` +
                `🔹 Architecture design & best practices\n` +
                `🔹 Security, scalability & cost efficiency\n` +
                `🔹 End-to-end practical execution\n\n` +
                `Continuous learning in action. 🚀\n\n` +
                hashtagLine,

                `Certified: ${title}${scoreText} ✅\n\n` +
                `Gained comprehensive domain expertise in modern ${topicName}. Excited to leverage these capabilities in current and future projects.\n\n` +
                hashtagLine,

                `Update: Formally achieved ${title}${scoreText}.\n\n` +
                `• Validated deep knowledge in ${topicName}\n` +
                `• Ready for production implementation\n` +
                `• Moving forward to the next technical objective\n\n` +
                hashtagLine
            ];
            return variations[v];
        }

        case 'Professional':
        default: {
            const variations = [
                `🎓 Thrilled to announce that I have successfully earned the ${title} certification${scoreText}${providerText}!\n\n` +
                `Over the past several weeks, I have immersed myself in mastering key concepts and industry standards across ${topicName}.\n\n` +
                `Key Competencies & Practical Takeaways:\n` +
                `🔹 ${bullets[0]}\n` +
                `🔹 ${bullets[1]}\n` +
                `🔹 ${bullets[2]}\n\n` +
                `A sincere thank you to my mentors, colleagues, and the broader tech community for the resources, guidance, and continuous support throughout the journey.\n\n` +
                `Excited to apply these refined skills to deliver resilient, scalable, and high-impact solutions for my team and clients!\n\n` +
                hashtagLine,

                `Excited to share a major professional milestone: I am now officially certified in ${title}${scoreText}!\n\n` +
                `This certification provided in-depth validation of critical technical frameworks, emphasizing real-world problem solving and modern engineering best practices.\n\n` +
                `Core Focus Areas:\n` +
                `1. Strategic Architecture: Designing systems built for performance, resilience, and growth.\n` +
                `2. Operational Excellence: Streamlining workflows while upholding strict security standards.\n` +
                `3. Business Impact: Translating cutting-edge technical capabilities into tangible organizational value.\n\n` +
                `Looking forward to collaborating with peers in the ${topicName} space and putting these principles into action!\n\n` +
                hashtagLine,

                `Proud to share that I have completed the requirements and earned ${title}${scoreText}${providerText}.\n\n` +
                `Continuous upskilling is essential in our fast-evolving technology landscape. This credential deepens my ability to design, deploy, and manage production-grade systems with confidence.\n\n` +
                `Highlights from the curriculum:\n` +
                `• Deep dive into modern ${topicName} paradigms\n` +
                `• Real-world scenario testing and performance benchmarks\n` +
                `• Implementation of industry-standard security and compliance protocols\n\n` +
                `Grateful for the journey and enthusiastic about the opportunities ahead.\n\n` +
                hashtagLine,

                `Professional Milestone: Awarded ${title}${scoreText}.\n\n` +
                `Mastering these advanced principles has strengthened my perspective on delivering robust solutions that scale seamlessly.\n\n` +
                `Key takeaways:\n` +
                `🔹 Practical scenario mastery ensures sound architectural decisions.\n` +
                `🔹 Security and optimization must be embedded from day zero.\n` +
                `🔹 Structured learning accelerates professional execution.\n\n` +
                `Always open to exchanging insights with fellow engineers and leaders working in this domain!\n\n` +
                hashtagLine
            ];
            return variations[v];
        }
    }
}

// -------------------------------------------------------------
// 2. JOB & PROMOTION DETAILS & SYNTHESIS
// -------------------------------------------------------------
function extractJobDetails(text) {
    const raw = (text || '').trim();
    let company = "an exciting new organization";
    const compMatch = raw.match(/(?:at|with|joined|joining)\s+([A-Z][A-Za-z0-9&]+(?:\s+[A-Z][A-Za-z0-9&]+)?)/);
    if (compMatch) company = compMatch[1];

    let role = "Software Professional";
    const roleMatch = raw.match(/(?:as|role of|position of)\s+(?:a\s+|an\s+)?([A-Za-z\s]+?)(?:\s+(?:at|with|in)|[\.\,\!]|$)/i);
    if (roleMatch && roleMatch[1].trim().length > 3) {
        role = roleMatch[1].trim();
    }

    const tags = ['#NewRole', '#CareerGrowth', '#TechCareers', '#Milestone', '#Leadership'].join(' ');
    return { company, role, hashtagLine: tags };
}

function synthesizeJobPost(details, style, variationIndex) {
    const { company, role, hashtagLine } = details;
    const v = Math.abs(parseInt(variationIndex, 10) || 0) % 4;

    const variations = [
        `🎉 Thrilled to announce that I have joined ${company} as a ${role}!\n\n` +
        `I’m deeply excited to embark on this new chapter and collaborate with an incredible group of talented individuals.\n\n` +
        `In this role, my primary focus will be:\n` +
        `🔹 Delivering scalable, high-impact solutions that solve real user problems\n` +
        `🔹 Driving engineering excellence and technical innovation across our stack\n` +
        `🔹 Partnering with cross-functional teams to build the future of our product\n\n` +
        `A huge thank you to everyone who supported, advised, and encouraged me along the way.\n\n` +
        `Excited for the journey ahead! Let’s connect and create great things together.\n\n` +
        hashtagLine,

        `Excited to share a major update: starting my next adventure as a ${role} at ${company}! 🚀\n\n` +
        `Looking forward to tackling ambitious engineering challenges, learning from visionary leaders, and building technology that makes a measurable difference.\n\n` +
        `Grateful for all the past experiences and incredible colleagues who helped prepare me for this moment.\n\n` +
        `Here’s to new beginnings and continuous growth!\n\n` +
        hashtagLine,

        `New chapter begins today: officially on board at ${company} as a ${role}! ✨\n\n` +
        `From the initial conversations to meeting the team, the vision, culture, and passion here made this an easy decision.\n\n` +
        `Ready to dive in, build, and make meaningful contributions from day one!\n\n` +
        hashtagLine,

        `Career Milestone 🎯: Proud to announce my new position as a ${role} with ${company}.\n\n` +
        `Focused on:\n` +
        `• Pushing the boundaries of quality and scalability\n` +
        `• Continuous learning in high-velocity environments\n` +
        `• Empowering our community and clients through world-class software\n\n` +
        hashtagLine
    ];

    return variations[v];
}

// -------------------------------------------------------------
// 3. PROJECT LAUNCH DETAILS & SYNTHESIS
// -------------------------------------------------------------
function extractProjectDetails(text) {
    const raw = (text || '').trim();
    const lower = raw.toLowerCase();

    const techTags = [];
    if (/react/i.test(lower)) techTags.push('React');
    if (/node/i.test(lower)) techTags.push('Node.js');
    if (/mongo/i.test(lower)) techTags.push('MongoDB');
    if (/python/i.test(lower)) techTags.push('Python');
    if (/ai|llm|gpt/i.test(lower)) techTags.push('Generative AI');
    if (/tailwind/i.test(lower)) techTags.push('TailwindCSS');
    if (/next/i.test(lower)) techTags.push('Next.js');

    const techStack = techTags.length > 0 ? techTags.join(', ') : 'modern full-stack technologies';
    const hashtags = ['#WebDevelopment', '#SoftwareEngineering', '#Coding', '#Innovation', '#OpenSource'].join(' ');

    return { raw, techStack, hashtagLine: hashtags };
}

function synthesizeProjectPost(details, style, variationIndex) {
    const { raw, techStack, hashtagLine } = details;
    const v = Math.abs(parseInt(variationIndex, 10) || 0) % 4;

    const variations = [
        `🚀 Excited to officially launch my latest project!\n\n` +
        `Overview:\n${raw}\n\n` +
        `🛠️ Tech Stack & Architecture:\n` +
        `🔹 Built with ${techStack}\n` +
        `🔹 Engineered for optimal performance, responsiveness, and clean architecture\n` +
        `🔹 Designed with intuitive user experience and robust security at its core\n\n` +
        `Building this from concept to deployment provided valuable lessons in iterative design and full-stack problem solving.\n\n` +
        `Would love to get feedback, suggestions, or ideas from the developer community! Drop your thoughts below. 👇\n\n` +
        hashtagLine,

        `Just shipped! ✨ Thrilled to unveil what I’ve been building:\n\n` +
        `${raw}\n\n` +
        `Key Technical Highlights:\n` +
        `• Clean, decoupled architecture using ${techStack}\n` +
        `• Fast rendering and optimized API data-fetching pipelines\n` +
        `• Production-ready resilience and clean error handling\n\n` +
        `Always a thrill taking an idea from a blank editor to a working product. Check it out and let me know what you think!\n\n` +
        hashtagLine,

        `Building software that solves real problems is my favorite part of engineering. 💡\n\n` +
        `Sharing my latest project release: ${raw}.\n\n` +
        `Core Learnings:\n` +
        `1. Start with a solid architectural foundation\n` +
        `2. Prioritize user friction reduction over vanity features\n` +
        `3. Rapid feedback loops make every release better\n\n` +
        hashtagLine,

        `Project Showcase 🛠️: ${raw}\n\n` +
        `• Stack: ${techStack}\n` +
        `• Scalable state management and responsive styling\n` +
        `• Ready for feedback and future iterations\n\n` +
        hashtagLine
    ];

    return variations[v];
}

// -------------------------------------------------------------
// 4. GENERAL CONTENT SYNTHESIS
// -------------------------------------------------------------
function synthesizeGeneralPost(notes, style, variationIndex) {
    const raw = (notes || '').trim();
    const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const mainIdea = lines[0] || raw || 'professional development and ongoing engineering projects';
    const v = Math.abs(parseInt(variationIndex, 10) || 0) % 4;
    const hashtagLine = '#ProfessionalGrowth #ContinuousLearning #Networking #Technology';

    const variations = [
        `Excited to share some reflections regarding ${mainIdea.toLowerCase()}.\n\n` +
        `Key insights and takeaways:\n\n` +
        `🔹 Strategic Alignment: Focusing on core value drivers leads to sustainable impact.\n` +
        `🔹 Iterative Excellence: Continuous adaptation and rigorous execution elevate quality at every stage.\n` +
        `🔹 Collaborative Momentum: Sharing knowledge across teams accelerates problem-solving and innovation.\n\n` +
        `Looking forward to continuing this momentum and connecting with peers working on similar initiatives.\n\n` +
        `What are your perspectives on this? Let's discuss in the comments below! 👇\n\n` +
        hashtagLine,

        `Driving meaningful impact in ${mainIdea.toLowerCase()}:\n\n` +
        `When executing complex projects, three strategic pillars make all the difference:\n` +
        `1. User-Centric Focus: Prioritizing real feedback to shape deliverables.\n` +
        `2. Operational Velocity: Streamlining workflows to reduce friction and ship faster.\n` +
        `3. Long-term Scalability: Building robust foundations that grow seamlessly with demand.\n\n` +
        `Proud of the progress achieved so far. How are you approaching these priorities in your current work?\n\n` +
        hashtagLine,

        `Professional update regarding ${mainIdea.toLowerCase()}:\n\n` +
        `As our industry rapidly evolves, staying ahead requires a proactive approach to continuous learning and technical agility.\n\n` +
        `Key Highlights:\n` +
        `• Successfully deployed core enhancements with zero downtime.\n` +
        `• Improved collaboration and delivery cycles across stakeholders.\n` +
        `• Established measurable benchmarks for ongoing performance tracking.\n\n` +
        hashtagLine,

        `Navigating modern challenges in ${mainIdea.toLowerCase()}:\n\n` +
        `The intersection of strategy, disciplined execution, and modern tooling is where real value is created.\n\n` +
        `Key Takeaway: Rather than over-engineering upfront, start with a resilient MVP, gather actionable data, and scale with confidence.\n\n` +
        hashtagLine
    ];

    return variations[v];
}

// Master synthesizer entry point
function synthesizePost(notes, style = 'Professional', variationIndex = 0) {
    const intent = detectIntent(notes);

    if (intent === 'CERTIFICATION') {
        const details = extractCertDetails(notes);
        return synthesizeCertPost(details, style, variationIndex);
    }

    if (intent === 'JOB_PROMOTION') {
        const details = extractJobDetails(notes);
        return synthesizeJobPost(details, style, variationIndex);
    }

    if (intent === 'PROJECT_LAUNCH') {
        const details = extractProjectDetails(notes);
        return synthesizeProjectPost(details, style, variationIndex);
    }

    return synthesizeGeneralPost(notes, style, variationIndex);
}

module.exports = {
    synthesizePost,
    detectIntent,
    extractCertDetails,
    extractJobDetails,
    extractProjectDetails
};
