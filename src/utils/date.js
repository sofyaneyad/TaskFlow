import { format, parseISO, isValid, isToday, isTomorrow, isYesterday } from "date-fns";
import { arSA, enUS, es, fr, de } from "date-fns/locale";

const dateLocales = {
  ar: arSA,
  en: enUS,
  es,
  fr,
  de,
};

/**
 * Formats a raw date (string, timestamp object, or Date) into a friendly localized string
 * @param {string|object|Date} raw
 * @param {string} lang
 * @param {string} formatStr
 * @returns {string|null}
 */
export function formatFriendlyDate(raw, lang = "ar", formatStr = "d MMM yyyy") {
  if (!raw) return null;
  const d = raw?.seconds
    ? new Date(raw.seconds * 1000)
    : typeof raw === "string"
    ? parseISO(raw)
    : new Date(raw);

  if (!isValid(d)) return null;

  const locale = dateLocales[lang] || enUS;
  if (isToday(d)) return lang === "ar" ? "اليوم" : "Today";
  if (isTomorrow(d)) return lang === "ar" ? "غداً" : "Tomorrow";
  if (isYesterday(d)) return lang === "ar" ? "أمس" : "Yesterday";

  return format(d, formatStr, { locale });
}
