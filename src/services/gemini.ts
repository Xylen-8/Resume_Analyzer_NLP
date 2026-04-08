import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("GEMINI_API_KEY environment variable is required. Check your .env file.");
}
const genAI = new GoogleGenerativeAI(apiKey);

export interface ResumeAnalysisResult {
  extracted_data: {
    name: string;
    email: string;
    phone: string;
    skills: { name: string; category: "Technical" | "Soft" | "Tool" }[];
    education: string[];
    experience_summary: string;
  };
  ats_analysis: {
    score: number;
    decision: "Shortlisted" | "Not Shortlisted";
    strengths: string[];
    gaps: string[];
    improvement_suggestions: string[];
  };
  grammar_check: {
    score: number;
    issues: { original: string; suggestion: string; reason: string }[];
    summary: string;
  };
  suggested_roles: {
    title: string;
    reason: string;
    match_score: number;
  }[];
  performance_analytics: {
    skill_gap_analysis: string;
    industry_readiness: number;
  };
  certifications: {
    name: string;
    issuer: string;
    date?: string;
    reputation_score: number;
    verification_summary?: string;
    audit_links: {
      google_search: string;
      linkedin_search: string;
      official_registry?: string;
    };
    is_premium_provider: boolean;
    is_indian_institute: boolean;
  }[];
}

export async function analyzeResume(
  resumeInput: string | { data: string; mimeType: string },
  jobDescription?: string
): Promise<ResumeAnalysisResult> {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ],
  });

  const resumePart = typeof resumeInput === 'string' 
    ? resumeInput 
    : `Resume image/PDF: mimeType=${resumeInput.mimeType}`;

  const isGeneralAnalysis = !jobDescription || jobDescription.trim().length === 0;
  
  const fullPrompt = isGeneralAnalysis 
    ? `Analyze this resume for career assessment:

Resume:
${resumePart}

Respond ONLY with valid JSON in this EXACT format (no extra text, markdown, or explanations):

{
  "extracted_data": {
    "name": "Full Name",
    "email": "email@example.com",
    "phone": "+1234567890",
    "skills": [{"name": "React", "category": "Technical"}, {"name": "Communication", "category": "Soft"}],
    "education": ["Bachelor of Science in Computer Science, University XYZ, 2020"],
    "experience_summary": "3 years experience as software engineer"
  },
  "ats_analysis": {
    "score": 85,
    "decision": "Shortlisted",
    "strengths": ["Strong technical foundation", "Relevant projects"],
    "gaps": ["Limited senior-level experience"],
    "improvement_suggestions": ["Quantify achievements", "Add metrics to projects"]
  },
  "grammar_check": {
    "score": 92,
    "issues": [{"original": "grammer error", "suggestion": "grammar error", "reason": "Spelling"}],
    "summary": "Mostly clean, minor typos"
  },
  "suggested_roles": [
    {"title": "Frontend Developer", "reason": "Strong React skills match demand", "match_score": 90},
    {"title": "Full Stack Engineer", "reason": "Balanced technical skills", "match_score": 82}
  ],
  "performance_analytics": {
    "skill_gap_analysis": "Excellent frontend, develop backend/database skills",
    "industry_readiness": 87
  },
  "certifications": [
    {
      "name": "React Developer Certificate",
      "issuer": "Udemy",
      "reputation_score": 75,
      "verification_summary": "Common online cert from popular platform",
      "audit_links": {
        "google_search": "https://google.com/search?q=Name+React+Udemy+certificate",
        "linkedin_search": "https://linkedin.com/search?q=Name+React+Udemy"
      },
      "is_premium_provider": false,
      "is_indian_institute": false
    }
  ]
}`
    : `Analyze resume vs job description for ATS:

JOB: ${jobDescription}

Resume:
${resumePart}

Respond ONLY with parseable JSON matching above structure. Use job-specific analysis.`;

  const result = await model.generateContent(fullPrompt);
  const response = await result.response;
  const text = response.text();
  if (!text) throw new Error("No response from AI");
  return JSON.parse(text);
}
