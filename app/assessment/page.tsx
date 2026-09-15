"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, ArrowRight, ShieldCheck, Info } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AppState, AssessmentData } from "@/lib/app-state";
import { AuthGuard } from "@/components/auth-guard";
import { 
  executeHardKnockouts, 
  executeCreditDecisionEngine, 
  validateNetSalary, 
  validateExistingEMIs, 
  ApplicantCreditProfile 
} from "@/lib/credit-engine";

export default function AssessmentPage() {
  const { t } = useTranslation();
  const router = useRouter();

  // Basic Financial Info
  const [annualIncome, setAnnualIncome] = useState<string>("250000");
  const [loanAmount, setLoanAmount] = useState<string>("120000");

  // Section 2: Loan Purpose & Conditional Categories
  const [loanPurpose, setLoanPurpose] = useState<string>("");
  const [educationCategory, setEducationCategory] = useState<string>("");
  const [educationProjectSize, setEducationProjectSize] = useState<string>("");
  const [businessType, setBusinessType] = useState<string>("");
  const [businessProjectSize, setBusinessProjectSize] = useState<string>("");
  const [personalReason, setPersonalReason] = useState<string>("");
  const [personalProjectSize, setPersonalProjectSize] = useState<string>("");
  const [otherPurposeText, setOtherPurposeText] = useState<string>("");
  const [otherProjectSize, setOtherProjectSize] = useState<string>("");

  // Section 3: Financial Liabilities & Banking
  const [existingEmis, setExistingEmis] = useState<string>("");
  const [salaryBank, setSalaryBank] = useState<string>("");
  const [netSalary, setNetSalary] = useState<string>("");

  // Section 4: Professional & Stability Details
  const [companyName, setCompanyName] = useState<string>("");
  const [yearsAtJob, setYearsAtJob] = useState<string>("");
  const [totalExperience, setTotalExperience] = useState<string>("");

  // Section 5: Residential Demographics
  const [pincode, setPincode] = useState<string>("");
  const [residentialStatus, setResidentialStatus] = useState<string>("");
  const [address, setAddress] = useState<string>("");

  // Section 6: Credit Score Range
  const [creditScore, setCreditScore] = useState<string>("");

  // Active section & form progress state
  const [activeSection, setActiveSection] = useState<string>("basic-info");
  const [formProgress, setFormProgress] = useState<number>(0);

  // Load existing assessment if available
  useEffect(() => {
    const existing = AppState.getAssessment();
    if (existing) {
      if (existing.income) setAnnualIncome(existing.income.toString());
      if (existing.loanAmount) setLoanAmount(existing.loanAmount.toString());
      if (existing.loanPurpose) {
        setLoanPurpose(existing.loanPurpose);
      } else if (existing.primaryPurpose) {
        setLoanPurpose(existing.primaryPurpose);
      }
      if (existing.educationCategory) setEducationCategory(existing.educationCategory);
      if (existing.educationProjectSize) setEducationProjectSize(existing.educationProjectSize);
      if (existing.businessType) setBusinessType(existing.businessType);
      if (existing.businessProjectSize) setBusinessProjectSize(existing.businessProjectSize);
      if (existing.personalReason) setPersonalReason(existing.personalReason);
      if (existing.personalProjectSize) setPersonalProjectSize(existing.personalProjectSize);
      if (existing.otherPurposeText) setOtherPurposeText(existing.otherPurposeText);
      if (existing.otherProjectSize) setOtherProjectSize(existing.otherProjectSize);
      if (existing.existingEmis !== undefined && existing.existingEmis !== null) setExistingEmis(existing.existingEmis.toString());
      if (existing.salaryBank) setSalaryBank(existing.salaryBank);
      if (existing.netSalary !== undefined && existing.netSalary !== null) setNetSalary(existing.netSalary.toString());
      if (existing.companyName) setCompanyName(existing.companyName);
      if (existing.yearsAtJob) setYearsAtJob(existing.yearsAtJob);
      if (existing.totalExperience) setTotalExperience(existing.totalExperience);
      if (existing.pincode) setPincode(existing.pincode);
      if (existing.residentialStatus) setResidentialStatus(existing.residentialStatus);
      if (existing.address) setAddress(existing.address);
      if (existing.creditScore) setCreditScore(existing.creditScore);
    }
  }, []);

  // Scroll listener for active section highlighting in sidebar
  useEffect(() => {
    const handleScroll = () => {
      const sectionIds = [
        "basic-info",
        "loan-purpose",
        "financial-liabilities",
        "professional-details",
        "loan-demographics",
        "credit-score"
      ];
      let current = "basic-info";

      sectionIds.forEach((id) => {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 280) {
            current = id;
          }
        }
      });
      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      history.pushState(null, "", `#${id}`);
    }
  };

  // Real-time Field Completion Progress Calculation (15 Required Fields)
  const isConditionalValid = (
    (loanPurpose === "education" && educationProjectSize.trim() !== "") ||
    (loanPurpose === "business" && businessProjectSize.trim() !== "") ||
    (loanPurpose === "personal" && personalProjectSize.trim() !== "") ||
    (loanPurpose === "other" && otherPurposeText.trim() !== "" && otherProjectSize.trim() !== "")
  );

  const fieldValidationStatus = [
    Boolean(parseFloat(annualIncome) > 0),
    Boolean(parseFloat(loanAmount) > 0),
    Boolean(loanPurpose.trim() !== ""),
    Boolean(isConditionalValid),
    Boolean(existingEmis.trim() !== "" && parseFloat(existingEmis) >= 0),
    Boolean(salaryBank.trim() !== ""),
    Boolean(netSalary.trim() !== "" && parseFloat(netSalary) > 0),
    Boolean(companyName.trim() !== ""),
    Boolean(yearsAtJob.trim() !== ""),
    Boolean(totalExperience.trim() !== ""),
    Boolean(/^\d{6}$/.test(pincode.trim())),
    Boolean(residentialStatus.trim() !== ""),
    Boolean(address.trim().length >= 10),
    Boolean(creditScore.trim() !== ""),
  ];

  const totalRequiredFields = fieldValidationStatus.length;
  const filledRequiredFields = fieldValidationStatus.filter(Boolean).length;
  const realTimeProgress = Math.round((filledRequiredFields / totalRequiredFields) * 100);

  // Dynamic progress gradient color based on progress percentage
  let progressBarGradient = "from-red-600 to-orange-600";
  if (realTimeProgress >= 70) {
    progressBarGradient = "from-aurora-600 to-teal-600";
  } else if (realTimeProgress >= 30) {
    progressBarGradient = "from-yellow-600 to-orange-600";
  }

  // Real-time DTI calculation for Section 3 display
  const currentNetSal = parseFloat(netSalary) || 0;
  const currentEmis = parseFloat(existingEmis) || 0;
  const computedDti = currentNetSal > 0 ? (currentEmis / currentNetSal) * 100 : 0;

  // Credit Score Calculator (0-100 scale)
  const calculateCreditScore = (data: {
    annualIncome: number;
    loanAmount: number;
    existingEmis: number;
    netSalary: number;
    creditScore: string;
    totalExperience: string;
    residentialStatus: string;
  }) => {
    let score = 0;
    const maxScore = 100;

    // 1. Income Score (20 points) - Scheme target: ₹2.5L - ₹5.0L
    if (data.annualIncome >= 250000 && data.annualIncome <= 500000) {
      score += 20; // Full 20 points
    } else if (data.annualIncome > 0 && data.annualIncome < 250000) {
      score += 6; // 6 points - too low, risky
    } else if (data.annualIncome > 500000) {
      score += 0; // 0 points - exceeds scheme ceiling, auto-decline
    }

    // 2. Loan Amount Score (15 points) - Ideal: Loan amount ≤ 2x annual income
    if (data.annualIncome > 0 && data.loanAmount > 0) {
      const loanToIncomeRatio = data.loanAmount / data.annualIncome;
      if (loanToIncomeRatio <= 2) {
        score += 15; // Full 15 points
      } else if (loanToIncomeRatio <= 3) {
        score += 9; // 9 points - acceptable but higher risk
      } else if (loanToIncomeRatio <= 4) {
        score += 4.5; // 4.5 points - risky
      } else {
        score += 0; // 0 points - too high, likely decline
      }
    }

    // 3. Credit Score (25 points) - MOST IMPORTANT
    if (data.creditScore === "excellent") {
      score += 25; // Full 25 points
    } else if (data.creditScore === "good") {
      score += 20; // 20 points
    } else if (data.creditScore === "fair") {
      score += 12.5; // 12.5 points
    } else if (data.creditScore === "no-history") {
      score += 10;
    } else if (data.creditScore === "needs-work") {
      score += 0; // 0 points - auto-decline
    }

    // 4. Debt-to-Income Ratio (20 points)
    if (data.netSalary > 0) {
      const dtiRatio = data.existingEmis / data.netSalary;
      if (dtiRatio <= 0.30) {
        score += 20; // Full 20 points - excellent DTI
      } else if (dtiRatio <= 0.40) {
        score += 16; // 16 points - good
      } else if (dtiRatio <= 0.50) {
        score += 12; // 12 points - acceptable
      } else if (dtiRatio <= 0.60) {
        score += 8; // 8 points - risky
      } else if (dtiRatio <= 0.70) {
        score += 4; // 4 points - very risky
      } else {
        score += 0; // 0 points - DTI >70%, likely decline
      }
    }

    // 5. Employment Stability (10 points)
    const expPoints: Record<string, number> = {
      "<1": 2,
      "0-1": 2,
      "1-3": 6,
      "1-2": 6,
      "2-5": 8,
      "3-5": 8,
      "5-10": 10,
      "10-15": 10,
      "10+": 10,
      "15+": 10
    };
    score += expPoints[data.totalExperience] || 0;

    // 6. Residential Stability (10 points)
    const residencePoints: Record<string, number> = {
      "owned-self": 10,
      "owned-family": 10,
      "rented": 4,
      "company-provided": 6,
      "pg-hostel": 2
    };
    score += residencePoints[data.residentialStatus] || 0;

    return Math.min(score, maxScore);
  };

  const calculatedEligibilityScore = useMemo(() => {
    return calculateCreditScore({
      annualIncome: parseFloat(annualIncome) || 0,
      loanAmount: parseFloat(loanAmount) || 0,
      existingEmis: parseFloat(existingEmis) || 0,
      netSalary: parseFloat(netSalary) || 0,
      creditScore,
      totalExperience,
      residentialStatus,
    });
  }, [annualIncome, loanAmount, existingEmis, netSalary, creditScore, totalExperience, residentialStatus]);

  const scoreConfig = useMemo(() => {
    if (calculatedEligibilityScore < 50) {
      return {
        barClass: "bg-gradient-to-r from-red-600 to-red-500 h-2.5 rounded-full transition-all duration-500 ease-out",
        displayColor: "text-red-500 dark:text-red-400",
        labelClass: "text-red-500 dark:text-red-400 text-xs font-medium",
        icon: "❌",
        labelText: "Low Eligibility",
        badge: "Low (0-49)",
        badgeBg: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
      };
    } else if (calculatedEligibilityScore < 70) {
      return {
        barClass: "bg-gradient-to-r from-yellow-600 to-orange-500 h-2.5 rounded-full transition-all duration-500 ease-out",
        displayColor: "text-amber-500 dark:text-yellow-400",
        labelClass: "text-amber-500 dark:text-yellow-400 text-xs font-medium",
        icon: "⚠️",
        labelText: "Moderate Eligibility",
        badge: "Moderate (50-69)",
        badgeBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      };
    } else if (calculatedEligibilityScore < 85) {
      return {
        barClass: "bg-gradient-to-r from-lime-600 to-green-500 h-2.5 rounded-full transition-all duration-500 ease-out",
        displayColor: "text-emerald-500 dark:text-lime-400",
        labelClass: "text-emerald-500 dark:text-lime-400 text-xs font-medium",
        icon: "✅",
        labelText: "Good Eligibility",
        badge: "Good (70-84)",
        badgeBg: "bg-emerald-500/10 text-emerald-600 dark:text-lime-400 border-emerald-500/20",
      };
    } else {
      return {
        barClass: "bg-gradient-to-r from-aurora-600 to-teal-500 h-2.5 rounded-full transition-all duration-500 ease-out",
        displayColor: "text-teal-600 dark:text-teal-400",
        labelClass: "text-teal-600 dark:text-teal-400 text-xs font-medium",
        icon: "🎯",
        labelText: "Excellent Eligibility",
        badge: "Excellent (85-100)",
        badgeBg: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
      };
    }
  }, [calculatedEligibilityScore]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const incomeNum = parseFloat(annualIncome) || 0;
    const loanNum = parseFloat(loanAmount) || 0;
    const existingEmisNum = parseFloat(existingEmis) || 0;
    const netSalaryNum = parseFloat(netSalary) || 0;

    // Validate income > 0
    if (incomeNum <= 0) {
      alert(t("Please enter a valid annual income"));
      return;
    }

    // Validate loan amount > 0
    if (loanNum <= 0) {
      alert(t("Please enter a valid loan amount"));
      return;
    }

    // VALIDATION 1: Net Take-Home Salary vs Annual Income
    const salaryValidation = validateNetSalary(incomeNum, netSalaryNum);
    if (!salaryValidation.valid) {
      alert("⚠️ " + t("Income Validation Failed") + "\n\n" + salaryValidation.message);
      return;
    }

    // VALIDATION 2: Existing EMIs vs Net Take-Home Salary
    const emiValidation = validateExistingEMIs(netSalaryNum, existingEmisNum);
    if (!emiValidation.valid) {
      alert("⚠️ " + t("EMI Validation Failed") + "\n\n" + emiValidation.message);
      return;
    }

    // Warning if EMIs are between 50-70% of salary
    if (existingEmisNum > (netSalaryNum * 0.50)) {
      const confirmHighEMI = window.confirm(
        `⚠️ ${t("High Debt Warning")}\n\n` +
        t("Your Existing Monthly EMIs (₹{{emis}}) are {{percent}}% of your Net Take-Home Salary.", {
          emis: existingEmisNum.toLocaleString('en-IN'),
          percent: (existingEmisNum / netSalaryNum * 100).toFixed(1)
        }) + `\n\n` +
        t("This is considered a high debt burden and may affect loan approval.") + `\n\n` +
        t("Do you want to continue?")
      );

      if (!confirmHighEMI) {
        return;
      }
    }

    // Validate pincode (6 digits)
    if (!/^\d{6}$/.test(pincode.trim())) {
      alert(t("Please enter a valid 6-digit pincode"));
      return;
    }

    // Validate address is not empty
    if (!address || address.trim().length < 10) {
      alert(t("Please enter a complete address (at least 10 characters)"));
      return;
    }

    // Conditional validation
    if (loanPurpose === "education") {
      if (!educationProjectSize) {
        alert(t("Please select your project size"));
        return;
      }
    }
    if (loanPurpose === "business") {
      if (!businessProjectSize) {
        alert(t("Please select your project size"));
        return;
      }
    }
    if (loanPurpose === "personal") {
      if (!personalProjectSize) {
        alert(t("Please select your loan size"));
        return;
      }
    }
    if (loanPurpose === "other") {
      if (!otherPurposeText.trim()) {
        alert(t("Please specify your loan purpose"));
        return;
      }
      if (!otherProjectSize) {
        alert(t("Please select your project size"));
        return;
      }
    }

    // Map purpose and projectType for downstream matching algorithms
    const isEducation = loanPurpose === "education";
    const mappedPurpose = isEducation ? "Education" : (loanPurpose === "business" ? "Business" : (loanPurpose === "personal" ? "Personal" : "Other"));
    const selectedProjectSize = loanPurpose === "education"
      ? educationProjectSize
      : (loanPurpose === "business"
        ? businessProjectSize
        : (loanPurpose === "personal"
          ? personalProjectSize
          : (loanPurpose === "other" ? otherProjectSize : undefined)));

    const mappedProjectType = selectedProjectSize === "micro"
      ? "Small"
      : (selectedProjectSize === "medium"
        ? "Medium"
        : (selectedProjectSize === "large"
          ? "Large"
          : (loanNum <= 140000 ? "Small" : loanNum <= 1000000 ? "Medium" : "Large")));

    const assessmentData: AssessmentData = {
      income: incomeNum,
      loanAmount: loanNum,
      loanPurpose,
      primaryPurpose: loanPurpose,
      educationCategory: isEducation ? educationCategory : undefined,
      educationProjectSize: isEducation ? educationProjectSize : undefined,
      businessProjectSize: loanPurpose === "business" ? businessProjectSize : undefined,
      personalReason: loanPurpose === "personal" ? personalReason : undefined,
      personalProjectSize: loanPurpose === "personal" ? personalProjectSize : undefined,
      otherPurposeText: loanPurpose === "other" ? otherPurposeText : undefined,
      otherProjectSize: loanPurpose === "other" ? otherProjectSize : undefined,
      businessScale: mappedProjectType,
      existingEmis: existingEmisNum,
      salaryBank,
      netSalary: netSalaryNum,
      companyName,
      yearsAtJob,
      totalExperience,
      pincode,
      residentialStatus,
      address,
      creditScore,
      dtiRatio: netSalaryNum > 0 ? (existingEmisNum / netSalaryNum) : (existingEmisNum / (incomeNum / 12)),
      purpose: mappedPurpose,
      projectType: mappedProjectType,
      educationLevel: isEducation ? educationCategory || "Undergraduate" : undefined,
    };

    // Construct credit applicant payload
    const creditProfile: ApplicantCreditProfile = {
      name: companyName || "Applicant",
      annualIncome: incomeNum,
      loanAmount: loanNum,
      existingEmis: existingEmisNum,
      netSalary: netSalaryNum > 0 ? netSalaryNum : Math.round(incomeNum / 12),
      salaryBank,
      primaryPurpose: loanPurpose,
      businessScale: mappedProjectType,
      loanPurpose,
      companyName,
      yearsAtJob,
      totalExperience,
      residentialStatus,
      pincode,
      address,
      creditScore: creditScore || "no-history"
    };

    console.log("Applicant data submitted:", creditProfile);
    console.log("Credit score evaluation:", creditProfile.creditScore);

    // FIRST: Run hard knockouts
    const knockoutResult = executeHardKnockouts(creditProfile);

    // Full decision engine execution
    const creditDecision = executeCreditDecisionEngine(creditProfile);

    // Save to AppState & sessionStorage
    AppState.saveAssessment(assessmentData);
    AppState.saveCreditDecision(creditDecision);

    // Continue to matched scheme / underwriting decision page
    router.push("/matched-scheme");
  };

  return (
    <AuthGuard>
      {/* Body Wrapper below Navbar */}
      <div className="min-h-[calc(100vh-4rem)] flex w-full relative bg-slate-50 dark:bg-[#070b14] text-foreground transition-colors duration-200">

        {/* Fixed Top-Right Dynamic Eligibility Score HUD Widget */}
        <div className="fixed top-20 right-4 sm:right-6 lg:right-8 z-40 w-[280px] sm:w-[320px] bg-white/90 dark:bg-navy-900/90 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-xl dark:shadow-2xl transition-all duration-300 animate-fade-in">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5">
              <span className="text-base">🎯</span>
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                {t("Eligibility Score")}
              </span>
            </div>
            <div id="creditScoreDisplay" className={`text-xl font-extrabold font-mono ${scoreConfig.displayColor}`}>
              {calculatedEligibilityScore}/100
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative h-2.5 w-full bg-slate-200 dark:bg-navy-950 rounded-full overflow-hidden mb-2">
            <div 
              id="creditScoreBar" 
              className={scoreConfig.barClass}
              style={{ width: `${calculatedEligibilityScore}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] gap-2">
            <span id="creditScoreLabel" className={`${scoreConfig.labelClass} truncate font-medium flex items-center gap-1`}>
              <span>{scoreConfig.icon}</span>
              <span>{t(scoreConfig.labelText)}</span>
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${scoreConfig.badgeBg}`}>
              {t(scoreConfig.badge)}
            </span>
          </div>

          {/* Collapsible Score Breakdown & Quick Tips */}
          <details className="mt-2.5 pt-2 border-t border-slate-200 dark:border-navy-800 text-[11px] group">
            <summary className="cursor-pointer text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-aurora-300 font-medium flex items-center justify-between select-none py-0.5">
              <span className="flex items-center gap-1">
                <span>💡</span>
                <span>{t("How to improve score")}</span>
              </span>
              <span className="text-[10px] text-slate-400 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="mt-2 space-y-1.5 text-[11px] text-slate-600 dark:text-slate-400 max-h-48 overflow-y-auto pr-1">
              <div className="flex justify-between items-center py-0.5 border-b border-slate-100 dark:border-navy-800/50">
                <span>{t("Income ₹2.5L-₹5L:")}</span>
                <span className="text-teal-600 dark:text-teal-400 font-mono font-semibold">{t("+20 pts")}</span>
              </div>
              <div className="flex justify-between items-center py-0.5 border-b border-slate-100 dark:border-navy-800/50">
                <span>{t("Loan ≤ 2x Income:")}</span>
                <span className="text-teal-600 dark:text-teal-400 font-mono font-semibold">{t("+15 pts")}</span>
              </div>
              <div className="flex justify-between items-center py-0.5 border-b border-slate-100 dark:border-navy-800/50">
                <span>{t("Credit Score 775+:")}</span>
                <span className="text-teal-600 dark:text-teal-400 font-mono font-semibold">{t("+25 pts")}</span>
              </div>
              <div className="flex justify-between items-center py-0.5 border-b border-slate-100 dark:border-navy-800/50">
                <span>{t("DTI Ratio ≤ 30%:")}</span>
                <span className="text-teal-600 dark:text-teal-400 font-mono font-semibold">{t("+20 pts")}</span>
              </div>
              <div className="flex justify-between items-center py-0.5 border-b border-slate-100 dark:border-navy-800/50">
                <span>{t("Experience 5+ yrs:")}</span>
                <span className="text-teal-600 dark:text-teal-400 font-mono font-semibold">{t("+10 pts")}</span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span>{t("Owned Home:")}</span>
                <span className="text-teal-600 dark:text-teal-400 font-mono font-semibold">{t("+10 pts")}</span>
              </div>
            </div>
          </details>
        </div>

        {/* Left Sidebar ("Assessment Sections"): Fixed to the left */}
        <aside className="w-64 shrink-0 fixed top-16 left-0 bottom-0 h-[calc(100vh-4rem)] overflow-y-auto border-r border-slate-200 dark:border-navy-800 p-5 hidden md:flex flex-col gap-6 bg-white dark:bg-navy-900 z-30 shadow-xs">
          
          {/* Real-time Sidebar Progress Indicator (Fixed at Top of Sidebar) */}
          <div className="p-4 bg-slate-50 dark:bg-navy-800/90 border border-slate-200 dark:border-navy-700 rounded-xl shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <p className="text-slate-900 dark:text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span>📊</span>
                <span>{t("Form Progress")}</span>
              </p>
              <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                {filledRequiredFields}/{totalRequiredFields}
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-navy-700 rounded-full h-2 overflow-hidden">
              <div
                id="progressBar"
                className={`bg-gradient-to-r ${progressBarGradient} h-2 rounded-full transition-all duration-300`}
                style={{ width: `${realTimeProgress}%` }}
              />
            </div>
            <p id="progressText" className="text-slate-500 dark:text-muted-foreground text-[11px] mt-2 font-medium">
              {t("{{progress}}% Complete ({{filled}}/{{total}} fields)", {
                progress: realTimeProgress,
                filled: filledRequiredFields,
                total: totalRequiredFields,
              })}
            </p>
          </div>

          {/* Assessment Sections Navigation */}
          <div className="flex-1">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <span>📑</span>
              <span>{t("Assessment Sections")}</span>
            </h3>
            
            <nav className="space-y-1.5">
              {[
                { id: "basic-info", icon: "💰", label: "Basic Financial Info" },
                { id: "loan-purpose", icon: "🎯", label: "Loan Purpose & Scale" },
                { id: "financial-liabilities", icon: "💡", label: "Financial Liabilities" },
                { id: "professional-details", icon: "🏢", label: "Professional Details" },
                { id: "loan-demographics", icon: "📌", label: "Loan Demographics" },
                { id: "credit-score", icon: "📊", label: "Credit Profile" },
              ].map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(item.id);
                  }}
                  className={`section-link block px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    activeSection === item.id
                      ? "bg-teal-50 dark:bg-aurora-900/30 text-teal-700 dark:text-aurora-400 font-semibold border-l-2 border-teal-600 dark:border-aurora-400 shadow-xs"
                      : "text-slate-600 dark:text-muted-foreground hover:bg-slate-100 dark:hover:bg-aurora-900/20 hover:text-slate-900 dark:hover:text-aurora-300"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-base">{item.icon}</span>
                    <span>{t(item.label)}</span>
                  </span>
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Assessment Area */}
        <div id="mainScrollContainer" className="flex-1 w-full md:pl-64 px-4 sm:px-8 py-8 flex flex-col items-center">
          {/* Mobile Section Selector (only visible on mobile) */}
          <div className="md:hidden w-full max-w-4xl mb-4 sticky top-20 z-20 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl p-3 shadow-md">
            <select
              id="mobileSectionSelector"
              value={`#${activeSection}`}
              onChange={(e) => {
                const val = e.target.value;
                if (val) {
                  const targetId = val.replace("#", "");
                  scrollToSection(targetId);
                }
              }}
              className="w-full bg-slate-50 dark:bg-navy-800 border border-slate-300 dark:border-navy-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white text-sm"
            >
              <option value="">{t("Jump to section...")}</option>
              <option value="#basic-info">💰 {t("Basic Financial Info")}</option>
              <option value="#loan-purpose">🎯 {t("Loan Purpose & Scale")}</option>
              <option value="#financial-liabilities">💡 {t("Financial Liabilities")}</option>
              <option value="#professional-details">🏢 {t("Professional Details")}</option>
              <option value="#loan-demographics">📌 {t("Loan Demographics")}</option>
              <option value="#credit-score">📊 {t("Credit Profile")}</option>
            </select>
          </div>

          {/* Centered Inner Form Container */}
          <div className="w-full max-w-4xl mx-auto flex flex-col gap-6">

            {/* Stepper Progress */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  {t("Step 1 of 4: Applicant Profile")}
                </span>
                <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">
                  {t("{{progress}}% Complete ({{filled}}/{{total}} fields)", {
                    progress: realTimeProgress,
                    filled: filledRequiredFields,
                    total: totalRequiredFields,
                  })}
                </span>
              </div>

              <div className="h-2 w-full bg-slate-200 dark:bg-navy-800 rounded-full overflow-hidden flex">
                <div 
                  className={`h-full bg-gradient-to-r ${progressBarGradient} rounded-full transition-all duration-300`} 
                  style={{ width: `${realTimeProgress}%` }}
                />
              </div>
            </div>


            {/* Quick Jump Navigation Bar */}
            <div className="rounded-xl p-2.5 border border-slate-200/80 dark:border-border/80 bg-white/80 dark:bg-card/70 backdrop-blur-md flex flex-wrap items-center justify-between gap-2 shadow-sm dark:shadow-lg relative z-20">
              <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-muted-foreground font-semibold px-2">
                <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>{t("Quick Jump:")}</span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium">
                {/* 1. Assessment button -> stays on current page / scrolls to top (active) */}
                <button
                  type="button"
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  className="px-3 py-1.5 rounded-lg bg-teal-50 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 font-bold border border-teal-200 dark:border-teal-500/40 shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-teal-600 dark:bg-teal-500 animate-pulse" />
                  <span>{t("Assessment")}</span>
                </button>

                {/* 2. Matched Scheme button -> navigates to /matched-scheme */}
                <Link
                  href="/matched-scheme"
                  className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-muted/50 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 hover:text-indigo-600 dark:hover:text-indigo-300 text-slate-700 dark:text-muted-foreground border border-slate-200 dark:border-border/60 flex items-center gap-1.5 transition-all cursor-pointer group"
                >
                  <span>{t("Matched Scheme")}</span>
                  <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-transform" />
                </Link>

                {/* 3. EMI Calculator button -> navigates to /emi-calculator */}
                <Link
                  href="/emi-calculator"
                  className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-muted/50 hover:bg-purple-50 dark:hover:bg-purple-500/20 hover:text-purple-600 dark:hover:text-purple-300 text-slate-700 dark:text-muted-foreground border border-slate-200 dark:border-border/60 flex items-center gap-1.5 transition-all cursor-pointer group"
                >
                  <span>{t("EMI Calculator")}</span>
                  <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-purple-500 group-hover:translate-x-0.5 transition-transform" />
                </Link>

                {/* 4. Partner Network button -> navigates to /partner-network */}
                <Link
                  href="/partner-network"
                  className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-muted/50 hover:bg-teal-50 dark:hover:bg-teal-500/20 hover:text-teal-600 dark:hover:text-teal-300 text-slate-700 dark:text-muted-foreground border border-slate-200 dark:border-border/60 flex items-center gap-1.5 transition-all cursor-pointer group"
                >
                  <span>{t("Partner Network")}</span>
                  <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-teal-500 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Heading Area */}
            <div className="space-y-2 text-center sm:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/10 px-3.5 py-1 text-xs text-indigo-700 dark:text-indigo-300 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-500" />
                <span>{t("Ministry of Social Justice & Empowerment Alignment")}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {t("Eligibility Assessment")}
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {t("Enter your financial details, employment profile, and credit background to check your scheme qualification.")}
              </p>
            </div>

            {/* Assessment Card & Form */}
            <div className="border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900/60 backdrop-blur-md shadow-xl dark:shadow-2xl rounded-2xl p-6 sm:p-8 relative overflow-hidden text-slate-900 dark:text-card-foreground">
              <div className="h-1.5 w-full bg-gradient-to-r from-aurora-500 via-purple-500 to-teal-400 absolute top-0 left-0" />

              <form id="assessmentForm" onSubmit={handleSubmit} className="space-y-8">

                {/* SECTION 1: Basic Financial Information */}
                <div className="mb-8 p-6 bg-slate-50/70 dark:bg-navy-800/50 border border-slate-200/80 dark:border-navy-700 rounded-xl space-y-6">
                  <h2 id="basic-info" className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-6 scroll-mt-24">
                    💰 {t("Basic Financial Information")}
                  </h2>

                  {/* 1. Annual Family Income */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label htmlFor="income" className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center">
                        <span>{t("Annual Family Income")} (₹)</span>
                        <span className="text-rose-500 dark:text-red-400 text-sm font-normal ml-1.5">*</span>
                      </label>
                      <span className="text-[11px] text-teal-600 dark:text-teal-400 font-mono font-medium">{t("Limit: ≤ ₹5,00,000")}</span>
                    </div>

                    <div className="relative">
                      <span className="absolute left-3.5 top-3 text-slate-400 dark:text-muted-foreground font-bold text-sm">₹</span>
                      <input
                        id="income"
                        name="income"
                        type="number"
                        required
                        min="1000"
                        max="5000000"
                        placeholder={t("e.g. 250000")}
                        value={annualIncome}
                        onChange={(e) => setAnnualIncome(e.target.value)}
                        className="w-full bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 rounded-lg pl-8 pr-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-teal-500 dark:focus:border-aurora-500 focus:ring-2 focus:ring-teal-500/20 dark:focus:ring-aurora-500/20 transition-all font-mono text-sm shadow-xs"
                      />
                    </div>

                    {/* Quick Chips */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className="text-[11px] text-slate-500 dark:text-muted-foreground">{t("Quick Select:")}</span>
                      {[150000, 300000, 500000, 750000].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setAnnualIncome(val.toString())}
                          className="text-[11px] font-mono font-medium px-2.5 py-1 rounded-lg border border-slate-300 dark:border-navy-700 bg-white dark:bg-navy-900/60 text-slate-700 dark:text-slate-300 hover:bg-teal-600 hover:text-white dark:hover:bg-teal-600 dark:hover:text-white hover:border-teal-600 transition-colors cursor-pointer shadow-xs"
                        >
                          ₹{(val / 100000).toFixed(2)}L {val === 500000 ? t("(Max)") : ""}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2. Loan Amount Needed */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label htmlFor="loanAmount" className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center">
                        <span>{t("Required Loan Amount")} (₹)</span>
                        <span className="text-rose-500 dark:text-red-400 text-sm font-normal ml-1.5">*</span>
                      </label>
                      <span className="text-[11px] text-indigo-600 dark:text-aurora-400 font-mono font-medium">{t("Up to ₹50,00,000")}</span>
                    </div>

                    <div className="relative">
                      <span className="absolute left-3.5 top-3 text-slate-400 dark:text-muted-foreground font-bold text-sm">₹</span>
                      <input
                        id="loanAmount"
                        name="loanAmount"
                        type="number"
                        required
                        min="5000"
                        max="5000000"
                        placeholder={t("e.g. 120000")}
                        value={loanAmount}
                        onChange={(e) => setLoanAmount(e.target.value)}
                        className="w-full bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 rounded-lg pl-8 pr-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-teal-500 dark:focus:border-aurora-500 focus:ring-2 focus:ring-teal-500/20 dark:focus:ring-aurora-500/20 transition-all font-mono text-sm shadow-xs"
                      />
                    </div>

                    {/* Quick Chips */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className="text-[11px] text-slate-500 dark:text-muted-foreground">{t("Quick Select:")}</span>
                      {[
                        { val: 100000, labelKey: "₹1.00L (Micro)" },
                        { val: 500000, labelKey: "₹5.00L" },
                        { val: 1500000, labelKey: "₹15.00L (Term)" },
                        { val: 3000000, labelKey: "₹30.00L" },
                      ].map(({ val, labelKey }) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setLoanAmount(val.toString())}
                          className="text-[11px] font-mono font-medium px-2.5 py-1 rounded-lg border border-slate-300 dark:border-navy-700 bg-white dark:bg-navy-900/60 text-slate-700 dark:text-slate-300 hover:bg-teal-600 hover:text-white dark:hover:bg-teal-600 dark:hover:text-white hover:border-teal-600 transition-colors cursor-pointer shadow-xs"
                        >
                          {t(labelKey)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* SECTION 2: Loan Purpose */}
                <div className="mb-8 p-6 bg-slate-50/70 dark:bg-navy-800/50 border border-slate-200/80 dark:border-navy-700 rounded-xl space-y-6">
                  <h2 id="loan-purpose" className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2 scroll-mt-24">
                    🎯 {t("Loan Purpose & Scale")}
                  </h2>
                  
                  {/* Primary Loan Purpose */}
                  <div>
                    <label htmlFor="loanPurpose" className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
                      {t("Primary Loan Purpose")} *
                    </label>
                    <select
                      id="loanPurpose"
                      name="loanPurpose"
                      required
                      value={loanPurpose}
                      onChange={(e) => setLoanPurpose(e.target.value)}
                      className="w-full px-4 py-3 bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:focus:ring-aurora-500 focus:border-teal-500 dark:focus:border-transparent transition-all cursor-pointer text-sm shadow-xs"
                    >
                      <option value="">{t("Select Purpose")}</option>
                      <option value="education">{t("Education")}</option>
                      <option value="business">{t("Business / Self-Employment")}</option>
                      <option value="personal">{t("Personal Reasons")}</option>
                      <option value="other">{t("Other")}</option>
                    </select>
                  </div>
                  
                  {/* Education Project Size (Conditional) */}
                  {loanPurpose === "education" && (
                    <div id="educationCategoryContainer" className="space-y-4 animate-fade-in transition-all">
                      {/* Project Size for Education */}
                      <div>
                        <label htmlFor="educationProjectSize" className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
                          {t("Project Size")} *
                        </label>
                        <select
                          id="educationProjectSize"
                          name="educationProjectSize"
                          required
                          value={educationProjectSize}
                          onChange={(e) => setEducationProjectSize(e.target.value)}
                          className="w-full px-4 py-3 bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:focus:ring-aurora-500 focus:border-teal-500 dark:focus:border-transparent transition-all cursor-pointer text-sm shadow-xs"
                        >
                          <option value="">{t("Select Project Size")}</option>
                          <option value="micro">{t("Micro (Up to ₹1.40 Lakh) - Diploma, Certificate, Short-term Courses")}</option>
                          <option value="medium">{t("Medium (₹1.40 Lakh - ₹10 Lakh) - Undergraduate, Postgraduate, Professional Courses")}</option>
                          <option value="large">{t("Large (₹10 Lakh - ₹50 Lakh) - Ph.D., Study Abroad, Research Programs")}</option>
                        </select>
                        <p className="text-xs text-slate-500 dark:text-muted-foreground mt-2">
                          💡 {t("Select based on your total education expense requirement")}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Business Project Size (Conditional) */}
                  {loanPurpose === "business" && (
                    <div id="businessTypeContainer" className="space-y-4 animate-fade-in transition-all">
                      {/* Project Size for Business */}
                      <div>
                        <label htmlFor="businessProjectSize" className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
                          {t("Project Size")} *
                        </label>
                        <select
                          id="businessProjectSize"
                          name="businessProjectSize"
                          required
                          value={businessProjectSize}
                          onChange={(e) => setBusinessProjectSize(e.target.value)}
                          className="w-full px-4 py-3 bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:focus:ring-aurora-500 focus:border-teal-500 dark:focus:border-transparent transition-all cursor-pointer text-sm shadow-xs"
                        >
                          <option value="">{t("Select Project Size")}</option>
                          <option value="micro">{t("Micro (Up to ₹1.40 Lakh) - Small business, working capital, equipment purchase")}</option>
                          <option value="medium">{t("Medium (₹1.40 Lakh - ₹10 Lakh) - Business expansion, machinery, inventory")}</option>
                          <option value="large">{t("Large (₹10 Lakh - ₹50 Lakh) - Large-scale manufacturing, infrastructure, franchise")}</option>
                        </select>
                        <p className="text-xs text-slate-500 dark:text-muted-foreground mt-2">
                          💡 {t("Micro: Small projects (Micro Finance Scheme) | Medium/Large: Term Loan Scheme")}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Personal Project Size (Conditional) */}
                  {loanPurpose === "personal" && (
                    <div id="personalReasonContainer" className="space-y-4 animate-fade-in transition-all">
                      {/* Project Size for Personal */}
                      <div>
                        <label htmlFor="personalProjectSize" className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
                          {t("Loan Size")} *
                        </label>
                        <select
                          id="personalProjectSize"
                          name="personalProjectSize"
                          required
                          value={personalProjectSize}
                          onChange={(e) => setPersonalProjectSize(e.target.value)}
                          className="w-full px-4 py-3 bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:focus:ring-aurora-500 focus:border-teal-500 dark:focus:border-transparent transition-all cursor-pointer text-sm shadow-xs"
                        >
                          <option value="">{t("Select Loan Size")}</option>
                          <option value="micro">{t("Micro (Up to ₹1 Lakh) - Small personal needs, consumer durables")}</option>
                          <option value="medium">{t("Medium (₹1 Lakh - ₹5 Lakh) - Medical, wedding, vehicle purchase")}</option>
                          <option value="large">{t("Large (₹5 Lakh+) - Major expenses, debt consolidation, home renovation")}</option>
                        </select>
                        <p className="text-xs text-slate-500 dark:text-muted-foreground mt-2">
                          💡 {t("Select based on your total loan requirement")}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Other Purpose (Conditional) */}
                  {loanPurpose === "other" && (
                    <div id="otherPurposeContainer" className="space-y-4 animate-fade-in transition-all">
                      <div>
                        <label htmlFor="otherPurposeText" className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
                          {t("Specify Other Purpose")} *
                        </label>
                        <input
                          type="text"
                          id="otherPurposeText"
                          name="otherPurposeText"
                          required
                          placeholder={t("e.g., Starting a coaching center, Buying agricultural equipment, etc.")}
                          value={otherPurposeText}
                          onChange={(e) => setOtherPurposeText(e.target.value)}
                          className="w-full px-4 py-3 bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:focus:ring-aurora-500 focus:border-teal-500 dark:focus:border-transparent transition-all text-sm shadow-xs"
                        />
                      </div>

                      {/* Project Size for Other */}
                      <div>
                        <label htmlFor="otherProjectSize" className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
                          {t("Project Size")} *
                        </label>
                        <select
                          id="otherProjectSize"
                          name="otherProjectSize"
                          required
                          value={otherProjectSize}
                          onChange={(e) => setOtherProjectSize(e.target.value)}
                          className="w-full px-4 py-3 bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:focus:ring-aurora-500 focus:border-teal-500 dark:focus:border-transparent transition-all cursor-pointer text-sm shadow-xs"
                        >
                          <option value="">{t("Select Project Size")}</option>
                          <option value="micro">{t("Micro (Up to ₹1.40 Lakh) - Small projects")}</option>
                          <option value="medium">{t("Medium (₹1.40 Lakh - ₹10 Lakh) - Medium-scale projects")}</option>
                          <option value="large">{t("Large (₹10 Lakh - ₹50 Lakh) - Large-scale projects")}</option>
                        </select>
                        <p className="text-xs text-slate-500 dark:text-muted-foreground mt-2">
                          💡 {t("Select based on your total project cost")}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* SECTION 3: Financial Liabilities & Banking Profile */}
                <div className="mb-8 p-6 bg-slate-50/70 dark:bg-navy-800/50 border border-slate-200/80 dark:border-navy-700 rounded-xl">
                  <h2 id="financial-liabilities" className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-6 scroll-mt-24">
                    💡 {t("Financial Liabilities & Banking Profile")}
                  </h2>
                  
                  {/* Existing Monthly EMIs */}
                  <div className="mb-6">
                    <label htmlFor="existingEmis" className="block text-slate-900 dark:text-white font-medium mb-2">
                      {t("Existing Monthly EMIs")} (₹)
                      <span className="text-red-500 dark:text-red-400 text-sm font-normal ml-2">*</span>
                    </label>
                    <input 
                      type="number" 
                      id="existingEmis"
                      name="existingEmis"
                      required
                      min="0"
                      placeholder="₹0" 
                      value={existingEmis}
                      onChange={(e) => setExistingEmis(e.target.value)}
                      className="w-full bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 rounded-lg px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-muted-foreground focus:border-teal-500 dark:focus:border-aurora-500 focus:ring-2 focus:ring-teal-500/20 dark:focus:ring-aurora-500/20 transition-all font-mono"
                    />
                    <p className="text-slate-500 dark:text-muted-foreground text-xs mt-2">
                      ℹ️ {t("Include home loan, car loan, personal loan, credit card EMIs, etc.")}
                    </p>
                  </div>
                  
                  {/* Salary Account Bank Name */}
                  <div className="mb-6">
                    <label htmlFor="salaryBank" className="block text-slate-900 dark:text-white font-medium mb-2">
                      {t("Salary Account Bank Name")}
                      <span className="text-red-500 dark:text-red-400 text-sm font-normal ml-2">*</span>
                    </label>
                    <select 
                      id="salaryBank" 
                      name="salaryBank"
                      required 
                      value={salaryBank}
                      onChange={(e) => setSalaryBank(e.target.value)}
                      className="w-full bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 rounded-lg px-4 py-3 text-slate-900 dark:text-white focus:border-teal-500 dark:focus:border-aurora-500 focus:ring-2 focus:ring-teal-500/20 dark:focus:ring-aurora-500/20 transition-all cursor-pointer"
                    >
                      <option value="">{t("Select your bank")}</option>
                      <option value="sbi">{t("State Bank of India (SBI)")}</option>
                      <option value="hdfc">{t("HDFC Bank")}</option>
                      <option value="icici">{t("ICICI Bank")}</option>
                      <option value="axis">{t("Axis Bank")}</option>
                      <option value="kotak">{t("Kotak Mahindra Bank")}</option>
                      <option value="pnb">{t("Punjab National Bank")}</option>
                      <option value="bob">{t("Bank of Baroda")}</option>
                      <option value="canara">{t("Canara Bank")}</option>
                      <option value="union">{t("Union Bank of India")}</option>
                      <option value="other-private">{t("Other Private Bank")}</option>
                      <option value="other-psb">{t("Other Public Sector Bank")}</option>
                      <option value="other">{t("Other Bank")}</option>
                    </select>
                    <p className="text-slate-500 dark:text-muted-foreground text-xs mt-2">
                      💡 {t("Some banks offer pre-approved corporate offers for salary account holders")}
                    </p>
                  </div>
                  
                  {/* Net Take-Home Salary */}
                  <div className="mb-4">
                    <label htmlFor="netSalary" className="block text-slate-900 dark:text-white font-medium mb-2">
                      {t("Net Take-Home Salary")} (₹/{t("month")})
                      <span className="text-red-500 dark:text-red-400 text-sm font-normal ml-2">*</span>
                    </label>
                    <input 
                      type="number" 
                      id="netSalary"
                      name="netSalary"
                      required
                      min="0"
                      placeholder="₹0" 
                      value={netSalary}
                      onChange={(e) => setNetSalary(e.target.value)}
                      className="w-full bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 rounded-lg px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-muted-foreground focus:border-teal-500 dark:focus:border-aurora-500 focus:ring-2 focus:ring-teal-500/20 dark:focus:ring-aurora-500/20 transition-all font-mono"
                    />
                    <p className="text-slate-500 dark:text-muted-foreground text-xs mt-2">
                      ℹ️ {t("This is the actual amount credited to your bank account monthly (not CTC)")}
                    </p>
                  </div>

                  {/* Real-time DTI Display Card */}
                  {currentNetSal > 0 && (
                    <div className={`mt-4 p-4 rounded-xl border transition-all duration-300 ${
                      computedDti > 70
                        ? "bg-rose-50 dark:bg-red-950/40 border-rose-200 dark:border-red-500/50 text-rose-900 dark:text-red-200"
                        : computedDti > 50
                        ? "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-500/50 text-amber-900 dark:text-amber-200"
                        : "bg-emerald-50 dark:bg-teal-950/40 border-emerald-200 dark:border-teal-500/50 text-emerald-900 dark:text-teal-200"
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                          📊 {t("Debt-to-Income (DTI) Ratio:")}
                        </span>
                        <span className="text-sm font-mono font-extrabold text-slate-900 dark:text-white">
                          {computedDti.toFixed(1)}%
                        </span>
                      </div>

                      {/* Visual DTI Bar */}
                      <div className="w-full bg-slate-200 dark:bg-navy-900 rounded-full h-2 mb-2 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${
                            computedDti > 70 
                              ? "bg-rose-500" 
                              : computedDti > 50 
                              ? "bg-amber-500" 
                              : "bg-emerald-500"
                          }`}
                          style={{ width: `${Math.min(100, computedDti)}%` }}
                        />
                      </div>

                      <p className={`text-xs font-semibold ${
                        computedDti > 70 
                          ? "text-rose-700 dark:text-red-400" 
                          : computedDti > 50 
                          ? "text-amber-700 dark:text-amber-400" 
                          : "text-emerald-700 dark:text-teal-400"
                      }`}>
                        {computedDti > 70 
                          ? t("Critical: DTI exceeds 70% threshold. This will trigger an automatic policy decline.") 
                          : computedDti > 50 
                          ? t("Warning: DTI is above 50%. High debt burden may reduce maximum eligible loan size.") 
                          : t("Healthy: DTI is within acceptable credit underwriting guidelines (≤50%).")}
                      </p>
                    </div>
                  )}
                </div>

                {/* SECTION 4: Professional Stability & Employment Details */}
                <div className="mb-8 p-6 bg-slate-50/70 dark:bg-navy-800/50 border border-slate-200/80 dark:border-navy-700 rounded-xl">
                  <h2 id="professional-details" className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-6 scroll-mt-24">
                    🏢 {t("Professional Stability & Employment Details")}
                  </h2>
                  
                  {/* Current Employer/Company Name */}
                  <div className="mb-6">
                    <label htmlFor="companyName" className="block text-slate-900 dark:text-white font-medium mb-2">
                      {t("Current Employer/Company Name")}
                      <span className="text-red-500 dark:text-red-400 text-sm font-normal ml-2">*</span>
                    </label>
                    <input 
                      type="text" 
                      id="companyName"
                      name="companyName"
                      required
                      placeholder={t("e.g., TCS, Infosys, HCL, Government, etc.")} 
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 rounded-lg px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-muted-foreground focus:border-teal-500 dark:focus:border-aurora-500 focus:ring-2 focus:ring-teal-500/20 dark:focus:ring-aurora-500/20 transition-all"
                    />
                    <p className="text-slate-500 dark:text-muted-foreground text-xs mt-2">
                      💼 {t("Lenders offer better rates for Tier-1 companies (MNCs, Govt, etc.)")}
                    </p>
                  </div>
                  
                  {/* Years at Current Job */}
                  <div className="mb-6">
                    <label htmlFor="yearsAtJob" className="block text-slate-900 dark:text-white font-medium mb-2">
                      {t("Years at Current Job")}
                      <span className="text-red-500 dark:text-red-400 text-sm font-normal ml-2">*</span>
                    </label>
                    <select 
                      id="yearsAtJob" 
                      name="yearsAtJob"
                      required 
                      value={yearsAtJob}
                      onChange={(e) => setYearsAtJob(e.target.value)}
                      className="w-full bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 rounded-lg px-4 py-3 text-slate-900 dark:text-white focus:border-teal-500 dark:focus:border-aurora-500 focus:ring-2 focus:ring-teal-500/20 dark:focus:ring-aurora-500/20 transition-all cursor-pointer"
                    >
                      <option value="">{t("Select duration")}</option>
                      <option value="0-1">{t("Less than 1 year")}</option>
                      <option value="1-2">{t("1-2 years")}</option>
                      <option value="2-5">{t("2-5 years")}</option>
                      <option value="5-10">{t("5-10 years")}</option>
                      <option value="10+">{t("10+ years")}</option>
                    </select>
                    <p className="text-slate-500 dark:text-muted-foreground text-xs mt-2">
                      ✓ {t("Longer tenure shows job stability and improves approval chances")}
                    </p>
                  </div>
                  
                  {/* Total Work Experience */}
                  <div className="mb-4">
                    <label htmlFor="totalExperience" className="block text-slate-900 dark:text-white font-medium mb-2">
                      {t("Total Work Experience")}
                      <span className="text-red-500 dark:text-red-400 text-sm font-normal ml-2">*</span>
                    </label>
                    <select 
                      id="totalExperience" 
                      name="totalExperience"
                      required 
                      value={totalExperience}
                      onChange={(e) => setTotalExperience(e.target.value)}
                      className="w-full bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 rounded-lg px-4 py-3 text-slate-900 dark:text-white focus:border-teal-500 dark:focus:border-aurora-500 focus:ring-2 focus:ring-teal-500/20 dark:focus:ring-aurora-500/20 transition-all cursor-pointer"
                    >
                      <option value="">{t("Select experience")}</option>
                      <option value="0-1">{t("Less than 1 year (Fresher)")}</option>
                      <option value="1-3">{t("1-3 years")}</option>
                      <option value="3-5">{t("3-5 years")}</option>
                      <option value="5-10">{t("5-10 years")}</option>
                      <option value="10-15">{t("10-15 years")}</option>
                      <option value="15+">{t("15+ years")}</option>
                    </select>
                    <p className="text-slate-500 dark:text-muted-foreground text-xs mt-2">
                      📈 {t("More experience = better career stability = higher loan eligibility")}
                    </p>
                  </div>
                </div>

                {/* SECTION 5: Residential Demographics */}
                <div className="mb-8 p-6 bg-slate-50/70 dark:bg-navy-800/50 border border-slate-200/80 dark:border-navy-700 rounded-xl">
                  <h2 id="loan-demographics" className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-6 scroll-mt-24">
                    📌 {t("Residential Demographics")}
                  </h2>
                  
                  {/* Current Pincode */}
                  <div className="mb-6">
                    <label htmlFor="pincode" className="block text-slate-900 dark:text-white font-medium mb-2">
                      {t("Current Pincode")}
                      <span className="text-red-500 dark:text-red-400 text-sm font-normal ml-2">*</span>
                    </label>
                    <input 
                      type="text" 
                      id="pincode"
                      name="pincode"
                      required 
                      maxLength={6}
                      pattern="[0-9]{6}"
                      placeholder={t("e.g., 110001")} 
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      className="w-full bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 rounded-lg px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-muted-foreground focus:border-teal-500 dark:focus:border-aurora-500 focus:ring-2 focus:ring-teal-500/20 dark:focus:ring-aurora-500/20 transition-all font-mono"
                    />
                    <p className="text-slate-500 dark:text-muted-foreground text-xs mt-2">
                      📍 {t("Helps find nearest channel partners and location-specific schemes")}
                    </p>
                  </div>
                  
                  {/* Current Residential Status */}
                  <div className="mb-6">
                    <label htmlFor="residentialStatus" className="block text-slate-900 dark:text-white font-medium mb-2">
                      {t("Current Residential Status")}
                      <span className="text-red-500 dark:text-red-400 text-sm font-normal ml-2">*</span>
                    </label>
                    <select 
                      id="residentialStatus" 
                      name="residentialStatus"
                      required 
                      value={residentialStatus}
                      onChange={(e) => setResidentialStatus(e.target.value)}
                      className="w-full bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 rounded-lg px-4 py-3 text-slate-900 dark:text-white focus:border-teal-500 dark:focus:border-aurora-500 focus:ring-2 focus:ring-teal-500/20 dark:focus:ring-aurora-500/20 transition-all cursor-pointer"
                    >
                      <option value="">{t("Select status")}</option>
                      <option value="owned-self">{t("Owned by Self")}</option>
                      <option value="owned-family">{t("Owned by Family/Parents")}</option>
                      <option value="rented">{t("Rented")}</option>
                      <option value="pg-hostel">{t("PG/Hostel")}</option>
                      <option value="company-provided">{t("Company Provided Accommodation")}</option>
                      <option value="other">{t("Other")}</option>
                    </select>
                    <p className="text-slate-500 dark:text-muted-foreground text-xs mt-2">
                      🏠 {t("Home ownership indicates asset stability and may improve approval")}
                    </p>
                  </div>

                  {/* Complete Address */}
                  <div className="mb-4">
                    <label htmlFor="address" className="block text-slate-900 dark:text-white font-medium mb-2">
                      {t("Complete Address")}
                      <span className="text-red-500 dark:text-red-400 text-sm font-normal ml-2">*</span>
                    </label>
                    <textarea 
                      id="address"
                      name="address"
                      required
                      rows={3}
                      placeholder={t("House/Flat No., Building Name, Street, Area, Landmark")} 
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 rounded-lg px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-muted-foreground focus:border-teal-500 dark:focus:border-aurora-500 focus:ring-2 focus:ring-teal-500/20 dark:focus:ring-aurora-500/20 transition-all resize-none"
                    />
                    <p className="text-slate-500 dark:text-muted-foreground text-xs mt-2">
                      📍 {t("Your complete residential address for loan processing")}
                    </p>
                  </div>
                </div>

                {/* SECTION 6: Credit Profile & Score Assessment */}
                <div className="mb-8 p-6 bg-slate-50/70 dark:bg-navy-800/50 border border-slate-200/80 dark:border-navy-700 rounded-xl">
                  <h2 id="credit-score" className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-6 scroll-mt-24">
                    📊 {t("Credit Profile & Score Assessment")}
                  </h2>
                  
                  {/* Credit Score Range */}
                  <div className="mb-4">
                    <label htmlFor="creditScore" className="block text-slate-900 dark:text-white font-medium mb-2">
                      {t("Credit Score Range (CIBIL)")}
                      <span className="text-red-500 dark:text-red-400 text-sm font-normal ml-2">*</span>
                    </label>
                    <select 
                      id="creditScore" 
                      name="creditScore"
                      required 
                      value={creditScore}
                      onChange={(e) => setCreditScore(e.target.value)}
                      className="w-full bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 rounded-lg px-4 py-3 text-slate-900 dark:text-white focus:border-teal-500 dark:focus:border-aurora-500 focus:ring-2 focus:ring-teal-500/20 dark:focus:ring-aurora-500/20 transition-all cursor-pointer"
                    >
                      <option value="">{t("Select your credit score range")}</option>
                      <option value="excellent">{t("Excellent (775 - 900)")}</option>
                      <option value="good">{t("Good (700 - 774)")}</option>
                      <option value="fair">{t("Fair (600 - 699)")}</option>
                      <option value="needs-work">{t("Needs Work (Below 600)")}</option>
                      <option value="no-history">{t("I don't know / First time borrowing (No History)")}</option>
                    </select>
                    <div className="mt-3 p-3.5 bg-indigo-50/80 dark:bg-aurora-900/20 border border-indigo-200/80 dark:border-aurora-700/50 rounded-lg">
                      <p className="text-slate-900 dark:text-white text-sm font-semibold mb-2">💡 {t("Credit Score Impact:")}</p>
                      <ul className="text-slate-600 dark:text-muted-foreground text-xs space-y-1">
                        <li>-  {t("Excellent (775+): Best interest rates, highest approval chance")}</li>
                        <li>-  {t("Good (700-774): Competitive rates, good approval chance")}</li>
                        <li>-  {t("Fair (600-699): Standard rates, may need additional documentation")}</li>
                        <li>-  {t("Below 600: Higher interest rates, lower approval chance")}</li>
                        <li>-  {t("No History: First-time borrower schemes available")}</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  {calculatedEligibilityScore < 40 ? (
                    <button
                      type="submit"
                      disabled
                      className="w-full h-14 py-3 px-4 bg-slate-100 dark:bg-navy-800/80 border border-slate-300 dark:border-navy-700 text-slate-400 dark:text-muted-foreground rounded-xl font-bold flex items-center justify-center gap-2 cursor-not-allowed transition-all opacity-80"
                    >
                      <span>❌ {t("Improve Eligibility Score (Min 40 Required)")}</span>
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="w-full h-14 rounded-xl bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-700 hover:to-indigo-700 text-white font-bold text-base flex items-center justify-center gap-2 shadow-xl shadow-teal-500/25 dark:shadow-aurora-500/25 transition-all group cursor-pointer"
                    >
                      <Sparkles className="w-5 h-5 text-amber-300 group-hover:rotate-12 transition-transform" />
                      <span>{t("Check My Eligibility & Match Schemes")}</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  )}
                </div>

              </form>
            </div>

            {/* Disclaimer Card */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-border/70 bg-slate-50/80 dark:bg-card/40 text-xs text-slate-600 dark:text-muted-foreground space-y-1">
              <div className="flex items-center gap-1.5 text-slate-900 dark:text-foreground font-semibold">
                <Info className="w-3.5 h-3.5 text-indigo-500" />
                <span>{t("Statutory Rules")}</span>
              </div>
              <p>
                {t("Government concessional loan programs mandate an annual family income threshold of ₹5,00,000. Eligible applicants receive up to 90% project cost coverage with only 10% self-contribution margin.")}
              </p>
            </div>

          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
