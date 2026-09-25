"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  PlusCircle,
  Sparkles,
  Search,
  Building2,
  Calendar,
  Percent,
  Trash2,
  ChevronRight,
  ShieldCheck,
  ClipboardList,
  IndianRupee
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApplicationRecord } from "@/lib/app-state";
import { AuthGuard } from "@/components/auth-guard";
import { getIdToken } from "@/lib/firebase";

export default function MyApplicationsPage() {
  const { t } = useTranslation();
  const router = useRouter();

  // Initial applications state with standard fallback demo records
  const [applications, setApplications] = useState<ApplicationRecord[]>([
    {
      applicationId: "SIH2026-001",
      scheme: "Micro Credit Finance (MCF)",
      schemeName: "Micro Credit Finance (MCF)",
      amount: 150000,
      loanAmount: 150000,
      interestRate: 4.0, // p.a.
      interestRateText: "4.0% p.a.",
      tenureMonths: 36,
      tenureYears: 3,
      emi: 4423,
      totalInterest: 9228,
      totalPayment: 159228,
      status: "approved", // approved, pending, rejected
      submittedDate: "2026-09-15",
      appliedDate: "2026-09-15",
      channelPartner: "State Bank of India",
      purpose: "Business - Retail Trading",
      timeline: [
        { step: "Application Created", date: "2026-09-15", completed: true },
        { step: "Submitted to Partner", date: "2026-09-15", completed: true },
        { step: "Document Verification", date: "2026-09-16", completed: true },
        { step: "Partner Review", date: "2026-09-18", completed: true },
        { step: "Sanction Decision", date: "2026-09-20", completed: true },
        { step: "Disbursement", date: "Pending", completed: false }
      ]
    },
    {
      applicationId: "SIH2026-002",
      scheme: "Term Loan (NSFDC)",
      schemeName: "Term Loan (NSFDC)",
      amount: 500000,
      loanAmount: 500000,
      interestRate: 4.0,
      interestRateText: "4.0% p.a.",
      tenureMonths: 84,
      tenureYears: 7,
      emi: 6805,
      totalInterest: 71620,
      totalPayment: 571620,
      status: "pending",
      submittedDate: "2026-09-20",
      appliedDate: "2026-09-20",
      channelPartner: "Punjab National Bank",
      purpose: "Education - Postgraduate",
      timeline: [
        { step: "Application Created", date: "2026-09-20", completed: true },
        { step: "Submitted to Partner", date: "2026-09-20", completed: true },
        { step: "Document Verification", date: "2026-09-22", completed: true },
        { step: "Partner Review", date: "Under Review", completed: false },
        { step: "Sanction Decision", date: "Pending", completed: false },
        { step: "Disbursement", date: "Pending", completed: false }
      ]
    }
  ]);

  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    loadApplications();
  }, []);

  // Helper to calculate total interest percentage
  const calculateTotalInterestPercent = (loanAmount: number, totalInterest: number) => {
    if (!loanAmount || loanAmount <= 0) return "0.00";
    return ((totalInterest / loanAmount) * 100).toFixed(2);
  };

  // Helper to get normalized calculated values
  const getCalculatedValues = (app: ApplicationRecord) => {
    const loanAmount = Number(app.loanAmount || app.amount || 150000);
    const rawRate = typeof app.interestRate === "number"
      ? app.interestRate
      : parseFloat(String(app.interestRate).replace(/[^0-9.]/g, "")) || 4.0;
    const tenureMonths = Number(app.tenureMonths || 36);
    const tenureYears = app.tenureYears || Math.round(tenureMonths / 12) || 1;

    const monthlyRate = (rawRate / 12) / 100;
    let emi = app.emi;
    let totalPayment = app.totalPayment;
    let totalInterest = app.totalInterest;

    if (!emi || !totalInterest || !totalPayment) {
      if (monthlyRate > 0) {
        const factor = Math.pow(1 + monthlyRate, tenureMonths);
        emi = Math.round((loanAmount * monthlyRate * factor) / (factor - 1));
      } else {
        emi = Math.round(loanAmount / tenureMonths);
      }
      totalPayment = emi * tenureMonths;
      totalInterest = Math.max(0, totalPayment - loanAmount);
    }

    return {
      loanAmount,
      rawRate,
      tenureMonths,
      tenureYears,
      emi,
      totalPayment,
      totalInterest
    };
  };

  const loadApplications = async () => {
    setIsLoaded(false);
    setError(null);
    try {
      let loadedApps: ApplicationRecord[] = [];

      // Check session storage first
      if (typeof window !== "undefined") {
        const stored = sessionStorage.getItem("applications");
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
              loadedApps = parsed;
            }
          } catch (e) {
            console.warn("Could not parse sessionStorage applications:", e);
          }
        }
      }

      // If user has token, query backend
      const idToken = await getIdToken();
      if (idToken) {
        const res = await fetch("/api/applications", {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          if (data.applications && Array.isArray(data.applications) && data.applications.length > 0) {
            loadedApps = data.applications;
          }
        }
      }

      // If loadedApps found, update state
      if (loadedApps.length > 0) {
        setApplications(loadedApps);
      }
    } catch (err: any) {
      console.error("Failed to fetch applications:", err);
      setError(err.message || "Could not retrieve applications.");
    } finally {
      setIsLoaded(true);
    }
  };

  const trackApplication = (appId: string) => {
    router.push(`/application-status?id=${encodeURIComponent(appId)}`);
  };

  const handleDeleteApplication = async (e: React.MouseEvent, appId: string) => {
    e.stopPropagation();
    if (confirm(`${t("Are you sure you want to remove application")} ${appId}?`)) {
      try {
        const idToken = await getIdToken();
        if (idToken) {
          await fetch(`/api/applications/${encodeURIComponent(appId)}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          }).catch(() => {});
        }

        const filtered = applications.filter((app) => app.applicationId !== appId);
        setApplications(filtered);
        if (typeof window !== "undefined") {
          sessionStorage.setItem("applications", JSON.stringify(filtered));
        }
      } catch (err: any) {
        console.error("Delete failed:", err);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const s = (status || "").toLowerCase();
    if (s.includes("approved") || s.includes("disbursed")) {
      return (
        <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-green-500/15 text-green-700 dark:text-green-400 border border-green-500/30">
          <CheckCircle className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
          <span className="capitalize">{t(status)}</span>
        </div>
      );
    }
    if (s.includes("reject")) {
      return (
        <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30">
          <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
          <span className="capitalize">{t(status)}</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border border-yellow-500/30">
        <Clock className="w-3.5 h-3.5 text-yellow-600 dark:text-yellow-400" />
        <span className="capitalize">{t(status || "Pending")}</span>
      </div>
    );
  };

  const filteredApplications = applications.filter((app) => {
    const matchesFilter =
      filterStatus === "All" ||
      (app.status || "").toLowerCase().includes(filterStatus.toLowerCase());
    const matchesSearch =
      searchQuery.trim() === "" ||
      (app.applicationId || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.scheme || app.schemeName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.purpose || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <AuthGuard>
      <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-navy-950 text-foreground py-10 md:py-16 transition-colors duration-200">
        <div className="container mx-auto px-4 max-w-5xl">
          
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-aurora-500/30 bg-aurora-500/10 px-3.5 py-1 text-xs text-aurora-700 dark:text-aurora-300 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-300" />
              <span>{t("Government Concessional Credit Portal")}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-3">
              {t("My Applications")}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
              {t("Track and manage your loan applications across all NSFDC schemes")}
            </p>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm dark:shadow-md mb-6">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={t("Search by ID, Scheme, Purpose...")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-300 dark:border-navy-700 bg-white dark:bg-navy-950 text-xs text-foreground placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-aurora-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {[
                { key: "All", label: t("All") },
                { key: "approved", label: t("Approved") },
                { key: "pending", label: t("Pending") },
                { key: "Under Review", label: t("Under Review") }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFilterStatus(key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    filterStatus === key
                      ? "bg-aurora-600 text-white shadow-sm"
                      : "bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-400 hover:text-foreground hover:bg-slate-200 dark:hover:bg-navy-700"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          {!isLoaded ? (
            <div className="py-20 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-aurora-500 border-r-transparent align-[-0.125em]" />
              <p className="mt-4 text-xs text-muted-foreground">{t("Loading applications...")}</p>
            </div>
          ) : applications.length === 0 ? (
            /* Empty State */
            <div id="emptyState" className="mt-4">
              <div className="bg-white/95 dark:bg-navy-800/90 border border-slate-200 dark:border-navy-700 rounded-2xl p-10 sm:p-14 text-center shadow-lg dark:shadow-2xl backdrop-blur-xl relative overflow-hidden text-card-foreground">
                <div className="h-1.5 w-full bg-gradient-to-r from-aurora-500 via-purple-500 to-teal-400 absolute top-0 left-0" />
                
                <div className="w-16 h-16 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto mb-4">
                  <ClipboardList className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  {t("No Applications Yet")}
                </h3>
                <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto mb-8 leading-relaxed">
                  {t("Apply for a scheme to see it here")}
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link href="/assessment">
                    <Button
                      variant="cta"
                      size="lg"
                      className="bg-aurora-600 hover:bg-aurora-700 text-white px-8 py-3.5 rounded-xl font-bold text-sm shadow-xl shadow-aurora-500/30 gap-2 cursor-pointer"
                    >
                      <span>{t("Apply for New Scheme")}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link href="/matched-scheme">
                    <Button
                      variant="outline"
                      size="lg"
                      className="border-slate-300 dark:border-navy-700 text-foreground text-sm font-semibold rounded-xl"
                    >
                      {t("Matched Scheme")}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Applications List */}
              <div id="applicationsList" className="space-y-6">
                {filteredApplications.length === 0 ? (
                  <div className="p-8 text-center bg-white dark:bg-navy-900/60 border border-slate-200 dark:border-navy-800 rounded-xl text-muted-foreground text-xs">
                    {t("No applications match the selected filter.")}
                  </div>
                ) : (
                  filteredApplications.map((app) => {
                    const calculated = getCalculatedValues(app);
                    const schemeTitle = app.schemeName || app.scheme || "NSFDC Concessional Loan";
                    const formattedDate = app.submittedDate || app.appliedDate || "2026-09-15";

                    return (
                      <div
                        key={app.applicationId}
                        className="p-6 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl hover:border-slate-300 dark:hover:border-navy-700 transition-all shadow-md dark:shadow-xl"
                      >
                        {/* Header with Scheme Name and Status Badge */}
                        <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-mono font-bold text-aurora-600 dark:text-aurora-400">
                                {app.applicationId}
                              </span>
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-1">
                              {schemeTitle}
                            </h3>
                            <p className="text-muted-foreground text-sm">
                              {app.purpose || "Business / Education Scheme"}
                            </p>
                          </div>

                          {/* Status Badge */}
                          <div className="flex items-center gap-2">
                            {getStatusBadge(app.status)}
                          </div>
                        </div>

                        {/* Loan Details Grid */}
                        <div className="grid md:grid-cols-3 gap-6 mb-6">
                          {/* 1. Loan Amount */}
                          <div className="p-4 bg-slate-100/70 dark:bg-navy-800/50 rounded-lg border border-slate-200/70 dark:border-navy-700/50">
                            <div className="flex items-center gap-3 mb-3">
                              <IndianRupee className="w-5 h-5 text-aurora-600 dark:text-aurora-400" />
                              <span className="text-sm text-muted-foreground font-medium">
                                {t("Loan Amount")}
                              </span>
                            </div>
                            <p className="text-2xl font-bold text-foreground">
                              ₹{calculated.loanAmount.toLocaleString("en-IN")}
                            </p>
                          </div>

                          {/* 2. Duration */}
                          <div className="p-4 bg-slate-100/70 dark:bg-navy-800/50 rounded-lg border border-slate-200/70 dark:border-navy-700/50">
                            <div className="flex items-center gap-3 mb-3">
                              <Calendar className="w-5 h-5 text-aurora-600 dark:text-aurora-400" />
                              <span className="text-sm text-muted-foreground font-medium">
                                {t("Loan Duration")}
                              </span>
                            </div>
                            <p className="text-2xl font-bold text-foreground">
                              {calculated.tenureYears} years ({calculated.tenureMonths} months)
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {t("Total repayment period")}
                            </p>
                          </div>

                          {/* 3. Total Interest */}
                          <div className="p-4 bg-slate-100/70 dark:bg-navy-800/50 rounded-lg border border-slate-200/70 dark:border-navy-700/50">
                            <div className="flex items-center gap-3 mb-3">
                              <Percent className="w-5 h-5 text-aurora-600 dark:text-aurora-400" />
                              <span className="text-sm text-muted-foreground font-medium">
                                {t("Total Interest")}
                              </span>
                            </div>
                            <p className="text-2xl font-bold text-foreground">
                              {calculateTotalInterestPercent(calculated.loanAmount, calculated.totalInterest)}%
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              ₹{calculated.totalInterest.toLocaleString("en-IN")} over {calculated.tenureYears} years
                            </p>
                          </div>
                        </div>

                        {/* Detailed Breakdown */}
                        <div className="grid md:grid-cols-2 gap-6 mb-6">
                          <div className="space-y-3">
                            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-navy-800">
                              <span className="text-sm text-muted-foreground">{t("Monthly EMI")}</span>
                              <span className="text-foreground font-semibold">
                                ₹{calculated.emi.toLocaleString("en-IN")}
                              </span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-navy-800">
                              <span className="text-sm text-muted-foreground">{t("Interest Rate (p.a.)")}</span>
                              <span className="text-foreground font-semibold">
                                {calculated.rawRate}%
                              </span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-navy-800">
                              <span className="text-sm text-muted-foreground">{t("Total Payment")}</span>
                              <span className="text-aurora-600 dark:text-aurora-400 font-bold">
                                ₹{calculated.totalPayment.toLocaleString("en-IN")}
                              </span>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-navy-800">
                              <span className="text-sm text-muted-foreground">{t("Channel Partner")}</span>
                              <span className="text-foreground font-semibold">
                                {app.channelPartner || "State Bank of India"}
                              </span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-navy-800">
                              <span className="text-sm text-muted-foreground">{t("Applied Date")}</span>
                              <span className="text-foreground font-semibold">
                                {formattedDate}
                              </span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-navy-800">
                              <span className="text-sm text-muted-foreground">{t("Total Interest Amount")}</span>
                              <span className="text-amber-600 dark:text-yellow-400 font-semibold">
                                ₹{calculated.totalInterest.toLocaleString("en-IN")}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Mini Timeline Progress Indicator */}
                        {app.timeline && app.timeline.length > 0 && (
                          <div className="pt-2 pb-4">
                            <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1.5">
                              <span className="font-semibold text-foreground">{t("Application Progress Lifecycle")}</span>
                              <span className="text-teal-600 dark:text-teal-400 font-mono font-bold">
                                {t("Step")} {app.timeline.filter((t) => t.completed).length} / {app.timeline.length}
                              </span>
                            </div>
                            <div className="grid grid-cols-4 gap-1.5">
                              {app.timeline.map((step, idx) => (
                                <div
                                  key={idx}
                                  className={`h-1.5 rounded-full transition-all ${
                                    step.completed
                                      ? "bg-gradient-to-r from-teal-500 to-aurora-500 shadow-xs shadow-aurora-500/50"
                                      : "bg-slate-200 dark:bg-navy-950 border border-slate-300 dark:border-navy-700"
                                  }`}
                                  title={`${t(step.step)}: ${step.date}`}
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-6 border-t border-slate-100 dark:border-navy-800">
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                trackApplication(app.applicationId);
                              }}
                              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-aurora-600 to-teal-600 hover:from-aurora-700 hover:to-teal-700 text-white text-sm font-medium rounded-lg transition-all shadow-md shadow-aurora-500/20 cursor-pointer"
                            >
                              <FileText className="w-4 h-4" />
                              <span>{t("View Details")}</span>
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => handleDeleteApplication(e, app.applicationId)}
                            className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-2 rounded-lg hover:bg-rose-500/10 transition-all cursor-pointer"
                            title={t("Delete application record")}
                            aria-label={t("Delete application record")}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Apply New Button at Bottom */}
              <div className="pt-4">
                <Link href="/assessment">
                  <button
                    type="button"
                    className="w-full bg-aurora-600 hover:bg-aurora-700 text-white px-8 py-4 rounded-xl text-base sm:text-lg font-bold shadow-xl shadow-aurora-500/25 hover:shadow-aurora-500/35 transition-all flex items-center justify-center gap-2 group cursor-pointer"
                  >
                    <PlusCircle className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                    <span>+ {t("Apply for New Scheme")}</span>
                  </button>
                </Link>
              </div>

            </div>
          )}

          {/* Informational Guidance Footer */}
          <div className="mt-12 p-6 rounded-2xl bg-slate-100 dark:bg-navy-900/60 border border-slate-200 dark:border-navy-800 text-xs text-muted-foreground flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-foreground">{t("Direct Lending Security Guarantee")}</p>
                <p className="text-muted-foreground">{t("Applications are dispatched to Ministry of Social Justice & Empowerment verified partner banks.")}</p>
              </div>
            </div>
            <Link href="/partner-network">
              <Button variant="ghost" size="sm" className="text-xs text-teal-600 dark:text-teal-400 hover:text-teal-500 hover:bg-teal-500/10">
                {t("Locate Branch")} →
              </Button>
            </Link>
          </div>

        </div>
      </div>
    </AuthGuard>
  );
}
