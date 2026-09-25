/**
 * Credit Underwriting & Decisioning Engine (CUDE) - Client/Vanilla JS Module
 */

// Phase 1: Hard Knockout Rules (FIXED)
const HARD_KNOCKOUT_RULES = [
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
      const dtiRatio = (applicant.existingEmis || 0) / Math.max(net, 1);
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

// Fixed executeHardKnockouts function
function executeHardKnockouts(applicant) {
  const failures = [];
  
  HARD_KNOCKOUT_RULES.forEach(rule => {
    // Evaluate condition function
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
    console.log("HARD KNOCKOUT FAILED");
    console.log("Failures:", failures);
    
    return {
      decision: "DECLINE",
      phase: "HARD_KNOCKOUT",
      failures: failures,
      nextStep: "ADVERSE_ACTION_NOTICE"
    };
  }
  
  console.log("Passed all hard knockout rules");
  return { 
    decision: "PASS", 
    nextPhase: "PHASE_2_FOIR" 
  };
}

// Phase 2: FOIR & Loan Sizing
const FOIR_TIERS = {
  "<25k": { bracket: "Net Salary < ₹25,000", maxFOIR: 0.40 },
  "25k-50k": { bracket: "Net Salary ₹25,000 - ₹50,000", maxFOIR: 0.50 },
  "50k-1L": { bracket: "Net Salary ₹50,000 - ₹1,00,000", maxFOIR: 0.60 },
  ">1L": { bracket: "Net Salary > ₹1,00,000", maxFOIR: 0.65 }
};

function calculateFOIR(applicant) {
  const netSalary = applicant.netSalary > 0 ? applicant.netSalary : (applicant.annualIncome / 12);
  const existingEMIs = applicant.existingEmis || 0;

  let foirTier = FOIR_TIERS["<25k"];
  if (netSalary >= 100000) foirTier = FOIR_TIERS[">1L"];
  else if (netSalary >= 50000) foirTier = FOIR_TIERS["50k-1L"];
  else if (netSalary >= 25000) foirTier = FOIR_TIERS["25k-50k"];

  const maxAllowableEMI = Math.max(0, (netSalary * foirTier.maxFOIR) - existingEMIs);
  const interestRate = getInterestRate(applicant);
  const tenureMonths = getTenure(applicant.loanPurpose || applicant.primaryPurpose || "other");

  const monthlyRate = interestRate / 12 / 100;
  let maxLoanEligibility = 0;
  if (monthlyRate > 0 && maxAllowableEMI > 0) {
    const comp = Math.pow(1 + monthlyRate, tenureMonths);
    maxLoanEligibility = maxAllowableEMI * ((comp - 1) / (monthlyRate * comp));
  }

  const roundedMaxLoan = Math.round(maxLoanEligibility);
  const haircutRequired = applicant.loanAmount > roundedMaxLoan;
  const counterOfferAmount = haircutRequired ? roundedMaxLoan : applicant.loanAmount;

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

function getInterestRate(applicant) {
  const creditScoreRates = {
    "excellent": 6.5,
    "good": 7.0,
    "fair": 7.5,
    "needs-work": 8.0,
    "no-history": 6.5
  };
  return creditScoreRates[applicant.creditScore] || 7.5;
}

function getTenure(purpose) {
  const tenureMap = {
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

// Phase 3: Scorecard
const UNDERWRITING_SCORECARD = {
  creditProfile: { "excellent": 35, "good": 28, "fair": 18, "needs-work": 8, "no-history": 20 },
  repaymentMargin: { "dti-0-10": 25, "dti-10-20": 22, "dti-20-30": 18, "dti-30-40": 12, "dti-40-50": 6, "dti-50-plus": 0 },
  residentialStability: { "owned-self": 10, "owned-family": 8, "company-provided": 5, "rented": 4, "other": 3, "pg-hostel": 2 },
  loanPurposeFeasibility: {
    "business-expansion": 10, "education": 10, "equipment": 9, "working-capital": 8, "inventory": 7,
    "home-renovation": 6, "medical": 6, "wedding": 5, "debt-consolidation": 4, "other": 5
  }
};

function calculateUnderwritingScore(applicant) {
  let totalScore = 0;
  const breakdown = {};

  breakdown.creditProfile = UNDERWRITING_SCORECARD.creditProfile[applicant.creditScore] || 18;
  totalScore += breakdown.creditProfile;

  const net = applicant.netSalary > 0 ? applicant.netSalary : (applicant.annualIncome / 12);
  const dtiRatio = ((applicant.existingEmis || 0) / Math.max(net, 1)) * 100;
  let dtiCategory = "dti-50-plus";
  if (dtiRatio <= 10) dtiCategory = "dti-0-10";
  else if (dtiRatio <= 20) dtiCategory = "dti-10-20";
  else if (dtiRatio <= 30) dtiCategory = "dti-20-30";
  else if (dtiRatio <= 40) dtiCategory = "dti-30-40";
  else if (dtiRatio <= 50) dtiCategory = "dti-40-50";

  breakdown.repaymentMargin = UNDERWRITING_SCORECARD.repaymentMargin[dtiCategory] || 0;
  totalScore += breakdown.repaymentMargin;

  const expMap = { "15+": 8, "10-15": 7, "5-10": 6, "3-5": 5, "1-3": 3, "<1": 1, "0-1": 1 };
  const tenureMap = { "10+": 7, "5-10": 6, "2-5": 5, "1-2": 3, "<1": 1, "0-1": 1 };
  const expScore = expMap[applicant.totalExperience] || 3;
  const tenureScore = tenureMap[applicant.yearsAtJob] || 3;
  const isTier1 = applicant.employerType === 'tier1-mnc-govt' || (applicant.companyName && /tcs|infosys|wipro|govt|psu/i.test(applicant.companyName));
  const isPSB = /sbi|pnb|bob|canara|union/i.test(applicant.salaryBank || '');
  const bankScore = (isTier1 && isPSB) ? 5 : (isTier1 || isPSB) ? 4 : 2;

  breakdown.employmentStability = expScore + tenureScore + bankScore;
  totalScore += breakdown.employmentStability;

  breakdown.residentialStability = UNDERWRITING_SCORECARD.residentialStability[applicant.residentialStatus] || 4;
  totalScore += breakdown.residentialStability;

  const purposeKey = applicant.loanPurpose || applicant.primaryPurpose || "other";
  breakdown.loanPurposeFeasibility = UNDERWRITING_SCORECARD.loanPurposeFeasibility[purposeKey] || 5;
  totalScore += breakdown.loanPurposeFeasibility;

  let riskCategory = "HIGH_RISK";
  if (totalScore >= 75) riskCategory = "PRIME";
  else if (totalScore >= 60) riskCategory = "STANDARD";
  else if (totalScore >= 45) riskCategory = "SUB_PRIME";

  return { totalScore, maxScore: 100, breakdown, riskCategory };
}

// Phase 4: Final Execution
function executeFinalDecision(applicant, scorecard, foirResult) {
  const score = scorecard.totalScore;

  if (score >= 75) {
    return {
      decision: "APPROVE",
      flag: "GREEN",
      score,
      riskCategory: scorecard.riskCategory,
      interestRate: 6.0,
      maxLoanAmount: foirResult.counterOfferAmount,
      tenure: foirResult.tenureMonths,
      monthlyEMI: foirResult.monthlyEMI,
      conditions: ["Digital e-Sign", "Auto-debit (e-NACH)"],
      userMessage: "Congratulations! Your application has been pre-approved with preferential terms.",
      nextSteps: ["Complete e-KYC verification", "Upload income documents", "E-sign agreement", "Disbursement in 24-48h"]
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
      conditions: ["CO_APPLICANT_RECOMMENDED", "LTV_REDUCTION_TO_80%"],
      userMessage: "Your application is approved subject to additional documentation/co-applicant.",
      nextSteps: ["Provide additional income proof", "Add co-applicant", "Wait for verification call"]
    };
  }

  if (score >= 45) {
    return {
      decision: "MANUAL_REVIEW",
      flag: "ORANGE",
      score,
      riskCategory: scorecard.riskCategory,
      interestRate: 8.0,
      maxLoanAmount: foirResult.counterOfferAmount,
      tenure: foirResult.tenureMonths,
      monthlyEMI: foirResult.monthlyEMI,
      conditions: ["Guarantor required", "Manual desk assessment"],
      userMessage: "Your application requires manual review by an underwriter.",
      nextSteps: ["Provide guarantor details", "Loan officer will contact in 3-5 days"]
    };
  }

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
    userMessage: "Unfortunately, your application does not meet our lending criteria.",
    nextSteps: ["Review adverse action reasons", "Improve credit score", "Reapply in 90 days"]
  };
}

function executeCreditDecisionEngine(applicant) {
  const knockoutResult = executeHardKnockouts(applicant);
  if (knockoutResult.decision === "DECLINE") {
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
      userMessage: failures.length > 0 ? failures[0].userMessage : "Application declined on policy rules.",
      adverseAction: {
        notice: true,
        top3Reasons: failures.map(f => f.userMessage),
        cooldownPeriod: "90 days"
      }
    };
  }

  const foirResult = calculateFOIR(applicant);
  const scorecard = calculateUnderwritingScore(applicant);
  return executeFinalDecision(applicant, scorecard, foirResult);
}

function validateNetSalary(annualIncome, netSalary) {
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

function validateExistingEMIs(netSalary, existingEmis) {
  const maxReasonableEMI = netSalary * 0.70; // 70% of monthly salary
  
  if (existingEmis > maxReasonableEMI) {
    return {
      valid: false,
      message: `Your Existing Monthly EMIs (₹${existingEmis.toLocaleString('en-IN')}) exceed 70% of your Net Take-Home Salary (₹${netSalary.toLocaleString('en-IN')}).\n\nMaximum reasonable EMI: ₹${Math.round(maxReasonableEMI).toLocaleString('en-IN')}\n\nThis indicates extremely high debt burden. Please review your financial details.`
    };
  }
  
  return { valid: true };
}

function mapProjectSizeToScheme(loanPurpose, projectSize, loanAmount) {
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

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    validateNetSalary,
    validateExistingEMIs,
    HARD_KNOCKOUT_RULES,
    executeHardKnockouts,
    calculateFOIR,
    calculateUnderwritingScore,
    executeFinalDecision,
    executeCreditDecisionEngine,
    mapProjectSizeToScheme
  };
}

