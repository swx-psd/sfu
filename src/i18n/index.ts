import * as Localization from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  tr: {
    translation: {
      home: "Ana Sayfa",
      search: "Ara",
      library: "Kütüphane",
    },
  },
  en: {
    translation: {
      home: "Home",
      search: "Search",
      library: "Library",
    },
  },
};

i18n.use(initReactI18next).init({
  compatibilityJSON: "v4",
  resources,
  lng: Localization.getLocales?.()[0]?.languageCode ?? "tr",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;


