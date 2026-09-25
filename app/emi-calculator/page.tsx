"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Calculator,
  SlidersHorizontal,
  Layers,
  MapPin,
  Clock,
  Award,
  IndianRupee,
  AlertCircle,
} from "lucide-react";
import { AppState, AssessmentData, MatchedSchemeData } from "@/lib/app-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { EmiCalculator } from "@/components/emi-calculator";
import { useTranslation } from "react-i18next";
import { AuthGuard } from "@/components/auth-guard";

export default function EmiCalculatorPage() {
  const { t } = useTranslation();
  const [assessment, setAssessment] = useState<AssessmentData | null>(null);
  const [scheme, setScheme] = useState<MatchedSchemeData | null>(null);
  const [initialPrincipal, setInitialPrincipal] = useState<number>(450000);
  const [initialRate, setInitialRate] = useState<number>(7.5);
  const [isEducation, setIsEducation] = useState<boolean>(false);

  useEffect(() => {
    const storedAssessment = AppState.getAssessment();
    const storedScheme = AppState.getScheme();

    if (storedAssessment) {
      setAssessment(storedAssessment);
      if (storedAssessment.purpose === "Education") {
        setIsEducation(true);
      }
      if (storedAssessment.loanAmount) {
        setInitialPrincipal(Math.round(storedAssessment.loanAmount * 0.90));
      }
    }

    if (storedScheme) {
      setScheme(storedScheme);
      if (storedScheme.interestRate) {
        setInitialRate(storedScheme.interestRate);
      }
      if (storedScheme.govtShareAmount) {
        setInitialPrincipal(storedScheme.govtShareAmount);
      }
      if (storedScheme.schemeName?.includes("Education") || storedScheme.moratoriumAvailable) {
        setIsEducation(true);
      }
    }
  }, []);

  return (
    <AuthGuard>
      <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-navy-950 text-foreground py-10 md:py-16 transition-colors duration-200">
        <div className="container px-4 mx-auto max-w-5xl space-y-8">
        
        {/* Stepper Header */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider">
              {t("Step 3 of 4: Repayment Planning")}
            </span>
            <span className="font-mono text-slate-600 dark:text-slate-400">{t("Next:")} {t("Partner Network")}</span>
          </div>
          
          <div className="h-2 w-full bg-slate-200/80 dark:bg-muted rounded-full overflow-hidden flex shadow-inner">
            <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-teal-400 w-3/4 rounded-full" />
          </div>
        </div>

        {/* Quick Jump Navigation Bar */}
        <div className="rounded-2xl p-2.5 sm:p-3 border border-slate-200/90 dark:border-border/80 bg-white/90 dark:bg-card/70 backdrop-blur-md flex flex-wrap items-center justify-between gap-2 shadow-md shadow-slate-200/50 dark:shadow-lg relative z-20">
          <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-muted-foreground font-bold px-2">
            <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>{t("Quick Jump:")}</span>
          </div>
          
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
            {/* 1. Assessment button -> navigates to /assessment */}
            <Link
              href="/assessment"
              className="px-3 py-1.5 rounded-xl bg-slate-100/90 hover:bg-teal-50 hover:text-teal-700 dark:bg-muted/50 dark:hover:bg-teal-500/20 text-slate-700 dark:text-muted-foreground dark:hover:text-teal-300 border border-slate-200/80 dark:border-border/60 flex items-center gap-1.5 transition-all cursor-pointer group shadow-sm"
            >
              <span>{t("Assessment")}</span>
              <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            {/* 2. Matched Scheme button -> navigates to /matched-scheme */}
            <Link
              href="/matched-scheme"
              className="px-3 py-1.5 rounded-xl bg-slate-100/90 hover:bg-indigo-50 hover:text-indigo-700 dark:bg-muted/50 dark:hover:bg-indigo-500/20 text-slate-700 dark:text-muted-foreground dark:hover:text-indigo-300 border border-slate-200/80 dark:border-border/60 flex items-center gap-1.5 transition-all cursor-pointer group shadow-sm"
            >
              <span>{t("Matched Scheme")}</span>
              <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            {/* 3. EMI Calculator button -> active */}
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="px-3 py-1.5 rounded-xl bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-300 font-bold border border-purple-300/80 dark:border-purple-500/40 shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span className="h-2 w-2 rounded-full bg-purple-600 dark:bg-purple-400 animate-pulse" />
              <span>{t("EMI Calculator")}</span>
            </button>

            {/* 4. Partner Network button -> navigates to /partner-network */}
            <Link
              href="/partner-network"
              className="px-3 py-1.5 rounded-xl bg-slate-100/90 hover:bg-emerald-50 hover:text-emerald-700 dark:bg-muted/50 dark:hover:bg-emerald-500/20 text-slate-700 dark:text-muted-foreground dark:hover:text-emerald-300 border border-slate-200/80 dark:border-border/60 flex items-center gap-1.5 transition-all cursor-pointer group shadow-sm"
            >
              <span>{t("Partner Network")}</span>
              <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>

        {/* NO SCHEME WARNING BANNER (SHOWN IF NO ASSESSMENT COMPLETED) */}
        {!scheme && (
          <div className="relative overflow-hidden rounded-3xl p-6 sm:p-7 border-2 border-amber-300/90 dark:border-amber-500/40 bg-gradient-to-br from-amber-50/95 via-amber-50/60 to-orange-50/50 dark:from-amber-950/40 dark:via-navy-900/95 dark:to-navy-950/90 shadow-xl shadow-amber-500/5 dark:shadow-black/40 backdrop-blur-xl animate-fade-in">
            {/* Top glowing amber accent stripe */}
            <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 absolute top-0 left-0" />

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
              <div className="flex items-start gap-3.5">
                <div className="p-3 rounded-2xl bg-amber-100 text-amber-800 border border-amber-300/80 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40 shrink-0 shadow-sm mt-0.5">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-amber-100">
                      {t("Please complete assessment first")}
                    </h3>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-950 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-300/80 dark:border-amber-500/30">
                      {t("Action Needed")}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed max-w-2xl font-medium">
                    {t("No active scheme matching session was found. Complete your initial eligibility assessment to get tailored government loan schemes, auto-filled 90% loan amounts, and subsidized interest rates.")}
                  </p>
                </div>
              </div>

              <Link href="/assessment" className="shrink-0 self-stretch sm:self-auto">
                <Button variant="cta" size="sm" className="w-full sm:w-auto font-bold text-xs sm:text-sm px-5 py-2.5 h-auto rounded-xl gap-2 shadow-lg shadow-aurora-500/20 hover:shadow-aurora-500/35 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>{t("Back to Assessment")}</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        )}


        {/* Heading Area */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 dark:border-purple-500/30 dark:bg-purple-500/10 px-3.5 py-1 text-xs text-purple-700 dark:text-purple-300 font-semibold shadow-sm">
              <Calculator className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>{t("Interactive reducing balance EMI & moratorium calculation")}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {t("Interactive Scheme EMI Calculator")}
            </h1>
            <p className="text-sm text-slate-600 dark:text-muted-foreground leading-relaxed max-w-2xl">
              {t("Calculate exact monthly installment, total interest payable, and amortization breakdown for your matched scheme.")}
            </p>
          </div>

          {scheme && (
            <div className="p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-500/10 border border-teal-200/90 dark:border-teal-500/30 flex items-center gap-3 shrink-0 shadow-sm">
              <div className="p-2 rounded-xl bg-teal-100 dark:bg-teal-500/20 text-teal-700 dark:text-teal-400">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-teal-700 dark:text-teal-300 font-bold uppercase tracking-wider block">
                  {t("Recommended Concessional Scheme")}
                </span>
                <span className="text-xs font-bold text-slate-900 dark:text-foreground">
                  {t(scheme.schemeName)} ({scheme.interestRateText})
                </span>
              </div>
            </div>
          )}
        </div>

        {/* EmiCalculator Component */}
        <div className="pt-2">
          <EmiCalculator
            key={`${initialPrincipal}-${initialRate}-${isEducation}`}
            initialLoanAmount={initialPrincipal}
            initialInterestRate={initialRate}
            initialPurpose={isEducation ? "education" : "business"}
            initialSchemeName={scheme?.schemeName || "Term Loan Scheme"}
          />
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200/90 dark:border-border">
          <Link href="/matched-scheme">
            <Button variant="outline" size="sm" className="gap-2 border-slate-200 dark:border-navy-700 text-slate-700 dark:text-slate-200 shadow-sm">
              <ArrowLeft className="h-4 w-4" />
              <span>← {t("Matched Scheme")}</span>
            </Button>
          </Link>

          <Link href="/partner-network">
            <Button variant="gradient" size="lg" className="font-bold text-sm px-8 py-5 shadow-xl shadow-teal-500/20 gap-2 group">
              <MapPin className="h-4 w-4 text-amber-300" />
              <span>{t("Find Partners")} →</span>
            </Button>
          </Link>
        </div>

      </div>
    </div>
    </AuthGuard>
  );
}

