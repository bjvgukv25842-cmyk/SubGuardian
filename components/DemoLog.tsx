"use client";

import { CheckCircle2, Circle, XCircle } from "lucide-react";
import { DemoLogItem } from "@/lib/types";
import { Panel, PanelHeader } from "@/components/ui";
import { useLanguage } from "@/components/LanguageProvider";

export function DemoLog({ items }: { items: DemoLogItem[] }) {
  const { t } = useLanguage();

  return (
    <Panel>
      <PanelHeader title={t.demoLog.title} eyebrow={t.demoLog.eyebrow} />
      <div className="space-y-3">
        {items.map((item) => {
          const Icon = item.status === "success" ? CheckCircle2 : item.status === "error" ? XCircle : Circle;
          const color = item.status === "success" ? "text-emerald-600" : item.status === "error" ? "text-rose-600" : "text-slate-400";
          return (
            <div key={item.id} className="flex gap-3">
              <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${color}`} />
              <div>
                <p className="text-sm font-semibold text-slate-900">{t.demoLog.items[item.id as keyof typeof t.demoLog.items] || item.label}</p>
                {item.detail ? <p className="mt-0.5 break-all text-xs text-slate-500">{item.detail}</p> : null}
                <p className="mt-0.5 text-xs text-slate-400">
                  {item.createdAt ? new Date(item.createdAt).toLocaleTimeString() : t.demoLog.waiting}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
