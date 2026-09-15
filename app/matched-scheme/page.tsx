"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Calculator,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AppState, AssessmentData, MatchedSchemeData } from "@/lib/app-state";
import { AuthGuard } from "@/components/auth-guard";
import { executeCreditDecisionEngine, FinalCreditDecision, ApplicantCreditProfile } from "@/lib/credit-engine";

export default function MatchedSchemePage() {
  const { t } = useTranslation();
  const [assessment, setAssessment] = useState<AssessmentData | null>(null);
  const [scheme, setScheme] = useState<MatchedSchemeData | null>(null);
  const [creditDecision, setCreditDecision] = useState<FinalCreditDecision | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let currentAssessment = AppState.getAssessment();

    if (!currentAssessment) {
      currentAssessment = {
        income: 250000,
        loanAmount: 120000,
        purpose: "Business",
        projectType: "Small",
        creditScore: "good"
      };
      AppState.saveAssessment(currentAssessment);
    }

    setAssessment(currentAssessment);

    // Compute or retrieve credit underwriting decision
    let decision = AppState.getCreditDecision();
    if (!decision) {
      const creditProfile: ApplicantCreditProfile = {
        name: currentAssessment.companyName || "Applicant",
        annualIncome: currentAssessment.income || 250000,
        loanAmount: currentAssessment.loanAmount || 120000,
        existingEmis: currentAssessment.existingEmis || 0,
        netSalary: currentAssessment.netSalary || Math.round((currentAssessment.income || 250000) / 12),
        salaryBank: currentAssessment.salaryBank,
        primaryPurpose: currentAssessment.primaryPurpose,
        businessScale: currentAssessment.businessScale,
        loanPurpose: currentAssessment.loanPurpose,
        yearsAtJob: currentAssessment.yearsAtJob,
        totalExperience: currentAssessment.totalExperience,
        residentialStatus: currentAssessment.residentialStatus,
        pincode: currentAssessment.pincode,
        creditScore: currentAssessment.creditScore || "no-history"
      };
      decision = executeCreditDecisionEngine(creditProfile);
      AppState.saveCreditDecision(decision);
    }
    setCreditDecision(decision);

    const { income, loanAmount, purpose, projectType } = currentAssessment;

    let evalScheme: MatchedSchemeData;

    // Rule 1: Knockout / Income Ceiling check / Credit decline
    if (decision && decision.decision === "DECLINE") {
      evalScheme = {
        isEligible: false,
        schemeName: "Ineligible for Concessional Credit",
        interestRate: 0,
        interestRateText: "N/A",
        maxLoanAmount: 0,
        maxLoanText: "₹0",
        govtCoveragePercent: 0,
        promoterMarginPercent: 0,
        govtShareAmount: 0,
        promoterMarginAmount: 0,
        totalProjectCost: loanAmount,
        fundingRatio: "0:0",
        description: "",
        moratoriumAvailable: false,
        ineligibleReason: decision.userMessage || (income > 500000 
          ? `Your annual family income of ₹${income.toLocaleString("en-IN")} exceeds the statutory ceiling limit of ₹5,00,000.`
          : "Application does not meet institutional credit underwriting threshold."),
      };
    } else if (income > 500000) {
      evalScheme = {
        isEligible: false,
        schemeName: "Ineligible for Concessional Credit",
        interestRate: 0,
        interestRateText: "N/A",
        maxLoanAmount: 0,
        maxLoanText: "₹0",
        govtCoveragePercent: 0,
        promoterMarginPercent: 0,
        govtShareAmount: 0,
        promoterMarginAmount: 0,
        totalProjectCost: loanAmount,
        fundingRatio: "0:0",
        description: "",
        moratoriumAvailable: false,
        ineligibleReason: `Your annual family income of ₹${income.toLocaleString("en-IN")} exceeds the statutory ceiling limit of ₹5,00,000 for Ministry concessional financing.`,
      };
    } else if (purpose === "Business") {
      if (projectType === "Small" || loanAmount <= 140000) {
        // Micro Finance Scheme (Small)
        const govtShare = Math.round(loanAmount * 0.9);
        const margin = Math.round(loanAmount * 0.1);
        evalScheme = {
          isEligible: true,
          schemeName: "Micro Finance Scheme (Small / Artisan)",
          interestRate: decision?.interestRate || 6.5,
          interestRateText: `${decision?.interestRate || 6.5}% p.a.`,
          maxLoanAmount: 140000,
          maxLoanText: "Up to ₹1.40 Lakhs",
          govtCoveragePercent: 90,
          promoterMarginPercent: 10,
          govtShareAmount: govtShare,
          promoterMarginAmount: margin,
          totalProjectCost: loanAmount,
          fundingRatio: "90:10",
          moratoriumAvailable: false,
          description: "High-impact micro-credit program providing direct capital for street vendors, small artisans, and petty traders with minimal paperwork and zero collateral requirements.",
        };
      } else {
        // Term Loan Scheme (Medium & Large)
        const govtShare = Math.round(loanAmount * 0.9);
        const margin = Math.round(loanAmount * 0.1);
        evalScheme = {
          isEligible: true,
          schemeName: "National Concessional Term Loan Scheme",
          interestRate: decision?.interestRate || 7.5,
          interestRateText: `${decision?.interestRate || 7.5}% p.a.`,
          maxLoanAmount: 5000000,
          maxLoanText: "Up to ₹50.00 Lakhs",
          govtCoveragePercent: 90,
          promoterMarginPercent: 10,
          govtShareAmount: govtShare,
          promoterMarginAmount: margin,
          totalProjectCost: loanAmount,
          fundingRatio: "90:10",
          moratoriumAvailable: false,
          description: "Medium-to-large business term financing designed for equipment purchase, technology upgradation, and working capital for viable commercial self-employment projects.",
        };
      }
    } else {
      // Education Loan Scheme
      const govtShare = Math.round(loanAmount * 0.9);
      const margin = Math.round(loanAmount * 0.1);
      evalScheme = {
        isEligible: true,
        schemeName: "Subsidized Education Loan Scheme",
        interestRate: decision?.interestRate || 6.5,
        interestRateText: `${decision?.interestRate || 6.5}% p.a.`,
        maxLoanAmount: 2000000,
        maxLoanText: "Up to ₹20.00 Lakhs (In India)",
        govtCoveragePercent: 90,
        promoterMarginPercent: 10,
        govtShareAmount: govtShare,
        promoterMarginAmount: margin,
        totalProjectCost: loanAmount,
        fundingRatio: "90:10",
        moratoriumAvailable: true,
        moratoriumDetails: "Course Duration + 1 Year Job Search Moratorium",
        description: "Concessional student finance covering tuition, exam fees, study materials, and hostel expenses with post-course moratorium repayment protection.",
      };
    }

    setScheme(evalScheme);
    AppState.saveScheme(evalScheme);
    setLoading(false);
  }, []);


  if (loading || !assessment || !scheme) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-slate-50 dark:bg-navy-950 text-foreground">
        <div className="h-8 w-8 rounded-full border-t-2 border-b-2 border-teal-500 animate-spin" />
        <span className="text-xs text-muted-foreground mt-4">{t("Analyzing 50+ Schemes...")}</span>
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-navy-950 text-foreground py-10 md:py-16 transition-colors duration-200">
        <div className="container px-4 mx-auto max-w-3xl space-y-8">
        
        {/* Stepper Header */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
              {t("Step 2 of 4: Scheme Matching")}
            </span>
            <span className="font-mono">
              {t("Next:")} {t("EMI Calculator")} &amp; {t("Partner Network")}
            </span>
          </div>
          
          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden flex">
            <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-teal-400 w-2/4 rounded-full" />
          </div>
        </div>

        {/* Quick Jump Navigation Bar */}
        <div className="rounded-xl p-2.5 border border-border/80 bg-card/70 backdrop-blur-md flex flex-wrap items-center justify-between gap-2 shadow-lg relative z-20">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold px-2">
            <Sparkles className="w-4 h-4 text-teal-500" />
            <span>{t("Quick Jump:")}</span>
          </div>
          
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium">
            {/* 1. Assessment button -> navigates to /assessment */}
            <Link
              href="/assessment"
              className="px-3 py-1.5 rounded-lg bg-muted/50 hover:bg-teal-500/20 hover:text-teal-600 dark:hover:text-teal-300 text-muted-foreground border border-border/60 flex items-center gap-1.5 transition-all cursor-pointer group"
            >
              <span>{t("Assessment")}</span>
              <ArrowRight className="w-3 h-3 text-muted-foreground group-hover:text-teal-500 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            {/* 2. Matched Scheme button -> active */}
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="px-3 py-1.5 rounded-lg bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 font-bold border border-indigo-500/40 shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
              <span>{t("Matched Scheme")}</span>
            </button>

            {/* 3. EMI Calculator button -> navigates to /emi-calculator */}
            <Link
              href="/emi-calculator"
              className="px-3 py-1.5 rounded-lg bg-muted/50 hover:bg-purple-500/20 hover:text-purple-600 dark:hover:text-purple-300 text-muted-foreground border border-border/60 flex items-center gap-1.5 transition-all cursor-pointer group"
            >
              <span>{t("EMI Calculator")}</span>
              <ArrowRight className="w-3 h-3 text-muted-foreground group-hover:text-purple-500 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            {/* 4. Partner Network button -> navigates to /partner-network */}
            <Link
              href="/partner-network"
              className="px-3 py-1.5 rounded-lg bg-muted/50 hover:bg-emerald-500/20 hover:text-emerald-600 dark:hover:text-emerald-300 text-muted-foreground border border-border/60 flex items-center gap-1.5 transition-all cursor-pointer group"
            >
              <span>{t("Partner Network")}</span>
              <ArrowRight className="w-3 h-3 text-muted-foreground group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>

        {/* CASE A: INELIGIBLE ERROR CARD / ADVERSE ACTION */}
        {!scheme.isEligible ? (
          <Card className="border-2 border-destructive bg-destructive/10 backdrop-blur-md shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-destructive/20 text-destructive border border-destructive">
                <XCircle className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 bg-destructive/20 border border-destructive text-destructive px-4 py-1.5 rounded-full text-xs font-bold">
                  {creditDecision?.flag === "RED" ? `❌ ${t("Underwriting Auto-Decline")}` : `✗ ${t("Statutory Limit Exceeded")}`}
                </div>
                <h2 className="text-2xl font-bold text-foreground">
                  {creditDecision?.flag === "RED" ? t("Application Declined by Credit Policy") : t("Not Eligible for Concessional Lending")}
                </h2>
                <p className="text-sm text-muted-foreground">{scheme.ineligibleReason ? t(scheme.ineligibleReason) : ""}</p>
              </div>
            </div>

            {/* Adverse Action Breakdown */}
            {creditDecision?.adverseAction && (
              <div className="p-4 rounded-xl bg-slate-900/80 border border-destructive/30 space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="font-bold text-destructive uppercase tracking-wider">
                    📋 {t("Adverse Action Notice (Fair Lending Disclosure)")}
                  </span>
                  <span className="text-[11px] text-amber-400 font-mono">
                    {t("Cooldown:")} {creditDecision.adverseAction.cooldownPeriod ? t(creditDecision.adverseAction.cooldownPeriod) : ""}
                  </span>
                </div>
                <div className="space-y-1.5">
                  <span className="text-slate-300 font-semibold block">{t("Primary Underwriting Negative Factors:")}</span>
                  <ul className="space-y-1 text-slate-400">
                    {creditDecision.adverseAction.top3Reasons.map((reason, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-red-400 font-bold">•</span>
                        <span>{t(reason)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <div className="p-4 rounded-xl bg-slate-100 dark:bg-navy-900/60 border border-slate-200 dark:border-navy-700 text-xs space-y-2 font-mono">
              <span className="font-bold text-foreground uppercase tracking-wider block">{t("Submitted Details")}</span>
              <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                <div>{t("Annual Income")}: <strong className="text-foreground">₹{assessment.income.toLocaleString("en-IN")}</strong></div>
                <div>{t("Loan Amount")}: <strong className="text-foreground">₹{assessment.loanAmount.toLocaleString("en-IN")}</strong></div>
                <div>{t("Credit Score")}: <strong className="text-foreground uppercase">{t(assessment.creditScore || "no-history") || assessment.creditScore || "N/A"}</strong></div>
                <div>{t("Existing EMIs")}: <strong className="text-foreground">₹{(assessment.existingEmis || 0).toLocaleString("en-IN")}{t("/mo")}</strong></div>
              </div>
            </div>

            <div className="pt-2">
              <Link href="/assessment">
                <Button variant="cta" className="gap-2 font-bold text-xs">
                  <RotateCcw className="h-4 w-4" />
                  <span>{t("Modify Assessment Inputs")}</span>
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          /* CASE B: ELIGIBLE & MATCHED CARD */
          <Card className="border-2 border-teal-600 dark:border-teal-700 bg-white/95 dark:bg-navy-900/60 backdrop-blur-md shadow-xl dark:shadow-2xl space-y-8 p-6 sm:p-8 relative overflow-hidden text-card-foreground">
            <div className="h-1.5 w-full bg-gradient-to-r from-teal-400 via-emerald-500 to-aurora-500 absolute top-0 left-0" />

            {/* Header & Badges */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-navy-700 pb-6">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center gap-2 bg-teal-50 dark:bg-teal-900/50 border border-teal-200 dark:border-teal-700 text-teal-700 dark:text-teal-300 px-4 py-2 rounded-full text-sm font-medium">
                    <span className="h-2 w-2 rounded-full bg-teal-500 mr-0.5 inline-block animate-pulse" />
                    ✓ {t("AI Match Verified")}
                  </div>
                  <div className="inline-flex items-center gap-2 bg-aurora-50 dark:bg-aurora-900/50 border border-aurora-200 dark:border-aurora-700 text-aurora-700 dark:text-aurora-300 px-3 py-1.5 rounded-full text-xs font-semibold font-mono">
                    {t("90:10 Ratio")}
                  </div>
                  {creditDecision && (
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border font-mono ${
                      creditDecision.flag === "GREEN" 
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40" 
                        : creditDecision.flag === "AMBER" 
                        ? "bg-amber-500/20 text-amber-400 border-amber-500/40" 
                        : "bg-orange-500/20 text-orange-400 border-orange-500/40"
                    }`}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current animate-ping" />
                      {t("Score:")} {creditDecision.score}/100 ({t(creditDecision.riskCategory)})
                    </div>
                  )}
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight pt-1">
                  {t(scheme.schemeName)}
                </h2>
              </div>

              <div className="p-3.5 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-center sm:text-right shrink-0">
                <span className="text-[10px] font-bold text-teal-600 dark:text-teal-300 uppercase tracking-wider block">
                  {t("Concessional Interest Rate")}
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold font-mono text-teal-600 dark:text-teal-400">
                  {scheme.interestRateText}
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t(scheme.description)}
            </p>

            {/* Credit Engine Haircut / Counter-Offer Alert if applicable */}
            {creditDecision?.counterOffer && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1.5 text-xs">
                <span className="font-bold text-amber-400 uppercase tracking-wider block">
                  ⚠️ {t("FOIR Debt Sizing Counter-Offer Applied")}
                </span>
                <p className="text-slate-300">
                  {t("Based on your Fixed Obligation to Income Ratio (FOIR), the maximum eligible loan amount is")} ₹{creditDecision.counterOffer.approvedAmount.toLocaleString("en-IN")}. {t("Maximum approved ticket is capped at")}{" "}
                  <strong className="text-white font-mono">
                    ₹{creditDecision.counterOffer.approvedAmount.toLocaleString("en-IN")}
                  </strong>.
                </p>
              </div>
            )}

            {/* 4-Metric Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-100 dark:bg-muted/40 border border-slate-200 dark:border-border/70 space-y-1">
                <span className="text-[11px] text-muted-foreground font-semibold block">{t("Total Project Cost")}</span>
                <span className="text-lg font-bold font-mono text-foreground">₹{scheme.totalProjectCost.toLocaleString("en-IN")}</span>
                <span className="text-[10px] text-muted-foreground block">{t("Required Loan Amount")}</span>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 space-y-1">
                <span className="text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold block">{t("Government Loan (90%)")}</span>
                <span className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">₹{scheme.govtShareAmount.toLocaleString("en-IN")}</span>
                <span className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 block">{t("Disbursement Channel")}</span>
              </div>

              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 space-y-1">
                <span className="text-[11px] text-amber-700 dark:text-amber-300 font-semibold block">{t("Promoter Margin (10%)")}</span>
                <span className="text-lg font-bold font-mono text-amber-600 dark:text-amber-400">₹{scheme.promoterMarginAmount.toLocaleString("en-IN")}</span>
                <span className="text-[10px] text-amber-600/80 dark:text-amber-400/80 block">{t("Self / Promoter Contribution")}</span>
              </div>

              <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 space-y-1">
                <span className="text-[11px] text-indigo-700 dark:text-indigo-300 font-semibold block">{t("Maximum Loan Ceiling")}</span>
                <span className="text-lg font-bold font-mono text-indigo-600 dark:text-indigo-400">{t(scheme.maxLoanText)}</span>
                <span className="text-[10px] text-indigo-600/80 dark:text-indigo-400/80 block">{t("90:10 Ratio")}</span>
              </div>
            </div>

            {/* Segmented Progress Bar */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-muted/30 border border-slate-200 dark:border-border/70 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  {t("Government Loan (90%)")} (₹{scheme.govtShareAmount.toLocaleString("en-IN")})
                </span>
                <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                  {t("Promoter Margin (10%)")} (₹{scheme.promoterMarginAmount.toLocaleString("en-IN")})
                </span>
              </div>

              <div className="h-3 w-full rounded-full bg-slate-200 dark:bg-muted overflow-hidden flex shadow-inner">
                <div className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 w-[90%]" />
                <div className="h-full bg-amber-500 w-[10%]" />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4">
              <Link href="/assessment" className="w-full sm:w-auto">
                <Button variant="outline" size="sm" className="w-full sm:w-auto gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span>{t("Back to Assessment")}</span>
                </Button>
              </Link>

              <Link href="/emi-calculator" className="w-full sm:w-auto">
                <Button id="calculateEmiBtn" variant="gradient" size="lg" className="w-full sm:w-auto font-bold text-sm px-8 py-5 shadow-xl shadow-teal-500/20 gap-2 group">
                  <Calculator className="h-4 w-4 text-amber-300" />
                  <span>{t("Calculate Monthly Repayment EMI")}</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

          </Card>
        )}

      </div>
    </div>
    </AuthGuard>
  );
}
