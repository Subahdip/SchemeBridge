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
  CheckCircle2,
  Cpu,
  Layers,
  Filter,
  TrendingUp,
  AlertTriangle,
  Award,
  BookOpen,
  Briefcase,
  User,
  ShieldCheck,
  Trophy,
  Activity
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AppState, AssessmentData, MatchedSchemeData } from "@/lib/app-state";
import { AuthGuard } from "@/components/auth-guard";
import { executeCreditDecisionEngine, FinalCreditDecision, ApplicantCreditProfile } from "@/lib/credit-engine";
import { SchemeEvaluationResult, MatchSchemesResponse } from "@/lib/ai-matcher";

function parseInterestRateDisplay(text?: string | number) {
  if (!text) return { primary: "6.5% p.a.", subNote: null };
  const str = String(text);
  const match = str.match(/^(.*?)\s*\((.*?)\)$/);
  if (match) {
    return {
      primary: match[1].trim(),
      subNote: match[2].trim()
    };
  }
  return {
    primary: str.includes("%") ? str : `${str}% p.a.`,
    subNote: null
  };
}

export default function MatchedSchemePage() {
  const { t } = useTranslation();
  const [assessment, setAssessment] = useState<AssessmentData | null>(null);
  const [scheme, setScheme] = useState<MatchedSchemeData | null>(null);
  const [creditDecision, setCreditDecision] = useState<FinalCreditDecision | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingStep, setLoadingStep] = useState<string>("Initializing...");
  
  // AI Matching States
  const [aiResponse, setAiResponse] = useState<MatchSchemesResponse | null>(null);
  const [selectedSchemeResult, setSelectedSchemeResult] = useState<SchemeEvaluationResult | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const performAiMatching = async (currentAssessment: AssessmentData, decision: FinalCreditDecision) => {
    setLoading(true);
    setAiError(null);

    // Step 1: User Profile analysis
    setLoadingStep("Step 1/4: Analyzing User Requirement & Profile...");
    await new Promise((r) => setTimeout(r, 250));

    // Step 2: Embedding Generation
    setLoadingStep("Step 2/4: Calling OpenRouter Embeddings (openai/text-embedding-3-small)...");

    try {
      const res = await fetch("/api/match-schemes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentAssessment),
      });

      const data: MatchSchemesResponse = await res.json();

      if (!res.ok || !data.success) {
        setAiError(data.error || "AI Scheme Matching request failed.");
        setLoading(false);
        return;
      }

      setLoadingStep("Step 3/4: Calculating Cosine Similarity & Validating Statutory Rules...");
      await new Promise((r) => setTimeout(r, 200));

      setLoadingStep("Step 4/4: Ranking Top Eligible Schemes...");
      await new Promise((r) => setTimeout(r, 200));

      setAiResponse(data);

      if (data.bestMatch) {
        setSelectedSchemeResult(data.bestMatch);
        const best = data.bestMatch;
        const s = best.scheme;
        const loanAmt = currentAssessment.loanAmount || 120000;
        const govtCoverage = s.govtCoveragePercent || 90;
        const promoterMargin = s.promoterMarginPercent || 10;
        const govtShare = Math.round(loanAmt * (govtCoverage / 100));
        const margin = Math.round(loanAmt * (promoterMargin / 100));

        const matchedSchemeData: MatchedSchemeData = {
          schemeId: s.id,
          isEligible: true,
          schemeName: s.schemeName,
          interestRate: s.interestRate,
          interestRateText: s.interestRateText || `${s.interestRate}% p.a.`,
          maxLoanAmount: s.maxLoanAmount,
          maxLoanText: `Up to ₹${(s.maxLoanAmount / 100000).toFixed(2)} Lakhs`,
          govtCoveragePercent: govtCoverage,
          promoterMarginPercent: promoterMargin,
          govtShareAmount: govtShare,
          promoterMarginAmount: margin,
          totalProjectCost: loanAmt,
          fundingRatio: `${govtCoverage}:${promoterMargin}`,
          description: s.description,
          moratoriumAvailable: s.moratoriumAvailable,
          moratoriumDetails: s.moratoriumDetails,
          aiMatchScore: best.aiMatchScore,
          cosineSimilarity: best.cosineSimilarity,
          reasons: best.reasons,
          topMatches: data.topEligibleSchemes,
          allEvaluations: data.allEvaluations,
          aiModelUsed: data.aiModel,
          userSemanticText: data.userSemanticText,
          isAiAssisted: true,
        };

        setScheme(matchedSchemeData);
        AppState.saveScheme(matchedSchemeData);
      } else {
        // No eligible schemes found (e.g. Income > 5L or all hard knocked out)
        const ineligibleSchemeData: MatchedSchemeData = {
          isEligible: false,
          schemeName: "Ineligible for Concessional Welfare Schemes",
          interestRate: 0,
          interestRateText: "N/A",
          maxLoanAmount: 0,
          maxLoanText: "₹0",
          govtCoveragePercent: 0,
          promoterMarginPercent: 0,
          govtShareAmount: 0,
          promoterMarginAmount: 0,
          totalProjectCost: currentAssessment.loanAmount || 0,
          fundingRatio: "0:0",
          description: "",
          moratoriumAvailable: false,
          ineligibleReason: currentAssessment.income > 500000
            ? `Your stated annual family income of ₹${currentAssessment.income.toLocaleString("en-IN")} exceeds the statutory ₹5,00,000 ceiling for concessional welfare lending.`
            : "Application does not meet mandatory credit policy eligibility rules.",
          isAiAssisted: true,
          topMatches: [],
          allEvaluations: data.allEvaluations
        };

        setScheme(ineligibleSchemeData);
        AppState.saveScheme(ineligibleSchemeData);
      }
    } catch (err: any) {
      console.error("❌ Failed to match schemes with AI:", err);
      setAiError(err?.message || "Could not connect to /api/match-schemes endpoint.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectScheme = (evalResult: SchemeEvaluationResult) => {
    if (!assessment || !evalResult.eligible) return;
    setSelectedSchemeResult(evalResult);
    const s = evalResult.scheme;
    const loanAmt = assessment.loanAmount || 120000;
    const govtCoverage = s.govtCoveragePercent || 90;
    const promoterMargin = s.promoterMarginPercent || 10;
    const govtShare = Math.round(loanAmt * (govtCoverage / 100));
    const margin = Math.round(loanAmt * (promoterMargin / 100));

    const updatedSchemeData: MatchedSchemeData = {
      schemeId: s.id,
      isEligible: true,
      schemeName: s.schemeName,
      interestRate: s.interestRate,
      interestRateText: s.interestRateText || `${s.interestRate}% p.a.`,
      maxLoanAmount: s.maxLoanAmount,
      maxLoanText: `Up to ₹${(s.maxLoanAmount / 100000).toFixed(2)} Lakhs`,
      govtCoveragePercent: govtCoverage,
      promoterMarginPercent: promoterMargin,
      govtShareAmount: govtShare,
      promoterMarginAmount: margin,
      totalProjectCost: loanAmt,
      fundingRatio: `${govtCoverage}:${promoterMargin}`,
      description: s.description,
      moratoriumAvailable: s.moratoriumAvailable,
      moratoriumDetails: s.moratoriumDetails,
      aiMatchScore: evalResult.aiMatchScore,
      cosineSimilarity: evalResult.cosineSimilarity,
      reasons: evalResult.reasons,
      topMatches: aiResponse?.topEligibleSchemes,
      allEvaluations: aiResponse?.allEvaluations,
      aiModelUsed: aiResponse?.aiModel,
      userSemanticText: aiResponse?.userSemanticText,
      isAiAssisted: true,
    };

    setScheme(updatedSchemeData);
    AppState.saveScheme(updatedSchemeData);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    let currentAssessment = AppState.getAssessment();

    if (!currentAssessment) {
      currentAssessment = {
        income: 250000,
        loanAmount: 120000,
        purpose: "Business",
        loanPurpose: "business",
        requirementText: "I want to start a tailoring business and need money for sewing machines.",
        projectType: "Small",
        creditScore: "good"
      };
      AppState.saveAssessment(currentAssessment);
    }

    setAssessment(currentAssessment);

    // Compute credit decision
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

    // Run AI Matching
    performAiMatching(currentAssessment, decision);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-slate-50 dark:bg-[#070b14] text-foreground p-6">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white dark:bg-navy-900 border border-teal-500/30 shadow-2xl space-y-6 text-center animate-fade-in">
          <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-teal-500/20 border-t-teal-500 animate-spin" />
            <Cpu className="w-7 h-7 text-teal-500 animate-pulse" />
          </div>

          <div className="space-y-2">
            <Badge variant="secondary" className="px-3 py-1 text-xs font-mono bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20">
              OpenRouter AI Embeddings
            </Badge>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {t("AI Semantic Matching Pipeline")}
            </h3>
            <p className="text-xs text-muted-foreground font-mono">
              model: openai/text-embedding-3-small
            </p>
          </div>

          {/* Micro Flow Steps */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-left space-y-2.5 text-xs">
            <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 font-semibold">
              <span className="h-2 w-2 rounded-full bg-teal-500 animate-ping" />
              <span>{loadingStep}</span>
            </div>
            <div className="h-1.5 w-full bg-slate-200 dark:bg-navy-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-teal-500 via-indigo-500 to-purple-500 animate-pulse w-3/4 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#070b14] text-foreground py-10 md:py-16 transition-colors duration-200">
        <div className="container px-4 mx-auto max-w-4xl space-y-8">
        
        {/* Stepper Header */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-500" />
              {t("Step 2 of 4: AI-Assisted Scheme Matching")}
            </span>
            <span className="font-mono">
              {t("Next:")} {t("EMI Calculator")} &amp; {t("Partner Network")}
            </span>
          </div>
          
          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden flex">
            <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-teal-400 w-2/4 rounded-full" />
          </div>
        </div>

        {/* ========================================================================= */}
        {/* AI FLOW INDICATOR HUD */}
        {/* ========================================================================= */}
        <div className="p-4 sm:p-5 rounded-2xl border border-teal-500/30 bg-white/95 dark:bg-navy-900/80 backdrop-blur-md shadow-xl space-y-3 relative overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-teal-400 via-indigo-500 to-purple-500 absolute top-0 left-0" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  {t("AI Semantic Recommendation Pipeline")}
                </h4>
                <p className="text-[11px] text-muted-foreground font-mono">
                  OpenRouter API • openai/text-embedding-3-small • Cosine Similarity
                </p>
              </div>
            </div>

            <Badge variant="outline" className="text-[10px] font-mono border-teal-500/40 text-teal-600 dark:text-teal-400 bg-teal-500/5 self-start sm:self-auto">
              Hard Statutory Filter: ACTIVE
            </Badge>
          </div>

          {/* Interactive Flow Nodes */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 text-[11px] font-medium">
            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-navy-950/60 border border-slate-200 dark:border-navy-800 text-center space-y-1">
              <User className="w-4 h-4 mx-auto text-teal-600 dark:text-teal-400" />
              <span className="font-bold text-slate-800 dark:text-slate-200 block">{t("1. User Profile")}</span>
              <span className="text-[10px] text-muted-foreground block truncate">
                {assessment?.loanPurpose || "Requirement"}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-navy-950/60 border border-slate-200 dark:border-navy-800 text-center space-y-1">
              <Sparkles className="w-4 h-4 mx-auto text-teal-600 dark:text-teal-400" />
              <span className="font-bold text-slate-800 dark:text-slate-200 block">{t("2. Embeddings")}</span>
              <span className="text-[10px] text-muted-foreground block font-mono">1536-dim vector</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-navy-950/60 border border-slate-200 dark:border-navy-800 text-center space-y-1">
              <Activity className="w-4 h-4 mx-auto text-teal-600 dark:text-teal-400" />
              <span className="font-bold text-slate-800 dark:text-slate-200 block">{t("3. Cosine Sim")}</span>
              <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold block font-mono">
                {scheme?.aiMatchScore ? `${scheme.aiMatchScore}% Score` : "Matched"}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-navy-950/60 border border-slate-200 dark:border-navy-800 text-center space-y-1">
              <ShieldCheck className="w-4 h-4 mx-auto text-teal-600 dark:text-teal-400" />
              <span className="font-bold text-slate-800 dark:text-slate-200 block">{t("4. Hard Rules")}</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block">
                {scheme?.isEligible ? t("Eligible") : t("Knockout")}
              </span>
            </div>

            <div className="col-span-2 sm:col-span-1 p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/30 text-center space-y-1">
              <Trophy className="w-4 h-4 mx-auto text-teal-600 dark:text-teal-400" />
              <span className="font-bold text-teal-700 dark:text-teal-300 block">{t("5. Ranking")}</span>
              <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold block">Top 3 Schemes</span>
            </div>
          </div>

          {/* User Semantic Query display */}
          {aiResponse?.userSemanticText && (
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-navy-950/80 border border-slate-200 dark:border-navy-800 text-xs text-muted-foreground">
              <span className="font-bold text-slate-700 dark:text-slate-300">Semantic Query: </span>
              <span className="italic text-slate-600 dark:text-slate-400">&ldquo;{aiResponse.userSemanticText}&rdquo;</span>
            </div>
          )}
        </div>

        {/* AI Error Alert if API failed */}
        {aiError && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-amber-500 font-bold">
              <AlertTriangle className="w-4 h-4" />
              <span>{t("AI Service Notice")}</span>
            </div>
            <p className="text-slate-700 dark:text-slate-300">{aiError}</p>
            <p className="text-muted-foreground font-mono text-[11px]">
              Tip: Set <code className="bg-slate-200 dark:bg-navy-900 px-1 py-0.5 rounded">OPENROUTER_API_KEY</code> in <code className="bg-slate-200 dark:bg-navy-900 px-1 py-0.5 rounded">.env.local</code> to activate live OpenRouter AI Embeddings.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => assessment && creditDecision && performAiMatching(assessment, creditDecision)}
              className="mt-2 text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              {t("Retry AI Matching")}
            </Button>
          </div>
        )}

        {/* CASE A: INELIGIBLE ERROR CARD / ADVERSE ACTION */}
        {scheme && !scheme.isEligible ? (
          <Card className="border-2 border-destructive bg-destructive/10 backdrop-blur-md shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-destructive/20 text-destructive border border-destructive">
                <XCircle className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 bg-destructive/20 border border-destructive text-destructive px-4 py-1.5 rounded-full text-xs font-bold">
                  <XCircle className="w-3.5 h-3.5" />
                  <span>{creditDecision?.flag === "RED" ? t("Underwriting Auto-Decline") : t("Statutory Limit Exceeded")}</span>
                </div>
                <h2 className="text-2xl font-bold text-foreground">
                  {creditDecision?.flag === "RED" ? t("Application Declined by Credit Policy") : t("Not Eligible for Concessional Lending")}
                </h2>
                <p className="text-sm text-muted-foreground">{scheme.ineligibleReason ? t(scheme.ineligibleReason) : ""}</p>
              </div>
            </div>

            {/* Hard Knockout Explanation */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-destructive/30 space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="font-bold text-destructive uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-destructive" />
                  <span>{t("Hard Eligibility Knockout Rule Enforcement")}</span>
                </span>
                <span className="text-[11px] text-amber-400 font-mono">
                  {t("AI Overrides: FORBIDDEN")}
                </span>
              </div>
              <p className="text-slate-300">
                {t("Even if AI semantic relevance is high, statutory income ceilings (₹5.00 Lakhs) and loan policy limits act as non-negotiable hard knockouts. Ineligible schemes cannot be recommended.")}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-100 dark:bg-navy-900/60 border border-slate-200 dark:border-navy-700 text-xs space-y-2 font-mono">
              <span className="font-bold text-foreground uppercase tracking-wider block">{t("Submitted Profile")}</span>
              <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                <div>{t("Annual Income")}: <strong className="text-foreground">₹{assessment?.income.toLocaleString("en-IN")}</strong></div>
                <div>{t("Loan Amount")}: <strong className="text-foreground">₹{assessment?.loanAmount.toLocaleString("en-IN")}</strong></div>
                <div>{t("Credit Score")}: <strong className="text-foreground uppercase">{assessment?.creditScore || "N/A"}</strong></div>
                <div>{t("Existing EMIs")}: <strong className="text-foreground">₹{(assessment?.existingEmis || 0).toLocaleString("en-IN")}{t("/mo")}</strong></div>
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
        ) : scheme ? (
          /* CASE B: ELIGIBLE & MATCHED CARD */
          <div className="space-y-8">
            <Card className="border-2 border-teal-600 dark:border-teal-700 bg-white/95 dark:bg-navy-900/60 backdrop-blur-md shadow-xl dark:shadow-2xl space-y-8 p-6 sm:p-8 relative overflow-hidden text-card-foreground">
              <div className="h-1.5 w-full bg-gradient-to-r from-teal-400 via-emerald-500 to-aurora-500 absolute top-0 left-0" />

              {/* Header & Badges */}
              <div className="space-y-4 border-b border-slate-200 dark:border-navy-700 pb-6">
                {/* Clean, Wrap-Enabled Badges Bar */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* BEST MATCH BADGE */}
                  <Badge className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-extrabold px-3 py-1 text-xs shadow-md flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5" />
                    <span>{t("BEST MATCH")}</span>
                  </Badge>

                  {/* AI MATCH SCORE BADGE */}
                  <div className="inline-flex items-center gap-1.5 bg-teal-500/15 border border-teal-500/30 text-teal-700 dark:text-teal-300 px-3.5 py-1.5 rounded-full text-xs font-bold font-mono">
                    <Sparkles className="w-3.5 h-3.5 text-teal-500" />
                    <span>{t("AI Match Score:")} {scheme.aiMatchScore || 91}%</span>
                  </div>

                  {/* ELIGIBILITY BADGE */}
                  <div className="inline-flex items-center gap-1.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 px-3 py-1.5 rounded-full text-xs font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{t("Statutory Rules: Eligible")}</span>
                  </div>

                  <div className="inline-flex items-center gap-2 bg-aurora-50 dark:bg-aurora-900/50 border border-aurora-200 dark:border-aurora-700 text-aurora-700 dark:text-aurora-300 px-3 py-1.5 rounded-full text-xs font-semibold font-mono">
                    {t("90:10 Ratio")}
                  </div>
                </div>

                {/* Main Title & Interest Rate Callout */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-5 pt-1">
                  <div className="flex-1 min-w-0 pr-0 md:pr-4">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                      {t(scheme.schemeName)}
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed mt-2.5">
                      {t(scheme.description)}
                    </p>
                  </div>

                  {/* Formatted Interest Rate Box */}
                  {(() => {
                    const { primary, subNote } = parseInterestRateDisplay(scheme.interestRateText || scheme.interestRate);
                    return (
                      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-teal-500/15 via-emerald-500/10 to-teal-500/5 border border-teal-500/30 text-left md:text-right shrink-0 shadow-sm flex flex-col justify-center min-w-[210px] max-w-full md:max-w-[280px]">
                        <span className="text-[10px] font-bold text-teal-600 dark:text-teal-300 uppercase tracking-wider block">
                          {t("Concessional Interest Rate")}
                        </span>
                        <span className="text-3xl sm:text-4xl font-black font-mono text-teal-600 dark:text-teal-400 tracking-tight block mt-0.5">
                          {primary}
                        </span>
                        {subNote && (
                          <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-teal-800 dark:text-teal-300 bg-teal-500/15 border border-teal-500/30 px-2.5 py-1 rounded-lg self-start md:self-end">
                            <Sparkles className="w-3 h-3 text-teal-500 shrink-0" />
                            <span>{subNote}</span>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* ================================================================= */}
              {/* WHY THIS SCHEME? (Transparent Grounded Reasons) */}
              {/* ================================================================= */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-navy-950/70 border border-teal-500/20 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-navy-800 pb-2">
                  <h4 className="text-xs font-bold text-teal-800 dark:text-teal-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-teal-500" />
                    <span>{t("Why This Scheme?")}</span>
                  </h4>
                  <span className="text-[11px] font-mono text-teal-600 dark:text-teal-400">
                    AI Semantic Relevance: {scheme.aiMatchScore || 91}%
                  </span>
                </div>

                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-300">
                  {(scheme.reasons && scheme.reasons.length > 0 ? scheme.reasons : [
                    `Purpose is semantically aligned with the scheme profile`,
                    `Income satisfies statutory requirement (₹${assessment?.income.toLocaleString('en-IN')})`,
                    `Requested amount is within the scheme limit (₹${assessment?.loanAmount.toLocaleString('en-IN')})`,
                    `Applicant category matches target beneficiary criteria`
                  ]).map((reason, idx) => (
                    <li key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-white dark:bg-navy-900/50 border border-slate-200/60 dark:border-navy-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{t(reason)}</span>
                    </li>
                  ))}
                </ul>
              </div>

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

            {/* ================================================================= */}
            {/* OTHER ELIGIBLE SCHEMES (Ranked Recommendations 2 & 3) */}
            {/* ================================================================= */}
            {aiResponse?.topEligibleSchemes && aiResponse.topEligibleSchemes.length > 1 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-indigo-500" />
                    <span>{t("Other Eligible Government Schemes")}</span>
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    {t("Ranked by AI Semantic Match Score")}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {aiResponse.topEligibleSchemes.slice(1).map((item: SchemeEvaluationResult, idx: number) => {
                    const isCurrent = scheme.schemeName === item.scheme.schemeName;
                    const { primary: ratePrimary, subNote: rateSubNote } = parseInterestRateDisplay(item.scheme.interestRateText || item.scheme.interestRate);
                    return (
                      <Card
                        key={idx}
                        className={`p-5 rounded-2xl border transition-all duration-200 space-y-4 ${
                          isCurrent
                            ? "border-teal-500 bg-teal-500/5 shadow-md"
                            : "border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900/60 hover:border-teal-500/50 hover:shadow-lg"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1 flex-1 min-w-0 pr-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                              {t("Rank")} #{item.rank || idx + 2}
                            </span>
                            <h4 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                              {t(item.scheme.schemeName)}
                            </h4>
                          </div>

                          <div className="px-3 py-1 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/30 text-xs font-bold font-mono shrink-0">
                            {item.aiMatchScore}% {t("Match")}
                          </div>
                        </div>

                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {t(item.scheme.description)}
                        </p>

                        <div className="grid grid-cols-2 gap-2 text-xs font-mono p-3 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200/60 dark:border-navy-800/60">
                          <div>
                            <span className="text-[10px] text-muted-foreground block font-sans">{t("Interest Rate")}</span>
                            <span className="font-bold text-teal-600 dark:text-teal-400 block">{ratePrimary}</span>
                            {rateSubNote && (
                              <span className="text-[10px] text-teal-600/90 dark:text-teal-300 font-sans block truncate" title={rateSubNote}>
                                {rateSubNote}
                              </span>
                            )}
                          </div>
                          <div>
                            <span className="text-[10px] text-muted-foreground block font-sans">{t("Max Ceiling")}</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200 block">
                              ₹{(item.scheme.maxLoanAmount / 100000).toFixed(1)}L
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {t("Eligible")}
                          </span>

                          <Button
                            variant={isCurrent ? "secondary" : "outline"}
                            size="sm"
                            onClick={() => handleSelectScheme(item)}
                            className="text-xs font-bold"
                          >
                            {isCurrent ? t("Active Selection") : t("Select this Scheme")}
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : null}

      </div>
    </div>
    </AuthGuard>
  );
}
