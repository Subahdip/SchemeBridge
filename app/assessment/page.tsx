"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Info,
  Target,
  CircleCheck,
  CheckCircle2,
  CircleX,
  AlertCircle,
  AlertTriangle,
  Lightbulb,
  TrendingUp,
  TrendingDown,
  BarChart3,
  FileText,
  IndianRupee,
  Briefcase,
  Building2,
  MapPin,
  Home,
  Scissors,
  Store,
  GraduationCap,
  Factory,
  Scale,
  Activity,
  Gauge,
} from "lucide-react";
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
  const [requirementText, setRequirementText] = useState<string>("");
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
      if (existing.requirementText) setRequirementText(existing.requirementText);
      else if (existing.purposeDescription) setRequirementText(existing.purposeDescription);
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

  // Section definitions for stepper and navigation validation
  const SECTIONS = useMemo(() => [
    { id: "basic-info", name: "personal", label: "Basic Financial Info", icon: IndianRupee, stepNum: 1 },
    { id: "loan-purpose", name: "loan", label: "Loan Purpose & Scale", icon: Target, stepNum: 2 },
    { id: "financial-liabilities", name: "financial", label: "Financial Liabilities", icon: Scale, stepNum: 3 },
    { id: "professional-details", name: "employment", label: "Professional Details", icon: Briefcase, stepNum: 4 },
    { id: "loan-demographics", name: "demographics", label: "Loan Demographics", icon: MapPin, stepNum: 5 },
    { id: "credit-score", name: "credit", label: "Credit Profile", icon: Activity, stepNum: 6 },
  ], []);

  const activeSectionIndex = useMemo(() => {
    const idx = SECTIONS.findIndex((s) => s.id === activeSection || s.name === activeSection);
    return idx === -1 ? 0 : idx;
  }, [activeSection, SECTIONS]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      history.pushState(null, "", `#${id}`);
    }
  };

  // Helper to compare Years at Current Job vs Total Work Experience
  const getExperienceRank = (val: string): number => {
    switch (val) {
      case "0-1": return 1;
      case "1-2": return 2;
      case "1-3": return 2;
      case "2-5": return 3;
      case "3-5": return 3;
      case "5-10": return 4;
      case "10+": return 5;
      case "10-15": return 5;
      case "15+": return 6;
      default: return 0;
    }
  };

  const isJobTenureValid = (jobTenure: string, totalExp: string): boolean => {
    if (!jobTenure || !totalExp) return true;
    const jobRank = getExperienceRank(jobTenure);
    const expRank = getExperienceRank(totalExp);
    return jobRank <= expRank;
  };

  // Section completion check for stepper status badges
  const checkSectionCompletion = (sectionId: string): boolean => {
    switch (sectionId) {
      case "basic-info":
      case "personal":
        return parseFloat(annualIncome) > 0 && parseFloat(loanAmount) > 0;
      case "loan-purpose":
      case "loan":
        return Boolean(loanPurpose.trim() !== "" && isConditionalValid);
      case "financial-liabilities":
      case "financial":
        return Boolean(
          existingEmis.trim() !== "" &&
          parseFloat(existingEmis) >= 0 &&
          salaryBank.trim() !== "" &&
          netSalary.trim() !== "" &&
          parseFloat(netSalary) > 0
        );
      case "professional-details":
      case "employment":
        return Boolean(
          companyName.trim() !== "" &&
          yearsAtJob.trim() !== "" &&
          totalExperience.trim() !== "" &&
          isJobTenureValid(yearsAtJob, totalExperience)
        );
      case "loan-demographics":
      case "demographics":
        return Boolean(
          /^\d{6}$/.test(pincode.trim()) &&
          residentialStatus.trim() !== "" &&
          address.trim().length >= 10
        );
      case "credit-score":
      case "credit":
        return Boolean(creditScore.trim() !== "");
      default:
        return false;
    }
  };

  // Validation function for each section before allowing forward navigation
  const validateSection = (sectionIdOrName: string): boolean => {
    const norm = (sectionIdOrName || "").toLowerCase().trim();
    let secKey = norm;
    if (norm === "personal" || norm === "basic" || norm === "basic-info") secKey = "basic-info";
    else if (norm === "loan" || norm === "purpose" || norm === "loan-purpose") secKey = "loan-purpose";
    else if (norm === "financial" || norm === "liabilities" || norm === "financial-liabilities") secKey = "financial-liabilities";
    else if (norm === "employment" || norm === "professional" || norm === "professional-details") secKey = "professional-details";
    else if (norm === "demographics" || norm === "address" || norm === "loan-demographics") secKey = "loan-demographics";
    else if (norm === "credit" || norm === "credit-profile" || norm === "credit-score") secKey = "credit-score";

    let isValid = true;
    const emptyFields: string[] = [];
    const elementsToHighlight: HTMLElement[] = [];

    const addError = (fieldId: string, label: string) => {
      isValid = false;
      emptyFields.push(label);
      const el = document.getElementById(fieldId);
      if (el) {
        elementsToHighlight.push(el);
      }
    };

    if (secKey === "basic-info") {
      const incomeNum = parseFloat(annualIncome) || 0;
      const loanNum = parseFloat(loanAmount) || 0;
      if (incomeNum <= 0) addError("income", t("Annual Family Income"));
      if (loanNum <= 0) addError("loanAmount", t("Required Loan Amount"));
    } else if (secKey === "loan-purpose") {
      if (!loanPurpose.trim()) {
        addError("loanPurpose", t("Primary Loan Purpose"));
      } else if (loanPurpose === "education") {
        if (!educationProjectSize.trim()) addError("educationProjectSize", t("Education Project Size"));
      } else if (loanPurpose === "business") {
        if (!businessProjectSize.trim()) addError("businessProjectSize", t("Business Project Size"));
      } else if (loanPurpose === "personal") {
        if (!personalProjectSize.trim()) addError("personalProjectSize", t("Personal Loan Size"));
      } else if (loanPurpose === "other") {
        if (!otherPurposeText.trim()) addError("otherPurposeText", t("Specify Purpose Description"));
        if (!otherProjectSize.trim()) addError("otherProjectSize", t("Project Size"));
      }
    } else if (secKey === "financial-liabilities") {
      if (existingEmis.trim() === "" || isNaN(parseFloat(existingEmis)) || parseFloat(existingEmis) < 0) {
        addError("existingEmis", t("Existing Monthly EMIs"));
      }
      if (!salaryBank.trim()) {
        addError("salaryBank", t("Salary Bank Name"));
      }
      const netSalNum = parseFloat(netSalary) || 0;
      if (netSalNum <= 0) {
        addError("netSalary", t("Net Take-Home Salary"));
      }
    } else if (secKey === "professional-details") {
      if (!companyName.trim()) addError("companyName", t("Employer / Company Name"));
      if (!yearsAtJob.trim()) addError("yearsAtJob", t("Years at Job"));
      if (!totalExperience.trim()) addError("totalExperience", t("Total Experience"));
      if (yearsAtJob.trim() && totalExperience.trim() && !isJobTenureValid(yearsAtJob, totalExperience)) {
        addError("yearsAtJob", t("Years at Current Job (must not exceed Total Work Experience)"));
      }
    } else if (secKey === "loan-demographics") {
      if (!/^\d{6}$/.test(pincode.trim())) addError("pincode", t("Valid 6-digit Pincode"));
      if (!residentialStatus.trim()) addError("residentialStatus", t("Residential Status"));
      if (!address || address.trim().length < 10) addError("address", t("Complete Address (min 10 characters)"));
    } else if (secKey === "credit-score") {
      if (!creditScore.trim()) addError("creditScore", t("Credit Score Range"));
    }

    // Also check any extra HTML required elements in section if present
    const secEl = document.getElementById(secKey);
    if (secEl) {
      const container = secEl.closest("div") || secEl;
      const inputs = container.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>("input[required], select[required], textarea[required]");
      inputs.forEach((input) => {
        if (input.offsetParent !== null && (!input.value || input.value.trim() === "")) {
          if (!elementsToHighlight.includes(input)) {
            isValid = false;
            const nameOrId = input.name || input.id || "Required field";
            emptyFields.push(nameOrId);
            elementsToHighlight.push(input);
          }
        }
      });
    }

    if (!isValid) {
      alert(`⚠️ ${t("Please fill all required fields in this section before proceeding.")}\n\n${t("Missing")}: ${emptyFields.join(", ")}`);
      if (elementsToHighlight.length > 0) {
        const first = elementsToHighlight[0];
        first.scrollIntoView({ behavior: "smooth", block: "center" });
        first.focus();
        first.classList.add("border-red-500", "ring-2", "ring-red-500/50", "border-rose-500");
        setTimeout(() => {
          first.classList.remove("border-red-500", "ring-2", "ring-red-500/50", "border-rose-500");
        }, 3000);
      }
    }

    return isValid;
  };

  // Safe navigation click handler that prevents skipping unvalidated sections
  const handleNavigationClick = (targetSectionIdOrName: string, targetIdx?: number) => {
    const norm = (targetSectionIdOrName || "").replace("#", "").trim();
    let targetIndex = targetIdx;
    if (targetIndex === undefined || targetIndex < 0) {
      targetIndex = SECTIONS.findIndex((s) => s.id === norm || s.name === norm);
    }
    if (targetIndex === -1) targetIndex = 0;

    let currentIndex = SECTIONS.findIndex((s) => s.id === activeSection || s.name === activeSection);
    if (currentIndex === -1) currentIndex = 0;

    // Allow going to previous sections freely
    if (targetIndex < currentIndex) {
      scrollToSection(SECTIONS[targetIndex].id);
      return;
    }

    // Clicking the same section: smooth scroll to it
    if (targetIndex === currentIndex) {
      scrollToSection(SECTIONS[targetIndex].id);
      return;
    }

    // Clicking forward: validate current section and any intervening sections
    if (targetIndex > currentIndex) {
      for (let i = currentIndex; i < targetIndex; i++) {
        const isSecValid = validateSection(SECTIONS[i].id);
        if (!isSecValid) {
          return; // Validation failed, blocked from proceeding
        }
      }
      scrollToSection(SECTIONS[targetIndex].id);
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
    Boolean(yearsAtJob.trim() !== "" && isJobTenureValid(yearsAtJob, totalExperience)),
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
        IconComponent: CircleX,
        labelText: "Low Eligibility",
        badge: "Low (0-49)",
        badgeBg: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
      };
    } else if (calculatedEligibilityScore < 70) {
      return {
        barClass: "bg-gradient-to-r from-yellow-600 to-orange-500 h-2.5 rounded-full transition-all duration-500 ease-out",
        displayColor: "text-amber-500 dark:text-yellow-400",
        labelClass: "text-amber-500 dark:text-yellow-400 text-xs font-medium",
        IconComponent: AlertTriangle,
        labelText: "Moderate Eligibility",
        badge: "Moderate (50-69)",
        badgeBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      };
    } else if (calculatedEligibilityScore < 85) {
      return {
        barClass: "bg-gradient-to-r from-lime-600 to-green-500 h-2.5 rounded-full transition-all duration-500 ease-out",
        displayColor: "text-emerald-500 dark:text-lime-400",
        labelClass: "text-emerald-500 dark:text-lime-400 text-xs font-medium",
        IconComponent: CircleCheck,
        labelText: "Good Eligibility",
        badge: "Good (70-84)",
        badgeBg: "bg-emerald-500/10 text-emerald-600 dark:text-lime-400 border-emerald-500/20",
      };
    } else {
      return {
        barClass: "bg-gradient-to-r from-aurora-600 to-teal-500 h-2.5 rounded-full transition-all duration-500 ease-out",
        displayColor: "text-teal-600 dark:text-teal-400",
        labelClass: "text-teal-600 dark:text-teal-400 text-xs font-medium",
        IconComponent: Target,
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

    // Validate Years at Current Job vs Total Work Experience
    if (!isJobTenureValid(yearsAtJob, totalExperience)) {
      alert(`⚠️ ${t("Years at Current Job cannot exceed Total Work Experience. Please correct your selections in Section 4.")}`);
      const jobEl = document.getElementById("yearsAtJob");
      if (jobEl) {
        jobEl.scrollIntoView({ behavior: "smooth", block: "center" });
        jobEl.focus();
        jobEl.classList.add("border-red-500", "ring-2", "ring-red-500/50");
      }
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
      requirementText: requirementText.trim() || otherPurposeText || "",
      purposeDescription: requirementText.trim() || otherPurposeText || "",
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

        {/* Left Sidebar ("Assessment Sections"): Fixed to the left */}
        <aside className="w-64 shrink-0 fixed top-16 left-0 bottom-0 h-[calc(100vh-4rem)] border-r border-slate-200 dark:border-navy-800 p-4 hidden md:flex flex-col justify-between bg-white dark:bg-navy-900 z-30 shadow-xs">
          
          {/* Scrollable Upper Section: Progress & Section Navigation */}
          <div className="overflow-y-auto flex-1 space-y-4 pr-1">
            {/* Real-time Sidebar Progress Indicator */}
            <div className="p-3.5 bg-slate-50 dark:bg-navy-800/90 border border-slate-200 dark:border-navy-700 rounded-xl shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <p className="text-slate-900 dark:text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
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
            <div>
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>{t("Assessment Sections")}</span>
              </h3>
              
              <nav className="space-y-1">
                {SECTIONS.map((item, index) => {
                  const ItemIcon = item.icon;
                  const isItemComplete = checkSectionCompletion(item.id);
                  return (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      data-section={item.id}
                      onClick={(e) => {
                        e.preventDefault();
                        handleNavigationClick(item.id, index);
                      }}
                      className={`section-link block px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        activeSection === item.id
                          ? "bg-teal-50 dark:bg-aurora-900/30 text-teal-700 dark:text-aurora-400 font-semibold border-l-2 border-teal-600 dark:border-aurora-400 shadow-xs"
                          : "text-slate-600 dark:text-muted-foreground hover:bg-slate-100 dark:hover:bg-aurora-900/20 hover:text-slate-900 dark:hover:text-aurora-300"
                      }`}
                    >
                      <span className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <ItemIcon className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                          <span>{t(item.label)}</span>
                        </span>
                        {isItemComplete && activeSection !== item.id && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        )}
                      </span>
                    </a>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Fixed Bottom of Sidebar: Dynamic Eligibility Score Card */}
          <div className="shrink-0 pt-3 border-t border-slate-200 dark:border-navy-800">
            <div className="bg-slate-50 dark:bg-navy-800/90 border border-slate-200 dark:border-navy-700 rounded-xl p-3 shadow-xs space-y-2">
              <div className="flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-teal-600 dark:text-aurora-400 shrink-0" />
                  <span className="text-[11px] font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    {t("Eligibility Score")}
                  </span>
                </div>
                <div id="creditScoreDisplay" className={`text-base font-extrabold font-mono ${scoreConfig.displayColor}`}>
                  {calculatedEligibilityScore}/100
                </div>
              </div>

              {/* Progress Bar */}
              <div className="relative h-2 w-full bg-slate-200 dark:bg-navy-950 rounded-full overflow-hidden">
                <div 
                  id="creditScoreBar" 
                  className={scoreConfig.barClass}
                  style={{ width: `${calculatedEligibilityScore}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] gap-1">
                <span id="creditScoreLabel" className={`${scoreConfig.labelClass} truncate font-medium flex items-center gap-1`}>
                  <scoreConfig.IconComponent className="w-3 h-3 shrink-0" />
                  <span className="truncate">{t(scoreConfig.labelText)}</span>
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border shrink-0 ${scoreConfig.badgeBg}`}>
                  {t(scoreConfig.badge)}
                </span>
              </div>

              {/* Collapsible Score Breakdown & Quick Tips */}
              <details className="pt-1.5 border-t border-slate-200 dark:border-navy-700 text-[10px] group">
                <summary className="cursor-pointer text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-aurora-300 font-medium flex items-center justify-between select-none py-0.5">
                  <span className="flex items-center gap-1.5">
                    <Lightbulb className="w-3 h-3 text-amber-500 shrink-0" />
                    <span>{t("How to improve score")}</span>
                  </span>
                  <span className="text-[9px] text-slate-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="mt-1.5 space-y-1 text-[10px] text-slate-600 dark:text-slate-400 max-h-36 overflow-y-auto pr-1">
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
          </div>
        </aside>

        {/* Main Assessment Area */}
        <div id="mainScrollContainer" className="flex-1 w-full md:pl-64 px-4 sm:px-8 py-8 flex flex-col items-center">
          {/* Mobile Section Selector & Score Header (only visible on mobile) */}
          <div className="md:hidden w-full max-w-4xl mb-4 sticky top-20 z-20 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl p-3 shadow-md space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-teal-600 dark:text-aurora-400" />
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  {t("Eligibility Score")}:
                </span>
              </div>
              <div className={`text-sm font-extrabold font-mono ${scoreConfig.displayColor}`}>
                {calculatedEligibilityScore}/100
              </div>
            </div>
            <div className="relative h-1.5 w-full bg-slate-200 dark:bg-navy-950 rounded-full overflow-hidden">
              <div 
                className={scoreConfig.barClass}
                style={{ width: `${calculatedEligibilityScore}%` }}
              />
            </div>
            <select
              id="mobileSectionSelector"
              value={`#${activeSection}`}
              onChange={(e) => {
                const val = e.target.value;
                if (val) {
                  const targetId = val.replace("#", "");
                  const idx = SECTIONS.findIndex((s) => s.id === targetId || s.name === targetId);
                  handleNavigationClick(targetId, idx);
                }
              }}
              className="w-full bg-slate-50 dark:bg-navy-800 border border-slate-300 dark:border-navy-700 rounded-lg px-3 py-1.5 text-slate-900 dark:text-white text-xs"
            >
              <option value="">{t("Jump to section...")}</option>
              {SECTIONS.map((sec) => (
                <option key={sec.id} value={`#${sec.id}`}>
                  {t(sec.label)}
                </option>
              ))}
            </select>
          </div>

          {/* Centered Inner Form Container */}
          <div className="w-full max-w-4xl mx-auto flex flex-col gap-6">

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
                  <h2 id="basic-info" className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-6 scroll-mt-24 flex items-center gap-2.5">
                    <IndianRupee className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                    <span>{t("Basic Financial Information")}</span>
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
                  <h2 id="loan-purpose" className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2 scroll-mt-24 flex items-center gap-2.5">
                    <Target className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                    <span>{t("Loan Purpose & Scale")}</span>
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
                      <option value="business">{t("Business / Self-Employment")}</option>
                      <option value="education">{t("Education")}</option>
                      <option value="personal">{t("Personal Reasons")}</option>
                      <option value="other">{t("Other")}</option>
                    </select>
                  </div>

                  {/* AI Semantic Requirement & Business Purpose Input */}
                  <div className="p-4 bg-teal-500/5 dark:bg-teal-950/20 border border-teal-500/20 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <label htmlFor="requirementText" className="text-sm font-bold text-teal-900 dark:text-teal-300 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                        <span>{t("Describe your Business Idea or Need in Detail")} ({t("AI Semantic Match")})</span>
                      </label>
                      <span className="text-[11px] font-mono text-teal-600 dark:text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-md border border-teal-500/20">
                        OpenRouter Embeddings
                      </span>
                    </div>
                    <textarea
                      id="requirementText"
                      name="requirementText"
                      rows={3}
                      placeholder={t("e.g., I want to start a tailoring business and need money for sewing machines...")}
                      value={requirementText}
                      onChange={(e) => setRequirementText(e.target.value)}
                      className="w-full px-4 py-3 bg-white dark:bg-navy-900 border border-teal-300 dark:border-teal-800 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30 text-sm shadow-xs resize-none"
                    />
                    
                    {/* Quick Preset Prompts */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                        {t("Quick Test Presets:")}
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { icon: Scissors, label: "Tailoring & Sewing Machines", text: "I want to start a tailoring business and need money for sewing machines.", purpose: "business", loan: "120000" },
                          { icon: Store, label: "Dairy Business Assistance", text: "I need financial assistance to start a small dairy business.", purpose: "business", loan: "250000" },
                          { icon: GraduationCap, label: "Higher Education Funding", text: "I want funding for my higher education.", purpose: "education", loan: "1000000" },
                          { icon: Factory, label: "Factory Machinery Expansion", text: "I want to expand my commercial manufacturing unit with heavy machinery.", purpose: "business", loan: "2500000" }
                        ].map((preset, idx) => {
                          const PresetIcon = preset.icon;
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setRequirementText(preset.text);
                                setLoanPurpose(preset.purpose);
                                if (preset.loan) setLoanAmount(preset.loan);
                              }}
                              className="text-[11px] px-2.5 py-1 rounded-lg bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 hover:border-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/30 text-slate-700 dark:text-slate-300 transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                            >
                              <PresetIcon className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                              <span>{t(preset.label)}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
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
                        <p className="text-xs text-slate-500 dark:text-muted-foreground mt-2 flex items-center gap-1.5">
                          <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span>{t("Select based on your total education expense requirement")}</span>
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
                        <p className="text-xs text-slate-500 dark:text-muted-foreground mt-2 flex items-center gap-1.5">
                          <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span>{t("Micro: Small projects (Micro Finance Scheme) | Medium/Large: Term Loan Scheme")}</span>
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
                        <p className="text-xs text-slate-500 dark:text-muted-foreground mt-2 flex items-center gap-1.5">
                          <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span>{t("Select based on your total loan requirement")}</span>
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
                        <p className="text-xs text-slate-500 dark:text-muted-foreground mt-2 flex items-center gap-1.5">
                          <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span>{t("Select based on your total project cost")}</span>
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* SECTION 3: Financial Liabilities & Banking Profile */}
                <div className="mb-8 p-6 bg-slate-50/70 dark:bg-navy-800/50 border border-slate-200/80 dark:border-navy-700 rounded-xl">
                  <h2 id="financial-liabilities" className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-6 scroll-mt-24 flex items-center gap-2.5">
                    <Scale className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                    <span>{t("Financial Liabilities & Banking Profile")}</span>
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
                    <p className="text-slate-500 dark:text-muted-foreground text-xs mt-2 flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                      <span>{t("Include home loan, car loan, personal loan, credit card EMIs, etc.")}</span>
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
                    <p className="text-slate-500 dark:text-muted-foreground text-xs mt-2 flex items-center gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>{t("Some banks offer pre-approved corporate offers for salary account holders")}</span>
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
                    <p className="text-slate-500 dark:text-muted-foreground text-xs mt-2 flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                      <span>{t("This is the actual amount credited to your bank account monthly (not CTC)")}</span>
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
                        <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                          <Activity className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                          <span>{t("Debt-to-Income (DTI) Ratio:")}</span>
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
                  <h2 id="professional-details" className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-6 scroll-mt-24 flex items-center gap-2.5">
                    <Briefcase className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                    <span>{t("Professional Stability & Employment Details")}</span>
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
                    <p className="text-slate-500 dark:text-muted-foreground text-xs mt-2 flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                      <span>{t("Lenders offer better rates for Tier-1 companies (MNCs, Govt, etc.)")}</span>
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
                      className={`w-full bg-white dark:bg-navy-900 border rounded-lg px-4 py-3 text-slate-900 dark:text-white focus:ring-2 transition-all cursor-pointer ${
                        yearsAtJob && totalExperience && !isJobTenureValid(yearsAtJob, totalExperience)
                          ? "border-red-500 ring-2 ring-red-500/30 dark:border-rose-500"
                          : "border-slate-300 dark:border-navy-700 focus:border-teal-500 dark:focus:border-aurora-500 focus:ring-teal-500/20 dark:focus:ring-aurora-500/20"
                      }`}
                    >
                      <option value="">{t("Select duration")}</option>
                      <option value="0-1" disabled={totalExperience !== "" && !isJobTenureValid("0-1", totalExperience)}>
                        {t("Less than 1 year")}
                      </option>
                      <option value="1-2" disabled={totalExperience !== "" && !isJobTenureValid("1-2", totalExperience)}>
                        {t("1-2 years")} {totalExperience !== "" && !isJobTenureValid("1-2", totalExperience) ? `(${t("Exceeds total experience")})` : ""}
                      </option>
                      <option value="2-5" disabled={totalExperience !== "" && !isJobTenureValid("2-5", totalExperience)}>
                        {t("2-5 years")} {totalExperience !== "" && !isJobTenureValid("2-5", totalExperience) ? `(${t("Exceeds total experience")})` : ""}
                      </option>
                      <option value="5-10" disabled={totalExperience !== "" && !isJobTenureValid("5-10", totalExperience)}>
                        {t("5-10 years")} {totalExperience !== "" && !isJobTenureValid("5-10", totalExperience) ? `(${t("Exceeds total experience")})` : ""}
                      </option>
                      <option value="10+" disabled={totalExperience !== "" && !isJobTenureValid("10+", totalExperience)}>
                        {t("10+ years")} {totalExperience !== "" && !isJobTenureValid("10+", totalExperience) ? `(${t("Exceeds total experience")})` : ""}
                      </option>
                    </select>

                    {yearsAtJob && totalExperience && !isJobTenureValid(yearsAtJob, totalExperience) ? (
                      <p className="text-red-500 dark:text-rose-400 text-xs mt-2 flex items-center gap-1.5 font-medium animate-pulse">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{t("Years at Current Job cannot exceed Total Work Experience")}</span>
                      </p>
                    ) : (
                      <p className="text-slate-500 dark:text-muted-foreground text-xs mt-2 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{t("Longer tenure shows job stability and improves approval chances")}</span>
                      </p>
                    )}
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
                      onChange={(e) => {
                        const newExp = e.target.value;
                        setTotalExperience(newExp);
                        if (yearsAtJob && !isJobTenureValid(yearsAtJob, newExp)) {
                          setYearsAtJob("");
                        }
                      }}
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
                    <p className="text-slate-500 dark:text-muted-foreground text-xs mt-2 flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{t("More experience = better career stability = higher loan eligibility")}</span>
                    </p>
                  </div>
                </div>

                {/* SECTION 5: Residential Demographics */}
                <div className="mb-8 p-6 bg-slate-50/70 dark:bg-navy-800/50 border border-slate-200/80 dark:border-navy-700 rounded-xl">
                  <h2 id="loan-demographics" className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-6 scroll-mt-24 flex items-center gap-2.5">
                    <MapPin className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                    <span>{t("Residential Demographics")}</span>
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
                    <p className="text-slate-500 dark:text-muted-foreground text-xs mt-2 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                      <span>{t("Helps find nearest channel partners and location-specific schemes")}</span>
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
                    <p className="text-slate-500 dark:text-muted-foreground text-xs mt-2 flex items-center gap-1.5">
                      <Home className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                      <span>{t("Home ownership indicates asset stability and may improve approval")}</span>
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
                    <p className="text-slate-500 dark:text-muted-foreground text-xs mt-2 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                      <span>{t("Your complete residential address for loan processing")}</span>
                    </p>
                  </div>
                </div>

                {/* SECTION 6: Credit Profile & Score Assessment */}
                <div className="mb-8 p-6 bg-slate-50/70 dark:bg-navy-800/50 border border-slate-200/80 dark:border-navy-700 rounded-xl">
                  <h2 id="credit-score" className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-6 scroll-mt-24 flex items-center gap-2.5">
                    <Gauge className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                    <span>{t("Credit Profile & Score Assessment")}</span>
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
                      <p className="text-slate-900 dark:text-white text-sm font-semibold mb-2 flex items-center gap-1.5">
                        <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
                        <span>{t("Credit Score Impact:")}</span>
                      </p>
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
                      <CircleX className="w-5 h-5 text-red-400" />
                      <span>{t("Improve Eligibility Score (Min 40 Required)")}</span>
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
