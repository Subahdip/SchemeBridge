"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Globe, Check, ChevronDown } from "lucide-react";

export function LanguageSwitcher({ isMobile = false }: { isMobile?: boolean }) {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang = i18n.language?.startsWith("hi") ? "hi" : "en";

  const languages = [
    {
      code: "en",
      label: "English",
      nativeLabel: "English",
      flag: "🇬🇧",
    },
    {
      code: "hi",
      label: "Hindi",
      nativeLabel: "हिन्दी",
      flag: "🇮🇳",
    },
  ];

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    if (typeof window !== "undefined") {
      localStorage.setItem("language", langCode);
      localStorage.setItem("i18nextLng", langCode);
      document.documentElement.lang = langCode;
    }
    setIsOpen(false);
  };

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const activeLanguage = languages.find((l) => l.code === currentLang) || languages[0];

  if (isMobile) {
    return (
      <div className="pt-2 pb-1 border-t border-navy-800">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1 mb-2 flex items-center gap-1.5">
          <Globe className="h-3.5 w-3.5 text-aurora-400" />
          <span>{t("Language")}</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {languages.map((lang) => {
            const isActive = currentLang === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "bg-aurora-500/20 text-aurora-300 border border-aurora-500/40 shadow-sm"
                    : "bg-navy-900/60 text-slate-300 hover:bg-navy-800 border border-navy-700/60"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base leading-none">{lang.flag}</span>
                  <span>{lang.nativeLabel}</span>
                </div>
                {isActive && <Check className="h-3.5 w-3.5 text-aurora-400" />}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 h-9 px-2.5 rounded-lg border border-navy-700/70 bg-navy-900/80 hover:bg-navy-800/90 text-slate-200 text-xs font-medium transition-all hover:border-aurora-500/40 focus:outline-none focus:ring-1 focus:ring-aurora-500/50 shadow-sm"
        aria-label="Select language"
        aria-expanded={isOpen}
      >
        <span className="text-base leading-none">{activeLanguage.flag}</span>
        <span className="hidden sm:inline font-semibold">{activeLanguage.nativeLabel}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-aurora-400" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-44 rounded-xl border border-navy-700 bg-navy-950/98 backdrop-blur-xl shadow-2xl p-1.5 z-50 animate-fade-in space-y-0.5">
          <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {t("Language")}
          </div>
          {languages.map((lang) => {
            const isActive = currentLang === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-aurora-500/20 text-aurora-300 font-semibold border border-aurora-500/30"
                    : "text-slate-300 hover:bg-navy-800 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base leading-none">{lang.flag}</span>
                  <div className="flex flex-col text-left">
                    <span className="leading-tight">{lang.nativeLabel}</span>
                    <span className="text-[10px] text-slate-400 leading-none">{lang.label}</span>
                  </div>
                </div>
                {isActive && <Check className="h-4 w-4 text-aurora-400" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default LanguageSwitcher;
