"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  Users,
  Sparkles,
  PieChart,
  MapPin,
  ArrowRight,
  CheckCircle2,
  Sliders,
  Cpu,
  Calculator,
  Building,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { isAuthenticated } from "@/lib/firebase";

export function HowItWorks() {
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

  const steps = [
    {
      stepNumber: "01",
      title: t("Tell us about yourself"),
      icon: Users,
      badgeText: t("Step 1"),
      description: t("Enter income, loan requirement and purpose"),
      details: t("Takes under 30 seconds with quick-select options"),
      color: "from-indigo-500 to-blue-500",
      iconBg: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30",
    },
    {
      stepNumber: "02",
      title: t("Get matched"),
      icon: Sparkles,
      badgeText: t("Step 2"),
      description: t("The system analyzes your information and identifies suitable schemes"),
      details: t("Instant evaluation against ₹5L ceiling and business scales"),
      color: "from-teal-500 to-emerald-500",
      iconBg: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/30",
    },
    {
      stepNumber: "03",
      title: t("Understand your funding"),
      icon: PieChart,
      badgeText: t("Step 3"),
      description: t("See government contribution, self-contribution, interest and EMI"),
      details: t("90% Govt Loan, 10% Margin, and moratorium support"),
      color: "from-purple-500 to-pink-500",
      iconBg: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30",
    },
    {
      stepNumber: "04",
      title: t("Find a partner"),
      icon: MapPin,
      badgeText: t("Step 4"),
      description: t("Locate an appropriate bank or channel partner"),
      details: t("Interactive map with 16+ verified metro bank branches"),
      color: "from-emerald-500 to-teal-500",
      iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-navy-900 dark:to-navy-950 border-t border-slate-200 dark:border-navy-800 relative transition-colors">
      
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-gradient-to-r from-aurora-500/10 via-purple-500/10 to-teal-500/10 blur-[100px] -z-10 rounded-full pointer-events-none" />

      <div className="container px-4 mx-auto max-w-6xl relative">
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto mb-16 md:mb-20">
          <Badge
            variant="secondary"
            className="px-3.5 py-1 text-xs font-semibold text-aurora-700 dark:text-aurora-300 bg-aurora-500/10 border border-aurora-500/25"
          >
            <Sparkles className="h-3.5 w-3.5 mr-1.5 inline-block text-aurora-600 dark:text-aurora-400" />
            {t("Simple & Guided Flow")}
          </Badge>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {t("How It Works")}
          </h2>
          
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
            {t("Four effortless steps connecting you from eligibility assessment to verified bank partner discovery.")}
          </p>
        </div>

        {/* 4-Step Flow with Numbered Circles and Connecting Lines */}
        <div className="relative">
          
          {/* Horizontal Connecting Line for Desktop (md and above) */}
          <div className="hidden md:block absolute top-[52px] left-[10%] right-[10%] h-[3px] bg-gradient-to-r from-aurora-500/40 via-teal-500/40 to-emerald-500/40 -z-0 rounded-full" />

          {/* Vertical Connecting Line for Mobile (below md) */}
          <div className="md:hidden absolute top-[40px] bottom-[40px] left-[35px] w-[3px] bg-gradient-to-b from-aurora-500/40 via-teal-500/40 to-emerald-500/40 -z-0 rounded-full" />

          {/* Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-6 relative z-10">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.stepNumber}
                  className="flex md:flex-col items-start md:items-center gap-5 md:gap-4 group text-left md:text-center"
                >
                  {/* Numbered Circle & Step Indicator */}
                  <div className="relative flex-shrink-0">
                    {/* Numbered Outer Glow Ring */}
                    <div className={`h-16 w-16 md:h-20 md:w-20 rounded-full bg-white dark:bg-navy-900 border-2 border-slate-200 dark:border-navy-700 group-hover:border-aurora-500 shadow-md flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:shadow-aurora-500/20`}>
                      <div className={`h-11 w-11 md:h-13 md:w-13 rounded-full bg-gradient-to-tr ${step.color} text-white font-extrabold text-sm md:text-base flex items-center justify-center shadow-md`}>
                        {step.stepNumber}
                      </div>
                    </div>

                    {/* Step Micro Tag */}
                    <span className="hidden md:inline-block absolute -bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-600 dark:text-slate-400 shadow-sm group-hover:border-aurora-500/40 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                      {step.badgeText}
                    </span>
                  </div>

                  {/* Step Content Card */}
                  <div className="space-y-2 flex-1 pt-1 md:pt-3">
                    <div className="flex items-center gap-2 md:justify-center">
                      <div className={`p-1.5 rounded-lg border ${step.iconBg} inline-flex md:hidden`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-aurora-600 dark:group-hover:text-aurora-300 transition-colors">
                        {step.title}
                      </h3>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {step.description}
                    </p>

                    <div className="pt-1 flex items-center gap-1.5 md:justify-center text-[11px] text-slate-500 dark:text-slate-400">
                      <CheckCircle2 className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                      <span>{step.details}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Guided Workflow Footer Action */}
        <div className="mt-16 text-center">
          <Button
            size="lg"
            variant="cta"
            onClick={handleStartAssessment}
            className="font-bold text-sm sm:text-base px-8 py-6 shadow-xl shadow-aurora-500/20 group gap-2 cursor-pointer"
          >
            <Sparkles className="h-4 w-4 text-amber-300" />
            <span>{t("Start Your Guided Assessment")}</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

      </div>
    </section>
  );
}
