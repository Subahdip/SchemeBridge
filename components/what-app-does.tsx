"use client";

import React from "react";
import Link from "next/link";
import {
  Search,
  Target,
  ShieldCheck,
  CheckCircle2,
  Calculator,
  IndianRupee,
  MapPin,
  Compass,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function WhatOurAppDoes() {
  const { t } = useTranslation();

  const features = [
    {
      id: "scheme-discovery",
      title: t("Scheme Discovery"),
      icon: Search,
      secondaryIcon: Target,
      tag: t("AI Matching"),
      text: t("Find government loan schemes relevant to your profile and requirements"),
      benefit: t("Analyzes 50+ central & state schemes in seconds"),
      href: "/assessment",
    },
    {
      id: "eligibility-assessment",
      title: t("Eligibility Assessment"),
      icon: ShieldCheck,
      secondaryIcon: CheckCircle2,
      tag: t("Statutory Rules"),
      text: t("Check whether you meet important scheme requirements instantly"),
      benefit: t("Clear income ceiling & qualification verification"),
      href: "/assessment",
    },
    {
      id: "financial-planning",
      title: t("Financial Planning"),
      icon: Calculator,
      secondaryIcon: IndianRupee,
      tag: t("90:10 Ratio"),
      text: t("Calculate government contribution, self-contribution, EMI and interest"),
      benefit: t("Interactive reducing balance EMI & moratorium calculation"),
      href: "/assessment",
    },
    {
      id: "partner-locator",
      title: t("Partner Locator"),
      icon: MapPin,
      secondaryIcon: Compass,
      tag: t("Geo-Spatial"),
      text: t("Find suitable banks and channel partners near your location"),
      benefit: t("16+ verified PSBs, SCAs & RRBs with NPA filtering"),
      href: "/assessment#partner-map-section",
    },
  ];

  return (
    <section id="what-we-do" className="py-20 md:py-28 bg-gradient-to-b from-slate-100 to-slate-50 dark:from-navy-950 dark:to-navy-900 border-t border-slate-200 dark:border-navy-800 transition-colors">
      <div className="container px-4 mx-auto max-w-5xl">
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto mb-14">
          <Badge
            variant="secondary"
            className="px-3.5 py-1 text-xs font-semibold text-teal-700 dark:text-teal-300 bg-teal-500/10 border border-teal-500/25"
          >
            <Sparkles className="h-3.5 w-3.5 mr-1.5 inline-block text-teal-600 dark:text-teal-400" />
            {t("Core Platform Modules")}
          </Badge>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {t("What Our App Does")}
          </h2>
          
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
            {t("An integrated welfare credit engine designed to take you from discovery to verified bank branch in minutes.")}
          </p>
        </div>

        {/* 2x2 Grid of Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((item, index) => {
            const MainIcon = item.icon;
            return (
              <Link
                key={item.id}
                href={item.href}
                className="group block focus:outline-none"
              >
                <Card className="h-full border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-800/50 backdrop-blur-md shadow-md rounded-2xl overflow-hidden transition-all duration-300 hover:border-aurora-500/50 hover:shadow-2xl hover:shadow-aurora-500/10 hover:-translate-y-1.5 flex flex-col justify-between relative">
                  
                  {/* Subtle Hover Gradient Top Line */}
                  <div className="h-1 w-full bg-gradient-to-r from-aurora-500 via-teal-500 to-sunset-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <CardHeader className="p-6 sm:p-8 space-y-4">
                    <div className="flex items-center justify-between">
                      {/* Icon Container with Aurora Accents on Hover */}
                      <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-navy-900/80 text-slate-800 dark:text-white border border-slate-200 dark:border-navy-700 group-hover:bg-aurora-500/15 group-hover:text-aurora-600 dark:group-hover:text-aurora-300 group-hover:border-aurora-500/40 transition-all duration-300 shadow-sm">
                        <MainIcon className="h-6 w-6 transition-transform group-hover:scale-110" />
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 group-hover:text-aurora-600 dark:group-hover:text-aurora-300 group-hover:border-aurora-500/40 transition-colors"
                        >
                          {item.tag}
                        </Badge>
                        <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500 group-hover:text-aurora-600 dark:group-hover:text-aurora-400 transition-colors">
                          0{index + 1}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <CardTitle className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-aurora-600 dark:group-hover:text-aurora-300 transition-colors flex items-center justify-between">
                        <span>{item.title}</span>
                        <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 text-aurora-500 dark:text-aurora-400" />
                      </CardTitle>
                      
                      <CardDescription className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                        {item.text}
                      </CardDescription>
                    </div>
                  </CardHeader>

                  <CardContent className="px-6 sm:px-8 pb-6 pt-0 border-t border-slate-100 dark:border-navy-700/60 mt-auto">
                    <div className="pt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">
                      <span className="font-medium flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-teal-500 dark:bg-teal-400" />
                        {item.benefit}
                      </span>
                      <span className="text-teal-600 dark:text-teal-400 font-semibold group-hover:underline inline-flex items-center gap-1">
                        {t("Explore")}
                      </span>
                    </div>
                  </CardContent>

                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
