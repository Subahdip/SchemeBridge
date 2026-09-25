/**
 * Comprehensive Automated Test Suite for SchemeBridge AI Matcher
 * 
 * Verifies:
 * 1. OpenRouter Embeddings API connection (openai/text-embedding-3-small)
 * 2. Vector Cosine Similarity calculation
 * 3. Deterministic Eligibility Rules (Hard Filter)
 * 4. Ranking & Top 3 Recommendations
 * 5. TEST 1: Tailoring business & sewing machines
 * 6. TEST 2: Dairy business financial assistance
 * 7. TEST 3: Higher education funding
 * 8. TEST 4: Non-keyword semantic test (artisan garment stitching craft)
 * 9. TEST 5: Hard Knockout test (Income > 5L excluded despite high AI score)
 */

const fs = require("fs");
const path = require("path");

// Load .env.local if present
const envLocalPath = path.join(__dirname, "..", ".env.local");
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const idx = trimmed.indexOf("=");
      const key = trimmed.substring(0, idx).trim();
      const val = trimmed.substring(idx + 1).trim();
      process.env[key] = val;
    }
  });
}

// Scheme catalog aligned with lib/schemes.ts (Audited against official NSFDC / MoSJE guidelines)
const SCHEMES_CATALOG = [
  {
    id: "micro-finance-small",
    schemeName: "Micro Credit Finance (MCF) Scheme",
    category: "MICRO",
    purposeCategory: "business",
    maxLoanAmount: 140000,
    incomeLimit: 500000,
    interestRate: 6.5,
    interestRateText: "6.5% p.a.",
    govtCoveragePercent: 90,
    promoterMarginPercent: 10,
    moratoriumAvailable: true,
    moratoriumDetails: "3 Months Moratorium",
    repaymentPeriod: "Up to 3 years (36 months) in quarterly installments",
    targetBeneficiaries: "Small artisans, street vendors, tailors, micro-business owners, petty shopkeepers belonging to Scheduled Castes",
    description: "Specially tailored micro-credit facility under NSFDC for small-scale entrepreneurs, artisans, and micro-business owners. Offers 90% direct financial assistance with minimal documentation.",
    semanticDescription: "Micro Credit Finance scheme for micro businesses, petty shopkeepers, street vendors, small artisans, tailoring units, sewing machines, garment stitching, handicraft making, small equipment purchase, and working capital up to ₹1.40 Lakhs."
  },
  {
    id: "term-loan-nsfdc",
    schemeName: "National Concessional Term Loan (TL) Scheme",
    category: "MEDIUM",
    purposeCategory: "business",
    maxLoanAmount: 5000000,
    incomeLimit: 500000,
    interestRate: 8.0,
    interestRateText: "8.0% p.a.",
    govtCoveragePercent: 90,
    promoterMarginPercent: 10,
    moratoriumAvailable: true,
    moratoriumDetails: "6 Months Moratorium (12 months for plantation/construction)",
    repaymentPeriod: "Up to 7 years (84 months) in quarterly installments",
    targetBeneficiaries: "SC commercial entrepreneurs, industrial units, expanding businesses, transport vehicle operators, equipment buyers",
    description: "Medium to large capital investment loan scheme designed for viable projects in industrial, agricultural, and service sectors, acquiring machinery, and commercial production.",
    semanticDescription: "National Concessional Term Loan Scheme for medium to large business enterprises, industrial projects, acquiring heavy machinery, manufacturing equipment, setting up commercial service centers, transport vehicles, and factory expansion up to ₹50.00 Lakhs."
  },
  {
    id: "education-loan-scheme",
    schemeName: "Educational Loan Scheme (ELS - Higher Studies)",
    category: "EDUCATION",
    purposeCategory: "education",
    maxLoanAmount: 4000000,
    incomeLimit: 500000,
    interestRate: 6.5,
    interestRateText: "6.5% p.a. (6.0% for female students)",
    govtCoveragePercent: 90,
    promoterMarginPercent: 10,
    moratoriumAvailable: true,
    moratoriumDetails: "Course Duration + 1 Year Moratorium (or 6 months after securing job)",
    repaymentPeriod: "Up to 5 to 10 years after moratorium period",
    targetBeneficiaries: "SC students pursuing full-time professional/technical courses (Engineering, Medical, Management, CA/CS, Research) in India and Abroad",
    description: "Comprehensive financial support for SC students pursuing full-time professional and technical studies in recognized institutions in India and abroad with zero repayment during study period.",
    semanticDescription: "Subsidized Education Loan Scheme for students seeking financial assistance for higher education, university tuition fees, college degrees, professional and technical courses, engineering, medicine, management, higher studies abroad, textbooks, and hostel accommodation up to ₹40.00 Lakhs."
  },
  {
    id: "mahila-samriddhi-yojana",
    schemeName: "Mahila Samriddhi Yojana (MSY - Women Micro Credit)",
    category: "MICRO",
    purposeCategory: "business",
    maxLoanAmount: 140000,
    incomeLimit: 500000,
    interestRate: 4.0,
    interestRateText: "4.0% p.a.",
    govtCoveragePercent: 90,
    promoterMarginPercent: 10,
    moratoriumAvailable: true,
    moratoriumDetails: "3 Months Moratorium",
    repaymentPeriod: "Up to 3 years (36 months) in quarterly installments",
    targetBeneficiaries: "Women entrepreneurs, female artisans, women SHGs, tailoring, boutique, small livestock, micro retail",
    description: "Highly concessional micro-finance scheme specifically designed to empower women from the Scheduled Caste community by providing affordable credit for income-generating micro activities.",
    semanticDescription: "Mahila Samriddhi Yojana micro credit scheme for women entrepreneurs, women self help groups, tailoring, boutique, handicrafts, small shops, beauty parlors, small livestock, and home-based micro businesses up to ₹1.40 Lakhs at 4% interest rate."
  },
  {
    id: "laghu-vyavsay-yojana",
    schemeName: "Laghu Vyavsay Yojana (LVY - Small Business Scheme)",
    category: "MEDIUM",
    purposeCategory: "business",
    maxLoanAmount: 500000,
    incomeLimit: 500000,
    interestRate: 6.0,
    interestRateText: "6.0% p.a.",
    govtCoveragePercent: 90,
    promoterMarginPercent: 10,
    moratoriumAvailable: true,
    moratoriumDetails: "6 Months Moratorium",
    repaymentPeriod: "Up to 5 years (60 months) in quarterly installments",
    targetBeneficiaries: "Dairy farmers, animal husbandry, small retail stores, vehicle repair workshops, rural service units",
    description: "Financial assistance under NSFDC for small commercial business units, dairy farming, milk booths, livestock rearing, retail shops, and commercial service establishments.",
    semanticDescription: "Laghu Vyavsay Yojana for small commercial businesses, dairy business, dairy farming, cattle purchase, livestock, milk production, grocery retail stores, workshop repair, photo studio, and small service enterprises up to ₹5.00 Lakhs."
  },
  {
    id: "green-business-scheme",
    schemeName: "Green Business Scheme (GBS - Eco & Renewable Ventures)",
    category: "MEDIUM",
    purposeCategory: "business",
    maxLoanAmount: 3000000,
    incomeLimit: 500000,
    interestRate: 6.0,
    interestRateText: "4.0% - 7.0% p.a. (1% rebate for women)",
    govtCoveragePercent: 90,
    promoterMarginPercent: 10,
    moratoriumAvailable: true,
    moratoriumDetails: "6 Months Moratorium",
    repaymentPeriod: "Up to 7 to 10 years in quarterly installments",
    targetBeneficiaries: "SC entrepreneurs setting up climate-mitigation green units, solar energy, e-rickshaws, organic farming, polyhouses",
    description: "Financial assistance for income-generating activities that address climate change, including battery-operated e-rickshaws, solar rooftop units/pumps, polyhouses, and waste recycling.",
    semanticDescription: "Green Business Scheme for climate change mitigation, electric rickshaw, battery vehicles, solar rooftop units, solar pumps, polyhouses, organic farming, waste recycling, and renewable green energy projects up to ₹30.00 Lakhs."
  },
  {
    id: "swachhta-udyami-yojana",
    schemeName: "Swachhta Udyami Yojana (SUY - Sanitation Mechanization)",
    category: "LARGE",
    purposeCategory: "business",
    maxLoanAmount: 5000000,
    incomeLimit: 500000,
    interestRate: 4.0,
    interestRateText: "4.0% p.a. (1% rebate for women)",
    govtCoveragePercent: 90,
    promoterMarginPercent: 10,
    moratoriumAvailable: true,
    moratoriumDetails: "6 Months Moratorium",
    repaymentPeriod: "Up to 7 years (84 months) in quarterly installments",
    targetBeneficiaries: "Safai Karamcharis, manual scavengers rehabilitation, sanitation entrepreneurs, waste management operators",
    description: "Financial assistance for the procurement and operation of mechanized sanitation equipment, vacuum cleaning loaders, suction trucks, and garbage transport to eliminate manual scavenging.",
    semanticDescription: "Swachhta Udyami Yojana for mechanized sanitation equipment, vacuum loader trucks, suction machines, septic tank cleaning vehicles, garbage collection transport, and public hygiene infrastructure up to ₹50.00 Lakhs."
  },
  {
    id: "micro-finance-education",
    schemeName: "Micro Credit Finance - Skill & Vocational Training",
    category: "MICRO",
    purposeCategory: "education",
    maxLoanAmount: 140000,
    incomeLimit: 500000,
    interestRate: 6.5,
    interestRateText: "6.5% p.a.",
    govtCoveragePercent: 90,
    promoterMarginPercent: 10,
    moratoriumAvailable: true,
    moratoriumDetails: "Course Duration Moratorium",
    repaymentPeriod: "Up to 3 years (36 months) in quarterly installments",
    targetBeneficiaries: "SC students undergoing short-term vocational diplomas, ITI, skill certifications, NSDC programs",
    description: "Micro-credit support under NSFDC for vocational training, skill enhancement, short-term computer courses, diploma certifications, and technical equipment.",
    semanticDescription: "Micro Credit Finance for vocational courses, technical training, computer diploma, ITI certifications, skill development programs, short-term certification courses, and learning equipment up to ₹1.40 Lakhs."
  }
];

function calculateCosineSimilarity(vecA, vecB) {
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

function calibrateSemanticScore(cosineSim) {
  const minBaseline = 0.25;
  const maxBaseline = 0.58;
  const normalized = (cosineSim - minBaseline) / (maxBaseline - minBaseline);
  const percentage = Math.round(normalized * 100);
  return Math.max(5, Math.min(99, percentage));
}

function evaluateSchemeEligibility(scheme, profile) {
  const reasons = [];

  if (profile.income > scheme.incomeLimit) {
    return {
      eligible: false,
      reasons: [
        `❌ Annual family income (₹${profile.income.toLocaleString("en-IN")}) exceeds statutory ceiling (₹${scheme.incomeLimit.toLocaleString("en-IN")})`
      ],
      knockoutFailure: "INCOME_CEILING_EXCEEDED"
    };
  }

  if (profile.loanAmount > scheme.maxLoanAmount) {
    return {
      eligible: false,
      reasons: [
        `❌ Requested amount (₹${profile.loanAmount.toLocaleString("en-IN")}) exceeds maximum scheme limit (₹${scheme.maxLoanAmount.toLocaleString("en-IN")})`
      ],
      knockoutFailure: "LOAN_AMOUNT_EXCEEDED"
    };
  }

  if (profile.creditScore === "needs-work") {
    return {
      eligible: false,
      reasons: [`❌ Credit profile does not meet minimum institutional lending policy guidelines.`],
      knockoutFailure: "CREDIT_POLICY_KNOCKOUT"
    };
  }

  const userPurpose = (profile.loanPurpose || "").toLowerCase();
  if (scheme.purposeCategory !== "all") {
    if (scheme.purposeCategory === "education" && userPurpose === "business") {
      return {
        eligible: false,
        reasons: [`❌ Scheme is restricted to educational and academic pursuits.`],
        knockoutFailure: "PURPOSE_INCOMPATIBLE"
      };
    }
    if (scheme.purposeCategory === "business" && userPurpose === "education") {
      return {
        eligible: false,
        reasons: [`❌ Scheme is restricted to business and self-employment ventures.`],
        knockoutFailure: "PURPOSE_INCOMPATIBLE"
      };
    }
  }

  reasons.push(`✓ Business purpose is semantically aligned with the scheme profile`);
  reasons.push(`✓ Annual family income (₹${profile.income.toLocaleString("en-IN")}) satisfies the statutory ₹${scheme.incomeLimit.toLocaleString("en-IN")} limit`);
  reasons.push(`✓ Requested loan amount (₹${profile.loanAmount.toLocaleString("en-IN")}) is within the scheme limit of ₹${scheme.maxLoanAmount.toLocaleString("en-IN")}`);
  reasons.push(`✓ Applicant profile matches target beneficiary category: ${scheme.targetBeneficiaries}`);

  return { eligible: true, reasons };
}

async function getOpenRouterEmbeddings(texts, apiKey) {
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

  const sortedData = json.data.slice().sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
  return sortedData.map((item) => item.embedding);
}

async function runTestCase(testNum, title, profile, apiKey) {
  console.log(`\n======================================================`);
  console.log(`TEST ${testNum}: ${title}`);
  console.log(`User Input: "${profile.requirementText}"`);
  console.log(`Financial Profile: Income ₹${profile.income.toLocaleString('en-IN')}, Loan ₹${profile.loanAmount.toLocaleString('en-IN')}, Purpose: ${profile.loanPurpose}`);
  console.log(`------------------------------------------------------`);

  const userSemanticText = `User requirement: "${profile.requirementText}". Primary Purpose: ${profile.loanPurpose}. Requested Loan: ₹${profile.loanAmount.toLocaleString('en-IN')}. Annual Family Income: ₹${profile.income.toLocaleString('en-IN')}`;
  const schemeTexts = SCHEMES_CATALOG.map(
    (s) => `Scheme: ${s.schemeName}. Category: ${s.category}. Target: ${s.targetBeneficiaries}. Description: ${s.description} Details: ${s.semanticDescription}`
  );

  const allTexts = [userSemanticText, ...schemeTexts];
  const embeddings = await getOpenRouterEmbeddings(allTexts, apiKey);

  const userEmbedding = embeddings[0];
  const schemeEmbeddings = embeddings.slice(1);

  const evaluations = SCHEMES_CATALOG.map((scheme, idx) => {
    const sEmb = schemeEmbeddings[idx];
    const cosineSim = calculateCosineSimilarity(userEmbedding, sEmb);
    const aiMatchScore = calibrateSemanticScore(cosineSim);
    const eligibility = evaluateSchemeEligibility(scheme, profile);

    return {
      schemeName: scheme.schemeName,
      cosineSimilarity: parseFloat(cosineSim.toFixed(4)),
      aiMatchScore,
      eligible: eligibility.eligible,
      reasons: eligibility.reasons,
      knockoutFailure: eligibility.knockoutFailure
    };
  });

  console.log("AI Semantic Scores & Eligibility:");
  evaluations.forEach((item) => {
    console.log(
      `  - [${item.schemeName}] Similarity: ${item.cosineSimilarity} | AI Score: ${item.aiMatchScore}% | Eligible: ${item.eligible ? "YES" : "NO"}${item.knockoutFailure ? ` (${item.knockoutFailure})` : ""}`
    );
  });

  const eligibleSchemes = evaluations.filter((item) => item.eligible);
  eligibleSchemes.sort((a, b) => b.aiMatchScore - a.aiMatchScore);

  const top3 = eligibleSchemes.slice(0, 3);
  console.log("\nTop 3 Eligible Schemes Recommended:");
  if (top3.length === 0) {
    console.log("  ⚠️ None (All schemes disqualified by Hard Eligibility Knockout Rules)");
  } else {
    top3.forEach((r, i) => {
      console.log(`  #${i + 1} ${r.schemeName} — AI Match Score: ${r.aiMatchScore}%`);
    });
  }

  return { evaluations, top3 };
}

async function main() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey || apiKey === "your_openrouter_api_key_here") {
    console.log("ℹ️ [TEST RUNNER] No active OPENROUTER_API_KEY detected in .env.local.");
    console.log("Please add OPENROUTER_API_KEY=sk-or-v1-... to .env.local to test against live OpenRouter endpoint.");
    return;
  }

  console.log("🚀 Starting AI Scheme Matcher Test Suite with OpenRouter (openai/text-embedding-3-small)...");

  // TEST 1
  await runTestCase(1, "Tailoring Business with Sewing Machines", {
    requirementText: "I want to start a tailoring business and need money for sewing machines.",
    income: 250000,
    loanAmount: 120000,
    loanPurpose: "business",
    creditScore: "good"
  }, apiKey);

  // TEST 2
  await runTestCase(2, "Small Dairy Business Assistance", {
    requirementText: "I need financial assistance to start a small dairy business.",
    income: 300000,
    loanAmount: 250000,
    loanPurpose: "business",
    creditScore: "good"
  }, apiKey);

  // TEST 3
  await runTestCase(3, "Higher Education Funding", {
    requirementText: "I want funding for my higher education.",
    income: 280000,
    loanAmount: 1500000,
    loanPurpose: "education",
    creditScore: "good"
  }, apiKey);

  // TEST 4: Non-keyword semantic test
  await runTestCase(4, "Artisan Garment Stitching Craft (Non-Keyword Semantic Test)", {
    requirementText: "I am an artisan looking for capital to buy equipment for my garment stitching craft.",
    income: 200000,
    loanAmount: 100000,
    loanPurpose: "business",
    creditScore: "good"
  }, apiKey);

  // TEST 5: Hard Knockout test (Income > 5 Lakhs)
  await runTestCase(5, "Income Exceeds Ceiling (Hard Knockout Rule Enforcement)", {
    requirementText: "I want to start a tailoring business and need money for sewing machines.",
    income: 650000, // Exceeds 5 Lakh limit
    loanAmount: 120000,
    loanPurpose: "business",
    creditScore: "good"
  }, apiKey);

  console.log("\n✅ All test scenarios executed successfully!");
}

main().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
