import type { Locales } from "~/i18n/i18n-types"
import { isLocale } from "~/i18n/i18n-util"
import { loadLocaleAsync } from "~/i18n/i18n-util.async"

export const loadPreferredLocale = async () => {
  const localePreference: Locales = (navigator.languages.find(lang => isLocale(lang)) ?? "en") as Locales
  await loadLocaleAsync(localePreference)

  return localePreference
}