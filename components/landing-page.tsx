"use client";

import React from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Calculator,
  MapPin,
  FileQuestion,
  HelpCircle,
  TrendingDown,
  Building,
  CheckCircle2,
  Check,
  ChevronRight,
  Layers,
  Search,
  PieChart,
  Coins,
  Scale,
  Award,
  Users,
  Compass,
  ArrowUpRight,
  Briefcase,
  GraduationCap,
  Percent,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HeroSection } from "@/components/hero-section";
import { WhatOurAppDoes } from "@/components/what-app-does";
import { HowItWorks } from "@/components/how-it-works";
import { WhyUseSection } from "@/components/why-use-section";
import { FinalCtaSection } from "@/components/cta-section";

export function LandingPage() {
  const { t } = useTranslation();

  return (
    <div className="w-full overflow-hidden bg-slate-50 dark:bg-navy-950 text-slate-800 dark:text-slate-100 selection:bg-aurora-500 selection:text-white transition-colors">
      
      {/* 1. HERO SECTION */}
      <HeroSection />

      {/* 2. WHAT OUR APP DOES (4 Feature Cards in 2x2 Grid) */}
      <WhatOurAppDoes />

      {/* ========================================================================= */}
      {/* 3. WHAT PROBLEM WE SOLVE (4 Pain Points) */}
      {/* ========================================================================= */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-slate-100 to-slate-50 dark:from-navy-950 dark:to-navy-900 border-y border-slate-200 dark:border-navy-800 relative">
        <div className="container px-4 mx-auto max-w-6xl">
          <div className="text-center space-y-4 max-w-2xl mx-auto mb-16">
            <Badge variant="destructive" className="px-3 py-1 text-xs font-semibold">
              {t("The Real-World Challenge")}
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {t("Finding the right government loan scheme shouldn't be complicated")}
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base">
              {t("Marginalized entrepreneurs and students face systemic hurdles navigating bureaucratic government welfare credit channels.")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Pain Point 1: Too many schemes */}
            <div className="p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-800/50 backdrop-blur-md space-y-3 relative overflow-hidden group hover:border-aurora-500/50 hover:shadow-aurora-500/10 transition-all shadow-sm">
              <div className="h-1 w-full bg-red-500/40 absolute top-0 left-0" />
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 shrink-0">
                  <Layers className="h-6 w-6" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{t("1. Too Many Fragmented Schemes")}</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {t("Over 50+ central and state schemes are scattered across disconnected departmental portals, making it nearly impossible for grassroots applicants to identify what applies to them.")}
                  </p>
                </div>
              </div>
            </div>

            {/* Pain Point 2: Complicated eligibility */}
            <div className="p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-800/50 backdrop-blur-md space-y-3 relative overflow-hidden group hover:border-aurora-500/50 hover:shadow-aurora-500/10 transition-all shadow-sm">
              <div className="h-1 w-full bg-amber-500/40 absolute top-0 left-0" />
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
                  <FileQuestion className="h-6 w-6" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{t("2. Complicated & Opaque Eligibility")}</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {t("Intricate annual family income ceilings (e.g. ₹5.00 Lakh threshold), business scale tiers, and restrictive education criteria cause frequent application dropouts and wrongful rejections.")}
                  </p>
                </div>
              </div>
            </div>

            {/* Pain Point 3: Difficult EMI calculations */}
            <div className="p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-800/50 backdrop-blur-md space-y-3 relative overflow-hidden group hover:border-aurora-500/50 hover:shadow-aurora-500/10 transition-all shadow-sm">
              <div className="h-1 w-full bg-purple-500/40 absolute top-0 left-0" />
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 shrink-0">
                  <TrendingDown className="h-6 w-6" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{t("3. Difficult EMI & Subsidy Calculations")}</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {t("Borrowers struggle to understand reducing interest amortizations, margin requirements (90% govt vs 10% self), and moratorium interest accruals without specialized financial tools.")}
                  </p>
                </div>
              </div>
            </div>

            {/* Pain Point 4: Finding correct bank */}
            <div className="p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-800/50 backdrop-blur-md space-y-3 relative overflow-hidden group hover:border-aurora-500/50 hover:shadow-aurora-500/10 transition-all shadow-sm">
              <div className="h-1 w-full bg-teal-500/40 absolute top-0 left-0" />
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 shrink-0">
                  <Building className="h-6 w-6" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{t("4. Finding the Correct Implementing Bank")}</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {t("Even after identifying a scheme, applicants get turned away because local commercial branches are unaware or not designated as official channel partners for that welfare corporation.")}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS (4-Step Flow with Numbered Circles) */}
      <HowItWorks />

      {/* 5. WHY USE GOVT. SCHEME MATCHER (5 Benefit Cards) */}
      <WhyUseSection />

      {/* 6. FINAL CTA SECTION */}
      <FinalCtaSection />

    </div>
  );
}
