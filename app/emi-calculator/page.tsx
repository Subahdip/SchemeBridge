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
            <span className="font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
              {t("Step 3 of 4: Repayment Planning")}
            </span>
            <span className="font-mono">{t("Next:")} {t("Partner Network")}</span>
          </div>
          
          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden flex">
            <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-teal-400 w-3/4 rounded-full" />
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

            {/* 2. Matched Scheme button -> navigates to /matched-scheme */}
            <Link
              href="/matched-scheme"
              className="px-3 py-1.5 rounded-lg bg-muted/50 hover:bg-indigo-500/20 hover:text-indigo-600 dark:hover:text-indigo-300 text-muted-foreground border border-border/60 flex items-center gap-1.5 transition-all cursor-pointer group"
            >
              <span>{t("Matched Scheme")}</span>
              <ArrowRight className="w-3 h-3 text-muted-foreground group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            {/* 3. EMI Calculator button -> active */}
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-600 dark:text-purple-300 font-bold border border-purple-500/40 shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-pulse" />
              <span>{t("EMI Calculator")}</span>
            </button>

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

        {/* NO SCHEME WARNING BANNER (SHOWN IF NO ASSESSMENT COMPLETED) */}
        {!scheme && (
          <div className="rounded-2xl p-6 border-2 border-amber-500/40 bg-amber-500/10 space-y-4 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-foreground">{t("Please complete assessment first")}</h3>
                <p className="text-xs text-muted-foreground">
                  {t("No active scheme matching session was found. Complete your initial eligibility assessment to get tailored government loan schemes, auto-filled 90% loan amounts, and subsidized interest rates.")}
                </p>
              </div>
              <Link href="/assessment">
                <Button variant="gradient" size="sm" className="font-bold text-xs gap-1.5 shrink-0 shadow-md">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>{t("Back to Assessment")}</span>
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Heading Area */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3.5 py-1 text-xs text-purple-600 dark:text-purple-300">
              <Calculator className="w-3.5 h-3.5 text-teal-500" />
              <span>{t("Interactive reducing balance EMI & moratorium calculation")}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              {t("Interactive Scheme EMI Calculator")}
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
              {t("Calculate exact monthly installment, total interest payable, and amortization breakdown for your matched scheme.")}
            </p>
          </div>

          {scheme && (
            <div className="p-3 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center gap-3 shrink-0">
              <div className="p-2 rounded-xl bg-teal-500/20 text-teal-600 dark:text-teal-400">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-teal-600 dark:text-teal-300 font-bold uppercase tracking-wider block">
                  {t("Recommended Concessional Scheme")}
                </span>
                <span className="text-xs font-bold text-foreground">
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border">
          <Link href="/matched-scheme">
            <Button variant="outline" size="sm" className="gap-2">
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
