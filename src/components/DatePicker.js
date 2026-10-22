"use client";

import { useState, useMemo } from "react";
import * as Popover from "@radix-ui/react-popover";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { format, parseISO, isValid, addDays, isToday } from "date-fns";
import { arSA, enUS, es, fr, de } from "date-fns/locale";
import { Calendar as CalendarIcon, X, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const dateLocales = {
  ar: arSA,
  en: enUS,
  es: es,
  fr: fr,
  de: de,
};

export default function DatePicker({ value, onChange, disabled = false, id }) {
  const [open, setOpen] = useState(false);
  const { lang, dir, t } = useLanguage();

  const currentLocale = dateLocales[lang] || enUS;

  // Parse incoming value (YYYY-MM-DD or ISO string)
  const selectedDate = useMemo(() => {
    if (!value) return undefined;
    if (value instanceof Date && isValid(value)) return value;
    if (typeof value === "string") {
      const parsed = parseISO(value);
      if (isValid(parsed)) return parsed;
    }
    return undefined;
  }, [value]);

  const handleSelect = (date) => {
    if (!date) {
      onChange?.("");
    } else {
      onChange?.(format(date, "yyyy-MM-dd"));
    }
    setOpen(false);
  };

  const setShortcut = (daysToAdd) => {
    const target = addDays(new Date(), daysToAdd);
    onChange?.(format(target, "yyyy-MM-dd"));
    setOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange?.("");
  };

  // Human-readable formatted string
  const formattedDisplay = useMemo(() => {
    if (!selectedDate) return null;
    try {
      return format(selectedDate, "d MMMM yyyy", { locale: currentLocale });
    } catch {
      return value;
    }
  }, [selectedDate, currentLocale, value]);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild disabled={disabled}>
        <button
          id={id}
          type="button"
          className={`mt-1.5 w-full flex items-center justify-between rounded-xl border border-[#E4E4E7] dark:border-[#27272A] bg-[#F8F9FA] dark:bg-[#09090B] px-3.5 py-2.5 text-xs transition focus:outline-none focus:border-[#2563EB] dark:focus:border-[#3B82F6] cursor-pointer group ${
            disabled ? "opacity-50 cursor-not-allowed" : "hover:border-[#2563EB]/60 dark:hover:border-[#3B82F6]/60"
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <CalendarIcon
              className={`h-4 w-4 shrink-0 transition ${
                selectedDate
                  ? "text-[#2563EB] dark:text-white"
                  : "text-[#64748B] dark:text-[#A1A1AA] group-hover:text-[#2563EB] dark:group-hover:text-white"
              }`}
            />
            <span
              className={`truncate font-medium ${
                selectedDate
                  ? "text-[#09090B] dark:text-white font-semibold"
                  : "text-[#64748B]/70 dark:text-[#A1A1AA]/70"
              }`}
            >
              {formattedDisplay || (lang === "ar" ? "حدد تاريخ الاستحقاق..." : "Select due date...")}
            </span>
          </div>

          {selectedDate && !disabled && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleClear(e);
                }
              }}
              title={lang === "ar" ? "إلغاء الموعد" : "Clear date"}
              className="p-1 rounded-md text-[#64748B] dark:text-[#A1A1AA] hover:bg-[#E4E4E7] dark:hover:bg-[#27272A] hover:text-red-500 transition cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </span>
          )}
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align={dir === "rtl" ? "end" : "start"}
          sideOffset={8}
          dir={dir}
          className="z-50 rounded-2xl border border-[#E4E4E7] dark:border-[#27272A] bg-white dark:bg-[#141416] p-3 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-150 focus:outline-none"
        >
          {/* Quick Shortcuts */}
          <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-[#E4E4E7] dark:border-[#27272A] text-[11px] font-semibold">
            <button
              type="button"
              onClick={() => setShortcut(0)}
              className="px-2.5 py-1 rounded-lg bg-[#EFF6FF] dark:bg-[#18181B] text-[#2563EB] dark:text-[#60A5FA] hover:bg-[#DBEAFE] dark:hover:bg-[#27272A] transition cursor-pointer"
            >
              {lang === "ar" ? "اليوم" : "Today"}
            </button>
            <button
              type="button"
              onClick={() => setShortcut(1)}
              className="px-2.5 py-1 rounded-lg bg-[#F4F4F5] dark:bg-[#18181B] text-[#09090B] dark:text-[#F4F4F5] hover:bg-[#E4E4E7] dark:hover:bg-[#27272A] transition cursor-pointer"
            >
              {lang === "ar" ? "غداً" : "Tomorrow"}
            </button>
            <button
              type="button"
              onClick={() => setShortcut(7)}
              className="px-2.5 py-1 rounded-lg bg-[#F4F4F5] dark:bg-[#18181B] text-[#09090B] dark:text-[#F4F4F5] hover:bg-[#E4E4E7] dark:hover:bg-[#27272A] transition cursor-pointer"
            >
              {lang === "ar" ? "بعد أسبوع" : "In 1 week"}
            </button>
            {selectedDate && (
              <button
                type="button"
                onClick={handleClear}
                className="ms-auto px-2 py-1 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition cursor-pointer"
              >
                {lang === "ar" ? "مسح" : "Clear"}
              </button>
            )}
          </div>

          {/* Custom DayPicker */}
          <div className="taskflow-day-picker text-xs text-[#09090B] dark:text-[#F4F4F5]">
            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={handleSelect}
              locale={currentLocale}
              dir={dir}
              weekStartsOn={0}
              showOutsideDays
              classNames={{
                root: "p-1",
                chevron: "fill-[#2563EB] dark:fill-[#3B82F6]",
                month_caption: "flex justify-center py-1 text-xs font-bold text-[#09090B] dark:text-[#F4F4F5]",
                weekdays: "flex justify-between border-b border-[#E4E4E7] dark:border-[#27272A] pb-1 text-[11px] font-semibold text-[#64748B] dark:text-[#A1A1AA]",
                weekday: "w-8 text-center",
                weeks: "space-y-1 mt-1",
                week: "flex justify-between",
                day: "w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium cursor-pointer transition hover:bg-[#EFF6FF] dark:hover:bg-[#1F1F23] hover:text-[#2563EB] dark:hover:text-[#60A5FA]",
                day_button: "w-full h-full flex items-center justify-center",
                selected: "!bg-[#2563EB] dark:!bg-[#3B82F6] !text-white font-bold shadow-xs hover:!bg-[#1D4ED8] dark:hover:!bg-[#2563EB]",
                today: "border border-[#2563EB] dark:border-[#3B82F6] font-bold text-[#2563EB] dark:text-[#3B82F6]",
                outside: "opacity-30 pointer-events-none",
                disabled: "opacity-20 cursor-not-allowed pointer-events-none",
              }}
            />
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
