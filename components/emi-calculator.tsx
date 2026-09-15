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
        <div className="bg-popover text-popover-foreground p-3 rounded-lg border shadow-lg text-xs space-y-1">
          <p className="font-semibold">{data.name}</p>
          <p className="text-sm font-bold text-primary">₹ {formatIndianCurrency(data.value)}</p>
          <p className="text-muted-foreground">{percentage}% {t("of total repayment")}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border border-slate-200 dark:border-navy-700 bg-white/95 dark:bg-navy-800/80 backdrop-blur-xl shadow-lg dark:shadow-2xl overflow-hidden text-card-foreground mt-12 transition-all duration-300">
      {/* Top Accent Gradient Bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500" />

      <CardHeader className="p-6 sm:p-8 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Calculator className="h-5 w-5" />
              </div>
              <span className="text-xs uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400">
                {t("Financial Planning")}
              </span>
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {t("Interactive Scheme EMI Calculator")}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              {t("Calculate exact monthly installment, total interest payable, and amortization breakdown for your matched scheme.")}
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <Badge variant="secondary" className="text-xs px-3 py-1">
              {t(schemeName)}
            </Badge>
            <Badge variant="outline" className="text-xs px-3 py-1">
              {t("Interest Rate")}: {interestRate}% p.a.
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 sm:p-8 pt-2 space-y-8">
        {/* Main Grid: Left Controls (Inputs & Tenure) vs Right Results (EMI & Pie Chart) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* LEFT COLUMN: Controls & Sliders (5 cols on lg) */}
          <div className="lg:col-span-6 space-y-6">

            {/* Input 1: Loan Amount (Auto-filled & Editable) */}
            <div className="space-y-2 p-4 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-900/60">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="calc-loan-amount"
                  className="text-sm font-semibold text-foreground flex items-center gap-1.5"
                >
                  <IndianRupee className="h-4 w-4 text-teal-500" />
                  <span>{t("Loan Amount (Principal)")}</span>
                </label>
                <span className="text-xs font-bold text-teal-700 dark:text-teal-300 bg-teal-500/15 border border-teal-500/30 px-2.5 py-0.5 rounded-full font-mono">
                  ₹ {formatIndianCurrency(loanAmount)}
                </span>
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                  <IndianRupee className="h-4 w-4 text-muted-foreground" />
                </div>
                <Input
                  id="calc-loan-amount"
                  type="number"
                  min="10000"
                  max="10000000"
                  step="5000"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Math.max(0, Number(e.target.value)))}
                  className="pl-9 text-base py-5 font-semibold font-mono bg-white dark:bg-navy-950 border-slate-300 dark:border-navy-700"
                />
              </div>

              {/* Slider for Loan Amount */}
              <input
                type="range"
                min="10000"
                max={purpose === "business" ? "5000000" : "2000000"}
                step="10000"
                value={loanAmount}
                onChange={(e) => setLoanAmount(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-navy-950 rounded-lg appearance-none cursor-pointer accent-teal-500"
              />

              <div className="flex justify-between text-[11px] text-muted-foreground">
                <span>{t("Min")}: ₹10,000</span>
                <span>{t("Max")}: ₹{purpose === "business" ? "50.00L" : "20.00L"}</span>
              </div>
            </div>

            {/* Input 2: Interest Rate (% p.a.) */}
            <div className="space-y-2 p-4 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-900/60">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="calc-interest-rate"
                  className="text-sm font-semibold text-foreground flex items-center gap-1.5"
                >
                  <Percent className="h-4 w-4 text-aurora-500" />
                  <span>{t("Annual Interest Rate (% p.a.)")}</span>
                </label>
                <span className="text-xs font-bold text-aurora-700 dark:text-aurora-300 bg-aurora-500/15 border border-aurora-500/30 px-2.5 py-0.5 rounded-full font-mono">
                  {interestRate}% p.a.
                </span>
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                  <Percent className="h-4 w-4 text-muted-foreground" />
                </div>
                <Input
                  id="calc-interest-rate"
                  type="number"
                  min="1"
                  max="25"
                  step="0.1"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Math.max(0, Number(e.target.value)))}
                  className="pl-9 text-base py-5 font-semibold font-mono bg-white dark:bg-navy-950 border-slate-300 dark:border-navy-700"
                />
              </div>

              {/* Slider for Rate */}
              <input
                type="range"
                min="4"
                max="15"
                step="0.25"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-navy-950 rounded-lg appearance-none cursor-pointer accent-aurora-500"
              />

              <div className="flex justify-between text-[11px] text-muted-foreground">
                <span>{t("Subsidized: 4.0%")}</span>
                <span>{t("Standard: 7.5%")}</span>
                <span>{t("Commercial: 12.0%")}</span>
              </div>
            </div>

            {/* Input 3: Repayment Tenure Dropdown (1 - 10 Years) */}
            <div className="space-y-2.5 p-4 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-900/60">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="calc-tenure-select"
                  className="text-sm font-semibold text-foreground flex items-center gap-1.5"
                >
                  <Calendar className="h-4 w-4 text-purple-500" />
                  <span>{t("Repayment Tenure (1 to 10 Years)")}</span>
                </label>
                <span className="text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-500/15 border border-purple-500/30 px-2.5 py-0.5 rounded-full font-mono">
                  {tenureYears} {tenureYears === 1 ? t("Year") : t("Years")} ({tenureYears * 12} EMIs)
                </span>
              </div>

              <div className="relative">
                <select
                  id="calc-tenure-select"
                  value={tenureYears}
                  onChange={(e) => setTenureYears(Number(e.target.value))}
                  className="w-full h-11 pl-3.5 pr-10 rounded-lg border border-slate-300 dark:border-navy-700 bg-white dark:bg-navy-800 text-sm font-semibold text-foreground appearance-none focus:border-aurora-500 focus:ring-1 focus:ring-aurora-500 focus:outline-none cursor-pointer transition-all"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((yr) => (
                    <option key={yr} value={yr}>
                      {yr} {yr === 1 ? t("Year") : t("Years")} ({yr * 12} {t("Months")})
                    </option>
                  ))}
                </select>
                <Clock className="absolute right-3.5 top-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>

              {/* Quick Tenure Pills */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] text-muted-foreground mr-1">{t("Quick Select:")}</span>
                {[1, 3, 5, 7, 10].map((yr) => (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => setTenureYears(yr)}
                    className={`text-xs px-2.5 py-1 rounded-md border font-medium transition-all ${tenureYears === yr
                      ? "bg-aurora-600 text-white border-aurora-500 shadow-sm"
                      : "bg-white dark:bg-navy-800 hover:bg-slate-100 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-navy-700"
                      }`}
                  >
                    {yr}Y
                  </button>
                ))}
              </div>
            </div>

            {/* Input 4: Education Loan Moratorium Section (Conditional / Toggle) */}
            {purpose === "education" && (
              <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-50 dark:bg-amber-950/20 space-y-3 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-400" />
                    <span className="text-sm font-semibold text-foreground">
                      {t("Moratorium Grace Period")}
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableMoratorium}
                      onChange={(e) => setEnableMoratorium(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-navy-950 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>

                <p className="text-xs text-muted-foreground">
                  {t("During education moratorium, no EMI is paid. Simple interest is accrued over the grace period.")}
                </p>

                {enableMoratorium && (
                  <div className="pt-2 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-foreground">{t("Moratorium Duration:")}</span>
                      <span className="font-bold text-amber-300">
                        {moratoriumMonths} {t("Months")}
                      </span>
                    </div>

                    <select
                      value={moratoriumMonths}
                      onChange={(e) => setMoratoriumMonths(Number(e.target.value))}
                      className="w-full h-10 px-3 rounded-lg border border-navy-700 bg-navy-800 text-xs font-semibold text-foreground focus:border-aurora-500 focus:ring-1 focus:ring-aurora-500 focus:outline-none cursor-pointer"
                    >
                      <option value="3">3 {t("Months")} (Short Training)</option>
                      <option value="6">6 {t("Months")} (Semester / Internship)</option>
                      <option value="9">9 {t("Months")}</option>
                      <option value="12">12 {t("Months")} (Full Academic Year + Post-Job Grace)</option>
                    </select>

                    <div className="p-2.5 rounded-lg bg-amber-900/40 text-xs text-amber-200 flex items-center justify-between border border-amber-500/20">
                      <span>{t("Accrued Moratorium Interest:")}</span>
                      <span className="font-bold text-sm text-amber-300">
                        + ₹ {formatIndianCurrency(calculations.moratoriumAccruedInterest)}
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
            <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-indigo-700 text-white shadow-xl shadow-emerald-600/20 space-y-3 relative overflow-hidden">
              <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold tracking-wider text-emerald-100">
                  {t("Monthly Installment (EMI)")}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur font-medium">
                  {tenureYears * 12} {t("Installments")}
                </span>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-4xl sm:text-5xl font-black tracking-tight">
                  ₹ {formatIndianCurrency(calculations.monthlyEmi)}
                </span>
                <span className="text-sm font-medium text-emerald-100">/ {t("month")}</span>
              </div>

              <p className="text-xs text-emerald-100/90 pt-1">
                Formula: EMI = [P × R × (1+R)ⁿ] / [(1+R)ⁿ - 1]
              </p>
            </div>

            {/* Financial Breakdown Summary Cards (3 metrics) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {/* Metric 1: Principal Loan */}
              <div className="p-3.5 rounded-xl border bg-muted/30 space-y-1">
                <span className="text-[11px] font-medium text-muted-foreground block">
                  {t("Principal Loan")}
                </span>
                <span className="text-base font-bold text-foreground block">
                  ₹ {formatIndianCurrency(calculations.P)}
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold">
                  {calculations.principalPercent}% {t("of total")}
                </span>
              </div>

              {/* Metric 2: Total Interest */}
              <div className="p-3.5 rounded-xl border bg-muted/30 space-y-1">
                <span className="text-[11px] font-medium text-muted-foreground block">
                  {t("Total Interest")}
                </span>
                <span className="text-base font-bold text-indigo-600 dark:text-indigo-400 block">
                  ₹ {formatIndianCurrency(calculations.totalInterestPayable)}
                </span>
                <span className="text-[10px] text-indigo-600 font-semibold">
                  {calculations.interestPercent}% {t("of total")}
                </span>
              </div>

              {/* Metric 3: Total Payable */}
              <div className="p-3.5 rounded-xl border bg-muted/30 space-y-1 col-span-2 sm:col-span-1">
                <span className="text-[11px] font-medium text-muted-foreground block">
                  {t("Total Repayment")}
                </span>
                <span className="text-base font-bold text-foreground block">
                  ₹ {formatIndianCurrency(calculations.totalRepayment)}
                </span>
                <span className="text-[10px] text-muted-foreground font-medium">
                  {t("Principal + Interest")}
                </span>
              </div>
            </div>

            {/* Recharts Pie Chart: Principal vs Interest Breakdown */}
            <div className="p-5 rounded-2xl border bg-card/60 backdrop-blur shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-2">
                  <PieChartIcon className="h-4 w-4 text-emerald-600" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                    {t("Principal vs Interest Breakdown")}
                  </h4>
                </div>
                <span className="text-xs text-muted-foreground">
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
                        <span className="text-xs text-foreground font-medium mr-2">
                          {value} (₹{formatIndianCurrency(entry.payload.value)})
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Quick Summary Note */}
              <div className="p-3 rounded-lg bg-muted/40 text-xs text-muted-foreground flex items-center gap-2">
                <Info className="h-4 w-4 text-indigo-500 flex-shrink-0" />
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

      <CardFooter className="bg-muted/30 border-t p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          {t("Standard Reducing Balance Method (National Portal Standard)")}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-foreground">
            {t("Monthly EMI")}: <strong className="text-emerald-600">₹{formatIndianCurrency(calculations.monthlyEmi)}</strong>
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}
