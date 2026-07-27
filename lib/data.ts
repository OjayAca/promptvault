import type {AudienceSegment, FaqItem, PricingPlan, PromptCategory, PromptItem} from "@/lib/types";

export const categories: Array<"All" | PromptCategory> = [
  "All",
  "Students",
  "Teachers",
  "Business",
  "Social Media",
  "Freelancers",
  "Productivity",
  "Writing",
  "Marketing",
  "Research",
  "Email",
];

export const prompts: PromptItem[] = [
  {
    id: 1,
    title: "Research Title Generator",
    category: "Students",
    access: "Free",
    purpose: "Generates 10 possible research titles for students.",
    prompt:
      "Act as a research adviser. Suggest 10 possible research titles about [TOPIC]. Make the titles clear, specific, and suitable for [GRADE/YEAR LEVEL]. Include qualitative, quantitative, and mixed-method title options.",
    bestFor: "Thesis, research proposals, action research.",
    tags: ["research", "thesis", "titles"],
  },
  {
    id: 2,
    title: "Facebook Promo Caption Generator",
    category: "Business",
    access: "Free",
    purpose: "Creates promotional Facebook captions for small businesses.",
    prompt:
      "Act as a social media copywriter. Create 5 Facebook captions for [PRODUCT/SERVICE]. The target customers are [TARGET AUDIENCE]. Use a friendly and persuasive tone. Include a short call-to-action and make the captions suitable for a small business page.",
    bestFor: "Facebook posts, product launches, promos.",
    tags: ["facebook", "caption", "promo"],
  },
  {
    id: 3,
    title: "Quiz Generator",
    category: "Teachers",
    access: "Free",
    purpose: "Creates a ready-to-use quiz on any topic.",
    prompt:
      "Act as a teacher. Create a [NUMBER]-item quiz about [TOPIC] for [GRADE LEVEL] students. Include multiple choice, true/false, and identification questions. Provide an answer key at the end.",
    bestFor: "Formative assessments, review activities.",
    tags: ["quiz", "assessment", "school"],
  },
  {
    id: 4,
    title: "30-Day Content Calendar",
    category: "Social Media",
    access: "Premium",
    purpose: "Plans an entire month of social media content.",
    prompt:
      "Act as a content strategist. Create a 30-day social media content calendar for [BRAND/BUSINESS]. Include post topics, content types, captions, and hashtags for [PLATFORM]. The target audience is [TARGET AUDIENCE]. Tone: [TONE].",
    bestFor: "Social media managers, brand accounts, businesses.",
    tags: ["calendar", "content", "social"],
  },
  {
    id: 5,
    title: "Upwork Proposal Writer",
    category: "Freelancers",
    access: "Free",
    purpose: "Writes a compelling Upwork job proposal.",
    prompt:
      "Act as a freelance career coach. Write a professional Upwork proposal for a [JOB TYPE] position. My skills include [YOUR SKILLS]. My relevant experience is [EXPERIENCE]. Keep the tone confident, client-focused, and under 200 words.",
    bestFor: "Upwork, Fiverr, OnlineJobs.ph profiles.",
    tags: ["upwork", "proposal", "freelance"],
  },
  {
    id: 6,
    title: "Business Proposal Writer",
    category: "Business",
    access: "Premium",
    purpose: "Drafts a professional business proposal.",
    prompt:
      "Act as a business consultant. Write a professional business proposal for [BUSINESS NAME] offering [PRODUCT/SERVICE] to [TARGET CLIENT]. Include an executive summary, scope of work, timeline, pricing, and a closing statement. Tone: formal and persuasive.",
    bestFor: "Pitches, partnerships, client acquisitions.",
    tags: ["proposal", "sales", "business"],
  },
  {
    id: 7,
    title: "Taglish Blog Outline",
    category: "Writing",
    access: "Premium",
    purpose: "Creates a structured conversational Taglish outline for Filipino blogs.",
    prompt:
      "Act as a Pinoy content strategist. Design a detailed outline for a Taglish blog post focusing on [TOPIC]. Tone should be extremely engaging, conversational, and culturally relatable ('lifestyle Pinoy'). Add hook variations.",
    bestFor: "Lifestyle blogging, Pinoy social publishers.",
    tags: ["taglish", "blog", "writing"],
  },
  {
    id: 8,
    title: "Daily Scrum Standup Planner",
    category: "Productivity",
    access: "Free",
    purpose: "Formats unstructured daily logs into logical, neat standup summaries.",
    prompt:
      "Act as a remote product assistant. Convert this raw day log: [YESTERDAY_TASKS], and [TODAY_TRACKS] into an elegant engineering standup note. Clearly list [BLOCKERS] separately.",
    bestFor: "Remote work, corporate virtual assistants.",
    tags: ["standup", "productivity", "remote"],
  },
  {
    id: 9,
    title: "GCash Promo SMS Campaign",
    category: "Marketing",
    access: "Premium",
    purpose: "Writes punchy, short local SMS offers announcing GCash mobile payments.",
    prompt:
      "Act as a mobile copywriter. Generate 3 variants of high-converting SMS ads for [CAMPAIGN_NAME] targeting [TARGET_AUDIENCE]. Explicitly detail GCash discount payouts. Max 140 chars.",
    bestFor: "E-Commerce retail, local bakeries, tech services.",
    tags: ["gcash", "sms", "marketing"],
  },
  {
    id: 10,
    title: "RRL Academic Synthesizer",
    category: "Research",
    access: "Free",
    purpose: "Synthesizes scientific abstracts on similar gaps into an APA literature segment.",
    prompt:
      "Act as a systematic research advisor. Synthesize these abstracts: [ABSTRACT_A] & [ABSTRACT_B] focusing on resolving [RESEARCH_GAP] under strict APA 7th layout rules.",
    bestFor: "Undergrad, masteral and doctoral college thesis.",
    tags: ["rrl", "apa", "research"],
  },
  {
    id: 11,
    title: "Gentle Delayed Invoice Mail",
    category: "Email",
    access: "Free",
    purpose: "Drafts polite but highly professional follow-ups on overdue freelance billing.",
    prompt:
      "Act as small agency director. Write a firm, collaborative follow-up email requesting prompt clearing status for invoice [ID] by client [CLIENT_NAME] with Philippine hospitality politeness.",
    bestFor: "Independent contractors, remote developers.",
    tags: ["email", "invoice", "follow-up"],
  },
  {
    id: 12,
    title: "Lesson Plan Constructor",
    category: "Teachers",
    access: "Premium",
    purpose: "Assembles structured lesson matrices with instructional targets.",
    prompt:
      "Act as curriculum planner. Draft an official lesson outline plan concerning [TOPIC] designed for [GRADE_LEVEL] following 4As (Activity, Analysis, Abstraction, Application) mechanics.",
    bestFor: "Primary and secondary school structures.",
    tags: ["lesson plan", "4as", "teachers"],
  },
  {
    id: 13,
    title: "TikTok Hook Hookmaster",
    category: "Social Media",
    access: "Premium",
    purpose: "Assembles 5 scroll-stopping viral video hook sentences.",
    prompt:
      "Act as TikTok analytics producer. Create 5 engaging video hook options for a [VIDEO_TOPIC] that Filipino students or workers would relate to instantly. Limit each to 1 line.",
    bestFor: "Local brand creators, influencers, UGC creators.",
    tags: ["tiktok", "hooks", "ugc"],
  },
];

export const audienceSegments: AudienceSegment[] = [
  {
    name: "Students",
    icon: "GraduationCap",
    description: "Draft academic outputs ethically and shape cleaner thesis proposals.",
    examples: ["Term Essays", "Thesis Titles", "Book Reviewers"],
  },
  {
    name: "Teachers",
    icon: "BookOpen",
    description: "Build lessons, quizzes, structured rubrics, and review activities in minutes.",
    examples: ["Lesson Plans", "Exam Quizzes", "Rubric Outlines"],
  },
  {
    name: "Business",
    icon: "BriefcaseBusiness",
    description: "Create client-ready business outlines, emails, and promo content.",
    examples: ["Pitch Proposals", "Refund Policies", "FAQ Builders"],
  },
  {
    name: "Social Media",
    icon: "Smartphone",
    description: "Build content schedules, video hooks, and higher-converting post copy.",
    examples: ["30-Day Calendars", "Reels/TikTok Hooks", "Ad Copy Drafts"],
  },
  {
    name: "Freelancers",
    icon: "Laptop",
    description: "Write Upwork proposals, client pitches, and cold business intros.",
    examples: ["Job Proposals", "Portfolio Bios", "Cold Outreach"],
  },
];

export const pricingPlans: PricingPlan[] = [
  {
    name: "Free",
    label: "Free Track",
    priceLabel: "PHP 0",
    cadence: "forever",
    description: "Perfect for students and casual AI users starting out.",
    features: ["Free prompts from the launch catalog", "One-click copy", "Category and keyword search"],
    unavailable: ["Premium prompt text remains locked"],
    ctaLabel: "Start for Free",
  },
  {
    name: "Founding",
    label: "Founding Access",
    priceLabel: "PHP 99",
    cadence: "month",
    description: "Launch pricing for early members while the library grows.",
    features: [
      "Every free and premium launch prompt",
      "Catalog additions released during membership",
      "Prompt customization guide",
      "Request-a-Prompt access",
    ],
    highlighted: true,
    ctaLabel: "Join as a Founding Member",
  },
];

export const customizationGuide: FaqItem[] = [
  {
    question: "[TOPIC] - Your actual subject matter",
    answer:
      "Substitute this label with your precise assignment, theme, or research domain. Example: replace [TOPIC] with wastewater treatment solutions in suburban Manila communities.",
  },
  {
    question: "[GRADE LEVEL] - Target scholastic layer",
    answer:
      "Tell the AI the expected writing complexity, lexical variety, and classroom tone. Example: Grade 11 Senior High or College Freshman.",
  },
  {
    question: "[TARGET AUDIENCE] - Customer avatar",
    answer:
      "This adapts copy to the desires, colloquial styles, and struggles of your demographic. Example: working mothers in urban centers looking for quick meals.",
  },
  {
    question: "[TONE] - Creative writing personality",
    answer:
      "Adjusts the emotional and professional balance of sentences. Example: conversational Taglish with high energy, or highly academic, formal, and logical.",
  },
  {
    question: "[BUSINESS NAME] - Brand wrapper",
    answer:
      "Use the exact business or creator name that should appear in the output, then add any product, offer, or service detail the prompt asks for.",
  },
];

export const faqs: FaqItem[] = [
  {
    question: "What AI tools can I use these prompts with?",
    answer:
      "Use them with any standard text-based LLM, including ChatGPT, Google Gemini, Claude, Microsoft Copilot, Meta AI, or local offline models.",
  },
  {
    question: "Are the prompts in Filipino or Taglish?",
    answer:
      "Most launch prompts are drafted in professional English and tuned for Philippine workflows. Some can be customized to request Filipino or Taglish output.",
  },
  {
    question: "How do I access my prompts after subscribing?",
    answer:
      "Sign in to your account, complete checkout from billing, then return to the dashboard. Premium access updates when the payment webhook is received.",
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer:
      "Yes. Cancellation stops future Xendit cycles immediately. Already-paid access continues through the displayed paid-through date.",
  },
  {
    question: "What is the Request-a-Prompt feature?",
    answer:
      "Active Founding members can submit a specific marketing, school, or business format request for future catalog additions.",
  },
  {
    question: "Do you offer student or group discounts?",
    answer:
      "Group options for school faculties and corporate marketing teams are planned as a future billing tier.",
  },
];
