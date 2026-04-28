/* ============================================================
   RESUME AI — All AI Prompt Templates
   ============================================================ */

export const RESUME_GENERATION_PROMPT = (userData, jobDescription) => {
  const isStrict = userData.genMode === "strict";
  const modeInstructions = isStrict
    ? "STRICT FORMATTING MODE: DO NOT invent, rewrite, or artificially enhance the candidate's bullet points. Focus entirely on professional alignment and perfect formatting. Extract EXACTLY the descriptions they provided."
    : "AI ENHANCED MODE (CRITICAL: 90+ ATS SCORE MANDATORY): You MUST aggressively rewrite every single bullet point. Your goal is a 100% match for the top keywords in the job description. Use the 'X-Y-Z formula' (Accomplished [X] as measured by [Y], by doing [Z]). If the user didn't provide numbers, use your industry expertise to estimate realistic, high-impact metrics (e.g., 'increased efficiency by 25%', 'reduced latency by 40ms'). This is non-negotiable for a 90+ score.";

  const toneInstruction = userData.tone === "human" 
    ? "HUMANIZER VOICE: Avoid all common AI buzzwords like 'Synergy', 'Leveraged', or 'Spearheaded'. Use natural, varied sentence structures. Write like a real person describing their pride in their work, not like a template. Focus on situational context."
    : userData.tone === "balanced"
    ? "BALANCED VOICE: Blend professional ATS keyword optimization with readable, natural phrasing. Professional but not robotic."
    : "ATS-HEAVY VOICE: Prioritize keyword density and rigid professional structures above all else. Focus on clinical efficiency.";

  return `
You are an elite ATS Resume Expert with 20+ years of experience.
${modeInstructions}
${toneInstruction}
Your task is to generate a highly professional, ATS-optimized resume.

## GENERATION MODE:
${modeInstructions}

## STRICT RULES:
1. ATS Score MUST be realistically calculated, but aim for 90+ in Enhanced mode.
2. Use STRONG action verbs, especially in Enhanced mode.
3. Quantifiable results are critical for high ATS scores.
4. Match keywords from the Job Description below.
5. NO tables, NO columns, NO graphics (ATS cannot read them).
6. Use standard section headers: Summary, Experience, Education, Skills.
7. Keep formatting clean: bullet points, plain text only.

## USER DATA:
${JSON.stringify(userData, null, 2)}

## JOB DESCRIPTION (Extract keywords from this):
${jobDescription || "General professional resume"}

## OUTPUT FORMAT (Return ONLY valid JSON, no markdown, no code blocks):
{
  "personalInfo": {
    "fullName": "",
    "email": "",
    "phone": "",
    "location": "",
    "linkedin": "",
    "portfolio": ""
  },
  "summary": "3-4 powerful sentences with keywords",
  "experience": [
    {
      "title": "",
      "company": "",
      "location": "",
      "startDate": "",
      "endDate": "",
      "current": false,
      "bullets": [
        "Action verb + task + quantified result",
        "Action verb + task + quantified result",
        "Action verb + task + quantified result"
      ]
    }
  ],
  "education": [
    {
      "degree": "",
      "field": "",
      "institution": "",
      "graduationYear": "",
      "gpa": ""
    }
  ],
  "skills": {
    "technical": [],
    "soft": [],
    "tools": [],
    "languages": []
  },
  "certifications": [],
  "projects": [],
  "atsScore": 95,
  "keywords_used": [],
  "improvements_made": []
}
`;
};

export const INTERVIEW_QUESTIONS_PROMPT = (userData, jobDescription) => `
You are famously known as the most rigorous, elite Head of Talent & Technical Hiring Manager for FAANG/Fortune 100 companies.
Generate a high-stakes, extremely realistic interview simulation for this candidate. Do NOT ask generic, boring questions.

## CANDIDATE PROFILE:
${JSON.stringify({
  name: userData.fullName,
  targetRole: userData.targetRole,
  yearsExp: userData.yearsOfExperience,
  topSkills: userData.skills?.technical?.slice(0, 8),
  recentRoles: userData.experience?.map(e => ({ title: e.title, company: e.company })),
}, null, 2)}

## JOB DESCRIPTION:
${jobDescription || "General professional role"}

Generate exactly 5 behavioral and 5 technical/role-specific questions.
RULES:
1. Behavioral questions must involve real-world tension (e.g., missed deadlines, toxic stakeholders, complete architectural failure).
2. Technical questions must be complex scenario-based systems or domain questions, NOT textbook trivia. "How would you design..." or "We are facing this exact production bug..."
3. Sample answers must be masterclass-level responses using the STAR format, showing deep maturity and expertise.

## OUTPUT FORMAT (Return ONLY valid JSON, no markdown):
{
  "behavioral": [
    {
      "question": "[Tense, high-stakes situational question here]",
      "why": "I ask this to see if you crack under pressure or blame others when...",
      "tip": "Do not give a fake weakness. Explain exactly how you mitigated disaster by...",
      "sampleAnswer": "In my previous role, our main deployment broke 2 hours before a major launch. I handled it by..."
    }
  ],
  "technical": [
    {
      "question": "[Complex domain-specific scenario or architecture design question]",
      "why": "This tests if you understand scalability and trade-offs rather than just knowing syntax.",
      "tip": "Acknowledge the trade-offs immediately. If you choose X over Y, explain the memory/time complexity costs.",
      "sampleAnswer": "To approach this system, I would separate the ingestion layer via Kafka to ensure..."
    }
  ]
}
`;

export const ATS_ANALYSIS_PROMPT = (resume, jobDescription) => `
You are an expert ATS (Applicant Tracking System) analyst at a top recruiting firm.
Perform a detailed, category-by-category ATS analysis of this resume vs. the job description.

## RESUME:
${JSON.stringify(resume, null, 2)}

## JOB DESCRIPTION:
${jobDescription || "General professional role"}

Be honest and accurate. Do NOT inflate scores.

## OUTPUT FORMAT (Return ONLY valid JSON, no markdown):
{
  "overallScore": 94,
  "categories": {
    "keywords": { "score": 28, "max": 30, "feedback": "Excellent keyword density. Most job-critical terms present." },
    "format":   { "score": 18, "max": 20, "feedback": "Clean, ATS-readable format. No tables or columns detected." },
    "skills":   { "score": 23, "max": 25, "feedback": "Strong skills alignment with job requirements." },
    "experience": { "score": 13, "max": 15, "feedback": "Well-quantified achievements. Relevant seniority level." },
    "education":  { "score": 8,  "max": 10, "feedback": "Relevant degree present." }
  },
  "matchedKeywords": ["React", "Node.js", "Agile", "REST API"],
  "missingKeywords": ["Kubernetes", "GraphQL", "Terraform"],
  "topRecommendations": [
    "Add 'Kubernetes' to skills — it appears 4 times in the JD",
    "Quantify your education section with GPA or honors if applicable",
    "Add a LinkedIn URL to the contact section"
  ],
  "passedChecks": [
    "No tables or multi-column layout",
    "Standard section headers used (Experience, Education, Skills)",
    "Strong action verbs throughout",
    "Contact information complete"
  ]
}
`;

export const LINKEDIN_SUMMARY_PROMPT = (userData, targetRole) => `
Write a compelling, optimized LinkedIn 'About' section for this professional.

## PROFILE:
Name: ${userData.fullName}
Target Role: ${targetRole || userData.targetRole}
Years of Experience: ${userData.yearsOfExperience}
Top Skills: ${userData.skills?.technical?.slice(0, 8)?.join(", ")}
Recent Role: ${userData.experience?.[0]?.title} at ${userData.experience?.[0]?.company}
Education: ${userData.education?.[0]?.degree} in ${userData.education?.[0]?.field}

## RULES:
- 3-4 paragraphs, max 280 words
- Start with a powerful hook — NOT "I am a..." or "Experienced professional..."
- Include passion, personality and what drives you
- Mention 2-3 key quantified achievements
- End with what you are open to / looking for
- Use emojis sparingly (2-3 only) where natural
- Write in first person ("I")
- Rich with keywords for LinkedIn search ranking

Return ONLY the LinkedIn About text. No labels, no headers.
`;

export const SKILLS_GAP_PROMPT = (userData, jobDescription) => `
You are a senior career development coach. Analyze the skills gap between this candidate and the job.

## CANDIDATE SKILLS:
Technical: ${userData.skills?.technical?.join(", ") || "None listed"}
Soft: ${userData.skills?.soft?.join(", ") || "None listed"}
Tools: ${userData.skills?.tools?.join(", ") || "None listed"}
Certifications: ${userData.certifications?.join(", ") || "None"}
Years of Experience: ${userData.yearsOfExperience}

## JOB DESCRIPTION:
${jobDescription || "General professional role"}

## OUTPUT FORMAT (Return ONLY valid JSON, no markdown):
{
  "matchScore": 78,
  "strongMatches": ["Python", "REST APIs", "Team Leadership"],
  "partialMatches": [
    { "skill": "Docker", "note": "You know containers conceptually — learn Docker CLI specifically" }
  ],
  "gapSkills": [
    {
      "skill": "Kubernetes",
      "priority": "High",
      "learnIn": "2-3 months",
      "resource": "Kubernetes official docs + CKA certification course"
    }
  ],
  "strengths": [
    "Exceeds requirements in backend development",
    "Strong foundation in cloud technologies"
  ],
  "actionPlan": [
    "Week 1-2: Start with Docker fundamentals on Docker's official docs",
    "Week 3-4: Move to Kubernetes basics via KodeKloud",
    "Month 2: Complete a hands-on Kubernetes project for your portfolio",
    "Month 3: Attempt the CKA certification exam"
  ]
}
`;

export const COVER_LETTER_PROMPT = (resume, jobDescription, companyName) => `
Write a professional, compelling cover letter based on this resume and job description.

RESUME SUMMARY: ${resume.summary}
TOP SKILLS: ${JSON.stringify(resume.skills)}
MOST RECENT ROLE: ${resume.experience?.[0]?.title} at ${resume.experience?.[0]?.company}
JOB DESCRIPTION: ${jobDescription}
TARGET COMPANY: ${companyName}

RULES:
- 3 paragraphs only
- Paragraph 1: Power opening hook + why this exact role excites you
- Paragraph 2: 2 specific achievements from experience + how they match the role
- Paragraph 3: Enthusiasm + clear call to action
- Professional but warm, personable tone
- Max 280 words
- Do NOT start with "I am writing to..."

Return ONLY the cover letter text. No greeting, no sign-off labels.
`;

export const BULLET_OPTIMIZER_PROMPT = (weakBullet, role) => `
You are an expert resume writer.
Transform this weak bullet point into a powerful, ATS-optimized achievement statement.

WEAK BULLET: "${weakBullet}"
TARGET ROLE: "${role}"

RULES:
- Start with a strong action verb (past tense)
- Add quantifiable results (use numbers, %, $ or estimated impact)
- Keep it under 20 words
- Make it ATS-friendly and impactful

Return ONLY the improved bullet point as plain text. No explanation.
`;

export const SUMMARY_PROMPT = (userData, role) => `
Write a professional resume summary for:
Name: ${userData.fullName || userData.name}
Role: ${role}
Experience: ${userData.yearsOfExperience} years
Top Skills: ${userData.topSkills?.join(", ")}

RULES:
- 3 sentences maximum
- Sentence 1: Job title + years of experience + top domain
- Sentence 2: 2-3 key achievements or skills
- Sentence 3: Value proposition / what you bring to the employer
- NO first person (no "I" or "My")
- ATS-optimized with role keywords

Return ONLY the summary paragraph.
`;
