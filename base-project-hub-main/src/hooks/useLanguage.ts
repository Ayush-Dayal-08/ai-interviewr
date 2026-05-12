import { useState, useCallback, createContext, useContext } from "react";

export type SupportedLanguage = "en" | "es" | "fr" | "de" | "hi" | "pt" | "ja" | "zh" | "ar" | "ko";

interface LanguageConfig {
  code: SupportedLanguage;
  label: string;
  speechCode: string; // BCP-47 for Web Speech API
  fillerWords: string[];
}

export const LANGUAGES: LanguageConfig[] = [
  {
    code: "en", label: "English", speechCode: "en-US",
    fillerWords: ["um", "uh", "like", "you know", "basically", "actually", "literally", "sort of", "kind of", "i mean", "right", "so", "well", "anyway", "obviously", "honestly", "seriously"],
  },
  {
    code: "es", label: "Español", speechCode: "es-ES",
    fillerWords: ["eh", "pues", "bueno", "o sea", "este", "entonces", "digamos", "como que", "la verdad", "sabes"],
  },
  {
    code: "fr", label: "Français", speechCode: "fr-FR",
    fillerWords: ["euh", "ben", "en fait", "du coup", "genre", "voilà", "quoi", "bah", "tu vois", "enfin"],
  },
  {
    code: "de", label: "Deutsch", speechCode: "de-DE",
    fillerWords: ["äh", "ähm", "also", "halt", "sozusagen", "quasi", "irgendwie", "na ja", "genau", "eigentlich"],
  },
  {
    code: "hi", label: "हिन्दी", speechCode: "hi-IN",
    fillerWords: ["matlab", "basically", "like", "acha", "toh", "haan", "woh", "actually", "you know"],
  },
  {
    code: "pt", label: "Português", speechCode: "pt-BR",
    fillerWords: ["é", "tipo", "então", "né", "assim", "bom", "olha", "sabe", "enfim", "basicamente"],
  },
  {
    code: "ja", label: "日本語", speechCode: "ja-JP",
    fillerWords: ["えーと", "あのー", "まあ", "なんか", "その", "ほら", "えー"],
  },
  {
    code: "zh", label: "中文", speechCode: "zh-CN",
    fillerWords: ["嗯", "那个", "就是", "然后", "对吧", "这个", "反正"],
  },
  {
    code: "ar", label: "العربية", speechCode: "ar-SA",
    fillerWords: ["يعني", "هلأ", "طيب", "والله", "شو", "بس", "اممم"],
  },
  {
    code: "ko", label: "한국어", speechCode: "ko-KR",
    fillerWords: ["음", "그", "어", "뭐", "좀", "약간", "진짜"],
  },
];

export function getLanguageConfig(code: SupportedLanguage): LanguageConfig {
  return LANGUAGES.find(l => l.code === code) || LANGUAGES[0];
}

export function useLanguage() {
  const [language, setLanguage] = useState<SupportedLanguage>(() => {
    const stored = localStorage.getItem("appLanguage");
    return (stored as SupportedLanguage) || "en";
  });

  const changeLanguage = useCallback((code: SupportedLanguage) => {
    setLanguage(code);
    localStorage.setItem("appLanguage", code);
  }, []);

  const config = getLanguageConfig(language);

  return { language, changeLanguage, config };
}
