import { create } from "zustand";
import { persist } from "zustand/middleware";
import { sr } from "./sr";
import { en } from "./en";
import type { Translations } from "./types";

export type Locale = "sr" | "en";

const translations: Record<Locale, Translations> = { sr, en };

interface LocaleState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: "sr",
      setLocale: (locale) => set({ locale }),
    }),
    { name: "stopshop-locale" },
  ),
);

export function useT(): Translations {
  const locale = useLocaleStore((s) => s.locale);
  return translations[locale];
}

export function useFormatPrice() {
  const locale = useLocaleStore((s) => s.locale);
  return (value: number | null | undefined): string => {
    if (value == null) return "\u2014";
    const fmt = new Intl.NumberFormat(locale === "sr" ? "sr-RS" : "en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
    return fmt.format(value) + " " + translations[locale].common.currency;
  };
}

export function useLocalized() {
  const locale = useLocaleStore((s) => s.locale);
  
  return (obj: any, field: string): string => {
    if (locale === "sr") {
      const srVal = obj[`${field}_sr`];
      if (typeof srVal === "string" && srVal) return srVal;
    }
    const val = obj[field];
    return typeof val === "string" ? val : "";
  };
}

export type { Translations };
