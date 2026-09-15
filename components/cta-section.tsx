"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ArrowRight,
  Play,
  Check,
  CheckCircle2,
  ShieldCheck,
  Zap,
  RotateCcw,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { isAuthenticated } from "@/lib/firebase";

export function FinalCtaSection() {
  const { t } = useTranslation();
  const router = useRouter();
  const [showDemoModal, setShowDemoModal] = useState(false);

  const handleStartAssessment = () => {
    const user = isAuthenticated();
    if (user && user.isLoggedIn) {
      router.push("/assessment");
    } else {
      router.push("/login");
    }
  };

  const handleViewDemoClick = () => {
    // Scroll to the top hero section preview or open quick modal
    const heroPreview = document.getElementById("how-it-works");
    if (heroPreview) {
      heroPreview.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <section className="py-20 md:py-28 container px-4 mx-auto max-w-5xl relative">
      
      {/* Outer Glow Blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[350px] bg-gradient-to-r from-aurora-600/20 via-purple-600/20 to-teal-500/10 blur-[120px] -z-10 rounded-full pointer-events-none" />

      {/* Prominent Gradient Card Container */}
      <div className="relative rounded-3xl overflow-hidden border-2 border-aurora-500/40 bg-gradient-to-br from-navy-900 via-navy-950 to-aurora-950/40 p-8 sm:p-14 md:p-16 text-center space-y-6 shadow-2xl shadow-aurora-500/10 backdrop-blur-xl">
        
        {/* Top Decorative Glowing Ribbon */}
        <div className="h-1.5 w-full bg-gradient-to-r from-aurora-500 via-purple-500 to-teal-400 absolute top-0 left-0" />

        {/* Floating Sparkle Pill */}
        <div className="inline-flex items-center gap-2 rounded-full border border-aurora-500/40 bg-aurora-500/15 px-4 py-1.5 text-xs text-aurora-300 shadow-sm mx-auto animate-fade-in">
          <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-pulse" />
          <span className="font-semibold">{t("Fast & Concessional Government Credit")}</span>
        </div>

        {/* Main Heading */}
        <h2 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white max-w-3xl mx-auto leading-tight">
          {t("Ready to find the right scheme?")}
        </h2>

        {/* Subtext */}
        <p className="text-base sm:text-lg md:text-xl text-slate-300 max-w-xl mx-auto leading-relaxed font-normal">
          {t("Start your assessment in less than 2 minutes")}
        </p>

        {/* Action Buttons: Primary & Secondary */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
          {/* Primary Button */}
          <div className="w-full sm:w-auto flex-1">
            <Button
              size="lg"
              variant="cta"
              onClick={handleStartAssessment}
              className="w-full text-base font-bold px-8 py-6 shadow-xl shadow-aurora-500/30 group gap-2 cursor-pointer"
            >
              <Sparkles className="h-4 w-4 text-amber-300 group-hover:rotate-12 transition-transform" />
              <span>{t("Start Your Assessment")}</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* Secondary Button: View Demo */}
          <Button
            size="lg"
            variant="secondary"
            onClick={handleViewDemoClick}
            className="w-full sm:w-auto text-base font-semibold px-6 py-6 border-white/20 bg-white/10 hover:bg-white/20 text-white backdrop-blur gap-2 shadow-sm"
          >
            <Play className="h-4 w-4 text-teal-300 fill-teal-300/30" />
            <span>{t("View Demo")}</span>
          </Button>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-6 text-xs text-slate-400 border-t border-slate-800/80">
          <span className="flex items-center gap-1.5">
            <Check className="h-4 w-4 text-emerald-400" />
            {t("100% Free & Open")}
          </span>
          <span className="flex items-center gap-1.5">
            <Check className="h-4 w-4 text-emerald-400" />
            {t("No Login Required")}
          </span>
          <span className="flex items-center gap-1.5">
            <Check className="h-4 w-4 text-emerald-400" />
            {t("Instant AI Evaluation")}
          </span>
          <span className="flex items-center gap-1.5">
            <Check className="h-4 w-4 text-emerald-400" />
            {t("Official Ministry Guidelines")}
          </span>
        </div>

      </div>

    </section>
  );
}
