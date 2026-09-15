"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  FileText,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Building2,
  Calendar,
  Percent,
  Download,
  Share2,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  Sparkles,
  MapPin,
  ChevronRight,
  Search,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AppState, ApplicationRecord } from "@/lib/app-state";

function ApplicationStatusContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const appId = searchParams?.get("id");
  const [application, setApplication] = useState<ApplicationRecord | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [manualIdInput, setManualIdInput] = useState("");
  const [showManualForm, setShowManualForm] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const apps = AppState.getApplications();
      if (appId) {
        const found = apps.find(
          (a) => a.applicationId && a.applicationId.toLowerCase() === appId.toLowerCase()
        );
        if (found) {
          setApplication(found);
          setShowManualForm(false);
        } else {
          // If ID not found, alert & redirect or show input
          alert(t("Application not found"));
          router.push("/my-applications");
          return;
        }
      } else {
        // No ID provided, show input form
        setShowManualForm(true);
      }
      setIsLoaded(true);
    }
  }, [appId, router, t]);

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualIdInput.trim()) return;
    lookupId(manualIdInput.trim());
  };

  const lookupId = (targetId: string) => {
    const apps = AppState.getApplications();
    const found = apps.find(
      (a) => a.applicationId && a.applicationId.toLowerCase() === targetId.toLowerCase()
    );
    if (found) {
      router.push(`/application-status?id=${encodeURIComponent(found.applicationId)}`);
      setApplication(found);
      setShowManualForm(false);
    } else {
      alert(`Application with ID "${targetId}" not found.`);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      Submitted: "bg-slate-600 text-slate-100 border-slate-500",
      "Under Review": "bg-amber-600/90 text-amber-100 border-amber-500",
      "Documents Verified": "bg-blue-600/90 text-blue-100 border-blue-500",
      Approved: "bg-teal-600 text-teal-100 border-teal-500",
      "Loan Approved": "bg-teal-600 text-teal-100 border-teal-500",
      Disbursed: "bg-aurora-600 text-white border-aurora-500",
      Rejected: "bg-rose-600 text-rose-100 border-rose-500",
    };
    return colors[status] || "bg-slate-600 text-slate-100 border-slate-500";
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isLoaded) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-aurora-500 border-r-transparent align-[-0.125em]" />
        <p className="mt-4 text-xs text-muted-foreground">{t("Loading application status...")}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-navy-950 text-slate-800 dark:text-slate-100 py-10 md:py-16 bg-gradient-to-b from-slate-50 via-white to-slate-100 dark:from-navy-950 dark:via-navy-900 dark:to-navy-950 transition-colors">
      <div className="container mx-auto px-4 max-w-4xl space-y-8">
        
        {/* =============================================================== */}
        {/* VIEW 1: MANUAL LOOKUP FORM (when no ID is in URL or requested) */}
        {/* =============================================================== */}
        {showManualForm || !application ? (
          <div>
            <div className="mb-6">
              <Link
                href="/my-applications"
                className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-aurora-600 dark:hover:text-aurora-400 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t("Back to My Applications")}</span>
              </Link>
            </div>

            <div className="bg-white dark:bg-navy-800/90 border border-slate-200 dark:border-navy-700 rounded-2xl p-8 sm:p-12 shadow-xl relative overflow-hidden backdrop-blur-xl">
              <div className="h-1.5 w-full bg-gradient-to-r from-aurora-500 via-purple-500 to-teal-400 absolute top-0 left-0" />
              
              <div className="max-w-xl mx-auto text-center space-y-4 mb-8">
                <div className="inline-flex p-3 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 mb-2">
                  <Search className="w-8 h-8" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {t("Track Loan Application")}
                </h1>
                <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">
                  {t("Enter your Application ID to track real-time sanction status, document verification, and disbursement progress.")}
                </p>
              </div>

              <form onSubmit={handleManualSearch} className="max-w-lg mx-auto space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <FileText className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text" 
                      placeholder="e.g. SIH2026-001" 
                      value={manualIdInput}
                      onChange={(e) => setManualIdInput(e.target.value)}
                      required
                      className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-300 dark:border-navy-600 bg-white dark:bg-navy-950 text-slate-900 dark:text-white font-mono placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-aurora-500 uppercase"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    variant="cta"
                    className="h-12 px-7 font-bold text-xs sm:text-sm shadow-lg shadow-aurora-500/20 gap-2 cursor-pointer"
                  >
                    <span>{t("Track Status")}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </form>

              {/* Quick Demo IDs list */}
              <div className="mt-8 pt-6 border-t border-slate-200 dark:border-navy-700/60 max-w-lg mx-auto text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{t("Or click one of the sample demo applications:")}</p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => lookupId("SIH2026-001")}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-navy-900 dark:hover:bg-navy-700 border border-slate-200 dark:border-navy-700 text-xs font-mono text-aurora-700 dark:text-aurora-300 transition-colors cursor-pointer"
                  >
                    SIH2026-001 ({t("Term Loan")})
                  </button>
                  <button
                    type="button"
                    onClick={() => lookupId("SIH2026-002")}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-navy-900 dark:hover:bg-navy-700 border border-slate-200 dark:border-navy-700 text-xs font-mono text-teal-700 dark:text-teal-300 transition-colors cursor-pointer"
                  >
                    SIH2026-002 ({t("Education Loan")})
                  </button>
                  <button
                    type="button"
                    onClick={() => lookupId("SIH2026-003")}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-navy-900 dark:hover:bg-navy-700 border border-slate-200 dark:border-navy-700 text-xs font-mono text-emerald-700 dark:text-emerald-300 transition-colors cursor-pointer"
                  >
                    SIH2026-003 ({t("Micro Finance")})
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* =============================================================== */
          /* VIEW 2: APPLICATION STATUS LIFECYCLE TRACKER                     */
          /* =============================================================== */
          <>
            {/* Top Back Navigation */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Link
                  href="/my-applications"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-aurora-600 dark:hover:text-aurora-400 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{t("Back to My Applications")}</span>
                </Link>
                <span className="text-slate-400 dark:text-slate-600">•</span>
                <button
                  type="button"
                  onClick={() => setShowManualForm(true)}
                  className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors cursor-pointer"
                >
                  {t("Search another ID")}
                </button>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="border-slate-300 dark:border-navy-700 bg-white dark:bg-navy-800/80 hover:bg-slate-100 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-300 text-xs gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{t("Export Slip")}</span>
              </Button>
            </div>

            {/* Application Banner */}
            <div className="bg-white dark:bg-navy-800/90 border border-slate-200 dark:border-navy-700 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden backdrop-blur-xl space-y-6">
              <div className="h-1.5 w-full bg-gradient-to-r from-aurora-500 via-purple-500 to-teal-400 absolute top-0 left-0" />
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                    {t("Application Status Tracker")}
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
                    {application.applicationId}
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    {t("Submitted on")} <strong className="text-slate-800 dark:text-slate-200">{application.submittedDate}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-4 py-1.5 rounded-full text-xs font-bold border ${getStatusColor(application.status)}`}>
                    {t(application.status)}
                  </span>
                </div>
              </div>

              {/* Quick Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-navy-950/80 border border-slate-200 dark:border-navy-700/60 text-xs">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block mb-0.5">{t("Government Scheme")}</span>
                  <strong className="text-slate-900 dark:text-white font-semibold text-sm line-clamp-1">{t(application.scheme)}</strong>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block mb-0.5">{t("Sanctioned Amount (90%)")}</span>
                  <strong className="text-emerald-600 dark:text-emerald-400 font-bold font-mono text-sm">
                    ₹{Number(application.amount).toLocaleString("en-IN")}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block mb-0.5">{t("Concessional Rate")}</span>
                  <strong className="text-slate-900 dark:text-white font-semibold text-sm">
                    {String(application.interestRate).includes("%") ? application.interestRate : `${application.interestRate}% p.a.`}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block mb-0.5">{t("Disbursement Channel")}</span>
                  <strong className="text-teal-700 dark:text-teal-300 font-semibold text-sm">{t("Public Sector Bank")}</strong>
                </div>
              </div>
            </div>

            {/* Real-Time Processing Timeline */}
            <div className="bg-white dark:bg-navy-800/90 border border-slate-200 dark:border-navy-700 rounded-2xl p-6 sm:p-8 shadow-xl backdrop-blur-xl space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  <span>{t("Application Progress Lifecycle")}</span>
                </h2>
                <Badge variant="glow" className="text-[10px] bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/30">
                  {t("Live Verified")}
                </Badge>
              </div>

              <div className="space-y-6 relative pl-2 sm:pl-4">
                {/* Vertical Connector Line */}
                <div className="absolute left-[19px] sm:left-[27px] top-4 bottom-4 w-0.5 bg-slate-200 dark:bg-navy-700" />

                {application.timeline.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-4 relative z-10">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 transition-all ${
                        step.completed
                          ? "bg-teal-500 border-teal-400 text-white dark:text-navy-950 shadow-md shadow-teal-500/30"
                          : "bg-slate-100 dark:bg-navy-900 border-slate-300 dark:border-navy-600 text-slate-400 dark:text-slate-500"
                      }`}
                    >
                      {step.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-white dark:text-navy-950 stroke-[3]" />
                      ) : (
                        <span className="text-xs font-mono font-bold">{idx + 1}</span>
                      )}
                    </div>

                    <div className="flex-1 pt-0.5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <h3 className={`text-sm sm:text-base font-bold ${step.completed ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400"}`}>
                          {t(step.step)}
                        </h3>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                          {step.date}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        {idx === 0 && t("Application submitted and received by the channel lending partner.")}
                        {idx === 1 && t("Branch officer verifies applicant caste certificate, project feasibility, and income.")}
                        {idx === 2 && t("Formal sanction letter issued under National Concessional Scheme guidelines.")}
                        {idx === 3 && t("Direct benefit transfer of 90% loan amount to beneficiary savings account.")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Assigned Lending Partner Info Card */}
            <div className="bg-white dark:bg-navy-800/90 border border-slate-200 dark:border-navy-700 rounded-2xl p-6 shadow-xl backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold uppercase tracking-wider block">
                    {t("Nodal Processing Partner")}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {t("State Bank of India (MSME & Concessional Lending Hub)")}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {t("Verified zero-collateral desk • Ambedkar Bhawan / Lead Bank Office")}
                  </p>
                </div>
              </div>

              <Link href="/partner-network">
                <Button variant="outline" size="sm" className="border-slate-300 dark:border-navy-700 hover:bg-slate-100 dark:hover:bg-navy-700 text-xs text-teal-600 dark:text-teal-400 gap-1.5 whitespace-nowrap">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{t("Locate Branch")}</span>
                </Button>
              </Link>
            </div>

            {/* Next Step Guidance Actions */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-100 to-slate-200 dark:from-navy-900 dark:to-navy-800 border border-slate-200 dark:border-navy-700 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{t("Need to submit additional documents?")}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {t("Keep your Aadhaar, Caste Certificate, and Bank Passbook ready for the branch officer.")}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link href="/my-applications">
                  <Button variant="outline" size="sm" className="border-slate-300 dark:border-navy-700 text-xs">
                    {t("All Applications")}
                  </Button>
                </Link>
                <Link href="/assessment">
                  <Button variant="cta" size="sm" className="font-bold text-xs gap-1.5">
                    <span>{t("New Assessment")}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}

import { AuthGuard } from "@/components/auth-guard";

export default function ApplicationStatusPage() {
  return (
    <AuthGuard>
      <Suspense
        fallback={
          <div className="min-h-screen bg-slate-50 dark:bg-navy-950 py-24 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-aurora-500 border-r-transparent align-[-0.125em]" />
            <p className="mt-4 text-xs text-muted-foreground">Loading...</p>
          </div>
        }
      >
        <ApplicationStatusContent />
      </Suspense>
    </AuthGuard>
  );
}
