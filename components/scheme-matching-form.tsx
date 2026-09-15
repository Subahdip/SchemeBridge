"use client";

import React, { useState, useMemo } from "react";
import {
  Sparkles,
  ArrowRight,
  Briefcase,
  GraduationCap,
  IndianRupee,
  Building2,
  BookOpen,
  CheckCircle2,
  XCircle,
  SlidersHorizontal,
  ChevronDown,
  Info,
  ShieldCheck,
  RotateCcw,
  BadgePercent,
  Wallet,
  Clock,
  Award,
  Calculator,
  MapPin,
  Navigation,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { EmiCalculator } from "@/components/emi-calculator";
import partnersData from "@/data/partners.json";
import { AppState } from "@/lib/app-state";
import { useTranslation } from "react-i18next";

// Types
export type PurposeType = "business" | "education";
export type BusinessProjectType = "small" | "medium" | "large";
export type EducationLevelType = "undergraduate" | "postgraduate" | "professional";

export interface EvaluationResult {
  isEligible: boolean;
  headerTitle: string;
  schemeName: string;
  interestRate: string;
  maxLoan: string;
  govtCoverage: string;
  selfContribution: string;
  moratorium?: string;
  requestedLoan: number;
  requestedIncome: number;
  purpose: PurposeType;
  projectType?: BusinessProjectType;
  educationLevel?: EducationLevelType;
  description: string;
  keyHighlights: string[];
  govtShareAmount?: number;
  userShareAmount?: number;
  promoterMarginAmount?: number;
}

export interface SchemeMatchingFormProps {
  onSchemeMatched?: (scheme: string) => void;
  onFindNearestPartner?: (scheme: string) => void;
}

interface PartnerItem {
  id: number;
  name: string;
  type: string;
  schemes: string[];
  status: string;
  npaFlag: boolean;
}

export function SchemeMatchingForm({
  onSchemeMatched,
  onFindNearestPartner,
}: SchemeMatchingFormProps) {
  const { t } = useTranslation();
  // Form State
  const [annualIncome, setAnnualIncome] = useState<string>("");
  const [loanAmount, setLoanAmount] = useState<string>("");
  const [purpose, setPurpose] = useState<PurposeType>("business");
  const [projectType, setProjectType] = useState<BusinessProjectType>("small");
  const [educationLevel, setEducationLevel] = useState<EducationLevelType>("undergraduate");

  // Submission / Evaluation State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [showEmiCalculator, setShowEmiCalculator] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Matched Scheme Type & Active Partner Counter
  const matchedSchemeType = useMemo(() => {
    if (!result || !result.isEligible) return "All Schemes";
    if (result.schemeName.includes("Micro Finance")) return "Micro Finance";
    if (result.schemeName.includes("Term Loan")) return "Term Loan";
    if (result.schemeName.includes("Education")) return "Education Loan";
    return "All Schemes";
  }, [result]);

  const activePartnersCount = useMemo(() => {
    const typedPartners = partnersData as PartnerItem[];
    if (matchedSchemeType === "All Schemes") {
      return typedPartners.filter((p) => p.status === "Active" && !p.npaFlag).length;
    }
    return typedPartners.filter(
      (p) => p.status === "Active" && !p.npaFlag && p.schemes.includes(matchedSchemeType)
    ).length;
  }, [matchedSchemeType]);

  // Quick Select Helper Values
  const incomeQuickOptions = [
    { label: "₹1.4 Lakh", value: "140000" },
    { label: "₹3.0 Lakh", value: "300000" },
    { label: "₹5.0 Lakh", value: "500000" },
    { label: "₹6.5 Lakh", value: "650000" },
  ];

  const loanQuickOptions = [
    { label: "₹1.0 Lakh", value: "100000" },
    { label: "₹1.4 Lakh", value: "140000" },
    { label: "₹5.0 Lakh", value: "500000" },
    { label: "₹25.0 Lakh", value: "2500000" },
    { label: "₹50.0 Lakh", value: "5000000" },
  ];

  // Helper to format currency numbers to Indian format (e.g. 150000 -> 1,50,000)
  const formatIndianCurrency = (val: string | number): string => {
    if (!val && val !== 0) return "";
    const num = typeof val === "string" ? parseInt(val.replace(/,/g, ""), 10) : val;
    if (isNaN(num)) return "";
    return num.toLocaleString("en-IN");
  };

  // Form Validation
  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    const incomeNum = parseInt(annualIncome.replace(/,/g, ""), 10);
    const loanNum = parseInt(loanAmount.replace(/,/g, ""), 10);

    if (!annualIncome || isNaN(incomeNum) || incomeNum <= 0) {
      errors.annualIncome = "Please enter a valid annual family income";
    }
    if (!loanAmount || isNaN(loanNum) || loanNum <= 0) {
      errors.loanAmount = "Please enter a valid loan amount needed";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Main Scheme Matching Logic
  const handleFindScheme = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setShowEmiCalculator(false);

    setTimeout(() => {
      const incomeNum = parseInt(annualIncome.replace(/,/g, ""), 10);
      const loanNum = parseInt(loanAmount.replace(/,/g, ""), 10);

      let evalResult: EvaluationResult;
      let targetSchemeCategory = "All Schemes";

      // 1. Check if income > 500000 -> Red error card
      if (incomeNum > 500000) {
        evalResult = {
          isEligible: false,
          headerTitle: "❌ Not Eligible - Annual income exceeds ₹5.00 Lakhs limit",
          schemeName: "Ineligible for Concessional Welfare Schemes",
          interestRate: "N/A",
          maxLoan: "N/A",
          govtCoverage: "0%",
          selfContribution: "100%",
          requestedIncome: incomeNum,
          requestedLoan: loanNum,
          purpose: purpose,
          description:
            "Your stated annual family income of ₹" +
            formatIndianCurrency(incomeNum) +
            " exceeds the mandatory welfare threshold of ₹5,00,000 per annum for subsidized government schemes.",
          keyHighlights: [
            "Income exceeds statutory ceiling of ₹5.00 Lakhs/year",
            "Targeted welfare schemes are reserved for low-income & marginalized families",
            "You may still explore commercial MSME / CGTMSE market-linked loans",
          ],
        };
      }
      // 2. Income <= 500000 AND Purpose is Business AND loan amount <= 140000
      else if (purpose === "business" && loanNum <= 140000) {
        const govtShare = Math.round(loanNum * 0.9);
        const userShare = Math.round(loanNum * 0.1);
        targetSchemeCategory = "Micro Finance";

        evalResult = {
          isEligible: true,
          headerTitle:
            "✅ Micro Finance Scheme - Interest: 6.5%, Max Loan: ₹1.40L, Govt Coverage: 90%",
          schemeName: "Micro Finance Scheme",
          interestRate: "6.5% p.a.",
          maxLoan: "₹1.40 Lakh",
          govtCoverage: "90%",
          selfContribution: "10%",
          requestedIncome: incomeNum,
          requestedLoan: loanNum,
          purpose: "business",
          projectType: "small",
          govtShareAmount: govtShare,
          userShareAmount: userShare,
          description:
            "Specially tailored micro-credit facility for small-scale entrepreneurs, artisans, and micro-business owners. Offers 90% direct financial assistance with minimal documentation.",
          keyHighlights: [
            "Low concessional interest rate of 6.5% per annum",
            "90% loan funded by Government / Channel Partner Agency",
            "Only 10% beneficiary self-contribution required",
            "Zero collateral or third-party guarantee needed",
            "Repayment period of up to 36 to 60 months",
          ],
        };
      }
      // 3. Income <= 500000 AND Purpose is Business AND loan amount > 140000 AND <= 5000000
      else if (purpose === "business" && loanNum > 140000 && loanNum <= 5000000) {
        const govtShare = Math.round(loanNum * 0.9);
        const userShare = Math.round(loanNum * 0.1);
        targetSchemeCategory = "Term Loan";

        evalResult = {
          isEligible: true,
          headerTitle:
            "✅ Term Loan Scheme - Interest: 7.5%, Max Loan: ₹50L, Govt Coverage: 90%",
          schemeName: "Term Loan Scheme",
          interestRate: "7.5% p.a.",
          maxLoan: "₹50.00 Lakh",
          govtCoverage: "90%",
          selfContribution: "10%",
          requestedIncome: incomeNum,
          requestedLoan: loanNum,
          purpose: "business",
          projectType: loanNum <= 1000000 ? "medium" : "large",
          govtShareAmount: govtShare,
          userShareAmount: userShare,
          description:
            "Medium to large capital investment loan scheme designed for business expansion, acquiring machinery, establishing service centers, and commercial production.",
          keyHighlights: [
            "Competitive interest rate of 7.5% per annum",
            "90% government funding coverage (up to ₹50 Lakh)",
            "Promoter contribution fixed at just 10%",
            "Supported by National Corporations & State Channelising Agencies (SCAs)",
            "Tenure of up to 5 to 10 years including moratorium period",
          ],
        };
      }
      // 4. Purpose is Education (with income <= 500000)
      else if (purpose === "education") {
        const govtShare = Math.round(loanNum * 0.9);
        const userShare = Math.round(loanNum * 0.1);
        targetSchemeCategory = "Education Loan";

        evalResult = {
          isEligible: true,
          headerTitle:
            "✅ Education Loan Scheme - Interest: 6.5%, Govt Coverage: 90%, Moratorium: Available",
          schemeName: "Education Loan Scheme",
          interestRate: "6.5% p.a.",
          maxLoan: "₹20.00 Lakh (Domestic) / ₹30.00 Lakh (Abroad)",
          govtCoverage: "90%",
          selfContribution: "10%",
          moratorium: "Available (Course Duration + 1 Year)",
          requestedIncome: incomeNum,
          requestedLoan: loanNum,
          purpose: "education",
          educationLevel: educationLevel,
          govtShareAmount: govtShare,
          userShareAmount: userShare,
          description:
            "Comprehensive financial support for marginalized students pursuing higher, professional, and technical studies in India and abroad with zero repayment during study period.",
          keyHighlights: [
            "Concessional interest rate of 6.5% p.a. (Special rebate for female students)",
            "90% total educational expense covered by government scheme",
            "10% margin money requirement",
            "Moratorium benefit: Repayment starts only 1 year after course completion",
            "Covers tuition fees, books, equipment, hostel & travel expenses",
          ],
        };
      }
      // Fallback if business loan > 5000000
      else {
        evalResult = {
          isEligible: false,
          headerTitle: "❌ Loan Ceiling Exceeded - Maximum welfare scheme limit is ₹50.00 Lakhs",
          schemeName: "Loan Amount Exceeds Scheme Ceiling",
          interestRate: "N/A",
          maxLoan: "₹50.00 Lakh",
          govtCoverage: "N/A",
          selfContribution: "N/A",
          requestedIncome: incomeNum,
          requestedLoan: loanNum,
          purpose: "business",
          description:
            "The requested loan amount of ₹" +
            formatIndianCurrency(loanNum) +
            " exceeds the maximum term loan limit of ₹50,00,000 for government concessional schemes.",
          keyHighlights: [
            "Maximum permissible limit under Term Loan Scheme is ₹50.00 Lakhs",
            "For requirements above ₹50L, apply under SIDBI CGTMSE Credit Guarantee",
          ],
        };
      }

      setResult(evalResult);
      setIsSubmitting(false);

      // Save to sessionStorage for multi-page persistence
      AppState.saveAssessment({
        income: incomeNum,
        loanAmount: loanNum,
        purpose: purpose === "business" ? "Business" : "Education",
        projectType: purpose === "business" ? (projectType === "small" ? "Small" : projectType === "medium" ? "Medium" : "Large") : undefined,
        educationLevel: purpose === "education" ? (educationLevel === "undergraduate" ? "Undergraduate" : educationLevel === "postgraduate" ? "Postgraduate" : "Professional") : undefined,
      });

      // Automatically notify parent / map filter
      if (evalResult.isEligible && targetSchemeCategory !== "All Schemes") {
        onSchemeMatched?.(targetSchemeCategory);
      }

      // Smooth scroll to the result card
      setTimeout(() => {
        const resultSection = document.getElementById("scheme-result-card");
        if (resultSection) {
          resultSection.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }, 450);
  };

  const handleReset = () => {
    setAnnualIncome("");
    setLoanAmount("");
    setPurpose("business");
    setProjectType("small");
    setEducationLevel("undergraduate");
    setResult(null);
    setShowEmiCalculator(false);
    setFormErrors({});
    onSchemeMatched?.("All Schemes");
  };

  const handleFindNearestPartnerClick = () => {
    onFindNearestPartner?.(matchedSchemeType);
    setTimeout(() => {
      const mapEl = document.getElementById("partner-map-section");
      mapEl?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <div className="w-full">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden py-12 md:py-20 border-b bg-gradient-to-b from-background via-background/95 to-muted/20">
        {/* Glow ambient background effects */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[380px] bg-gradient-to-tr from-indigo-500/15 via-purple-500/15 to-pink-500/10 blur-[100px] -z-10 rounded-full pointer-events-none" />

        <div className="container px-4 mx-auto max-w-5xl text-center space-y-6">
          {/* Badge / Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 backdrop-blur px-4 py-1.5 text-xs sm:text-sm text-indigo-700 dark:text-indigo-300 shadow-sm">
            <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span className="font-semibold">{t("AI Scheme Matcher 2.0")}</span>
            <span className="h-1 w-1 rounded-full bg-indigo-500" />
            <span>{t("Empowering Marginalized Communities")}</span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[1.18] max-w-4xl mx-auto">
            {t("AI-Driven Scheme Matching for Marginalized Entrepreneurs")}
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-normal">
            {t("Get matched to the right government loan scheme in 60 seconds.")}
          </p>

          {/* Value Highlights */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs sm:text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 rounded-lg border bg-card/60 backdrop-blur px-3 py-1.5 shadow-sm">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              {t("90% Govt Loan Coverage")}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border bg-card/60 backdrop-blur px-3 py-1.5 shadow-sm">
              <BadgePercent className="h-4 w-4 text-indigo-500" />
              {t("Concessional Interest (6.5% - 7.5%)")}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border bg-card/60 backdrop-blur px-3 py-1.5 shadow-sm">
              <Wallet className="h-4 w-4 text-purple-500" />
              {t("Only 10% Self-Contribution")}
            </span>
          </div>
        </div>
      </section>

      {/* 2. MAIN INTERACTIVE FORM SECTION */}
      <section className="py-12 md:py-16 container px-4 mx-auto max-w-3xl">
        <Card className="border-border/80 shadow-xl bg-card/80 backdrop-blur-md relative overflow-hidden transition-all duration-300 hover:border-indigo-500/40">
          {/* Top Decorative Gradient Line */}
          <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

          <CardHeader className="space-y-2 pb-6 pt-6 sm:pt-8 px-6 sm:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-primary font-medium text-xs sm:text-sm tracking-wide uppercase">
                <SlidersHorizontal className="h-4 w-4" />
                <span>{t("Eligibility Assessment")}</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                {t("Instant Check")}
              </Badge>
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-bold tracking-tight">
              {t("Tell us about your requirement")}
            </CardTitle>
            <CardDescription className="text-sm sm:text-base text-muted-foreground">
              {t("Enter your annual family income and required loan amount to check your scheme qualification.")}
            </CardDescription>
          </CardHeader>

          <CardContent className="px-6 sm:px-8 pb-8 pt-0">
            <form onSubmit={handleFindScheme} className="space-y-6" id="scheme-matcher-form">
              
              {/* Field 1: Annual Family Income */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="annual-income-input"
                    className="text-sm font-semibold text-foreground flex items-center gap-1.5"
                  >
                    <span>{t("1. Annual Family Income")}</span>
                    <span className="text-primary font-bold">(₹)</span>
                    <span className="text-destructive">*</span>
                  </label>
                  {annualIncome && (
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                      parseInt(annualIncome, 10) > 500000
                        ? "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/60 font-semibold"
                        : "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60"
                    }`}>
                      ₹ {formatIndianCurrency(annualIncome)} / year
                      {parseInt(annualIncome, 10) > 500000 && " (> ₹5.0L ceiling)"}
                    </span>
                  )}
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                    <IndianRupee className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Input
                    id="annual-income-input"
                    type="number"
                    min="0"
                    step="1000"
                    placeholder="e.g. 250000 (Limit: ≤ ₹5.00 Lakhs)"
                    value={annualIncome}
                    onChange={(e) => {
                      setAnnualIncome(e.target.value);
                      if (formErrors.annualIncome) {
                        setFormErrors((prev) => ({ ...prev, annualIncome: "" }));
                      }
                    }}
                    className={`pl-9 text-base py-5 transition-all font-mono ${
                      formErrors.annualIncome
                        ? "border-destructive focus-visible:ring-destructive"
                        : "focus:border-aurora-500 focus:ring-1 focus:ring-aurora-500"
                    }`}
                  />
                </div>
                {formErrors.annualIncome && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    {formErrors.annualIncome}
                  </p>
                )}

                {/* Quick Select Pills */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-xs text-muted-foreground mr-1">{t("Quick Select:")}</span>
                  {incomeQuickOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setAnnualIncome(opt.value);
                        if (formErrors.annualIncome) {
                          setFormErrors((prev) => ({ ...prev, annualIncome: "" }));
                        }
                      }}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                        annualIncome === opt.value
                          ? "bg-aurora-600 text-white border-aurora-500 font-medium shadow-sm"
                          : "bg-navy-800 hover:bg-navy-700 text-slate-300 border-navy-700"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Field 2: Loan Amount Needed */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="loan-amount-input"
                    className="text-sm font-semibold text-foreground flex items-center gap-1.5"
                  >
                    <span>{t("2. Required Loan Amount")}</span>
                    <span className="text-aurora-400 font-bold">(₹)</span>
                    <span className="text-destructive">*</span>
                  </label>
                  {loanAmount && (
                    <span className="text-xs font-medium text-aurora-300 bg-aurora-500/15 border border-aurora-500/30 px-2 py-0.5 rounded font-mono">
                      ₹ {formatIndianCurrency(loanAmount)}
                    </span>
                  )}
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                    <IndianRupee className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Input
                    id="loan-amount-input"
                    type="number"
                    min="0"
                    step="5000"
                    placeholder="e.g. 140000"
                    value={loanAmount}
                    onChange={(e) => {
                      setLoanAmount(e.target.value);
                      if (formErrors.loanAmount) {
                        setFormErrors((prev) => ({ ...prev, loanAmount: "" }));
                      }
                    }}
                    className={`pl-9 text-base py-5 transition-all font-mono ${
                      formErrors.loanAmount
                        ? "border-destructive focus-visible:ring-destructive"
                        : "focus:border-aurora-500 focus:ring-1 focus:ring-aurora-500"
                    }`}
                  />
                </div>
                {formErrors.loanAmount && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    {formErrors.loanAmount}
                  </p>
                )}

                {/* Quick Select Pills */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-xs text-muted-foreground mr-1">{t("Quick Select:")}</span>
                  {loanQuickOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setLoanAmount(opt.value);
                        if (formErrors.loanAmount) {
                          setFormErrors((prev) => ({ ...prev, loanAmount: "" }));
                        }
                      }}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                        loanAmount === opt.value
                          ? "bg-teal-600 text-white border-teal-500 font-medium shadow-sm"
                          : "bg-navy-800 hover:bg-navy-700 text-slate-300 border-navy-700"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Field 3: Purpose Dropdown / Selector */}
              <div className="space-y-2.5">
                <label
                  htmlFor="purpose-select"
                  className="text-sm font-semibold text-foreground flex items-center gap-1.5"
                >
                  <span>{t("3. Primary Loan Purpose")}</span>
                  <span className="text-destructive">*</span>
                </label>

                {/* Interactive Toggle Cards */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPurpose("business")}
                    className={`flex items-center justify-center gap-2.5 p-3.5 rounded-xl border text-sm font-medium transition-all ${
                      purpose === "business"
                        ? "border-aurora-500 bg-aurora-500/15 text-aurora-300 ring-2 ring-aurora-500/30 shadow-sm"
                        : "border-navy-700 bg-navy-800/80 hover:bg-navy-700 text-slate-300 hover:text-white"
                    }`}
                  >
                    <Briefcase className={`h-4 w-4 ${purpose === "business" ? "text-aurora-400" : ""}`} />
                    <span>{t("Business / MSME")}</span>
                    {purpose === "business" && (
                      <CheckCircle2 className="h-4 w-4 text-aurora-400 ml-auto hidden sm:block" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setPurpose("education")}
                    className={`flex items-center justify-center gap-2.5 p-3.5 rounded-xl border text-sm font-medium transition-all ${
                      purpose === "education"
                        ? "border-aurora-500 bg-aurora-500/15 text-aurora-300 ring-2 ring-aurora-500/30 shadow-sm"
                        : "border-navy-700 bg-navy-800/80 hover:bg-navy-700 text-slate-300 hover:text-white"
                    }`}
                  >
                    <GraduationCap className={`h-4 w-4 ${purpose === "education" ? "text-aurora-400" : ""}`} />
                    <span>{t("Higher Education")}</span>
                    {purpose === "education" && (
                      <CheckCircle2 className="h-4 w-4 text-aurora-400 ml-auto hidden sm:block" />
                    )}
                  </button>
                </div>

                {/* Native accessible select for small screens */}
                <div className="relative mt-2 sm:hidden">
                  <select
                    id="purpose-select"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value as PurposeType)}
                    className="w-full h-11 px-3 rounded-lg border border-navy-700 bg-navy-800 text-sm font-medium text-foreground appearance-none focus:border-aurora-500 focus:ring-1 focus:ring-aurora-500 focus:outline-none"
                  >
                    <option value="business">{t("Business / MSME")}</option>
                    <option value="education">{t("Higher Education")}</option>
                  </select>
                  <ChevronDown className="absolute right-3.5 top-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              {/* Field 4 (Conditional): If Business selected -> Project Type dropdown */}
              {purpose === "business" && (
                <div className="space-y-2.5 p-4 rounded-xl border border-navy-700 bg-navy-900/60 animate-fade-in">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-aurora-400" />
                    <label
                      htmlFor="project-type-select"
                      className="text-sm font-semibold text-foreground"
                    >
                      {t("4. Business Scale / Target Activity")}
                    </label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t("Select your business project scale based on estimated capital requirement:")}
                  </p>

                  <div className="relative">
                    <select
                      id="project-type-select"
                      value={projectType}
                      onChange={(e) => setProjectType(e.target.value as BusinessProjectType)}
                      className="w-full h-11 pl-3.5 pr-10 rounded-lg border border-navy-700 bg-navy-800 text-sm font-medium text-foreground appearance-none focus:border-aurora-500 focus:ring-1 focus:ring-aurora-500 focus:outline-none transition-all cursor-pointer"
                    >
                      <option value="small">{t("Micro / Small Unit (≤ ₹1.40L)")}</option>
                      <option value="medium">{t("Medium Enterprise (₹1.40L - ₹10.0L)")}</option>
                      <option value="large">{t("Large Commercial Project (₹10.0L - ₹50.0L)")}</option>
                    </select>
                    <ChevronDown className="absolute right-3.5 top-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>

                  <div className="flex items-center gap-2 pt-1 text-xs text-muted-foreground">
                    <Info className="h-3.5 w-3.5 text-aurora-400 flex-shrink-0" />
                    <span>
                      {projectType === "small" && t("Micro Finance Scheme: Interest 6.5%, Max Loan ₹1.40L, 90% Coverage.")}
                      {projectType === "medium" && t("Term Loan Scheme: Interest 7.5%, Max Loan ₹50.00L, 90% Coverage.")}
                      {projectType === "large" && t("Term Loan Scheme (Large): Interest 7.5%, Max Loan ₹50.00L, 90% Coverage.")}
                    </span>
                  </div>
                </div>
              )}

              {/* Field 5 (Conditional): If Education selected -> Education Level dropdown */}
              {purpose === "education" && (
                <div className="space-y-2.5 p-4 rounded-xl border border-navy-700 bg-navy-900/60 animate-fade-in">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-purple-400" />
                    <label
                      htmlFor="education-level-select"
                      className="text-sm font-semibold text-foreground"
                    >
                      {t("4. Course Level / Degree Type")}
                    </label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t("Select your current or planned academic level:")}
                  </p>

                  <div className="relative">
                    <select
                      id="education-level-select"
                      value={educationLevel}
                      onChange={(e) => setEducationLevel(e.target.value as EducationLevelType)}
                      className="w-full h-11 pl-3.5 pr-10 rounded-lg border border-navy-700 bg-navy-800 text-sm font-medium text-foreground appearance-none focus:border-aurora-500 focus:ring-1 focus:ring-aurora-500 focus:outline-none transition-all cursor-pointer"
                    >
                      <option value="undergraduate">{t("Undergraduate Degree (B.Tech, B.Sc, B.Com, MBBS)")}</option>
                      <option value="postgraduate">{t("Postgraduate Degree (M.Tech, MBA, MD, MS)")}</option>
                      <option value="professional">{t("Professional / Overseas Studies")}</option>
                    </select>
                    <ChevronDown className="absolute right-3.5 top-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>

                  <div className="flex items-center gap-2 pt-1 text-xs text-muted-foreground">
                    <Info className="h-3.5 w-3.5 text-purple-400 flex-shrink-0" />
                    <span>
                      {t("Education Loan Scheme: Interest 6.5%, Govt Coverage 90%, Moratorium Available during studies.")}
                    </span>
                  </div>
                </div>
              )}

              {/* Field 6: Find My Scheme Button */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <Button
                  type="submit"
                  variant="cta"
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full text-base font-semibold py-6 shadow-aurora-500/25 shadow-lg group"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {t("Analyzing 50+ Schemes...")}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-amber-300" />
                      {t("Check Eligibility")}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  )}
                </Button>

                {result && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleReset}
                    className="w-full sm:w-auto text-sm py-6 gap-2"
                  >
                    <RotateCcw className="h-4 w-4 text-muted-foreground" />
                    {t("Reset Form")}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>

          <CardFooter className="bg-muted/30 border-t px-6 sm:px-8 py-4 flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              {t("Official Ministry Guidelines")}
            </span>
            <span>{t("Instant AI Evaluation")}</span>
          </CardFooter>
        </Card>

        {/* 3. DYNAMIC SCHEME RESULT CARD (BELOW THE FORM) */}
        {result && (
          <div id="scheme-result-card" className="mt-10 animate-fade-in space-y-6">
            
            {/* Conditional Card Rendering: RED for Ineligible, GREEN for Eligible */}
            {!result.isEligible ? (
              /* RED ERROR CARD */
              <Card className="border-2 border-destructive bg-destructive/10 text-red-100 shadow-xl overflow-hidden backdrop-blur-md">
                <div className="h-1.5 w-full bg-destructive" />
                <CardHeader className="p-6 sm:p-8 pb-4">
                  <div className="flex items-start gap-3">
                    <XCircle className="h-7 w-7 text-destructive flex-shrink-0 mt-0.5" />
                    <div className="space-y-2">
                      <div className="inline-flex items-center gap-2 bg-destructive/20 border border-destructive text-destructive px-4 py-1.5 rounded-full text-xs font-bold">
                        ✗ {t("Statutory Limit Exceeded")}
                      </div>
                      <CardTitle className="text-xl sm:text-2xl font-bold text-red-400 leading-tight">
                        {result.headerTitle.includes("Not Eligible") ? `❌ ${t("Not Eligible")} - ${t("Income exceeds limit")}` : result.headerTitle}
                      </CardTitle>
                      <p className="text-sm text-slate-300">
                        Eligibility Check Status: <span className="font-semibold text-red-400">{t("Not Eligible")} ({t("Income exceeds limit")})</span>
                      </p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="px-6 sm:px-8 pb-6 space-y-4">
                  <p className="text-sm text-slate-200 leading-relaxed bg-destructive/20 p-4 rounded-xl border border-destructive/40">
                    {t(result.description)}
                  </p>

                  <div className="space-y-2 pt-1">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-red-300">
                      {t("Why did this happen?")}
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {result.keyHighlights.map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-red-400 font-bold">•</span>
                          <span>{t(item)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>

                <CardFooter className="bg-navy-950/60 border-t border-destructive/30 px-6 sm:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <span className="text-slate-300">
                    {t("Statutory income ceiling: ₹5,00,000 / year under National Concessional Schemes")}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReset}
                    className="border-destructive/40 text-red-400 hover:bg-destructive/20"
                  >
                    {t("Modify Assessment Inputs")}
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              /* GREEN SUCCESS CARD */
              <Card className="border-2 border-teal-700 bg-navy-900/60 text-foreground shadow-xl overflow-hidden backdrop-blur-md">
                {/* Top Green Accent bar */}
                <div className="h-1.5 w-full bg-gradient-to-r from-teal-400 to-emerald-500" />

                <CardHeader className="p-6 sm:p-8 pb-4">
                  {/* Header Title specified by requirements */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <div className="inline-flex items-center gap-2 bg-teal-900/50 border border-teal-700 text-teal-400 px-4 py-2 rounded-full text-sm font-medium">
                          ✓ {t("AI Match Verified")}
                        </div>
                        <div className="inline-flex items-center gap-2 bg-aurora-900/50 border border-aurora-700 text-aurora-400 px-3 py-1.5 rounded-full text-xs font-medium font-mono">
                          {result.purpose === "business" ? t("Business / MSME") : t("Higher Education")}
                        </div>
                      </div>
                      <CardTitle className="text-xl sm:text-2xl font-extrabold text-teal-400 leading-snug">
                        {t(result.schemeName)}
                      </CardTitle>
                    </div>

                    <div className="bg-teal-950/60 p-3 rounded-xl border border-teal-700/50 text-right self-start sm:self-auto">
                      <span className="text-[11px] uppercase font-bold text-teal-400 block">
                        {t("Concessional Interest Rate")}
                      </span>
                      <span className="text-lg sm:text-xl font-extrabold text-teal-300 font-mono">
                        {result.interestRate}
                      </span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="px-6 sm:px-8 pb-6 space-y-6">
                  {/* 1. Mandatory Badges Requested: 90% Loan Coverage Badge & 10% Self-Contribution Badge */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Badge 1: 90% Loan Coverage */}
                    <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold text-xs sm:text-sm bg-emerald-600 text-white shadow-sm shadow-emerald-600/20">
                      <ShieldCheck className="h-4 w-4 text-emerald-100" />
                      <span>{t("Government Loan (90%)")}</span>
                    </div>

                    {/* Badge 2: 10% Self-Contribution */}
                    <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold text-xs sm:text-sm bg-indigo-600 text-white shadow-sm shadow-indigo-600/20">
                      <Wallet className="h-4 w-4 text-indigo-100" />
                      <span>{t("Promoter Margin (10%)")}</span>
                    </div>

                    {/* Badge 3: Scheme Name */}
                    <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-medium text-xs sm:text-sm bg-background/80 border border-emerald-500/40 text-emerald-800 dark:text-emerald-200">
                      <Award className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      <span>{t(result.schemeName)}</span>
                    </div>

                    {/* Badge 4: Moratorium if education */}
                    {result.moratorium && (
                      <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-medium text-xs sm:text-sm bg-purple-600/15 border border-purple-500/30 text-purple-700 dark:text-purple-300">
                        <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        <span>{t("Moratorium Grace Period")}</span>
                      </div>
                    )}
                  </div>

                  {/* 2. Visual Segmented Progress Bar: 90% Govt Loan vs 10% Self Contribution */}
                  {result.govtShareAmount && result.userShareAmount && (
                    <div className="space-y-3 p-4 rounded-xl bg-white/70 dark:bg-card/70 backdrop-blur border border-emerald-500/30 shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs font-semibold">
                        <span className="text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                          {t("Government Loan (90%)")}: ₹ {formatIndianCurrency(result.govtShareAmount)}
                        </span>
                        <span className="text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                          <span className="h-2.5 w-2.5 rounded-full bg-indigo-500 inline-block" />
                          {t("Promoter Margin (10%)")}: ₹ {formatIndianCurrency(result.userShareAmount)}
                        </span>
                      </div>

                      {/* Visual Segmented Progress Bar */}
                      <div className="w-full h-5 bg-muted rounded-full overflow-hidden flex p-0.5 border border-emerald-500/30 shadow-inner">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-l-full flex items-center justify-center text-[10px] font-extrabold text-white transition-all duration-700 shadow-sm"
                          style={{ width: "90%" }}
                        >
                          {t("90% Government Funding")} (₹{formatIndianCurrency(result.govtShareAmount)})
                        </div>
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-r-full flex items-center justify-center text-[10px] font-extrabold text-white transition-all duration-700 shadow-sm"
                          style={{ width: "10%" }}
                        >
                          10%
                        </div>
                      </div>

                      {/* Breakdown Split Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div className="space-y-0.5 p-2.5 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-500/20">
                          <span className="text-[11px] text-muted-foreground block font-medium">
                            {t("Government Loan (90%)")}:
                          </span>
                          <p className="text-base font-bold text-emerald-700 dark:text-emerald-300">
                            ₹ {formatIndianCurrency(result.govtShareAmount)}
                          </p>
                          <span className="text-[10px] text-muted-foreground">
                            {t("Disbursement Channel")}
                          </span>
                        </div>

                        <div className="space-y-0.5 p-2.5 rounded-lg bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-500/20">
                          <span className="text-[11px] text-muted-foreground block font-medium">
                            {t("Promoter Margin (10%)")}:
                          </span>
                          <p className="text-base font-bold text-indigo-700 dark:text-indigo-300">
                            ₹ {formatIndianCurrency(result.userShareAmount)}
                          </p>
                          <span className="text-[10px] text-muted-foreground">
                            {t("Self / Promoter Contribution")}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5 border-t border-border/50">
                        <span>{t("Total Amount Payable")}: <strong>₹ {formatIndianCurrency(result.requestedLoan)}</strong></span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">{t("90:10 Ratio")}</span>
                      </div>
                    </div>
                  )}

                  {/* 3. Scheme Description */}
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    {t(result.description)}
                  </p>

                  {/* 4. Key Highlights / Benefits List */}
                  <div className="space-y-2 pt-1 border-t border-emerald-500/20">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                      {t("Key Scheme Highlights")}
                    </span>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-foreground/80 pt-1">
                      {result.keyHighlights.map((highlight, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                          <span>{t(highlight)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>

                <CardFooter className="bg-emerald-100/50 dark:bg-emerald-950/60 border-t border-emerald-200 dark:border-emerald-900/50 px-6 sm:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <span className="text-emerald-800 dark:text-emerald-200 font-medium flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    {t("Official Ministry Guidelines")}
                  </span>

                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                    {/* "Calculate EMI" Button */}
                    <Button
                      type="button"
                      variant="gradient"
                      size="sm"
                      onClick={() => {
                        setShowEmiCalculator((prev) => !prev);
                        if (!showEmiCalculator) {
                          setTimeout(() => {
                            const emiEl = document.getElementById("emi-calculator-section");
                            emiEl?.scrollIntoView({ behavior: "smooth" });
                          }, 100);
                        }
                      }}
                      className="w-full sm:w-auto font-bold gap-2 shadow-md shadow-indigo-500/20"
                    >
                      <Calculator className="h-4 w-4 text-amber-300" />
                      {showEmiCalculator ? t("Hide EMI Calculator") : t("Calculate EMI")}
                      <ChevronDown
                        className={`h-3.5 w-3.5 transition-transform duration-200 ${
                          showEmiCalculator ? "rotate-180" : ""
                        }`}
                      />
                    </Button>

                    <Button
                      size="sm"
                      className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-1.5 shadow-sm"
                      onClick={() => alert(`Application process initiated for ${result.schemeName}`)}
                    >
                      {t("Apply Now")} ({t(result.schemeName)})
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            )}

            {/* 4. Connected EMI Calculator Section */}
            {result.isEligible && showEmiCalculator && (
              <div id="emi-calculator-section" className="pt-2 animate-fade-in space-y-6">
                <EmiCalculator
                  initialLoanAmount={result.govtShareAmount || Math.round(result.requestedLoan * 0.9)}
                  initialInterestRate={
                    result.interestRate.includes("6.5")
                      ? 6.5
                      : result.interestRate.includes("7.5")
                      ? 7.5
                      : 6.5
                  }
                  initialPurpose={result.purpose}
                  initialSchemeName={result.schemeName}
                />

                {/* 5. "Find Nearest Partner" Action Card Below EMI Calculator */}
                <div className="p-5 sm:p-6 rounded-2xl border-2 border-teal-500/40 bg-teal-50/50 dark:bg-teal-950/30 backdrop-blur shadow-xl space-y-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-teal-600 text-white shadow-sm">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-bold text-foreground">
                        {t("Ready to Apply for {{scheme}}?", { scheme: t(result.schemeName), defaultValue: `Ready to Apply for ${result.schemeName}?` })}
                      </span>
                      <Badge variant="secondary" className="text-xs px-2.5 py-0.5 bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/30">
                        {activePartnersCount} {t("Active")}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">
                      {t("16+ verified metro bank branches")}
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="default"
                    size="lg"
                    className="w-full md:w-auto bg-teal-600 hover:bg-teal-700 text-white font-bold gap-2 shadow-lg shadow-teal-600/25 px-6 py-6 text-sm shrink-0"
                    onClick={handleFindNearestPartnerClick}
                  >
                    <Navigation className="h-4 w-4 text-emerald-200" />
                    {t("Find Nearest Partner")}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
