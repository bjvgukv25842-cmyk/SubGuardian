"use client";

import { ShieldCheck } from "lucide-react";
import { HealthResponse } from "@/lib/types";
import { LanguageToggle } from "@/components/LanguageToggle";
import { WalletConnect } from "@/components/WalletConnect";
import { StatusPill } from "@/components/ui";
import { useLanguage } from "@/components/LanguageProvider";

export function Header({
  health,
  onConnected
}: {
  health: HealthResponse | null;
  onConnected: (address: string) => void;
}) {
  const { t } = useLanguage();

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-normal text-slate-950">SubGuardian</h1>
            <p className="text-sm text-slate-600">{t.header.subtitle}</p>
          </div>
        </div>
        <div className="flex w-full flex-col items-end gap-3 lg:w-auto">
          <LanguageToggle />
          <div className="flex flex-wrap gap-2">
            <StatusPill tone={health?.mockMode.compute ? "warning" : "success"}>
              0G Compute: {health?.mockMode.compute ? t.header.mock : t.header.live}
            </StatusPill>
            <StatusPill tone={health?.mockMode.storage ? "warning" : "success"}>
              0G Storage: {health?.mockMode.storage ? t.header.mock : t.header.live}
            </StatusPill>
          </div>
          <WalletConnect onConnected={onConnected} />
        </div>
      </div>
    </header>
  );
}
