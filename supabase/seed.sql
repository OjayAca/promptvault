insert into public.prompts (id, title, category, access, status, purpose, prompt, best_for, tags)
values
(1, 'Research Title Generator', 'Students', 'Free', 'Published', 'Generates 10 possible research titles for students.', 'Act as a research adviser. Suggest 10 possible research titles about [TOPIC]. Make the titles clear, specific, and suitable for [GRADE/YEAR LEVEL]. Include qualitative, quantitative, and mixed-method title options.', 'Thesis, research proposals, action research.', array['research','thesis','titles']),
(2, 'Facebook Promo Caption Generator', 'Business', 'Free', 'Published', 'Creates promotional Facebook captions for small businesses.', 'Act as a social media copywriter. Create 5 Facebook captions for [PRODUCT/SERVICE]. The target customers are [TARGET AUDIENCE]. Use a friendly and persuasive tone. Include a short call-to-action and make the captions suitable for a small business page.', 'Facebook posts, product launches, promos.', array['facebook','caption','promo']),
(3, 'Quiz Generator', 'Teachers', 'Free', 'Published', 'Creates a ready-to-use quiz on any topic.', 'Act as a teacher. Create a [NUMBER]-item quiz about [TOPIC] for [GRADE LEVEL] students. Include multiple choice, true/false, and identification questions. Provide an answer key at the end.', 'Formative assessments, review activities.', array['quiz','assessment','school']),
(4, '30-Day Content Calendar', 'Social Media', 'Premium', 'Published', 'Plans an entire month of social media content.', 'Act as a content strategist. Create a 30-day social media content calendar for [BRAND/BUSINESS]. Include post topics, content types, captions, and hashtags for [PLATFORM]. The target audience is [TARGET AUDIENCE]. Tone: [TONE].', 'Social media managers, brand accounts, businesses.', array['calendar','content','social']),
(5, 'Upwork Proposal Writer', 'Freelancers', 'Free', 'Published', 'Writes a compelling Upwork job proposal.', 'Act as a freelance career coach. Write a professional Upwork proposal for a [JOB TYPE] position. My skills include [YOUR SKILLS]. My relevant experience is [EXPERIENCE]. Keep the tone confident, client-focused, and under 200 words.', 'Upwork, Fiverr, OnlineJobs.ph profiles.', array['upwork','proposal','freelance']),
(6, 'Business Proposal Writer', 'Business', 'Premium', 'Published', 'Drafts a professional business proposal.', 'Act as a business consultant. Write a professional business proposal for [BUSINESS NAME] offering [PRODUCT/SERVICE] to [TARGET CLIENT]. Include an executive summary, scope of work, timeline, pricing, and a closing statement. Tone: formal and persuasive.', 'Pitches, partnerships, client acquisitions.', array['proposal','sales','business']),
(7, 'Taglish Blog Outline', 'Writing', 'Premium', 'Published', 'Creates a structured conversational Taglish outline for Filipino blogs.', 'Act as a Pinoy content strategist. Design a detailed outline for a Taglish blog post focusing on [TOPIC]. Tone should be extremely engaging, conversational, and culturally relatable (''lifestyle Pinoy''). Add hook variations.', 'Lifestyle blogging, Pinoy social publishers.', array['taglish','blog','writing']),
(8, 'Daily Scrum Standup Planner', 'Productivity', 'Free', 'Published', 'Formats unstructured daily logs into logical, neat standup summaries.', 'Act as a remote product assistant. Convert this raw day log: [YESTERDAY_TASKS], and [TODAY_TRACKS] into an elegant engineering standup note. Clearly list [BLOCKERS] separately.', 'Remote work, corporate virtual assistants.', array['standup','productivity','remote']),
(9, 'GCash Promo SMS Campaign', 'Marketing', 'Premium', 'Published', 'Writes punchy, short local SMS offers announcing GCash mobile payments.', 'Act as a mobile copywriter. Generate 3 variants of high-converting SMS ads for [CAMPAIGN_NAME] targeting [TARGET_AUDIENCE]. Explicitly detail GCash discount payouts. Max 140 chars.', 'E-Commerce retail, local bakeries, tech services.', array['gcash','sms','marketing']),
(10, 'RRL Academic Synthesizer', 'Research', 'Free', 'Published', 'Synthesizes scientific abstracts on similar gaps into an APA literature segment.', 'Act as a systematic research advisor. Synthesize these abstracts: [ABSTRACT_A] & [ABSTRACT_B] focusing on resolving [RESEARCH_GAP] under strict APA 7th layout rules.', 'Undergrad, masteral and doctoral college thesis.', array['rrl','apa','research']),
(11, 'Gentle Delayed Invoice Mail', 'Email', 'Free', 'Published', 'Drafts polite but highly professional follow-ups on overdue freelance billing.', 'Act as small agency director. Write a firm, collaborative follow-up email requesting prompt clearing status for invoice [ID] by client [CLIENT_NAME] with Philippine hospitality politeness.', 'Independent contractors, remote developers.', array['email','invoice','follow-up']),
(12, 'Lesson Plan Constructor', 'Teachers', 'Premium', 'Published', 'Assembles structured lesson matrices with instructional targets.', 'Act as curriculum planner. Draft an official lesson outline plan concerning [TOPIC] designed for [GRADE_LEVEL] following 4As (Activity, Analysis, Abstraction, Application) mechanics.', 'Primary and secondary school structures.', array['lesson plan','4as','teachers']),
(13, 'TikTok Hook Hookmaster', 'Social Media', 'Premium', 'Published', 'Assembles 5 scroll-stopping viral video hook sentences.', 'Act as TikTok analytics producer. Create 5 engaging video hook options for a [VIDEO_TOPIC] that Filipino students or workers would relate to instantly. Limit each to 1 line.', 'Local brand creators, influencers, UGC creators.', array['tiktok','hooks','ugc'])
on conflict (id) do update set
  title = excluded.title,
  category = excluded.category,
  access = excluded.access,
  status = excluded.status,
  purpose = excluded.purpose,
  prompt = excluded.prompt,
  best_for = excluded.best_for,
  tags = excluded.tags,
  updated_at = now();

select setval(
  pg_get_serial_sequence('public.prompts', 'id'),
  (select max(id) from public.prompts),
  true
);

select setval(pg_get_serial_sequence('public.prompts', 'id'), (select max(id) from public.prompts));
