"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ArrowRight,
  Play,
  Check,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { isAuthenticated } from "@/lib/firebase";

export function FinalCtaSection() {
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

  return (
    <section className="py-20 md:py-28 container px-4 mx-auto max-w-5xl relative">
      
      {/* Outer Glow Blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[350px] bg-gradient-to-r from-indigo-200/40 via-purple-200/30 to-teal-100/40 dark:from-aurora-600/20 dark:via-purple-600/20 dark:to-teal-500/10 blur-[120px] -z-10 rounded-full pointer-events-none" />

      {/* Prominent Gradient Card Container */}
      <div className="relative rounded-3xl overflow-hidden border-2 border-indigo-200/80 dark:border-aurora-500/40 bg-gradient-to-br from-white via-indigo-50/40 to-purple-50/50 dark:from-navy-900 dark:via-navy-950 dark:to-aurora-950/40 p-8 sm:p-14 md:p-16 text-center space-y-6 shadow-2xl shadow-indigo-500/10 dark:shadow-aurora-500/10 backdrop-blur-xl">
        
        {/* Top Decorative Glowing Ribbon */}
        <div className="h-1.5 w-full bg-gradient-to-r from-aurora-500 via-purple-500 to-teal-400 absolute top-0 left-0" />

        {/* Floating Sparkle Pill */}
        <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 dark:border-aurora-500/40 dark:bg-aurora-500/15 px-4 py-1.5 text-xs text-purple-700 dark:text-aurora-300 shadow-sm mx-auto animate-fade-in font-semibold">
          <Sparkles className="h-3.5 w-3.5 text-amber-500 dark:text-amber-300 animate-pulse" />
          <span>{t("Fast & Concessional Government Credit")}</span>
        </div>

        {/* Main Heading */}
        <h2 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-3xl mx-auto leading-tight">
          {t("Ready to find the right scheme?")}
        </h2>

        {/* Subtext */}
        <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-xl mx-auto leading-relaxed font-medium">
          {t("Start your assessment in less than 2 minutes")}
        </p>

        {/* Action Buttons: Primary & Secondary */}
        <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4 max-w-xl mx-auto">
          {/* Primary Button */}
          <div className="w-full sm:w-auto flex-1">
            <Button
              size="lg"
              variant="cta"
              onClick={handleStartAssessment}
              className="w-full h-[58px] text-base font-bold px-8 shadow-xl shadow-aurora-500/30 group gap-2 cursor-pointer rounded-2xl transition-all duration-300 hover:shadow-2xl hover:shadow-aurora-500/40 hover:-translate-y-0.5 active:translate-y-0"
            >
              <Sparkles className="h-4 w-4 text-amber-300 group-hover:rotate-12 transition-transform" />
              <span>{t("Start Your Assessment")}</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* Secondary Button: View Demo */}
          <div className="w-full sm:w-auto flex-1">
            <a
              href="https://youtu.be/DDYcMwEmopg"
              target="_blank"
              rel="noopener noreferrer"
              className="relative w-full h-[58px] overflow-hidden group flex items-center justify-center gap-3 px-7 bg-white hover:bg-teal-50/70 text-slate-800 hover:text-teal-900 border border-slate-200/90 hover:border-teal-400/80 dark:bg-navy-900/80 dark:hover:bg-navy-800/90 dark:text-white dark:border-white/15 dark:hover:border-teal-400/60 font-semibold rounded-2xl backdrop-blur-xl transition-all duration-300 shadow-lg shadow-slate-200/60 hover:shadow-xl hover:shadow-teal-500/15 dark:shadow-black/25 dark:hover:shadow-teal-500/20 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              {/* Shimmer light sweep across button on hover */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-teal-500/10 dark:via-white/10 to-transparent pointer-events-none" />

              {/* Glowing animated Play Icon Badge */}
              <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-teal-50 border border-teal-200 text-teal-600 group-hover:bg-teal-600 group-hover:text-white group-hover:border-teal-600 dark:bg-teal-500/20 dark:border-teal-400/40 dark:text-teal-300 dark:group-hover:bg-teal-400 dark:group-hover:text-navy-950 dark:group-hover:border-teal-300 group-hover:scale-110 shadow-md shadow-teal-500/20 transition-all duration-300 shrink-0">
                <Play className="w-3.5 h-3.5 ml-0.5 fill-current transition-colors duration-300" />
                <span className="absolute inset-0 rounded-full bg-teal-400/40 animate-ping opacity-0 group-hover:opacity-75 duration-700 pointer-events-none" />
              </div>

              {/* Button Text */}
              <span className="text-base tracking-wide font-semibold text-slate-800 group-hover:text-teal-900 dark:text-slate-100 dark:group-hover:text-white transition-colors whitespace-nowrap">
                {t("View Demo")}
              </span>

              {/* Subtle External Arrow Icon */}
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 dark:text-slate-400 dark:group-hover:text-teal-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300 shrink-0" />
            </a>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-6 text-xs text-slate-600 dark:text-slate-400 border-t border-slate-200/90 dark:border-slate-800/80 font-semibold">
          <span className="flex items-center gap-1.5">
            <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            {t("100% Free & Open")}
          </span>
          <span className="flex items-center gap-1.5">
            <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            {t("No Login Required")}
          </span>
          <span className="flex items-center gap-1.5">
            <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            {t("Instant AI Evaluation")}
          </span>
          <span className="flex items-center gap-1.5">
            <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            {t("Official Ministry Guidelines")}
          </span>
        </div>

      </div>

    </section>
  );
}

