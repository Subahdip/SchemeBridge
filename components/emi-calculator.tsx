"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Calculator,
  IndianRupee,
  Calendar,
  Percent,
  TrendingUp,
  Clock,
  PieChart as PieChartIcon,
  Info,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  Building,
  GraduationCap,
  Lock,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface EmiCalculatorProps {
  initialLoanAmount?: number;
  initialInterestRate?: number;
  initialPurpose?: "business" | "education";
  initialSchemeName?: string;
}

export function EmiCalculator({
  initialLoanAmount = 140000,
  initialInterestRate = 6.5,
  initialPurpose = "business",
  initialSchemeName = "Micro Finance Scheme",
}: EmiCalculatorProps) {
  const { t } = useTranslation();

  // State
  const [loanAmount, setLoanAmount] = useState<number>(initialLoanAmount);
  const [interestRate, setInterestRate] = useState<number>(initialInterestRate);
  const [tenureYears, setTenureYears] = useState<number>(3); // 1 to 10 years
  const [purpose, setPurpose] = useState<"business" | "education">(initialPurpose);
  const [schemeName, setSchemeName] = useState<string>(initialSchemeName);

  // Moratorium state (for Education loan)
  const [enableMoratorium, setEnableMoratorium] = useState<boolean>(
    initialPurpose === "education"
  );
  const [moratoriumMonths, setMoratoriumMonths] = useState<number>(6); // 3, 6, 9, 12 months

  // Synchronize when initial props change (e.g. from Scheme Matcher selection)
  useEffect(() => {
    if (initialLoanAmount > 0) setLoanAmount(initialLoanAmount);
    if (initialInterestRate > 0) setInterestRate(initialInterestRate);
    if (initialPurpose) {
      setPurpose(initialPurpose);
      setEnableMoratorium(initialPurpose === "education");
    }
    if (initialSchemeName) setSchemeName(initialSchemeName);
  }, [initialLoanAmount, initialInterestRate, initialPurpose, initialSchemeName]);

  // Helper to format currency numbers to Indian format
  const formatIndianCurrency = (val: number): string => {
    if (isNaN(val)) return "0";
    return Math.round(val).toLocaleString("en-IN");
  };

  // EMI and Amortization Calculations
  const calculations = useMemo(() => {
    const P = Math.max(0, loanAmount || 0);
    const annualRate = Math.max(0, interestRate || 0);
    const N = Math.max(1, tenureYears * 12); // Total tenure in months

    // Monthly interest rate: R = (annualRate / 12) / 100
    const R = annualRate > 0 ? annualRate / (12 * 100) : 0;

    // Moratorium calculations (if Education loan + enabled)
    let moratoriumAccruedInterest = 0;
    let effectivePrincipal = P;

    if (purpose === "education" && enableMoratorium && moratoriumMonths > 0) {
      // Simple interest accrued during moratorium: P * (annualRate/100) * (moratoriumMonths/12)
      moratoriumAccruedInterest = Math.round(
        P * (annualRate / 100) * (moratoriumMonths / 12)
      );
      // Standard practice: moratorium interest is capitalized or serviced separately
      effectivePrincipal = P + moratoriumAccruedInterest;
    }

    // EMI Formula: EMI = [P × R × (1+R)^N] / [(1+R)^N - 1]
    let monthlyEmi = 0;
    if (effectivePrincipal > 0) {
      if (R === 0) {
        monthlyEmi = Math.round(effectivePrincipal / N);
      } else {
        const factor = Math.pow(1 + R, N);
        monthlyEmi = Math.round((effectivePrincipal * R * factor) / (factor - 1));
      }
    }

    const totalRepayment = monthlyEmi * N;
    const totalInterestPayable = Math.max(0, totalRepayment - P);
    const postMoratoriumInterest = Math.max(0, totalRepayment - effectivePrincipal);

    // Percentage splits
    const principalPercent = totalRepayment > 0 ? Math.round((P / totalRepayment) * 100) : 100;
    const interestPercent = totalRepayment > 0 ? Math.round((totalInterestPayable / totalRepayment) * 100) : 0;

    return {
      P,
      annualRate,
      tenureMonths: N,
      monthlyEmi,
      totalInterestPayable,
      totalRepayment,
      moratoriumAccruedInterest,
      effectivePrincipal,
      postMoratoriumInterest,
      principalPercent,
      interestPercent,
    };
  }, [loanAmount, interestRate, tenureYears, purpose, enableMoratorium, moratoriumMonths]);

  // Chart Data for Recharts PieChart
  const chartData = useMemo(() => {
    if (purpose === "education" && enableMoratorium && calculations.moratoriumAccruedInterest > 0) {
      return [
        {
          name: t("Principal Loan"),
          value: calculations.P,
          color: "#10b981", // Emerald
        },
        {
          name: t("Regular Interest"),
          value: calculations.postMoratoriumInterest,
          color: "#6366f1", // Indigo
        },
        {
          name: t("Moratorium Interest"),
          value: calculations.moratoriumAccruedInterest,
          color: "#f59e0b", // Amber
        },
      ];
    }

    return [
      {
        name: t("Principal Loan"),
        value: calculations.P,
        color: "#10b981", // Emerald
      },
      {
        name: t("Total Interest"),
        value: calculations.totalInterestPayable,
        color: "#6366f1", // Indigo
      },
    ];
  }, [calculations, purpose, enableMoratorium, t]);

  // Custom tooltip for the Recharts pie chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const total = calculations.totalRepayment || 1;
      const percentage = ((data.value / total) * 100).toFixed(1);
      return (
        <div className="bg-white dark:bg-navy-900 text-slate-900 dark:text-white p-3.5 rounded-xl border border-slate-200 dark:border-navy-700 shadow-xl text-xs space-y-1">
          <p className="font-bold text-slate-800 dark:text-slate-200">{data.name}</p>
          <p className="text-sm font-extrabold text-teal-600 dark:text-teal-400 font-mono">₹ {formatIndianCurrency(data.value)}</p>
          <p className="text-slate-500 dark:text-slate-400 font-medium">{percentage}% {t("of total repayment")}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border border-slate-200/90 dark:border-navy-700 bg-white dark:bg-navy-800/80 backdrop-blur-xl shadow-xl shadow-slate-200/60 dark:shadow-2xl overflow-hidden text-card-foreground mt-4 transition-all duration-300 rounded-3xl">
      {/* Top Accent Gradient Bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500" />

      <CardHeader className="p-6 sm:p-8 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/70 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-transparent shadow-sm">
                <Calculator className="h-5 w-5" />
              </div>
              <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-700 dark:text-emerald-400">
                {t("Financial Planning")}
              </span>
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {t("Interactive Scheme EMI Calculator")}
            </CardTitle>
            <CardDescription className="text-sm text-slate-600 dark:text-slate-300">
              {t("Calculate exact monthly installment, total interest payable, and amortization breakdown for your matched scheme.")}
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <Badge variant="secondary" className="text-xs px-3 py-1 bg-slate-100 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-slate-200 font-semibold shadow-sm">
              {t(schemeName)}
            </Badge>
            <Badge variant="outline" className="text-xs px-3 py-1 bg-teal-50 dark:bg-teal-500/10 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-500/30 font-bold shadow-sm">
              {t("Interest Rate")}: {interestRate}% p.a.
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 sm:p-8 pt-2 space-y-8">
        {/* Main Grid: Left Controls (Inputs & Tenure) vs Right Results (EMI & Pie Chart) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* LEFT COLUMN: Controls & Sliders (6 cols on lg) */}
          <div className="lg:col-span-6 space-y-6">

            {/* Scheme Type / Purpose Segmented Tabs */}
            <div className="flex items-center gap-2 p-1.5 rounded-2xl border border-slate-200/90 dark:border-navy-700 bg-slate-100/80 dark:bg-navy-900/80 shadow-inner">
              <button
                type="button"
                onClick={() => {
                  setPurpose("business");
                  setEnableMoratorium(false);
                }}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  purpose === "business"
                    ? "bg-white dark:bg-navy-800 text-teal-800 dark:text-teal-300 shadow-md border border-slate-200/90 dark:border-navy-600"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Building className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                <span>{t("Business / MSME Loan")}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setPurpose("education");
                  setEnableMoratorium(true);
                }}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  purpose === "education"
                    ? "bg-white dark:bg-navy-800 text-amber-800 dark:text-amber-300 shadow-md border border-amber-200 dark:border-navy-600"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <GraduationCap className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span>{t("Education (Moratorium)")}</span>
              </button>
            </div>

            {/* Input 1: Loan Amount (Fixed from Assessment) */}
            <div className="space-y-2 p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-navy-700 bg-slate-50/80 dark:bg-navy-900/60 shadow-sm">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="calc-loan-amount"
                  className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5"
                >
                  <IndianRupee className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                  <span>{t("Loan Amount (Principal)")}</span>
                </label>
                <span className="text-xs font-extrabold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-500/15 border border-teal-200 dark:border-teal-500/30 px-3 py-1 rounded-full font-mono shadow-sm flex items-center gap-1.5">
                  <Lock className="h-3 w-3 text-teal-600 dark:text-teal-400" />
                  ₹ {formatIndianCurrency(loanAmount)}
                </span>
              </div>

              <div className="relative pt-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 dark:text-muted-foreground">
                  <IndianRupee className="h-4 w-4 text-slate-500 dark:text-muted-foreground" />
                </div>
                <Input
                  id="calc-loan-amount"
                  type="number"
                  readOnly
                  value={loanAmount}
                  className="pl-9 pr-10 text-base py-5 font-bold font-mono bg-slate-100/90 dark:bg-navy-950/80 border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white shadow-sm cursor-not-allowed select-none"
                />
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <Lock className="h-4 w-4" />
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium pt-0.5">
                <Lock className="h-3 w-3 text-teal-600 dark:text-teal-400 shrink-0" />
                <span>{t("Fixed from user assessment (90% scheme government share)")}</span>
              </div>
            </div>

            {/* Input 2: Interest Rate (% p.a.) (Fixed from Matched Scheme) */}
            <div className="space-y-2 p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-navy-700 bg-slate-50/80 dark:bg-navy-900/60 shadow-sm">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="calc-interest-rate"
                  className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5"
                >
                  <Percent className="h-4 w-4 text-aurora-600 dark:text-aurora-400" />
                  <span>{t("Annual Interest Rate (% p.a.)")}</span>
                </label>
                <span className="text-xs font-extrabold text-aurora-800 dark:text-aurora-300 bg-aurora-50 dark:bg-aurora-500/15 border border-aurora-200 dark:border-aurora-500/30 px-3 py-1 rounded-full font-mono shadow-sm flex items-center gap-1.5">
                  <Lock className="h-3 w-3 text-aurora-600 dark:text-aurora-400" />
                  {interestRate}% p.a.
                </span>
              </div>

              <div className="relative pt-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 dark:text-muted-foreground">
                  <Percent className="h-4 w-4 text-slate-500 dark:text-muted-foreground" />
                </div>
                <Input
                  id="calc-interest-rate"
                  type="number"
                  readOnly
                  value={interestRate}
                  className="pl-9 pr-10 text-base py-5 font-bold font-mono bg-slate-100/90 dark:bg-navy-950/80 border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white shadow-sm cursor-not-allowed select-none"
                />
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <Lock className="h-4 w-4" />
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium pt-0.5">
                <Lock className="h-3 w-3 text-aurora-600 dark:text-aurora-400 shrink-0" />
                <span>{t("Fixed from matched concessional scheme rate")}</span>
              </div>
            </div>

            {/* Input 3: Repayment Tenure Dropdown (1 - 10 Years) */}
            <div className="space-y-2.5 p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-navy-700 bg-slate-50/80 dark:bg-navy-900/60 shadow-sm">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="calc-tenure-select"
                  className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5"
                >
                  <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  <span>{t("Repayment Tenure (1 to 10 Years)")}</span>
                </label>
                <span className="text-xs font-extrabold text-purple-800 dark:text-purple-300 bg-purple-50 dark:bg-purple-500/15 border border-purple-200 dark:border-purple-500/30 px-3 py-1 rounded-full font-mono shadow-sm">
                  {tenureYears} {tenureYears === 1 ? t("Year") : t("Years")} ({tenureYears * 12} EMIs)
                </span>
              </div>

              <div className="relative pt-1">
                <select
                  id="calc-tenure-select"
                  value={tenureYears}
                  onChange={(e) => setTenureYears(Number(e.target.value))}
                  className="w-full h-11 pl-3.5 pr-10 rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-800 text-sm font-bold text-slate-900 dark:text-white appearance-none focus:border-aurora-500 focus:ring-1 focus:ring-aurora-500 focus:outline-none cursor-pointer transition-all shadow-sm"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((yr) => (
                    <option key={yr} value={yr}>
                      {yr} {yr === 1 ? t("Year") : t("Years")} ({yr * 12} {t("Months")})
                    </option>
                  ))}
                </select>
                <Clock className="absolute right-3.5 top-4 h-4 w-4 text-slate-400 dark:text-muted-foreground pointer-events-none" />
              </div>

              {/* Quick Tenure Pills */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
                <span className="text-[11px] text-slate-600 dark:text-slate-400 font-semibold mr-1">{t("Quick Select:")}</span>
                {[1, 3, 5, 7, 10].map((yr) => (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => setTenureYears(yr)}
                    className={`text-xs px-3 py-1.5 rounded-lg border font-bold transition-all cursor-pointer ${tenureYears === yr
                      ? "bg-aurora-600 text-white border-aurora-500 shadow-md"
                      : "bg-white dark:bg-navy-800 hover:bg-slate-100 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-navy-700 shadow-sm"
                      }`}
                  >
                    {yr}Y
                  </button>
                ))}
              </div>
            </div>

            {/* Input 4: Education Loan Moratorium Section (Conditional / Toggle) */}
            {purpose === "education" && (
              <div className="p-5 rounded-2xl border-2 border-amber-300/80 dark:border-amber-500/40 bg-gradient-to-br from-amber-50/90 via-amber-50/50 to-orange-50/60 dark:from-amber-950/40 dark:via-navy-900/80 dark:to-navy-900/60 space-y-4 shadow-md transition-all duration-300 animate-fade-in relative overflow-hidden">
                {/* Top decorative amber strip */}
                <div className="h-1 w-full bg-gradient-to-r from-amber-400 via-amber-500 to-orange-400 absolute top-0 left-0" />

                {/* Header with Title & Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-500/30 shadow-sm">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>{t("Moratorium Grace Period")}</span>
                        <Badge className="text-[10px] px-1.5 py-0 bg-amber-200 text-amber-950 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40 font-extrabold">
                          {t("0 EMI Period")}
                        </Badge>
                      </h4>
                      <p className="text-[11px] text-amber-900/80 dark:text-amber-200/70 font-medium">
                        {t("Repayment holiday during studies & job hunting")}
                      </p>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableMoratorium}
                      onChange={(e) => setEnableMoratorium(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 dark:bg-navy-950 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500 shadow-inner"></div>
                  </label>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium bg-white/80 dark:bg-navy-950/40 p-3 rounded-xl border border-amber-200/70 dark:border-navy-800 shadow-sm">
                  {t("During education moratorium, zero EMIs are paid. Simple interest is calculated on principal and capitalized at the start of repayment.")}
                </p>

                {enableMoratorium && (
                  <div className="pt-1 space-y-3">
                    {/* Duration Selector Header & Pills */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                          <span>{t("Moratorium Duration:")}</span>
                        </span>
                        <span className="font-extrabold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-500/20 border border-amber-300/80 dark:border-amber-500/30 px-2.5 py-0.5 rounded-full text-xs font-mono shadow-sm">
                          {moratoriumMonths} {t("Months")}
                        </span>
                      </div>

                      {/* Quick select duration pills */}
                      <div className="grid grid-cols-4 gap-1.5">
                        {[
                          { m: 3, label: "3 Mo" },
                          { m: 6, label: "6 Mo" },
                          { m: 9, label: "9 Mo" },
                          { m: 12, label: "12 Mo" },
                        ].map((item) => (
                          <button
                            key={item.m}
                            type="button"
                            onClick={() => setMoratoriumMonths(item.m)}
                            className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                              moratoriumMonths === item.m
                                ? "bg-amber-500 text-white border-amber-600 shadow-sm"
                                : "bg-white dark:bg-navy-800 text-slate-700 dark:text-slate-300 border-amber-200/80 dark:border-navy-700 hover:bg-amber-100/60 dark:hover:bg-navy-700 shadow-sm"
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>

                      <select
                        value={moratoriumMonths}
                        onChange={(e) => setMoratoriumMonths(Number(e.target.value))}
                        className="w-full h-10 px-3 rounded-xl border border-amber-200/90 dark:border-navy-700 bg-white dark:bg-navy-800 text-xs font-bold text-slate-900 dark:text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none cursor-pointer shadow-sm"
                      >
                        <option value="3">3 {t("Months")} (Short Skill Training / Certification)</option>
                        <option value="6">6 {t("Months")} (Semester / Practical Internship)</option>
                        <option value="9">9 {t("Months")} (Academic Term)</option>
                        <option value="12">12 {t("Months")} (Full Academic Year + Post-Job Grace Period)</option>
                      </select>
                    </div>

                    {/* Accrued Moratorium Interest Box */}
                    <div className="p-3.5 rounded-xl bg-white dark:bg-navy-950/70 border border-amber-300/80 dark:border-amber-500/30 shadow-sm flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                          {t("Accrued Moratorium Interest")}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                          ({moratoriumMonths} {t("months")} @ {interestRate}% {t("p.a.")})
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-extrabold text-amber-700 dark:text-amber-300 font-mono block">
                          + ₹ {formatIndianCurrency(calculations.moratoriumAccruedInterest)}
                        </span>
                        <span className="text-[10px] text-amber-800 dark:text-amber-400 font-bold">
                          {t("Capitalized to loan balance")}
                        </span>
                      </div>
                    </div>

                    {/* Effective Principal Notice */}
                    <div className="p-3 rounded-xl bg-amber-100/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-500/20 text-xs text-amber-950 dark:text-amber-200 flex items-center justify-between">
                      <span className="font-bold">{t("Effective Principal after Moratorium:")}</span>
                      <span className="font-extrabold font-mono text-sm text-amber-900 dark:text-amber-200">
                        ₹ {formatIndianCurrency(calculations.effectivePrincipal)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Results Cards & Recharts Pie Chart (6 cols on lg) */}
          <div className="lg:col-span-6 space-y-6">

            {/* Primary Result Card: Monthly EMI Hero Banner */}
            <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-indigo-700 text-white shadow-xl shadow-teal-600/20 space-y-3 relative overflow-hidden">
              <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-100">
                  {t("Monthly Installment (EMI)")}
                </span>
                <span className="text-xs px-3 py-0.5 rounded-full bg-white/20 backdrop-blur font-bold border border-white/20">
                  {tenureYears * 12} {t("Installments")}
                </span>
              </div>

              <div className="flex items-baseline gap-1.5 pt-1">
                <span className="text-4xl sm:text-5xl font-black tracking-tight font-mono">
                  ₹ {formatIndianCurrency(calculations.monthlyEmi)}
                </span>
                <span className="text-sm font-semibold text-emerald-100">/ {t("month")}</span>
              </div>

              <p className="text-xs text-emerald-100/90 pt-1 font-medium">
                {purpose === "education" && enableMoratorium ? (
                  <span>Includes {moratoriumMonths}-month moratorium interest capitalization</span>
                ) : (
                  <span>Standard reducing balance amortized monthly installment</span>
                )}
              </p>
            </div>

            {/* Financial Breakdown Summary Cards (3 metrics) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {/* Metric 1: Principal Loan */}
              <div className="p-3.5 rounded-2xl border border-emerald-200/80 dark:border-navy-700 bg-emerald-50/60 dark:bg-navy-900/60 shadow-sm space-y-1">
                <span className="text-[11px] font-bold text-emerald-900 dark:text-muted-foreground block">
                  {t("Principal Loan")}
                </span>
                <span className="text-base font-extrabold text-slate-900 dark:text-white font-mono block">
                  ₹ {formatIndianCurrency(calculations.P)}
                </span>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">
                  {calculations.principalPercent}% {t("of total")}
                </span>
              </div>

              {/* Metric 2: Total Interest */}
              <div className="p-3.5 rounded-2xl border border-indigo-200/80 dark:border-navy-700 bg-indigo-50/60 dark:bg-navy-900/60 shadow-sm space-y-1">
                <span className="text-[11px] font-bold text-indigo-900 dark:text-muted-foreground block">
                  {t("Total Interest")}
                </span>
                <span className="text-base font-extrabold text-indigo-700 dark:text-indigo-400 font-mono block">
                  ₹ {formatIndianCurrency(calculations.totalInterestPayable)}
                </span>
                <span className="text-[10px] text-indigo-700 dark:text-indigo-400 font-bold">
                  {calculations.interestPercent}% {t("of total")}
                </span>
              </div>

              {/* Metric 3: Total Payable */}
              <div className="p-3.5 rounded-2xl border border-slate-200/90 dark:border-navy-700 bg-slate-50 dark:bg-navy-900/60 shadow-sm space-y-1 col-span-2 sm:col-span-1">
                <span className="text-[11px] font-bold text-slate-800 dark:text-muted-foreground block">
                  {t("Total Repayment")}
                </span>
                <span className="text-base font-extrabold text-slate-900 dark:text-white font-mono block">
                  ₹ {formatIndianCurrency(calculations.totalRepayment)}
                </span>
                <span className="text-[10px] text-slate-600 dark:text-slate-400 font-semibold">
                  {t("Principal + Interest")}
                </span>
              </div>
            </div>

            {/* Recharts Pie Chart: Principal vs Interest Breakdown */}
            <div className="p-5 sm:p-6 rounded-3xl border border-slate-200/90 dark:border-navy-700 bg-white dark:bg-navy-900/60 backdrop-blur shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-navy-800 pb-3">
                <div className="flex items-center gap-2">
                  <PieChartIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    {t("Principal vs Interest Breakdown")}
                  </h4>
                </div>
                <span className="text-xs font-bold font-mono text-slate-600 dark:text-slate-400">
                  {t("Total")}: ₹{formatIndianCurrency(calculations.totalRepayment)}
                </span>
              </div>

              {/* Chart Container */}
              <div className="h-56 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                      formatter={(value, entry: any) => (
                        <span className="text-xs text-slate-800 dark:text-slate-200 font-semibold mr-2">
                          {value} (₹{formatIndianCurrency(entry.payload.value)})
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Quick Summary Note */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-950/60 border border-slate-200/70 dark:border-navy-800 text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2 font-medium">
                <Info className="h-4 w-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                <span>
                  {t("For every ₹100 repaid, approximately ₹{{principal}} pays the principal and ₹{{interest}} covers interest.", {
                    principal: calculations.principalPercent,
                    interest: calculations.interestPercent,
                    defaultValue: `For every ₹100 repaid, approximately ₹${calculations.principalPercent} pays the principal and ₹${calculations.interestPercent} covers interest.`
                  })}
                </span>
              </div>
            </div>

          </div>
        </div>
      </CardContent>

      <CardFooter className="bg-slate-50 dark:bg-navy-900/80 border-t border-slate-200/90 dark:border-navy-800 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600 dark:text-slate-400 font-medium">
        <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          {t("Standard Reducing Balance Method (National Portal Standard)")}
        </span>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              {t("Monthly EMI")}: <strong className="text-emerald-600 dark:text-emerald-400 font-mono text-sm">₹{formatIndianCurrency(calculations.monthlyEmi)}</strong>
            </span>
          </div>
        </CardFooter>
      </Card>
    );
  }

