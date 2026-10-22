"use client";

import * as React from "react";
import * as RadixSelect from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

/**
 * Reusable Radix UI Select Component for TaskFlow
 * Supports Dark/Light mode, RTL (Arabic), custom icons, dots, and seamless Tailwind styling.
 */

export function Select({ value, onValueChange, dir, children, ...props }) {
  const { lang } = useLanguage();
  const resolvedDir = dir || (lang === "ar" ? "rtl" : "ltr");

  return (
    <RadixSelect.Root value={value} onValueChange={onValueChange} dir={resolvedDir} {...props}>
      {children}
    </RadixSelect.Root>
  );
}

export const SelectGroup = RadixSelect.Group;
export const SelectValue = RadixSelect.Value;

export function SelectTrigger({ className = "", children, ...props }) {
  return (
    <RadixSelect.Trigger
      className={`inline-flex items-center justify-between gap-2 rounded-xl border border-[#E4E4E7] dark:border-[#27272A] bg-[#F8F9FA] dark:bg-[#09090B] px-3 py-1.5 text-xs font-medium text-[#09090B] dark:text-[#F4F4F5] hover:border-[#2563EB]/40 dark:hover:border-[#3B82F6]/50 focus:border-[#2563EB] dark:focus:border-[#3B82F6] focus:outline-none transition cursor-pointer select-none ${className}`}
      {...props}
    >
      {children}
      <RadixSelect.Icon asChild>
        <ChevronDown className="h-3.5 w-3.5 text-[#64748B] dark:text-[#A1A1AA] transition-transform duration-200" />
      </RadixSelect.Icon>
    </RadixSelect.Trigger>
  );
}

export function SelectContent({ className = "", children, position = "popper", ...props }) {
  return (
    <RadixSelect.Portal>
      <RadixSelect.Content
        position={position}
        sideOffset={5}
        className={`z-50 min-w-[var(--radix-select-trigger-width)] max-h-72 overflow-y-auto rounded-xl border border-[#E4E4E7] dark:border-[#27272A] bg-[#FFFFFF] dark:bg-[#141416] p-1.5 shadow-2xl text-[#09090B] dark:text-[#F4F4F5] will-change-[opacity,transform] animate-in fade-in-80 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 ${className}`}
        {...props}
      >
        <RadixSelect.ScrollUpButton className="flex items-center justify-center py-1 text-[#64748B] dark:text-[#A1A1AA]">
          <ChevronUp className="h-3.5 w-3.5" />
        </RadixSelect.ScrollUpButton>
        <RadixSelect.Viewport className="p-0.5">
          {children}
        </RadixSelect.Viewport>
        <RadixSelect.ScrollDownButton className="flex items-center justify-center py-1 text-[#64748B] dark:text-[#A1A1AA]">
          <ChevronDown className="h-3.5 w-3.5" />
        </RadixSelect.ScrollDownButton>
      </RadixSelect.Content>
    </RadixSelect.Portal>
  );
}

export function SelectItem({ className = "", children, icon, colorDot, ...props }) {
  return (
    <RadixSelect.Item
      className={`relative flex w-full cursor-pointer select-none items-center rounded-lg py-1.5 px-2.5 text-xs text-[#09090B] dark:text-[#F4F4F5] outline-none transition-colors data-[highlighted]:bg-[#2563EB]/10 dark:data-[highlighted]:bg-[#2563EB]/25 data-[highlighted]:text-[#2563EB] dark:data-[highlighted]:text-[#60A5FA] data-[disabled]:pointer-events-none data-[disabled]:opacity-50 ${className}`}
      {...props}
    >
      <div className="flex items-center gap-2 flex-1">
        {colorDot && (
          <span className={`h-2 w-2 rounded-full shrink-0 ${colorDot}`} />
        )}
        {icon && <span className="shrink-0">{icon}</span>}
        <RadixSelect.ItemText>{children}</RadixSelect.ItemText>
      </div>

      <RadixSelect.ItemIndicator className="inline-flex items-center justify-center ltr:ml-2 rtl:mr-2">
        <Check className="h-3.5 w-3.5 text-[#2563EB] dark:text-[#60A5FA]" />
      </RadixSelect.ItemIndicator>
    </RadixSelect.Item>
  );
}

/**
 * Convenient Drop-in Select for easy replacement of native <select>
 */
export default function AppSelect({
  value,
  onChange,
  options = [],
  placeholder = "",
  className = "",
  triggerClassName = "",
  id,
  "aria-label": ariaLabel,
}) {
  const currentOption = options.find((opt) => String(opt.value) === String(value));

  return (
    <Select
      value={value !== undefined && value !== null ? String(value) : undefined}
      onValueChange={(val) => onChange?.({ target: { value: val } })}
    >
      <SelectTrigger
        id={id}
        aria-label={ariaLabel}
        className={`${triggerClassName} ${className}`}
      >
        <div className="flex items-center gap-2 truncate">
          {currentOption?.colorDot && (
            <span className={`h-2 w-2 rounded-full shrink-0 ${currentOption.colorDot}`} />
          )}
          {currentOption?.icon && (
            <span className="shrink-0">{currentOption.icon}</span>
          )}
          <span className="truncate">
            {currentOption ? currentOption.label : placeholder || value}
          </span>
        </div>
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={String(option.value)}
            colorDot={option.colorDot}
            icon={option.icon}
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
