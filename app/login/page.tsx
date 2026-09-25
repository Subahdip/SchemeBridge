"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, CheckCircle2, ArrowLeft, AlertCircle, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { BrandIcon } from "@/components/brand-icon";
import { signInWithGoogle, isAuthenticated } from "@/lib/firebase";

function GoogleLogo({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

export default function LoginPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    const user = isAuthenticated();
    if (user && user.isLoggedIn) {
      router.push("/assessment");
    }
  }, [router]);

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      router.push("/assessment");
    } catch (err: any) {
      console.error("Authentication error:", err);
      // Helpful fallback message if demo Firebase API keys are still default
      if (
        err?.code === "auth/invalid-api-key" ||
        err?.code === "auth/api-key-not-valid" ||
        err?.message?.includes("API key")
      ) {
        setError(
          "Firebase API Key needs configuration in Firebase Console. Please add your credentials to src/firebase.js."
        );
      } else if (err?.code === "auth/popup-closed-by-user") {
        setError("Sign-in cancelled. Please click again to proceed.");
      } else {
        setError(err?.message || "Google sign-in failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 bg-slate-50/80 dark:bg-navy-950 text-slate-900 dark:text-slate-100 relative overflow-hidden transition-colors duration-300">
      {/* Background glowing gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-aurora-500/15 via-teal-500/10 to-indigo-500/15 dark:from-aurora-600/20 dark:via-purple-600/15 dark:to-teal-500/15 blur-[120px] -z-10 rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[450px] h-[300px] bg-gradient-to-bl from-teal-500/15 via-aurora-500/10 to-transparent blur-[100px] -z-10 rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Back Link */}
        <div className="mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>{t("Back to Home")}</span>
          </Link>
        </div>

        {/* Login Box */}
        <div className="bg-white/90 dark:bg-navy-800/90 border border-slate-200/90 dark:border-navy-700/80 rounded-2xl p-8 sm:p-10 shadow-xl dark:shadow-2xl backdrop-blur-xl space-y-7 relative overflow-hidden transition-colors">
          {/* Top Decorative Glowing Ribbon */}
          <div className="h-1.5 w-full bg-gradient-to-r from-aurora-500 via-purple-500 to-teal-400 absolute top-0 left-0" />

          {/* Logo & Header */}
          <div className="text-center space-y-2 pt-2">
            <div className="flex justify-center mb-2">
              <BrandIcon className="h-12 w-auto hover:scale-105 transition-transform" />
            </div>
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-aurora-600 via-teal-600 to-teal-700 dark:from-aurora-400 dark:via-teal-300 dark:to-teal-400 bg-clip-text text-transparent">
              SchemeBridge
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed max-w-xs mx-auto">
              {t("Sign in to access your loan scheme assessment")}
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-500/15 border border-rose-200 dark:border-rose-500/30 text-rose-800 dark:text-rose-300 text-xs flex items-start gap-2.5 animate-fade-in">
              <AlertCircle className="h-4 w-4 text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-rose-900 dark:text-rose-200">Authentication Alert</p>
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* Google Sign In Button */}
          <div>
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full bg-white dark:bg-navy-900/90 hover:bg-slate-50 dark:hover:bg-navy-750 text-slate-800 dark:text-slate-100 font-semibold py-3.5 px-6 rounded-xl flex items-center justify-center gap-3 transition-all border border-slate-200 dark:border-navy-600/80 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-navy-500 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer group"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-aurora-600 dark:text-aurora-400" />
                  <span className="text-slate-700 dark:text-slate-300 text-sm font-medium">
                    {t("Connecting with Google...")}
                  </span>
                </>
              ) : (
                <>
                  <GoogleLogo className="w-5 h-5 shrink-0 transition-transform group-hover:scale-110" />
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    {t("Sign in with Google")}
                  </span>
                </>
              )}
            </button>
          </div>

          {/* Info Box */}
          <div className="p-4 bg-aurora-500/10 dark:bg-aurora-900/20 border border-aurora-500/20 dark:border-aurora-700/40 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-aurora-500/15 dark:bg-aurora-500/20 text-aurora-600 dark:text-aurora-300 shrink-0">
                <Shield className="h-4 w-4 text-aurora-600 dark:text-teal-400" />
              </div>
              <div className="text-left text-xs space-y-1">
                <p className="text-slate-900 dark:text-white font-semibold">{t("Secure Authentication")}</p>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {t("We use Firebase Authentication with Google OAuth. Your data is encrypted and never shared.")}
                </p>
              </div>
            </div>
          </div>

          {/* Features Checklist */}
          <div className="space-y-2.5 pt-2 border-t border-slate-200 dark:border-navy-700/70">
            <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300 text-xs font-medium">
              <CheckCircle2 className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0" />
              <span>{t("Access personalized scheme recommendations")}</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300 text-xs font-medium">
              <CheckCircle2 className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0" />
              <span>{t("Track your applications anytime")}</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300 text-xs font-medium">
              <CheckCircle2 className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0" />
              <span>{t("Save your assessment data securely")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
