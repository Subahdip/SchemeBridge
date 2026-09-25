"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, Moon, Sun, Menu, X, LogIn, LogOut, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useTheme } from "@/components/theme-provider";
import { isAuthenticated, logout, UserSessionData } from "@/lib/firebase";
import { AppState } from "@/lib/app-state";
import Image from "next/image";
import { BrandIcon } from "@/components/brand-icon";

export function Navbar() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const { isDark, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserSessionData | null>(null);
  const [hasAssessment, setHasAssessment] = useState<boolean>(false);

  // Sync user authentication state and assessment state on client mount and path transitions
  useEffect(() => {
    const user = isAuthenticated();
    setCurrentUser(user);

    const checkAssessment = () => {
      const stored = AppState.getAssessment();
      setHasAssessment(Boolean(stored && (stored.income || stored.loanAmount || stored.loanPurpose || stored.primaryPurpose)));
    };

    checkAssessment();

    window.addEventListener("storage", checkAssessment);
    window.addEventListener("assessmentSubmitted", checkAssessment);
    return () => {
      window.removeEventListener("storage", checkAssessment);
      window.removeEventListener("assessmentSubmitted", checkAssessment);
    };
  }, [pathname]);

  const handleLogout = async () => {
    await logout();
    setCurrentUser(null);
    setMobileMenuOpen(false);
  };

  // Active route matching helper
  const currentPath = pathname || "/";
  const isHomeActive = currentPath === "/" || currentPath === "/index.html";
  const isAssessmentActive = currentPath === "/assessment" || currentPath === "/assessment.html";
  const isMatchedSchemeActive = currentPath === "/matched-scheme" || currentPath === "/matched-scheme.html";
  const isEmiActive = currentPath === "/emi-calculator" || currentPath === "/emi-calculator.html";
  const isPartnerNetworkActive = currentPath === "/partner-network" || currentPath === "/partner-network.html";
  const isMyApplicationsActive = currentPath === "/my-applications" || currentPath === "/my-applications.html" || currentPath.startsWith("/application-status");

  const navLinks = [
    { name: t("Home"), href: "/", isActive: isHomeActive, requiresAssessment: false },
    { name: t("Assessment"), href: "/assessment", isActive: isAssessmentActive, requiresAssessment: false },
    { name: t("Scheme"), href: "/matched-scheme", isActive: isMatchedSchemeActive, requiresAssessment: true },
    { name: t("EMI"), href: "/emi-calculator", isActive: isEmiActive, requiresAssessment: true },
    { name: t("Partners"), href: "/partner-network", isActive: isPartnerNetworkActive, requiresAssessment: true },
    { name: t("My Applications"), href: "/my-applications", isActive: isMyApplicationsActive, requiresAssessment: true },
  ];

  return (
    <nav className="bg-white/95 dark:bg-navy-950/95 border-b border-slate-200 dark:border-navy-800 fixed top-0 left-0 right-0 z-50 backdrop-blur-md transition-colors duration-200 shadow-sm dark:shadow-md dark:shadow-black/20 w-full h-16 shrink-0">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">

          {/* 1. LOGO */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <BrandIcon className="h-9 w-auto group-hover:scale-105 transition-transform" />
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-aurora-600 via-teal-600 to-teal-700 dark:from-aurora-400 dark:via-teal-300 dark:to-teal-400 bg-clip-text text-transparent group-hover:brightness-110 transition-all">
                SchemeBridge
              </span>
              <Badge variant="glow" className="text-[10px] font-medium py-0 px-2 hidden sm:inline-flex border-aurora-500/30 text-aurora-600 dark:text-aurora-300 bg-aurora-500/10">
                DesiDevs_Surtech
              </Badge>
            </div>
          </Link>

          {/* 2. NAVIGATION LINKS (DESKTOP) */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const isLocked = link.requiresAssessment && !hasAssessment;
              if (isLocked) {
                return (
                  <span
                    key={link.href}
                    className="font-medium text-sm text-slate-400/50 dark:text-slate-600 cursor-not-allowed select-none py-1"
                    title={t("Submit Assessment first to unlock")}
                  >
                    {link.name}
                  </span>
                );
              }
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`transition-colors font-medium text-sm ${link.isActive
                    ? "text-aurora-600 dark:text-aurora-400 font-semibold border-b-2 border-aurora-600 dark:border-aurora-400 pb-0.5"
                    : "text-slate-600 dark:text-slate-300 hover:text-aurora-600 dark:hover:text-aurora-400"
                    }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* 3. CTA & UTILITIES (RIGHT) */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Language Switcher Dropdown */}
            <LanguageSwitcher />

            {/* Theme Toggle Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full h-9 w-9 text-slate-600 dark:text-slate-300 hover:text-aurora-600 dark:hover:text-aurora-400 hover:bg-slate-100 dark:hover:bg-navy-800/80 transition-colors"
              aria-label={t("Toggle theme")}
            >
              {isDark ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-slate-700" />
              )}
            </Button>

            {/* Auth Section: Login Button OR User Profile & Logout */}
            {currentUser ? (
              <div className="hidden sm:flex items-center gap-3">
                <div className="flex items-center gap-2.5 bg-slate-100 dark:bg-navy-800/80 py-1 px-3 rounded-full border border-slate-200 dark:border-navy-700 shadow-sm">
                  {currentUser.photo ? (
                    <Image
                      src={currentUser.photo}
                      alt={currentUser.name}
                      width={36}
                      height={36}
                      className="w-9 h-9 rounded-full border-2 border-aurora-500 object-cover"
                      unoptimized
                    />

                  ) : (
                    <div className="w-7 h-7 rounded-full bg-aurora-500/20 text-aurora-400 flex items-center justify-center">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                  <span className="text-slate-800 dark:text-white text-xs font-semibold max-w-[110px] truncate">
                    {currentUser.name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="bg-slate-200 hover:bg-slate-300 dark:bg-navy-800 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-200 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer border border-slate-300 dark:border-navy-700"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <Link href="/login" className="hidden sm:inline-flex">
                <button
                  type="button"
                  className="bg-gradient-to-r from-aurora-600 to-teal-600 hover:from-aurora-700 hover:to-teal-700 text-white px-6 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all shadow-lg shadow-aurora-500/20 hover:shadow-aurora-500/30 flex items-center gap-1.5 cursor-pointer"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  <span>Login</span>
                </button>
              </Link>
            )}

            {/* Mobile Hamburger Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-aurora-600 dark:hover:text-aurora-400 hover:bg-slate-100 dark:hover:bg-navy-800/60 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* 4. MOBILE NAVIGATION DRAWER */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-navy-800 bg-white/98 dark:bg-navy-950/98 backdrop-blur-xl p-4 space-y-3 animate-fade-in shadow-2xl max-h-[calc(100vh-4rem)] overflow-y-auto">
          {/* User Profile in Mobile Drawer if logged in */}
          {currentUser && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-navy-800/80 border border-slate-200 dark:border-navy-700 mb-2">
              <div className="flex items-center gap-2.5">
                {currentUser.photo ? (
                  <Image
                    src={currentUser.photo}
                    alt={currentUser.name}
                    width={36}
                    height={36}
                    className="w-9 h-9 rounded-full border-2 border-aurora-500 object-cover"
                    unoptimized
                  />

                ) : (
                  <div className="w-9 h-9 rounded-full bg-aurora-500/20 text-aurora-400 flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                )}
                <div>
                  <p className="text-slate-900 dark:text-white text-sm font-bold truncate max-w-[180px]">
                    {currentUser.name}
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 text-xs truncate max-w-[180px]">
                    {currentUser.email || "Logged In"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border border-rose-500/30 flex items-center gap-1"
              >
                <LogOut className="h-3 w-3" />
                <span>Logout</span>
              </button>
            </div>
          )}

          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => {
              const isLocked = link.requiresAssessment && !hasAssessment;
              if (isLocked) {
                return (
                  <div
                    key={link.href}
                    className="flex items-center justify-between text-sm py-2.5 px-3.5 rounded-lg text-slate-400/60 dark:text-slate-600 cursor-not-allowed select-none font-medium bg-slate-50/50 dark:bg-navy-950/40 border border-transparent"
                    title={t("Submit Assessment first to unlock")}
                  >
                    <span>{link.name}</span>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-wider bg-slate-200/60 dark:bg-navy-900 px-2 py-0.5 rounded-md border border-slate-300/60 dark:border-navy-800">
                      {t("Locked")}
                    </span>
                  </div>
                );
              }
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between text-sm py-2.5 px-3.5 rounded-lg transition-colors ${link.isActive
                    ? "bg-slate-100 dark:bg-navy-800 text-aurora-600 dark:text-aurora-400 font-semibold border border-slate-200 dark:border-navy-700"
                    : "text-slate-700 dark:text-slate-300 hover:text-aurora-600 dark:hover:text-aurora-400 hover:bg-slate-50 dark:hover:bg-navy-900/60 font-medium"
                    }`}
                >
                  <span>{link.name}</span>
                  {link.isActive && (
                    <span className="h-2 w-2 rounded-full bg-aurora-500 shadow-sm" />
                  )}
                </Link>
              );
            })}
          </div>

          <LanguageSwitcher isMobile={true} />

          {/* Auth Action in Mobile Drawer */}
          <div className="pt-3 border-t border-slate-200 dark:border-navy-800">
            {currentUser ? (
              <button
                type="button"
                onClick={handleLogout}
                className="w-full bg-slate-200 dark:bg-navy-800 hover:bg-slate-300 dark:hover:bg-navy-700 text-slate-800 dark:text-white justify-center py-2.5 px-4 rounded-lg font-bold text-xs flex items-center gap-2 cursor-pointer transition-all border border-slate-300 dark:border-navy-700"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout ({currentUser.name})</span>
              </button>
            ) : (
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <button
                  type="button"
                  className="w-full bg-gradient-to-r from-aurora-600 to-teal-600 hover:from-aurora-700 hover:to-teal-700 text-white justify-center py-2.5 px-4 rounded-lg font-bold text-xs shadow-lg shadow-aurora-500/20 flex items-center gap-2 cursor-pointer"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Login</span>
                </button>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
