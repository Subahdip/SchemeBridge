"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Calculator,
  MapPin,
  CheckCircle2,
  TrendingUp,
  Percent,
  Wallet,
  Building,
  Check,
  ChevronRight,
  Layers,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { isAuthenticated } from "@/lib/firebase";

export function HeroSection() {
  const { t } = useTranslation();
  const router = useRouter();

  const handleStartAssessment = () => {
    const user = isAuthenticated();
    if (user && user.isLoggedIn) {
      router.push("/assessment");
    } else {
      router.push("/login");
    }
  };

  const handleScrollToHowItWorks = () => {
    const el = document.getElementById("how-it-works");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32 border-b border-slate-200 dark:border-navy-800 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-navy-950 dark:via-navy-900 dark:to-aurora-950/20 transition-colors">
      {/* Background radial & ambient glow effects */}
      <div className="absolute top-1/3 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-gradient-to-tr from-aurora-600/15 via-purple-600/10 to-teal-500/10 blur-[120px] -z-10 rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[350px] bg-gradient-to-bl from-teal-500/10 via-aurora-500/10 to-transparent blur-[100px] -z-10 rounded-full pointer-events-none" />

      <div className="container px-4 mx-auto max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* LEFT COLUMN: Content & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* Trust Pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-aurora-500/30 bg-aurora-500/10 backdrop-blur-md px-4 py-1.5 text-xs sm:text-sm text-aurora-700 dark:text-aurora-300 shadow-sm animate-fade-in">
              <Sparkles className="h-4 w-4 text-aurora-500 dark:text-aurora-400 animate-pulse" />
              <span className="font-semibold">{t("SchemeBridge AI")}</span>
              <span className="h-1 w-1 rounded-full bg-aurora-500" />
              <span className="text-slate-600 dark:text-slate-300 font-normal">{t("Empowering Marginalized Communities")}</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.14]">
              {t("AI-Driven Scheme Matching for Marginalized Entrepreneurs")}
            </h1>

            {/* Subtext */}
            <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              {t("Discover suitable government loan schemes based on your eligibility and requirements")}
            </p>

            {/* Primary & Secondary CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Button
                size="lg"
                variant="cta"
                onClick={handleStartAssessment}
                className="w-full sm:w-auto text-base font-bold px-8 py-6 shadow-xl shadow-aurora-500/25 group cursor-pointer"
              >
                <Sparkles className="h-4 w-4 text-amber-300 mr-2 group-hover:rotate-12 transition-transform" />
                {t("Start Assessment")}
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>

              <Button
                size="lg"
                variant="secondary"
                onClick={handleScrollToHowItWorks}
                className="w-full sm:w-auto text-base font-semibold px-6 py-6 border-slate-300 dark:border-navy-700 bg-white dark:bg-navy-800/60 hover:bg-slate-100 dark:hover:bg-navy-700 text-slate-800 dark:text-white shadow-sm backdrop-blur"
              >
                {t("Learn More")}
              </Button>
            </div>

            {/* Quick Proof Checklist */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4 text-xs text-slate-600 dark:text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                {t("Instant Eligibility Check")}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                {t("90% Government Funding")}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                {t("16+ Bank Branches Mapped")}
              </span>
            </div>

          </div>

          {/* RIGHT COLUMN: Abstract Graphic & Glassmorphic UI Card Illustration */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            
            {/* Background Glow Behind Illustration */}
            <div className="absolute inset-0 bg-gradient-to-tr from-aurora-500/20 via-purple-500/20 to-teal-400/20 blur-2xl rounded-3xl -z-10 transform scale-95" />

            {/* Main Interactive SaaS Mockup Card */}
            <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-navy-700 bg-white/90 dark:bg-navy-800/50 backdrop-blur-xl shadow-xl p-5 sm:p-6 space-y-4 relative overflow-hidden transition-all duration-500 hover:border-aurora-500/50 hover:shadow-aurora-500/10">
              
              {/* Top Accent Strip */}
              <div className="h-1 w-full bg-gradient-to-r from-aurora-500 via-purple-500 to-teal-400 absolute top-0 left-0" />

              {/* Header Status */}
              <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-navy-700">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-teal-500 dark:bg-teal-400 animate-pulse" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {t("Live Assessment Preview")}
                  </span>
                </div>
                <Badge variant="glow" className="text-[10px] px-2 py-0.5 border-aurora-500/30 text-aurora-700 dark:text-aurora-300 bg-aurora-500/10">
                  {t("AI Match Verified")}
                </Badge>
              </div>

              {/* Matched Scheme Card Preview */}
              <div className="p-4 rounded-xl border border-teal-500/30 bg-teal-50/60 dark:bg-teal-950/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-teal-800 dark:text-teal-300 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                    {t("Micro Finance Scheme")}
                  </span>
                  <Badge className="bg-teal-600 text-white text-[10px] py-0 px-1.5 font-bold">
                    6.5% p.a.
                  </Badge>
                </div>

                {/* Segmented Funding Bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-semibold text-teal-800 dark:text-teal-200">
                    <span>{t("Government Loan (90%)")} (₹1.26L)</span>
                    <span>{t("Promoter Margin (10%)")} (₹14K)</span>
                  </div>
                  <div className="w-full h-3 bg-slate-200 dark:bg-navy-950 rounded-full overflow-hidden flex p-0.5 border border-teal-500/30">
                    <div className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-l-full" style={{ width: "90%" }} />
                    <div className="h-full bg-aurora-500 rounded-r-full" style={{ width: "10%" }} />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1 text-teal-800/90 dark:text-teal-200/90 border-t border-teal-500/20">
                  <span>{t("Monthly EMI")}: <strong>₹2,465/mo</strong></span>
                  <span className="text-[10px]">{t("Maximum Repayment Tenure")}: 5 Years</span>
                </div>
              </div>

              {/* Floating Sub-Cards (Channel Partner & Criteria) */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-900/60 space-y-1">
                  <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400">
                    <Building className="h-3 w-3 text-aurora-600 dark:text-aurora-400" />
                    <span>{t("Find Nearest Partner")}</span>
                  </div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    SBI BKC MSME Hub
                  </p>
                  <span className="text-[9px] text-teal-600 dark:text-teal-400 font-semibold flex items-center gap-0.5">
                    <Check className="h-2.5 w-2.5" /> {t("Active")}
                  </span>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-900/60 space-y-1">
                  <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400">
                    <ShieldCheck className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                    <span>{t("Statutory Rules")}</span>
                  </div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    Income ≤ ₹5.00L
                  </p>
                  <span className="text-[9px] text-aurora-700 dark:text-aurora-300 font-semibold flex items-center gap-0.5">
                    <Check className="h-2.5 w-2.5" /> 100% {t("Check Eligibility")}
                  </span>
                </div>
              </div>

              {/* Floating Action Hint */}
              <button
                type="button"
                onClick={handleStartAssessment}
                className="w-full block pt-1 text-left cursor-pointer"
              >
                <div className="p-2.5 rounded-xl bg-aurora-500/10 hover:bg-aurora-500/20 border border-aurora-500/20 flex items-center justify-between text-xs text-aurora-700 dark:text-aurora-300 font-medium transition-colors">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500 dark:text-amber-300" />
                    {t("Start your assessment in less than 2 minutes")}
                  </span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </div>
              </button>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
