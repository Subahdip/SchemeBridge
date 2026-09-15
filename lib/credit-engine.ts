/**
 * Production-Grade Credit Underwriting & Decisioning Engine (CUDE)
 * Implements deterministic Hard Knockouts, FOIR Actuarial Sizing,
 * 100-Point Underwriting Scorecard, and 4-Tier Decision Matrix.
 */

export interface ApplicantCreditProfile {
  name?: string;
  annualIncome: number;
  loanAmount: number;
  existingEmis: number;
  netSalary: number;
  salaryBank?: string;
  primaryPurpose?: string;
  businessScale?: string;
  loanPurpose?: string;
  companyName?: string;
  employerType?: string;
  yearsAtJob?: string;
  totalExperience?: string;
  residentialStatus?: string;
  pincode?: string;
  address?: string;
  creditScore: 'excellent' | 'good' | 'fair' | 'needs-work' | 'no-history' | string;
}

export interface KnockoutFailure {
  ruleId: string;
  ruleName: string;
  rejectCode: string;
  userMessage: string;
}

export interface KnockoutResult {
  decision: "DECLINE" | "PASS";
  phase: string;
  failures?: KnockoutFailure[];
  nextStep?: string;
  nextPhase?: string;
}

export interface FOIRResult {
  foirTier: string;
  maxFOIR: number;
  maxAllowableEMI: number;
  maxLoanEligibility: number;
  requestedLoan: number;
  haircutRequired: boolean;
  counterOfferAmount: number;
  interestRate: number;
  tenureMonths: number;
  monthlyEMI: number;
}

export interface ScorecardBreakdown {
  creditProfile: number;
  repaymentMargin: number;
  employmentStability: number;
  residentialStability: number;
  loanPurposeFeasibility: number;
}

export interface ScorecardResult {
  totalScore: number;
  maxScore: number;
  breakdown: ScorecardBreakdown;
  riskCategory: "PRIME" | "STANDARD" | "SUB_PRIME" | "HIGH_RISK";
}

export interface FinalCreditDecision {
  decision: "APPROVE" | "APPROVE_WITH_CONDITIONS" | "MANUAL_REVIEW" | "DECLINE";
  flag: "GREEN" | "AMBER" | "ORANGE" | "RED";
  score: number;
  riskCategory: string;
  interestRate: number;
  maxLoanAmount: number;
  tenure: number;
  monthlyEMI: number;
  conditions: string[];
  sla: {
    approvalTime?: string;
    disbursementTime?: string;
    autoSanction?: boolean;
    documentation?: string;
  } | null;
  userMessage: string;
  nextSteps: string[];
  adverseAction: {
    notice: boolean;
    top3Reasons: string[];
    cooldownPeriod: string;
    creditCounseling?: boolean;
    alternativeOptions?: string[];
  } | null;
  counterOffer?: {
    requestedAmount: number;
    approvedAmount: number;
    reason: string;
  } | null;
  scorecardBreakdown?: ScorecardBreakdown;
}

export interface ValidationResult {
  valid: boolean;
  message?: string;
  userCancelled?: boolean;
}

// ============================================================================
// SANITY VALIDATIONS: INCOME & OBLIGATION CONSISTENCY
// ============================================================================

/**
 * Validation: Net Take-Home Salary should be realistic vs Annual Income
 */
export function validateNetSalary(annualIncome: number, netSalary: number): ValidationResult {
  const monthlyIncomeFromAnnual = annualIncome / 12;
  const minReasonableSalary = monthlyIncomeFromAnnual * 0.6; // At least 60% of monthly income
  const maxReasonableSalary = monthlyIncomeFromAnnual * 1.2; // At most 120% (includes bonuses, etc.)

  if (netSalary < minReasonableSalary) {
    return {
      valid: false,
      message: `Your Net Take-Home Salary (₹${netSalary.toLocaleString('en-IN')}) is too low compared to your Annual Income (₹${annualIncome.toLocaleString('en-IN')}).\n\nExpected monthly salary: ₹${Math.round(minReasonableSalary).toLocaleString('en-IN')} - ₹${Math.round(maxReasonableSalary).toLocaleString('en-IN')}\n\nPlease verify your income details.`
    };
  }

  if (netSalary > maxReasonableSalary * 2) {
    return {
      valid: false,
      message: `Your Net Take-Home Salary (₹${netSalary.toLocaleString('en-IN')}) seems unusually high compared to your Annual Income (₹${annualIncome.toLocaleString('en-IN')}).\n\nPlease verify your income details.`
    };
  }

  return { valid: true };
}

/**
 * Validation: Existing EMIs should not exceed 70% of Net Salary
 */
export function validateExistingEMIs(netSalary: number, existingEmis: number): ValidationResult {
  const maxReasonableEMI = netSalary * 0.70; // 70% of monthly salary

  if (existingEmis > maxReasonableEMI) {
    return {
      valid: false,
      message: `Your Existing Monthly EMIs (₹${existingEmis.toLocaleString('en-IN')}) exceed 70% of your Net Take-Home Salary (₹${netSalary.toLocaleString('en-IN')}).\n\nMaximum reasonable EMI: ₹${Math.round(maxReasonableEMI).toLocaleString('en-IN')}\n\nThis indicates extremely high debt burden. Please review your financial details.`
    };
  }

  return { valid: true };
}

// ============================================================================
// PHASE 1: HARD KNOCKOUT RULES (FIXED & DETERMINISTIC)
// ============================================================================

export interface HardKnockoutRule {
  ruleId: string;
  name: string;
  condition: (applicant: ApplicantCreditProfile) => boolean;
  rejectCode: string;
  userMessage: string;
  action: "DECLINE";
}

export const HARD_KNOCKOUT_RULES: HardKnockoutRule[] = [
  {
    ruleId: "KO-001",
    name: "Minimum CIBIL Score",
    condition: (applicant) => applicant.creditScore === 'needs-work',
    rejectCode: "CIBIL_BELOW_MINIMUM",
    userMessage: "Your credit score is below the minimum threshold of 600. Please improve your credit history before applying.",
    action: "DECLINE"
  },
  {
    ruleId: "KO-002",
    name: "Income Ceiling Violation",
    condition: (applicant) => applicant.annualIncome > 500000,
    rejectCode: "INCOME_ABOVE_CEILING",
    userMessage: "Annual family income exceeds the ₹5.00 Lakhs ceiling for NSFDC concessional schemes.",
    action: "DECLINE"
  },
  {
    ruleId: "KO-003",
    name: "Excessive Debt-to-Income Ratio",
    condition: (applicant) => {
      const net = applicant.netSalary > 0 ? applicant.netSalary : (applicant.annualIncome / 12);
      const dtiRatio = applicant.existingEmis / Math.max(net, 1);
      return dtiRatio > 0.70; // DTI > 70%
    },
    rejectCode: "DTI_EXCEEDS_LIMIT",
    userMessage: "Your existing debt obligations exceed 70% of your monthly income, which poses a high repayment risk.",
    action: "DECLINE"
  },
  {
    ruleId: "KO-004",
    name: "Loan-to-Income Multiplier",
    condition: (applicant) => {
      return applicant.loanAmount > (applicant.annualIncome * 3);
    },
    rejectCode: "LOAN_EXCEEDS_INCOME_MULTIPLIER",
    userMessage: "Requested loan amount exceeds 3x your annual income, which is beyond acceptable unsecured exposure limits.",
    action: "DECLINE"
  },
  {
    ruleId: "KO-005",
    name: "Extreme Instability",
    condition: (applicant) => {
      const isFresher = applicant.totalExperience === '<1' || 
                        applicant.totalExperience === '0-1' || 
                        applicant.yearsAtJob === '<1' || 
                        applicant.yearsAtJob === '0-1';
      const isUnstableResidence = applicant.residentialStatus === 'rented' || 
                                  applicant.residentialStatus === 'pg-hostel' ||
                                  applicant.residentialStatus === 'company-provided';
      return isFresher && isUnstableResidence;
    },
    rejectCode: "EMPLOYMENT_RESIDENCE_INSTABILITY",
    userMessage: "Combination of limited work experience (<1 year) and non-owned residence indicates high instability.",
    action: "DECLINE"
  }
];

export function executeHardKnockouts(applicant: ApplicantCreditProfile): KnockoutResult {
  const failures: KnockoutFailure[] = [];

  HARD_KNOCKOUT_RULES.forEach(rule => {
    // Evaluate condition function safely
    const isFailed = rule.condition(applicant);

    if (isFailed) {
      failures.push({
        ruleId: rule.ruleId,
        ruleName: rule.name,
        rejectCode: rule.rejectCode,
        userMessage: rule.userMessage
      });
    }
  });

  // If ANY knockout rule failed, decline immediately
  if (failures.length > 0) {
    console.log("❌ HARD KNOCKOUT FAILED");
    console.log("Failures:", failures);

    return {
      decision: "DECLINE",
      phase: "HARD_KNOCKOUT",
      failures: failures,
      nextStep: "ADVERSE_ACTION_NOTICE"
    };
  }

  console.log("✅ Passed all hard knockout rules");
  return {
    decision: "PASS",
    phase: "HARD_KNOCKOUT",
    nextPhase: "PHASE_2_FOIR"
  };
}

// ============================================================================
// PHASE 2: MAXIMUM LOAN SIZING & FOIR ENGINE
// ============================================================================

export const FOIR_TIERS = {
  "<25k": {
    bracket: "Net Salary < ₹25,000",
    maxFOIR: 0.40,
    riskCategory: "HIGH_RISK"
  },
  "25k-50k": {
    bracket: "Net Salary ₹25,000 - ₹50,000",
    maxFOIR: 0.50,
    riskCategory: "MEDIUM_RISK"
  },
  "50k-1L": {
    bracket: "Net Salary ₹50,000 - ₹1,00,000",
    maxFOIR: 0.60,
    riskCategory: "LOW_RISK"
  },
  ">1L": {
    bracket: "Net Salary > ₹1,00,000",
    maxFOIR: 0.65,
    riskCategory: "PRIME"
  }
};

export function calculateFOIR(applicant: ApplicantCreditProfile): FOIRResult {
  const netSalary = applicant.netSalary > 0 ? applicant.netSalary : Math.round(applicant.annualIncome / 12);
  const existingEMIs = applicant.existingEmis || 0;

  // Determine FOIR tier
  let foirTier = FOIR_TIERS["<25k"];
  if (netSalary >= 100000) foirTier = FOIR_TIERS[">1L"];
  else if (netSalary >= 50000) foirTier = FOIR_TIERS["50k-1L"];
  else if (netSalary >= 25000) foirTier = FOIR_TIERS["25k-50k"];

  // Calculate maximum allowable EMI
  const maxAllowableEMI = Math.max(0, (netSalary * foirTier.maxFOIR) - existingEMIs);

  // Interest rate and tenure
  const interestRate = getInterestRate(applicant);
  const tenureMonths = getTenure(applicant.loanPurpose || applicant.primaryPurpose || "other");

  // Reversed standard EMI Annuity formula: P = EMI * ((1+R)^N - 1) / (R * (1+R)^N)
  const monthlyRate = interestRate / 12 / 100;
  let maxLoanEligibility = 0;

  if (monthlyRate > 0 && maxAllowableEMI > 0) {
    const compounding = Math.pow(1 + monthlyRate, tenureMonths);
    maxLoanEligibility = maxAllowableEMI * ((compounding - 1) / (monthlyRate * compounding));
  }

  const roundedMaxLoan = Math.max(0, Math.round(maxLoanEligibility));
  const haircutRequired = applicant.loanAmount > roundedMaxLoan;
  const counterOfferAmount = haircutRequired ? roundedMaxLoan : applicant.loanAmount;

  // Calculate monthly EMI for sanctioned/counter-offer amount
  let monthlyEMI = 0;
  if (counterOfferAmount > 0 && monthlyRate > 0) {
    const comp = Math.pow(1 + monthlyRate, tenureMonths);
    monthlyEMI = Math.round((counterOfferAmount * monthlyRate * comp) / (comp - 1));
  }

  return {
    foirTier: foirTier.bracket,
    maxFOIR: foirTier.maxFOIR,
    maxAllowableEMI: Math.round(maxAllowableEMI),
    maxLoanEligibility: roundedMaxLoan,
    requestedLoan: applicant.loanAmount,
    haircutRequired,
    counterOfferAmount,
    interestRate,
    tenureMonths,
    monthlyEMI
  };
}

export function getInterestRate(applicant: ApplicantCreditProfile): number {
  const creditScoreRates: Record<string, number> = {
    "excellent": 6.5,
    "good": 7.0,
    "fair": 7.5,
    "needs-work": 8.0,
    "no-history": 6.5
  };
  return creditScoreRates[applicant.creditScore] || 7.5;
}

export function getTenure(purpose: string): number {
  const tenureMap: Record<string, number> = {
    "business-expansion": 36,
    "working-capital": 24,
    "equipment": 48,
    "inventory": 24,
    "education": 60,
    "medical": 36,
    "wedding": 36,
    "home-renovation": 48,
    "debt-consolidation": 36,
    "business": 36,
    "personal": 36,
    "other": 36
  };
  return tenureMap[purpose] || 36;
}

// ============================================================================
// PHASE 3: 100-POINT UNDERWRITING SCORECARD
// ============================================================================

export const UNDERWRITING_SCORECARD = {
  creditProfile: {
    maxPoints: 35,
    scoring: {
      "excellent": 35,
      "good": 28,
      "fair": 18,
      "needs-work": 8,
      "no-history": 20
    } as Record<string, number>
  },
  repaymentMargin: {
    maxPoints: 25,
    scoring: {
      "dti-0-10": 25,
      "dti-10-20": 22,
      "dti-20-30": 18,
      "dti-30-40": 12,
      "dti-40-50": 6,
      "dti-50-plus": 0
    } as Record<string, number>
  },
  employmentStability: {
    maxPoints: 20,
    components: {
      totalExperience: {
        maxPoints: 8,
        scoring: {
          "15+": 8,
          "10-15": 7,
          "5-10": 6,
          "3-5": 5,
          "1-3": 3,
          "<1": 1,
          "0-1": 1
        } as Record<string, number>
      },
      jobTenure: {
        maxPoints: 7,
        scoring: {
          "10+": 7,
          "5-10": 6,
          "2-5": 5,
          "1-2": 3,
          "<1": 1,
          "0-1": 1
        } as Record<string, number>
      },
      employerBank: {
        maxPoints: 5,
        scoring: {
          "tier1-mnc-govt": 5,
          "tier1-private": 4,
          "other-govt": 4,
          "other-private": 2
        } as Record<string, number>
      }
    }
  },
  residentialStability: {
    maxPoints: 10,
    scoring: {
      "owned-self": 10,
      "owned-family": 8,
      "company-provided": 5,
      "rented": 4,
      "other": 3,
      "pg-hostel": 2
    } as Record<string, number>
  },
  loanPurposeFeasibility: {
    maxPoints: 10,
    scoring: {
      "business-expansion": 10,
      "education": 10,
      "equipment": 9,
      "working-capital": 8,
      "inventory": 7,
      "home-renovation": 6,
      "medical": 6,
      "wedding": 5,
      "debt-consolidation": 4,
      "business": 9,
      "personal": 5,
      "other": 5
    } as Record<string, number>
  }
};

export function calculateUnderwritingScore(applicant: ApplicantCreditProfile): ScorecardResult {
  let totalScore = 0;
  const breakdown: ScorecardBreakdown = {
    creditProfile: 0,
    repaymentMargin: 0,
    employmentStability: 0,
    residentialStability: 0,
    loanPurposeFeasibility: 0
  };

  // 1. Credit Profile (35 pts)
  breakdown.creditProfile = UNDERWRITING_SCORECARD.creditProfile.scoring[applicant.creditScore] || 18;
  totalScore += breakdown.creditProfile;

  // 2. Repayment Margin (25 pts)
  const net = applicant.netSalary > 0 ? applicant.netSalary : Math.max(1, applicant.annualIncome / 12);
  const dtiRatio = (applicant.existingEmis / net) * 100;
  let dtiCategory = "dti-50-plus";
  if (dtiRatio <= 10) dtiCategory = "dti-0-10";
  else if (dtiRatio <= 20) dtiCategory = "dti-10-20";
  else if (dtiRatio <= 30) dtiCategory = "dti-20-30";
  else if (dtiRatio <= 40) dtiCategory = "dti-30-40";
  else if (dtiRatio <= 50) dtiCategory = "dti-40-50";

  breakdown.repaymentMargin = UNDERWRITING_SCORECARD.repaymentMargin.scoring[dtiCategory] || 0;
  totalScore += breakdown.repaymentMargin;

  // 3. Employment Stability (20 pts)
  const expScore = UNDERWRITING_SCORECARD.employmentStability.components.totalExperience.scoring[applicant.totalExperience || "<1"] || 3;
  const tenureScore = UNDERWRITING_SCORECARD.employmentStability.components.jobTenure.scoring[applicant.yearsAtJob || "<1"] || 3;
  const employerTier = determineEmployerBankTier(applicant);
  const bankScore = UNDERWRITING_SCORECARD.employmentStability.components.employerBank.scoring[employerTier] || 2;

  const empScore = expScore + tenureScore + bankScore;
  breakdown.employmentStability = empScore;
  totalScore += empScore;

  // 4. Residential Stability (10 pts)
  breakdown.residentialStability = UNDERWRITING_SCORECARD.residentialStability.scoring[applicant.residentialStatus || "rented"] || 4;
  totalScore += breakdown.residentialStability;

  // 5. Loan Purpose Feasibility (10 pts)
  const purposeKey = applicant.loanPurpose || applicant.primaryPurpose || "other";
  breakdown.loanPurposeFeasibility = UNDERWRITING_SCORECARD.loanPurposeFeasibility.scoring[purposeKey] || 5;
  totalScore += breakdown.loanPurposeFeasibility;

  // Risk Category
  let riskCategory: ScorecardResult["riskCategory"] = "HIGH_RISK";
  if (totalScore >= 75) riskCategory = "PRIME";
  else if (totalScore >= 60) riskCategory = "STANDARD";
  else if (totalScore >= 45) riskCategory = "SUB_PRIME";

  return {
    totalScore,
    maxScore: 100,
    breakdown,
    riskCategory
  };
}

export function determineEmployerBankTier(applicant: ApplicantCreditProfile): string {
  const tier1Employers = ["tcs", "infosys", "wipro", "hcl", "government", "psu", "state bank", "railway", "defense"];
  const psbBanks = ["sbi", "pnb", "bob", "canara", "union", "other-psb", "other_psu"];

  const company = (applicant.companyName || "").toLowerCase();
  const bank = (applicant.salaryBank || "").toLowerCase();

  const isTier1Employer = applicant.employerType === "tier1-mnc-govt" || 
                          tier1Employers.some(emp => company.includes(emp));
  const isPSBBank = psbBanks.includes(bank);

  if (isTier1Employer && isPSBBank) return "tier1-mnc-govt";
  if (isTier1Employer) return "tier1-private";
  if (isPSBBank) return "other-govt";
  return "other-private";
}

// ============================================================================
// PHASE 4: FINAL DECISION MATRIX & ACTION ENGINE
// ============================================================================

export function executeFinalDecision(
  applicant: ApplicantCreditProfile,
  scorecard: ScorecardResult,
  foirResult: FOIRResult
): FinalCreditDecision {
  const score = scorecard.totalScore;

  if (score >= 75) {
    return {
      decision: "APPROVE",
      flag: "GREEN",
      score,
      riskCategory: scorecard.riskCategory,
      interestRate: 6.0, // 50 bps discount for prime borrowers
      maxLoanAmount: foirResult.counterOfferAmount,
      tenure: foirResult.tenureMonths,
      monthlyEMI: foirResult.monthlyEMI,
      conditions: [
        "Digital e-Sign of standard loan agreement",
        "Auto-debit (e-NACH) registration via NetBanking/UPI"
      ],
      sla: {
        approvalTime: "INSTANT",
        disbursementTime: "24-48 hours",
        autoSanction: true,
        documentation: "MINIMAL"
      },
      userMessage: "Congratulations! Your application has been pre-approved with preferential terms.",
      nextSteps: [
        "Complete e-KYC verification",
        "Upload income documents (ITR, bank statements)",
        "E-sign loan agreement",
        "Disbursement within 24-48 hours"
      ],
      adverseAction: null,
      counterOffer: foirResult.haircutRequired ? {
        requestedAmount: applicant.loanAmount,
        approvedAmount: foirResult.counterOfferAmount,
        reason: `Based on your Fixed Obligation to Income Ratio (FOIR), the maximum eligible loan amount is ₹${foirResult.counterOfferAmount.toLocaleString('en-IN')}`
      } : null,
      scorecardBreakdown: scorecard.breakdown
    };
  }

  if (score >= 60) {
    return {
      decision: "APPROVE_WITH_CONDITIONS",
      flag: "AMBER",
      score,
      riskCategory: scorecard.riskCategory,
      interestRate: 7.0,
      maxLoanAmount: foirResult.counterOfferAmount,
      tenure: foirResult.tenureMonths,
      monthlyEMI: foirResult.monthlyEMI,
      conditions: [
        "CO_APPLICANT_RECOMMENDED",
        "TENURE_EXTENSION_OPTIONAL",
        "LTV_REDUCTION_TO_80%"
      ],
      sla: {
        approvalTime: "24-48 hours",
        disbursementTime: "3-5 days",
        autoSanction: false,
        documentation: "STANDARD"
      },
      userMessage: "Your application is approved subject to additional documentation and/or co-applicant.",
      nextSteps: [
        "Provide additional income proof",
        "Consider adding a co-applicant",
        "Upload collateral documents (if applicable)",
        "Wait for loan officer call (2-3 days)"
      ],
      adverseAction: null,
      counterOffer: foirResult.haircutRequired ? {
        requestedAmount: applicant.loanAmount,
        approvedAmount: foirResult.counterOfferAmount,
        reason: `Based on your Fixed Obligation to Income Ratio (FOIR), the maximum eligible loan amount is ₹${foirResult.counterOfferAmount.toLocaleString('en-IN')}`
      } : null,
      scorecardBreakdown: scorecard.breakdown
    };
  }

  if (score >= 45) {
    return {
      decision: "MANUAL_REVIEW",
      flag: "ORANGE",
      score,
      riskCategory: scorecard.riskCategory,
      interestRate: 8.0, // 50 bps risk premium
      maxLoanAmount: foirResult.counterOfferAmount,
      tenure: foirResult.tenureMonths,
      monthlyEMI: foirResult.monthlyEMI,
      conditions: [
        applicant.loanAmount <= 140000 ? "PMMY/MUDRA Priority Micro Routing" : "Senior Desk Underwriting",
        "Guarantor with CIBIL > 720 required"
      ],
      sla: {
        approvalTime: "3-5 working days",
        disbursementTime: "7-10 days",
        autoSanction: false,
        documentation: "INTENSIVE_MANUAL"
      },
      userMessage: "Your application requires manual review. A loan officer will contact you within 3-5 working days.",
      nextSteps: [
        "Wait for manual underwriting review",
        "Prepare to provide guarantor details",
        "Explore PMMY/MUDRA schemes for micro loans",
        "Loan officer will contact within 3-5 days"
      ],
      adverseAction: null,
      counterOffer: foirResult.haircutRequired ? {
        requestedAmount: applicant.loanAmount,
        approvedAmount: foirResult.counterOfferAmount,
        reason: `Based on your Fixed Obligation to Income Ratio (FOIR), the maximum eligible loan amount is ₹${foirResult.counterOfferAmount.toLocaleString('en-IN')}`
      } : null,
      scorecardBreakdown: scorecard.breakdown
    };
  }

  // score < 45 -> Red Flag Auto-Decline
  return {
    decision: "DECLINE",
    flag: "RED",
    score,
    riskCategory: scorecard.riskCategory,
    interestRate: 0,
    maxLoanAmount: 0,
    tenure: 0,
    monthlyEMI: 0,
    conditions: [],
    sla: null,
    userMessage: "Unfortunately, your application does not meet our current lending criteria.",
    nextSteps: [
      "Review adverse action notice",
      "Work on improving credit score",
      "Reduce existing debt burden",
      "Reapply after 90-day cooldown period"
    ],
    adverseAction: {
      notice: true,
      top3Reasons: getTopRejectionReasons(scorecard.breakdown),
      cooldownPeriod: "90 days",
      creditCounseling: true,
      alternativeOptions: [
        "IMPROVE_CREDIT_SCORE",
        "REDUCE_EXISTING_DEBT",
        "APPLY_WITH_CO_APPLICANT",
        "EXPLORE_PMMY_MUDRA_SCHEMES"
      ]
    },
    counterOffer: null,
    scorecardBreakdown: scorecard.breakdown
  };
}

export function getTopRejectionReasons(breakdown: ScorecardBreakdown): string[] {
  const maxScores = {
    creditProfile: 35,
    repaymentMargin: 25,
    employmentStability: 20,
    residentialStability: 10,
    loanPurposeFeasibility: 10
  };

  const explanations: Record<string, string> = {
    creditProfile: "Low credit score or limited credit history (<600)",
    repaymentMargin: "High existing debt obligations relative to income (High DTI)",
    employmentStability: "Limited work experience or short current job tenure",
    residentialStability: "Non-owned residence indicates lower demographic stability",
    loanPurposeFeasibility: "Loan purpose categorized as consumption rather than income-generating"
  };

  const deficits = (Object.keys(breakdown) as Array<keyof ScorecardBreakdown>).map(key => {
    const score = breakdown[key];
    const max = maxScores[key];
    const deficitRatio = 1.0 - (score / max);
    return {
      key,
      deficitRatio,
      explanation: explanations[key] || "Risk metric below underwriting threshold"
    };
  });

  deficits.sort((a, b) => b.deficitRatio - a.deficitRatio);
  return deficits.slice(0, 3).map(d => d.explanation);
}

// ============================================================================
// MAIN ORCHESTRATOR
// ============================================================================

export function executeCreditDecisionEngine(applicant: ApplicantCreditProfile): FinalCreditDecision {
  console.log("=== CREDIT UNDERWRITING ENGINE ===");
  console.log("Applicant:", applicant.name || "Anonymous");
  console.log("Credit Score:", applicant.creditScore);

  // Phase 1: Hard Knockouts
  console.log("Phase 1: Hard Knockout Rules");
  const knockoutResult = executeHardKnockouts(applicant);

  if (knockoutResult.decision === "DECLINE") {
    console.log("❌ DECLINED at Phase 1 (Hard Knockout)");
    const failures = knockoutResult.failures || [];
    return {
      decision: "DECLINE",
      flag: "RED",
      score: 0,
      riskCategory: "HIGH_RISK",
      interestRate: 0,
      maxLoanAmount: 0,
      tenure: 0,
      monthlyEMI: 0,
      conditions: [],
      sla: null,
      userMessage: failures.length > 0 ? failures[0].userMessage : "Your application was declined based on mandatory credit policy rules.",
      nextSteps: [
        "Review adverse action notice",
        "Work on improving credit score",
        "Reduce existing debt burden",
        "Reapply after 90-day cooldown period"
      ],
      adverseAction: {
        notice: true,
        top3Reasons: failures.map(f => f.userMessage),
        cooldownPeriod: "90 days",
        creditCounseling: true,
        alternativeOptions: [
          "IMPROVE_CREDIT_SCORE",
          "REDUCE_EXISTING_DEBT",
          "APPLY_WITH_CO_APPLICANT",
          "EXPLORE_PMMY_MUDRA_SCHEMES"
        ]
      },
      counterOffer: null
    };
  }

  console.log("✅ Passed Hard Knockouts");

  // Phase 2: FOIR & Loan Sizing
  const foirResult = calculateFOIR(applicant);
  console.log("Max Eligible Loan: ₹" + foirResult.maxLoanEligibility.toLocaleString('en-IN'));

  // Phase 3: Underwriting Scorecard
  const scorecard = calculateUnderwritingScore(applicant);
  console.log("Total Score:", scorecard.totalScore + "/100");

  // Phase 4: Final Decision
  const finalDecision = executeFinalDecision(applicant, scorecard, foirResult);
  console.log("Final Decision:", finalDecision.decision, `(${finalDecision.flag})`);

  return finalDecision;
}

export function mapProjectSizeToScheme(loanPurpose: string, projectSize?: string, loanAmount: number = 0): { scheme: string; category: string } {
  let recommendedScheme = '';
  let schemeCategory = '';
  
  if (loanPurpose === 'business') {
    if (projectSize === 'micro' || loanAmount <= 140000) {
      recommendedScheme = 'Micro Credit Finance (MCF)';
      schemeCategory = 'MICRO';
    } else if (projectSize === 'medium' || loanAmount <= 1000000) {
      recommendedScheme = 'Term Loan (NSFDC)';
      schemeCategory = 'MEDIUM';
    } else {
      recommendedScheme = 'Term Loan (NSFDC) - Large';
      schemeCategory = 'LARGE';
    }
  } else if (loanPurpose === 'education') {
    if (projectSize === 'micro') {
      recommendedScheme = 'Micro Credit Finance - Education';
      schemeCategory = 'MICRO';
    } else if (projectSize === 'medium') {
      recommendedScheme = 'Education Loan Scheme';
      schemeCategory = 'MEDIUM';
    } else {
      recommendedScheme = 'Education Loan Scheme - Higher Studies';
      schemeCategory = 'LARGE';
    }
  } else if (loanPurpose === 'personal') {
    if (projectSize === 'micro' || loanAmount <= 100000) {
      recommendedScheme = 'Micro Credit Finance (Personal)';
      schemeCategory = 'MICRO';
    } else if (projectSize === 'medium' || loanAmount <= 500000) {
      recommendedScheme = 'Term Loan (Personal)';
      schemeCategory = 'MEDIUM';
    } else {
      recommendedScheme = 'Term Loan (Personal) - Large';
      schemeCategory = 'LARGE';
    }
  } else {
    if (projectSize === 'micro' || loanAmount <= 140000) {
      recommendedScheme = 'Micro Credit Finance';
      schemeCategory = 'MICRO';
    } else if (projectSize === 'medium' || loanAmount <= 1000000) {
      recommendedScheme = 'Term Loan (NSFDC)';
      schemeCategory = 'MEDIUM';
    } else {
      recommendedScheme = 'Term Loan (NSFDC) - Large';
      schemeCategory = 'LARGE';
    }
  }
  
  return {
    scheme: recommendedScheme,
    category: schemeCategory
  };
}
