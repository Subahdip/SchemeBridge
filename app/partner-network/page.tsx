"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  MapPin,
  Building2,
  Filter,
  ShieldCheck,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";
import { AppState, MatchedSchemeData } from "@/lib/app-state";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { AuthGuard } from "@/components/auth-guard";

const DynamicPartnerMap = dynamic(
  () => import("@/components/partner-map").then((mod) => mod.PartnerMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[480px] w-full rounded-2xl bg-card/60 border border-border/80 flex flex-col items-center justify-center space-y-3">
        <div className="h-8 w-8 rounded-full border-t-2 border-b-2 border-teal-500 animate-spin" />
        <span className="text-xs text-muted-foreground">Loading GIS Partner Map &amp; Branches...</span>
      </div>
    ),
  }
);

export default function PartnerNetworkPage() {
  const { t } = useTranslation();
  const [matchedScheme, setMatchedScheme] = useState<MatchedSchemeData | null>(null);
  const [selectedSchemeFilter, setSelectedSchemeFilter] = useState<string>("All Schemes");

  useEffect(() => {
    const scheme = AppState.getScheme();
    if (scheme && scheme.schemeName) {
      setMatchedScheme(scheme);
      if (scheme.schemeName.includes("Micro")) setSelectedSchemeFilter("Micro Finance");
      else if (scheme.schemeName.includes("Term")) setSelectedSchemeFilter("Term Loan");
      else if (scheme.schemeName.includes("Education")) setSelectedSchemeFilter("Education Loan");
    }
  }, []);

  const handleApplyNow = () => {
    // Get current scheme and assessment data
    const scheme = AppState.getScheme();
    const assessment = AppState.getAssessment();

    if (!scheme || !assessment) {
      alert("Please complete assessment first");
      window.location.href = "/assessment";
      return;
    }

    // Generate random application ID
    const appId = `SIH2026-${Math.floor(Math.random() * 1000)}`;
    const schemeName = (scheme as any).name || scheme.schemeName || "Welfare Scheme";

    // Create application object
    const application = {
      applicationId: appId,
      scheme: schemeName,
      amount: Math.round(assessment.loanAmount * 0.9), // 90% govt coverage
      interestRate: scheme.interestRateText || `${scheme.interestRate}% p.a.`,
      purpose: assessment.purpose,
      status: "Submitted" as const,
      submittedDate: new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      timeline: [
        { step: "Submitted", date: new Date().toLocaleDateString("en-IN"), completed: true },
        { step: "Documents Verified", date: "Pending", completed: false },
        { step: "Loan Approved", date: "Pending", completed: false },
        { step: "Disbursed", date: "Pending", completed: false },
      ],
    };

    // Save to sessionStorage
    const applications = JSON.parse(sessionStorage.getItem("applications") || "[]");
    applications.push(application);
    sessionStorage.setItem("applications", JSON.stringify(applications));

    // Show success message
    const message =
      `✅ Application Submitted Successfully!\n\n` +
      `Application ID: ${appId}\n` +
      `Scheme: ${schemeName}\n` +
      `Amount: ₹${application.amount.toLocaleString("en-IN")}\n` +
      `Date: ${application.submittedDate}\n\n` +
      `You can track your application anytime in "My Applications" page.`;

    alert(message);

    // Ask user what to do next
    const choice = confirm("Click OK to view all your applications, or Cancel to stay here.");
    if (choice) {
      window.location.href = "/my-applications";
    }
  };

  return (
    <AuthGuard>
      <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-navy-950 text-foreground py-10 md:py-16 transition-colors duration-200">
        <div className="container px-4 mx-auto max-w-6xl space-y-8">
        
        {/* Stepper Header */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
              {t("Step 4 of 4: Channel Partner Network")}
            </span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
              {t("Apply Now")}
            </span>
          </div>
          
          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden flex">
            <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-teal-400 w-full rounded-full" />
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

            {/* 3. EMI Calculator button -> navigates to /emi-calculator */}
            <Link
              href="/emi-calculator"
              className="px-3 py-1.5 rounded-lg bg-muted/50 hover:bg-purple-500/20 hover:text-purple-600 dark:hover:text-purple-300 text-muted-foreground border border-border/60 flex items-center gap-1.5 transition-all cursor-pointer group"
            >
              <span>{t("EMI Calculator")}</span>
              <ArrowRight className="w-3 h-3 text-muted-foreground group-hover:text-purple-500 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            {/* 4. Partner Network button -> active */}
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 font-bold border border-emerald-500/40 shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{t("Partner Network")}</span>
            </button>
          </div>
        </div>

        {/* Heading Area */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3.5 py-1 text-xs text-teal-600 dark:text-teal-300">
              <MapPin className="w-3.5 h-3.5 text-teal-500" />
              <span>{t("Physical Branch Discovery")}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              {t("Locate Authorized Channel Partners")}
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
              {t("Find nearest verified Public Sector Banks, State Channelising Agencies (SCAs), and Regional Rural Banks (RRBs).")}
            </p>
          </div>

          {matchedScheme && (
            <div className="p-3 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center gap-3 shrink-0">
              <div className="p-2 rounded-xl bg-teal-500/20 text-teal-600 dark:text-teal-400">
                <Filter className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-teal-600 dark:text-teal-300 font-bold uppercase tracking-wider block">
                  {t("Recommended Concessional Scheme")}
                </span>
                <span className="text-xs font-bold text-foreground">
                  {t(matchedScheme.schemeName)} ({matchedScheme.interestRateText})
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Helpful Guide Info Box */}
        <div className="mb-6 p-4 bg-aurora-50 dark:bg-aurora-900/20 border border-aurora-200 dark:border-aurora-700/50 rounded-xl text-card-foreground">
          <div className="flex items-start gap-3">
            <span className="text-2xl">ℹ️</span>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-1">{t("How to Apply")}</h4>
              <ol className="text-slate-600 dark:text-muted-foreground text-sm space-y-1">
                <li>{t("1. Review your matched scheme (previous page)")}</li>
                <li>{t("2. Calculate EMI to understand repayments")}</li>
                <li>{t("3. Find your nearest channel partner on this map")}</li>
                <li>{t("4. Click \"Apply to This Scheme\" button below")}</li>
                <li>{t("5. Track your application in \"My Applications\" page")}</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Interactive Partner Map & Directory Component */}
        <DynamicPartnerMap selectedScheme={selectedSchemeFilter} />

        {/* "Apply to This Scheme" Section Card */}
        <div className="mt-8 p-6 sm:p-8 bg-white/95 dark:bg-navy-800/90 border border-slate-200 dark:border-navy-700 rounded-2xl shadow-xl dark:shadow-2xl relative overflow-hidden backdrop-blur-xl text-card-foreground">
          <div className="h-1.5 w-full bg-gradient-to-r from-aurora-500 via-purple-500 to-teal-400 absolute top-0 left-0" />
          
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-aurora-500/15 border border-aurora-500/30 text-aurora-700 dark:text-aurora-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-300" />
              <span>{t("Government Concessional Credit Portal")}</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              {t("Ready to Apply?")}
            </h3>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-2xl">
              {t("You've reviewed your matched scheme, calculated EMI, and found your nearest partner. Now you can submit your application.")}
            </p>
          </div>

          <div className="pt-6">
            <Button
              onClick={handleApplyNow}
              variant="cta"
              size="lg"
              className="bg-gradient-to-r from-aurora-600 to-teal-600 hover:from-aurora-700 hover:to-teal-700 text-white px-8 py-6 rounded-xl text-base sm:text-lg font-bold shadow-xl shadow-aurora-500/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>✅ {t("Apply to This Scheme")}</span>
            </Button>
          </div>

          <p className="text-muted-foreground text-xs sm:text-sm mt-4">
            {t("Your application will be saved and you can track it anytime in \"My Applications\"")}
          </p>
        </div>

      </div>
    </div>
    </AuthGuard>
  );
}
