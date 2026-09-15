"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, ShieldCheck, MapPin, Calculator, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { BrandIcon } from "@/components/brand-icon";

export function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="border-t border-border/60 bg-card/60 backdrop-blur-xl py-12 text-xs text-muted-foreground transition-colors">
      <div className="container px-4 mx-auto max-w-6xl space-y-8">

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">

          {/* Brand & Mission Statement */}
          <div className="space-y-3 max-w-md">
            <Link href="/" className="flex items-center gap-2.5 group">
              <BrandIcon className="h-8 w-auto group-hover:scale-105 transition-transform" />
              <span className="font-extrabold text-base text-foreground tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                SchemeBridge
              </span>
              <Badge variant="glow" className="text-[10px] font-medium py-0 px-2">
                BY DESIDEVS
              </Badge>
            </Link>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {t("Empowering marginalized entrepreneurs, artisans, and students across India through AI-driven government scheme matching, transparent EMI financial calculations, and geo-spatial bank locator.")}
            </p>
          </div>

          {/* Quick Navigation Links */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs font-medium">
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-foreground uppercase tracking-wider block">
                {t("Platform")}
              </span>
              <ul className="space-y-1.5">
                <li>
                  <Link href="/" className="hover:text-foreground transition-colors">
                    {t("Home")}
                  </Link>
                </li>
                <li>
                  <Link href="/assessment" className="hover:text-foreground transition-colors">
                    {t("Eligibility Assessment")}
                  </Link>
                </li>
                <li>
                  <Link href="/emi-calculator" className="hover:text-foreground transition-colors">
                    {t("EMI Calculator")}
                  </Link>
                </li>
                <li>
                  <Link href="/partner-network" className="hover:text-foreground transition-colors">
                    {t("Partner Network")}
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-bold text-foreground uppercase tracking-wider block">
                {t("Key Schemes")}
              </span>
              <ul className="space-y-1.5 text-muted-foreground">
                <li>
                  <Link href="/assessment" className="hover:text-foreground transition-colors">
                    {t("Micro Finance (≤ ₹1.4L)")}
                  </Link>
                </li>
                <li>
                  <Link href="/assessment" className="hover:text-foreground transition-colors">
                    {t("Term Loan (≤ ₹50L)")}
                  </Link>
                </li>
                <li>
                  <Link href="/assessment" className="hover:text-foreground transition-colors">
                    {t("Education Loan (Subsidized)")}
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-2 col-span-2 sm:col-span-1">
              <span className="text-[11px] font-bold text-foreground uppercase tracking-wider block">
                {t("Coverage")}
              </span>
              <ul className="space-y-1.5 text-muted-foreground">
                <li>{t("Delhi • Mumbai • Kolkata")}</li>
                <li>{t("Chennai • Bangalore")}</li>
                <li className="text-teal-600 dark:text-teal-400 font-semibold">{t("16+ Verified Hubs")}</li>
              </ul>
            </div>
          </div>

        </div>

        {/* Bottom Rights & Status */}
        <div className="border-t border-border/50 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
          <p className="flex items-center gap-1">
            © {new Date().getFullYear()} SchemeBridge • {t("Ministry of Social Justice & Empowerment Alignment")}
          </p>

          <div className="flex items-center gap-4 text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              {t("Real-time scheme database")}
            </span>
            <span>•</span>
            <span className="text-foreground/80 font-medium">{t("90% Government Funding")}</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
