"use client";

import { Languages } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import { clsx } from "@/lib/utils";

export function LanguageToggle() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white p-1 shadow-sm" aria-label={t.languageToggle.label}>
      <Languages className="mx-2 h-4 w-4 text-slate-500" aria-hidden="true" />
      {(["en", "zh"] as const).map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => setLanguage(option)}
          className={clsx(
            "focus-ring min-h-8 rounded px-2.5 text-xs font-semibold transition",
            language === option ? "bg-slate-950 text-white" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
          )}
          aria-pressed={language === option}
        >
          {option === "en" ? t.languageToggle.english : t.languageToggle.chinese}
        </button>
      ))}
    </div>
  );
}
