import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enTranslation from "./public/locales/en/translation.json";
import hiTranslation from "./public/locales/hi/translation.json";

const resources = {
  en: {
    translation: enTranslation,
  },
  hi: {
    translation: hiTranslation,
  },
};

const getInitialLanguage = () => {
  if (typeof window !== "undefined") {
    const savedLng = localStorage.getItem("language") || localStorage.getItem("i18nextLng");
    if (savedLng && (savedLng === "en" || savedLng === "hi")) {
      return savedLng;
    }
  }
  return "en";
};

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    lng: getInitialLanguage(),
    fallbackLng: "en",
    interpolation: {
      escapeValue: false, // React already safes from XSS
    },
    react: {
      useSuspense: false,
    },
  });

  if (typeof window !== "undefined") {
    i18n.on("languageChanged", (lng) => {
      localStorage.setItem("language", lng);
      localStorage.setItem("i18nextLng", lng);
      document.documentElement.lang = lng;
    });
  }
}

export default i18n;
