"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  PlusCircle,
  Sparkles,
  Search,
  Building2,
  Calendar,
  Percent,
  Trash2,
  ChevronRight,
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AppState, ApplicationRecord } from "@/lib/app-state";
import { AuthGuard } from "@/components/auth-guard";

export default function MyApplicationsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = () => {
    const apps = AppState.getApplications();
    setApplications(apps);
    setIsLoaded(true);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      "Submitted": "bg-slate-100 dark:bg-slate-600 text-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-500",
      "Under Review": "bg-amber-100 dark:bg-amber-600/90 text-amber-800 dark:text-amber-100 border-amber-300 dark:border-amber-500",
      "Documents Verified": "bg-blue-100 dark:bg-blue-600/90 text-blue-800 dark:text-blue-100 border-blue-300 dark:border-blue-500",
      "Approved": "bg-teal-100 dark:bg-teal-600 text-teal-800 dark:text-teal-100 border-teal-300 dark:border-teal-500",
      "Loan Approved": "bg-teal-100 dark:bg-teal-600 text-teal-800 dark:text-teal-100 border-teal-300 dark:border-teal-500",
      "Disbursed": "bg-aurora-600 text-white border-aurora-500",
      "Rejected": "bg-rose-100 dark:bg-rose-600 text-rose-800 dark:text-rose-100 border-rose-300 dark:border-rose-500",
    };
    return colors[status] || "bg-slate-100 dark:bg-slate-600 text-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-500";
  };

  const trackApplication = (appId: string) => {
    router.push(`/application-status?id=${encodeURIComponent(appId)}`);
  };

  const handleDeleteApplication = (e: React.MouseEvent, appId: string) => {
    e.stopPropagation();
    if (confirm(`${t("Are you sure you want to remove application")} ${appId}?`)) {
      const updated = applications.filter((app) => app.applicationId !== appId);
      sessionStorage.setItem("applications", JSON.stringify(updated));
      setApplications(updated);
    }
  };

  const filteredApplications = applications.filter((app) => {
    const matchesFilter = filterStatus === "All" || app.status.toLowerCase().includes(filterStatus.toLowerCase());
    const matchesSearch =
      searchQuery.trim() === "" ||
      app.applicationId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.scheme.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.purpose.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <AuthGuard>
      <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-navy-950 text-foreground py-10 md:py-16 transition-colors duration-200">
        <div className="container mx-auto px-4 max-w-5xl">
        
        {/* Header Section */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-aurora-500/30 bg-aurora-500/10 px-3.5 py-1 text-xs text-aurora-700 dark:text-aurora-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-300" />
              <span>{t("Government Concessional Credit Portal")}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              {t("My Applications")}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl">
              {t("View and track all your loan applications")}
            </p>
          </div>

          {applications.length > 0 && (
            <Link href="/assessment">
              <Button
                variant="cta"
                size="sm"
                className="font-bold text-xs shadow-lg shadow-aurora-500/20 gap-2 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{t("Apply for New Scheme")}</span>
              </Button>
            </Link>
          )}
        </div>

        {/* Content Area */}
        {!isLoaded ? (
          <div className="py-20 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-aurora-500 border-r-transparent align-[-0.125em]" />
            <p className="mt-4 text-xs text-muted-foreground">{t("Loading applications...")}</p>
          </div>
        ) : applications.length === 0 ? (
          /* Empty State (if no applications) */
          <div id="emptyState" className="mt-4">
            <div className="bg-white/95 dark:bg-navy-800/90 border border-slate-200 dark:border-navy-700 rounded-2xl p-10 sm:p-14 text-center shadow-lg dark:shadow-2xl backdrop-blur-xl relative overflow-hidden text-card-foreground">
              <div className="h-1.5 w-full bg-gradient-to-r from-aurora-500 via-purple-500 to-teal-400 absolute top-0 left-0" />
              
              <div className="text-6xl mb-4 animate-bounce">📋</div>
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
            
            {/* Search & Filter Bar */}
            <div className="bg-white/90 dark:bg-navy-900/90 border border-slate-200 dark:border-navy-800 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm dark:shadow-md">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={t("Search by ID or Scheme...")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-300 dark:border-navy-700 bg-white dark:bg-navy-950 text-xs text-foreground placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-aurora-500"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                {[
                  { key: "All", label: t("All") },
                  { key: "Submitted", label: t("Submitted") },
                  { key: "Approved", label: t("Approved") },
                  { key: "Disbursed", label: t("Disbursed") }
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

            {/* Applications List */}
            <div id="applicationsList" className="space-y-4">
              {filteredApplications.length === 0 ? (
                <div className="p-8 text-center bg-white dark:bg-navy-900/60 border border-slate-200 dark:border-navy-800 rounded-xl text-muted-foreground text-xs">
                  {t("No applications match the selected filter.")}
                </div>
              ) : (
                filteredApplications.map((app) => {
                  const interestRateFormatted = typeof app.interestRate === "number"
                    ? `${app.interestRate}% p.a.`
                    : String(app.interestRate).includes("%")
                    ? app.interestRate
                    : `${app.interestRate}% p.a.`;

                  return (
                    <div
                      key={app.applicationId}
                      onClick={() => trackApplication(app.applicationId)}
                      className="bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 rounded-xl p-6 hover:border-aurora-500 hover:shadow-xl dark:hover:shadow-2xl hover:shadow-aurora-500/10 transition-all cursor-pointer group relative overflow-hidden text-card-foreground"
                    >
                      <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6">
                        <div className="flex-1 space-y-4">
                          
                          {/* Top Row: App ID & Status Badge */}
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <span className="text-xl font-mono font-bold text-aurora-600 dark:text-aurora-400 group-hover:text-aurora-500 transition-colors">
                                {app.applicationId}
                              </span>
                              <span
                                className={`px-3.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                                  app.status
                                )}`}
                              >
                                {t(app.status)}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => handleDeleteApplication(e, app.applicationId)}
                              className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                              title={t("Delete application record")}
                              aria-label={t("Delete application record")}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Details Grid */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-1 border-t border-slate-100 dark:border-navy-700/60">
                            <div>
                              <p className="text-muted-foreground text-xs mb-1 flex items-center gap-1">
                                <Building2 className="w-3 h-3 text-slate-400" />
                                <span>{t("Scheme")}</span>
                              </p>
                              <p className="text-foreground font-medium text-xs sm:text-sm line-clamp-1">
                                {t(app.scheme)}
                              </p>
                            </div>

                            <div>
                              <p className="text-muted-foreground text-xs mb-1">
                                {t("Amount")} ({t("90% Government Funding")})
                              </p>
                              <p className="text-foreground font-bold text-xs sm:text-sm font-mono text-emerald-600 dark:text-emerald-400">
                                ₹{Number(app.amount).toLocaleString("en-IN")}
                              </p>
                            </div>

                            <div>
                              <p className="text-muted-foreground text-xs mb-1 flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-slate-400" />
                                <span>{t("Applied Date")}</span>
                              </p>
                              <p className="text-foreground text-xs sm:text-sm">
                                {app.submittedDate}
                              </p>
                            </div>

                            <div>
                              <p className="text-muted-foreground text-xs mb-1 flex items-center gap-1">
                                <Percent className="w-3 h-3 text-slate-400" />
                                <span>{t("Interest Rate")}</span>
                              </p>
                              <p className="text-foreground text-xs sm:text-sm font-semibold">
                                {interestRateFormatted}
                              </p>
                            </div>
                          </div>

                          {/* Mini Timeline Progress Indicator */}
                          {app.timeline && app.timeline.length > 0 && (
                            <div className="pt-2">
                              <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1.5">
                                <span className="font-semibold text-foreground">{t("Application Progress Lifecycle")}</span>
                                <span className="text-teal-600 dark:text-teal-400 font-mono font-bold">
                                  {t("Step")} {app.timeline.filter(t => t.completed).length} / {app.timeline.length}
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

                        </div>

                        {/* Right Column: Track Status CTA */}
                        <div className="flex-shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-navy-700/60 flex items-center justify-end">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              trackApplication(app.applicationId);
                            }}
                            className="w-full sm:w-auto bg-teal-600 hover:bg-teal-500 text-white px-6 py-3 rounded-lg font-semibold text-xs sm:text-sm shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 transition-all flex items-center justify-center gap-2 group/btn cursor-pointer"
                          >
                            <span>{t("Track Status")} →</span>
                            <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                          </button>
                        </div>
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
