"use client";

import React, { useEffect } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "@/lib/i18n";

export function I18nProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const saved = localStorage.getItem("language") || localStorage.getItem("i18nextLng");
    if (saved && (saved === "en" || saved === "hi") && saved !== i18n.language) {
      i18n.changeLanguage(saved);
      document.documentElement.lang = saved;
    }
  }, []);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
