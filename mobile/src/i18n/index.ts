import { getLocales } from "expo-localization";
import en from "./en";
import es from "./es";
import type { Locales } from "./i18n-types";

export type Dictionary = typeof en;

const dictionaries: Record<Locales, Dictionary> = { en, es: es as Dictionary };

export function getPreferredLocale(): Locales {
  const tag = getLocales()[0]?.languageTag ?? "en";
  return tag.toLowerCase().startsWith("es") ? "es" : "en";
}

// Diccionario crudo. El formateo con params (ej. SONGS_IN_PLAYLIST) y el
// adapter react de typesafe-i18n se migran en Fase 3 con las pantallas.
export function getDictionary(locale?: Locales): Dictionary {
  return dictionaries[locale ?? getPreferredLocale()];
}
