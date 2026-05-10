"use client";

import Link from "next/link";
import { AlertTriangle, Database, KeyRound, ShieldCheck } from "lucide-react";
import { DashboardShell } from "@/components/DashboardShell";
import { useLanguage } from "@/components/LanguageProvider";
import { StatusPill } from "@/components/ui";

export function SettingsClient({
  computeMock,
  storageMock,
  apiAuthConfigured
}: {
  computeMock: boolean;
  storageMock: boolean;
  apiAuthConfigured: boolean;
}) {
  const { p } = useLanguage();
  return (
    <DashboardShell>
      <div className="space-y-5">
        <div className="border-b border-slate-200 pb-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">{p.settings.eyebrow}</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-950">{p.settings.title}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{p.settings.body}</p>
        </div>
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Setting
            icon={<ShieldCheck className="h-5 w-5 text-emerald-700" />}
            title="0G Chain"
            status={<StatusPill tone="success">{p.settings.chainStatus}</StatusPill>}
            body={p.settings.chainBody}
          />
          <Setting
            icon={<Database className="h-5 w-5 text-cyan-700" />}
            title="0G Storage"
            status={<StatusPill tone={storageMock ? "warning" : "success"}>{storageMock ? p.settings.mockFallback : p.settings.liveEncryptedUpload}</StatusPill>}
            body={p.settings.storageBody}
          />
          <Setting
            icon={<Database className="h-5 w-5 text-cyan-700" />}
            title="0G Compute"
            status={<StatusPill tone={computeMock ? "warning" : "success"}>{computeMock ? p.settings.mockFallback : p.settings.liveVerifyTee}</StatusPill>}
            body={p.settings.computeBody}
          />
          <Setting
            icon={<KeyRound className="h-5 w-5 text-slate-700" />}
            title={p.settings.apiTitle}
            status={<StatusPill tone={apiAuthConfigured ? "success" : "warning"}>{apiAuthConfigured ? p.settings.globalApiKeySet : p.settings.localDevFallback}</StatusPill>}
            body={p.settings.apiBody}
          />
        </section>
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-2 font-semibold text-amber-950">
            <AlertTriangle className="h-4 w-4" />
            {p.settings.boundaryTitle}
          </div>
          <p className="mt-2 text-sm leading-6 text-amber-900">{p.settings.boundaryBody}</p>
          <Link href="/developers/portal" className="mt-3 inline-flex min-h-9 items-center rounded-md border border-amber-300 bg-white px-3 text-sm font-semibold text-amber-950">
            {p.settings.manageIntegrations}
          </Link>
        </section>
      </div>
    </DashboardShell>
  );
}

function Setting({ icon, title, status, body }: { icon: React.ReactNode; title: string; status: React.ReactNode; body: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="font-semibold text-slate-950">{title}</h2>
        </div>
        {status}
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">{body}</p>
    </div>
  );
}
