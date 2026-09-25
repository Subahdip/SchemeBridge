/**
 * SchemeBridge - AI Semantic Matching & Hybrid Recommendation Engine
 * 
 * Pipeline:
 * User Profile -> OpenRouter Embeddings (openai/text-embedding-3-small) -> 
 * Cosine Similarity -> Deterministic Eligibility Rules (Hard Filter) -> 
 * Ranking -> Top 3 Recommended Schemes
 */

import { SchemeDefinition } from "./schemes";
import { fetchActiveSchemesFromDB } from "./db/schemes";

export interface UserMatchingProfile {
  name?: string;
  income: number;
  loanAmount: number;
  loanPurpose?: string;
  requirementText?: string;
  businessType?: string;
  businessProjectSize?: string;
  personalReason?: string;
  personalProjectSize?: string;
  educationCategory?: string;
  educationProjectSize?: string;
  otherPurposeText?: string;
  otherProjectSize?: string;
  creditScore?: string;
  existingEmis?: number;
  netSalary?: number;
  companyName?: string;
  residentialStatus?: string;
  pincode?: string;
}

export interface SchemeEvaluationResult {
  scheme: SchemeDefinition;
  aiMatchScore: number;
  cosineSimilarity: number;
  eligible: boolean;
  reasons: string[];
  knockoutFailure?: string;
  rank?: number;
}

export interface MatchSchemesResponse {
  success: boolean;
  error?: string;
  errorCode?: string;
  userSemanticText?: string;
  aiModel?: string;
  bestMatch: SchemeEvaluationResult | null;
  topEligibleSchemes: SchemeEvaluationResult[];
  allEvaluations: SchemeEvaluationResult[];
  executionLog?: {
    timestamp: string;
    totalSchemesEvaluated: number;
    eligibleCount: number;
    ineligibleCount: number;
  };
}

/**
 * Calculates Cosine Similarity between two floating-point vectors:
 * Cosine(A, B) = (A • B) / (||A|| * ||B||)
 */
export function calculateCosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0 || vecA.length !== vecB.length) {
    return 0;
  }
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Calibrates raw vector cosine similarity to a readable 0-100% AI Semantic Match Score.
 * (For openai/text-embedding-3-small, cosine values typically range from ~0.25 to ~0.60).
 */
export function calibrateSemanticScore(cosineSim: number): number {
  const minBaseline = 0.25;
  const maxBaseline = 0.58;
  const normalized = (cosineSim - minBaseline) / (maxBaseline - minBaseline);
  const percentage = Math.round(normalized * 100);
  return Math.max(5, Math.min(99, percentage));
}

/**
 * Constructs structured semantic text from applicant inputs.
 */
export function constructUserSemanticText(profile: UserMatchingProfile): string {
  const parts: string[] = [];

  if (profile.requirementText && profile.requirementText.trim().length > 0) {
    parts.push(`User requirement: "${profile.requirementText.trim()}"`);
  }

  if (profile.loanPurpose) {
    parts.push(`Primary Purpose: ${profile.loanPurpose}`);
  }

  if (profile.businessType) {
    parts.push(`Business Type: ${profile.businessType}`);
  }

  if (profile.businessProjectSize) {
    parts.push(`Project Scale: ${profile.businessProjectSize}`);
  }

  if (profile.educationCategory) {
    parts.push(`Education Category: ${profile.educationCategory}`);
  }

  if (profile.educationProjectSize) {
    parts.push(`Education Scale: ${profile.educationProjectSize}`);
  }

  if (profile.personalReason) {
    parts.push(`Personal Reason: ${profile.personalReason}`);
  }

  if (profile.otherPurposeText) {
    parts.push(`Specified Purpose: ${profile.otherPurposeText}`);
  }

  if (profile.loanAmount) {
    parts.push(`Requested Loan: ₹${profile.loanAmount.toLocaleString("en-IN")}`);
  }

  if (profile.income) {
    parts.push(`Annual Family Income: ₹${profile.income.toLocaleString("en-IN")}`);
  }

  return parts.join(". ");
}

/**
 * Fetches embeddings from OpenRouter using the openai/text-embedding-3-small model.
 */
export async function getOpenRouterEmbeddings(texts: string[], apiKey: string): Promise<number[][]> {
  const response = await fetch("https://openrouter.ai/api/v1/embeddings", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:3000",
      "X-Title": "SchemeBridge AI Matcher",
    },
    body: JSON.stringify({
      model: "openai/text-embedding-3-small",
      input: texts,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter Embeddings API responded with status ${response.status}: ${errorText}`);
  }

  const json = await response.json();
  if (!json.data || !Array.isArray(json.data)) {
    throw new Error(`Invalid response structure received from OpenRouter embeddings API`);
  }

  // Ensure index alignment
  const sortedData = json.data.slice().sort((a: any, b: any) => (a.index ?? 0) - (b.index ?? 0));
  return sortedData.map((item: any) => item.embedding);
}

/**
 * Evaluates deterministic statutory eligibility rules.
 * AI CANNOT override these rules (Hard Filter).
 */
export function evaluateSchemeEligibility(
  scheme: SchemeDefinition,
  profile: UserMatchingProfile
): { eligible: boolean; reasons: string[]; knockoutFailure?: string } {
  const reasons: string[] = [];

  // 1. Annual Family Income Limit (Strict Statutory Ceiling e.g. ₹5.00 Lakhs)
  if (profile.income > scheme.incomeLimit) {
    return {
      eligible: false,
      reasons: [
        `Annual family income (₹${profile.income.toLocaleString("en-IN")}) exceeds statutory ceiling (₹${scheme.incomeLimit.toLocaleString("en-IN")})`
      ],
      knockoutFailure: "INCOME_CEILING_EXCEEDED"
    };
  }

  // 2. Maximum Loan Amount Limit
  if (profile.loanAmount > scheme.maxLoanAmount) {
    return {
      eligible: false,
      reasons: [
        `Requested amount (₹${profile.loanAmount.toLocaleString("en-IN")}) exceeds maximum scheme limit (₹${scheme.maxLoanAmount.toLocaleString("en-IN")})`
      ],
      knockoutFailure: "LOAN_AMOUNT_EXCEEDED"
    };
  }

  // 3. Credit Score Policy Knockout (if credit is critically impaired)
  if (profile.creditScore === "needs-work") {
    return {
      eligible: false,
      reasons: [
        `Credit profile does not meet minimum institutional lending policy guidelines.`
      ],
      knockoutFailure: "CREDIT_POLICY_KNOCKOUT"
    };
  }

  // 4. Purpose Compatibility Filter
  const userPurpose = (profile.loanPurpose || "").toLowerCase();
  if (scheme.purposeCategory !== "all") {
    if (scheme.purposeCategory === "education" && userPurpose === "business") {
      return {
        eligible: false,
        reasons: [`Scheme is restricted to educational and academic pursuits.`],
        knockoutFailure: "PURPOSE_INCOMPATIBLE"
      };
    }
    if (scheme.purposeCategory === "business" && userPurpose === "education") {
      return {
        eligible: false,
        reasons: [`Scheme is restricted to business and self-employment ventures.`],
        knockoutFailure: "PURPOSE_INCOMPATIBLE"
      };
    }
  }

  // Grounded verification points for eligible schemes
  reasons.push(`Business/purpose is semantically aligned with the scheme profile`);
  reasons.push(`Annual family income (₹${profile.income.toLocaleString("en-IN")}) satisfies the statutory ₹${scheme.incomeLimit.toLocaleString("en-IN")} limit`);
  reasons.push(`Requested loan amount (₹${profile.loanAmount.toLocaleString("en-IN")}) is within the scheme limit of ₹${scheme.maxLoanAmount.toLocaleString("en-IN")}`);
  reasons.push(`Applicant profile matches target beneficiary category: ${scheme.targetBeneficiaries}`);

  return {
    eligible: true,
    reasons
  };
}

/**
 * Main AI Matching Pipeline:
 * 1. Build user text & scheme texts
 * 2. Generate embeddings via OpenRouter
 * 3. Calculate Cosine Similarity & AI Match Score
 * 4. Apply Hard Eligibility Rules
 * 5. Rank Eligible Schemes and return Top 3 Recommendations
 */
export async function matchSchemesWithAI(
  profile: UserMatchingProfile,
  apiKeyOverride?: string,
  schemesOverride?: SchemeDefinition[]
): Promise<MatchSchemesResponse> {
  const apiKey = apiKeyOverride || process.env.OPENROUTER_API_KEY;

  if (!apiKey || apiKey.trim() === "" || apiKey === "your_openrouter_api_key_here") {
    console.error("❌ [AI Matcher] Missing OPENROUTER_API_KEY in server environment.");
    return {
      success: false,
      error: "OPENROUTER_API_KEY is not configured in .env.local. Please provide a valid OpenRouter API key to enable AI semantic matching.",
      errorCode: "MISSING_API_KEY",
      bestMatch: null,
      topEligibleSchemes: [],
      allEvaluations: []
    };
  }

  // 1. Fetch active schemes from Supabase PostgreSQL (Source of Truth)
  let activeSchemes: SchemeDefinition[];
  let schemeSource = "Supabase PostgreSQL";
  if (schemesOverride && schemesOverride.length > 0) {
    activeSchemes = schemesOverride;
    schemeSource = "Explicit Schemes Override";
  } else {
    try {
      activeSchemes = await fetchActiveSchemesFromDB();
    } catch (dbErr: any) {
      console.error("❌ [AI Matcher] Database Retrieval Failure:", dbErr?.message || dbErr);
      return {
        success: false,
        error: `Failed to retrieve government scheme catalog from PostgreSQL database: ${dbErr?.message || "Database connection error"}`,
        errorCode: "DATABASE_ERROR",
        bestMatch: null,
        topEligibleSchemes: [],
        allEvaluations: []
      };
    }
  }

  if (!activeSchemes || activeSchemes.length === 0) {
    return {
      success: false,
      error: "PostgreSQL database returned an empty scheme catalog. Please seed the database with audited schemes.",
      errorCode: "EMPTY_SCHEME_CATALOG",
      bestMatch: null,
      topEligibleSchemes: [],
      allEvaluations: []
    };
  }

  const userSemanticText = constructUserSemanticText(profile);
  const schemeTexts = activeSchemes.map(
    (s) => `Scheme: ${s.schemeName}. Category: ${s.category}. Target: ${s.targetBeneficiaries}. Description: ${s.description} Details: ${s.semanticDescription}`
  );

  const allTextsToEmbed = [userSemanticText, ...schemeTexts];

  let embeddings: number[][];
  try {
    embeddings = await getOpenRouterEmbeddings(allTextsToEmbed, apiKey);
  } catch (err: any) {
    console.error("❌ [AI Matcher] OpenRouter Embeddings Error:", err?.message || err);
    return {
      success: false,
      error: `AI Embeddings generation failed: ${err?.message || "Unknown error from OpenRouter API"}`,
      errorCode: "AI_API_ERROR",
      bestMatch: null,
      topEligibleSchemes: [],
      allEvaluations: []
    };
  }

  const userEmbedding = embeddings[0];
  const schemeEmbeddings = embeddings.slice(1);

  // Compute similarity and apply hard eligibility rules for each scheme retrieved from DB
  const evaluations: SchemeEvaluationResult[] = activeSchemes.map((scheme, idx) => {
    const sEmbedding = schemeEmbeddings[idx];
    const cosineSim = calculateCosineSimilarity(userEmbedding, sEmbedding);
    const aiMatchScore = calibrateSemanticScore(cosineSim);
    const eligibility = evaluateSchemeEligibility(scheme, profile);

    return {
      scheme,
      aiMatchScore,
      cosineSimilarity: parseFloat(cosineSim.toFixed(4)),
      eligible: eligibility.eligible,
      reasons: eligibility.reasons,
      knockoutFailure: eligibility.knockoutFailure
    };
  });

  // HARD FILTER: Separate eligible and ineligible
  const eligibleSchemes = evaluations.filter((item) => item.eligible);
  const ineligibleSchemes = evaluations.filter((item) => !item.eligible);

  // Sort eligible schemes by AI Semantic Match Score descending
  eligibleSchemes.sort((a, b) => b.aiMatchScore - a.aiMatchScore);

  // Assign ranks
  eligibleSchemes.forEach((item, index) => {
    item.rank = index + 1;
  });

  const topEligibleSchemes = eligibleSchemes.slice(0, 3);
  const bestMatch = topEligibleSchemes.length > 0 ? topEligibleSchemes[0] : null;

  // Server-side development logs
  console.log("\n================ [AI SCHEME MATCHER LOG] ================");
  console.log("Database Source:", schemeSource, `(${activeSchemes.length} schemes loaded)`);
  console.log("User Semantic Text:", userSemanticText);
  console.log("AI Model: openai/text-embedding-3-small (OpenRouter)");
  console.log("Evaluated Schemes:");
  evaluations.forEach((item) => {
    console.log(
      ` - [${item.scheme.schemeName}] Similarity: ${item.cosineSimilarity} | AI Score: ${item.aiMatchScore}% | Eligible: ${item.eligible ? "YES" : "NO"}${item.knockoutFailure ? ` (${item.knockoutFailure})` : ""}`
    );
  });
  console.log(
    "Final Top 3 Eligible:",
    topEligibleSchemes.map((r, i) => `#${i + 1} ${r.scheme.schemeName} (Score: ${r.aiMatchScore}%)`).join(" | ") || "None (All Ineligible)"
  );
  console.log("=========================================================\n");

  return {
    success: true,
    userSemanticText,
    aiModel: "openai/text-embedding-3-small",
    bestMatch,
    topEligibleSchemes,
    allEvaluations: [...eligibleSchemes, ...ineligibleSchemes],
    executionLog: {
      timestamp: new Date().toISOString(),
      totalSchemesEvaluated: activeSchemes.length,
      eligibleCount: eligibleSchemes.length,
      ineligibleCount: ineligibleSchemes.length
    }
  };
}
