import {
  RESUME_GENERATION_PROMPT,
  COVER_LETTER_PROMPT,
  INTERVIEW_QUESTIONS_PROMPT,
  ATS_ANALYSIS_PROMPT,
  LINKEDIN_SUMMARY_PROMPT,
  SKILLS_GAP_PROMPT,
} from "./prompts/resumePrompt.js";

/* ─── Core caller ─────────────────────────────────────────── */
export const BASE_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? "" 
  : (window.API_URL || "");

async function callGemini(prompt, config = null) {
  let retries = 3;
  let delay = 1500;
  
  while (retries > 0) {
    try {
      const response = await fetch(`${BASE_URL}/api/gemini`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, config }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.error || `API returned ${response.status}`);
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    } catch (e) {
      retries--;
      if (retries === 0) {
        throw new Error("AI is overloaded or unresponsive. Please try again. " + e.message);
      }
      await new Promise(r => setTimeout(r, delay));
      delay *= 2; // exponential backoff
    }
  }
}

/* ─── JSON helper ─────────────────────────────────────────── */
function parseJSON(raw) {
  const cleaned = raw
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/gi, "")
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error("AI returned invalid JSON. Please try again.");
  }
}

/* ─── Public API ──────────────────────────────────────────── */
export async function generateResume(userData, jobDescription) {
  const prompt = RESUME_GENERATION_PROMPT(userData, jobDescription);
  const raw = await callGemini(prompt);
  return parseJSON(raw);
}

export async function generateCoverLetter(resume, jobDescription, companyName) {
  const prompt = COVER_LETTER_PROMPT(resume, jobDescription, companyName);
  return await callGemini(prompt);
}

export async function generateInterviewQuestions(userData, jobDescription) {
  const prompt = INTERVIEW_QUESTIONS_PROMPT(userData, jobDescription);
  const raw = await callGemini(prompt);
  return parseJSON(raw);
}

export async function analyzeATSDetailed(resume, jobDescription) {
  const prompt = ATS_ANALYSIS_PROMPT(resume, jobDescription);
  const raw = await callGemini(prompt);
  return parseJSON(raw);
}

export async function generateLinkedInSummary(userData, targetRole) {
  const prompt = LINKEDIN_SUMMARY_PROMPT(userData, targetRole);
  return await callGemini(prompt);
}

export async function analyzeSkillsGap(userData, jobDescription) {
  const prompt = SKILLS_GAP_PROMPT(userData, jobDescription);
  const raw = await callGemini(prompt);
  return parseJSON(raw);
}
