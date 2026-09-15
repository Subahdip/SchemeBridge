"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, Shield, CheckCircle2, ArrowLeft, AlertCircle, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { BrandIcon } from "@/components/brand-icon";
import { signInWithGoogle, isAuthenticated } from "@/lib/firebase";
import Image from "next/image";

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
      if (err?.code === "auth/invalid-api-key" || err?.code === "auth/api-key-not-valid" || err?.message?.includes("API key")) {
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
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 bg-slate-950 dark:bg-navy-950 text-slate-100 relative overflow-hidden">
      {/* Background glowing gradients */}
      <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-aurora-600/20 via-purple-600/15 to-teal-500/15 blur-[120px] -z-10 rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[450px] h-[300px] bg-gradient-to-bl from-teal-500/15 via-aurora-500/10 to-transparent blur-[100px] -z-10 rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Back Link */}
        <div className="mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>{t("Back to Home")}</span>
          </Link>
        </div>

        {/* Login Box */}
        <div className="bg-slate-900/90 dark:bg-navy-800/90 border border-slate-800 dark:border-navy-700/80 rounded-2xl p-8 sm:p-10 shadow-2xl backdrop-blur-xl space-y-7 relative overflow-hidden">
          {/* Top Decorative Glowing Ribbon */}
          <div className="h-1.5 w-full bg-gradient-to-r from-aurora-500 via-purple-500 to-teal-400 absolute top-0 left-0" />

          {/* Logo & Header */}
          <div className="text-center space-y-2 pt-2">
            <div className="flex justify-center mb-2">
              <BrandIcon className="h-12 w-auto" />
            </div>
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-aurora-400 via-teal-300 to-teal-400 bg-clip-text text-transparent">
              SchemeBridge
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs mx-auto">
              {t("Sign in to access your loan scheme assessment")}
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-fade-in">
              <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-rose-200">Authentication Alert</p>
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* Google Sign In Button */}
          <div>
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full bg-white hover:bg-slate-100 text-slate-900 font-semibold py-3.5 px-6 rounded-xl flex items-center justify-center gap-3 transition-all border border-slate-300 shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer group"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-slate-700" />
                  <span className="text-slate-700 text-sm font-medium">
                    Connecting with Google...
                  </span>
                </>
              ) : (
                <>
                  <Image
                    src="https://www.gstatic.com/firebasejs/ui/logo/lock/google_landing_logo.svg"
                    alt="Google"
                    width={20}
                    height={20}  
                    className="w-5 h-5"
                  />

                  <span className="text-sm font-bold">Sign in with Google</span>
                </>
              )}
            </button>
          </div>

          {/* Info Box */}
          <div className="p-4 bg-aurora-900/20 border border-aurora-700/40 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-aurora-500/20 text-aurora-300 shrink-0">
                <Shield className="h-4 w-4 text-teal-400" />
              </div>
              <div className="text-left text-xs space-y-1">
                <p className="text-white font-semibold">Secure Authentication</p>
                <p className="text-slate-400 leading-relaxed">
                  We use Firebase Authentication with Google OAuth. Your data is encrypted and never shared.
                </p>
              </div>
            </div>
          </div>

          {/* Features Checklist */}
          <div className="space-y-2.5 pt-2 border-t border-slate-800 dark:border-navy-700/70">
            <div className="flex items-center gap-2.5 text-slate-300 text-xs font-medium">
              <CheckCircle2 className="h-4 w-4 text-teal-400 shrink-0" />
              <span>Access personalized scheme recommendations</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-300 text-xs font-medium">
              <CheckCircle2 className="h-4 w-4 text-teal-400 shrink-0" />
              <span>Track your applications anytime</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-300 text-xs font-medium">
              <CheckCircle2 className="h-4 w-4 text-teal-400 shrink-0" />
              <span>Save your assessment data securely</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
