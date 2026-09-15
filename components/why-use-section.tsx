"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  Star,
  CheckCircle2,
  Zap,
  ShieldCheck,
  Scale,
  Compass,
  Award,
  ArrowRight,
  Sparkles,
  Check,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { isAuthenticated } from "@/lib/firebase";

export function WhyUseSection() {
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

  const benefits = [
    {
      id: "faster-discovery",
      title: t("Faster Scheme Discovery"),
      shortTitle: t("1. Faster Discovery"),
      icon: Zap,
      accentColor: "from-indigo-500 to-blue-600",
      iconBg: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30",
      description: t("Eliminate weeks of searching through fragmented government circulars. Match with concessional credit schemes in under 60 seconds."),
      highlights: [
        t("Instant AI-driven matching"),
        t("50+ central & state programs mapped"),
        t("Real-time requirement analysis"),
      ],
    },
    {
      id: "simple-eligibility",
      title: t("Simple Eligibility Assessment"),
      shortTitle: t("2. Simple Assessment"),
      icon: ShieldCheck,
      accentColor: "from-teal-500 to-emerald-600",
      iconBg: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/30",
      description: t("Clear-cut qualification checks against family income thresholds (≤ ₹5.00 Lakhs ceiling) and specific business project categories."),
      highlights: [
        t("Transparent statutory rules"),
        t("Zero confusing bureaucratic jargon"),
        t("Instant eligible / ineligible verdict"),
      ],
    },
    {
      id: "transparent-calculations",
      title: t("Transparent Financial Calculations"),
      shortTitle: t("3. Transparent Calculations"),
      icon: Scale,
      accentColor: "from-purple-500 to-pink-600",
      iconBg: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30",
      description: t("Full mathematical clarity on the 90% government funding ratio, 10% promoter margin, reducing balance EMIs, and moratorium interest."),
      highlights: [
        t("Live Recharts principal vs interest breakdown"),
        t("Exact monthly EMI schedule (1-10 yrs)"),
        t("Education loan moratorium interest calculation"),
      ],
    },
    {
      id: "partner-discovery",
      title: t("Partner & Channel Discovery"),
      shortTitle: t("4. Partner Discovery"),
      icon: Compass,
      accentColor: "from-emerald-500 to-teal-600",
      iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
      description: t("Direct geo-spatial map locating authorized Public Sector Banks, Regional Rural Banks, and State Channelising Agencies in your city."),
      highlights: [
        t("16+ verified metro bank branches"),
        t("NPA risk health indicator filter"),
        t("Direct branch contact details"),
      ],
    },
    {
      id: "unified-workflow",
      title: t("One Unified Workflow"),
      shortTitle: t("5. Unified Workflow"),
      icon: Award,
      accentColor: "from-blue-600 via-indigo-600 to-purple-600",
      iconBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
      description: t("An end-to-end continuous journey connecting requirement assessment, financial planning, and physical channel partner outreach in one unified interface."),
      highlights: [
        t("End-to-end guidance from discovery to branch"),
        t("100% free and open public welfare tool"),
        t("No login or registration barrier"),
      ],
      featured: true,
    },
  ];

  return (
    <section id="why-use" className="py-20 md:py-28 relative overflow-hidden bg-gradient-to-b from-slate-100 via-slate-50 to-slate-100 dark:from-navy-950 dark:via-navy-900 dark:to-navy-950 border-t border-slate-200 dark:border-navy-800 transition-colors">
      
      {/* Background ambient mesh */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[400px] bg-gradient-to-tr from-aurora-500/10 via-purple-500/10 to-teal-500/10 blur-[130px] -z-10 rounded-full pointer-events-none" />

      <div className="container px-4 mx-auto max-w-6xl">
        
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto mb-16">
          <Badge
            variant="secondary"
            className="px-3.5 py-1 text-xs font-semibold text-aurora-700 dark:text-aurora-300 bg-aurora-500/10 border border-aurora-500/25"
          >
            <Star className="h-3.5 w-3.5 mr-1.5 inline-block text-amber-500 fill-amber-500" />
            {t("Key Advantages")}
          </Badge>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {t("Why Use SchemeBridge?")}
          </h2>
          
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
            {t("Built to make institutional welfare credit transparent, accessible, and actionable for marginalized entrepreneurs and students across India.")}
          </p>
        </div>

        {/* 5 Benefit Cards in Balanced Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((b) => {
            const Icon = b.icon;
            return (
              <Card
                key={b.id}
                className={`border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-800/50 backdrop-blur-md shadow-md rounded-2xl overflow-hidden transition-all duration-300 hover:border-aurora-500/50 hover:shadow-2xl hover:shadow-aurora-500/10 hover:-translate-y-1.5 flex flex-col justify-between group ${
                  b.featured ? "md:col-span-2 lg:col-span-2" : ""
                }`}
              >
                {/* Subtle Top Accent Line */}
                <div className={`h-1 w-full bg-gradient-to-r ${b.accentColor}`} />

                <CardHeader className="p-6 sm:p-7 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-xl border ${b.iconBg} shadow-sm group-hover:scale-105 transition-transform`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star className="h-3.5 w-3.5 fill-amber-500" />
                      <Star className="h-3.5 w-3.5 fill-amber-500" />
                      <Star className="h-3.5 w-3.5 fill-amber-500" />
                    </div>
                  </div>

                  <CardTitle className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white group-hover:text-aurora-600 dark:group-hover:text-aurora-300 transition-colors">
                    {b.title}
                  </CardTitle>

                  <CardDescription className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                    {b.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="px-6 sm:p-7 pt-0 border-t border-slate-100 dark:border-navy-700/60 mt-auto">
                  <div className="pt-4 space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                      {t("Key Highlights:")}
                    </span>
                    <ul className="grid grid-cols-1 gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                      {b.highlights.map((h, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Bottom CTA Banner */}
        <div className="mt-14 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900/60 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left shadow-md">
          <div className="space-y-1">
            <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center justify-center sm:justify-start gap-2">
              <Sparkles className="h-4 w-4 text-amber-500 dark:text-amber-300" />
              {t("Empowering 10,000+ Entrepreneurs & Students Nationwide")}
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              {t("Experience seamless discovery, calculation, and bank branch mapping today.")}
            </p>
          </div>

          <div className="w-full sm:w-auto shrink-0">
            <Button
              variant="cta"
              size="lg"
              onClick={handleStartAssessment}
              className="w-full sm:w-auto font-bold text-sm px-6 py-5 shadow-lg shadow-aurora-500/20 gap-2 cursor-pointer"
            >
              <Sparkles className="h-4 w-4 text-amber-300" />
              <span>{t("Get Started Now")}</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

      </div>
    </section>
  );
}
