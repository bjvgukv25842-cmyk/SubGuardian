"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  ClipboardCheck,
  Code2,
  Gauge,
  History,
  KeyRound,
  ListChecks,
  Settings,
  ShieldCheck,
  WalletCards
} from "lucide-react";
import { WalletConnect } from "@/components/WalletConnect";
import { LanguageToggle } from "@/components/LanguageToggle";
import { StatusPill } from "@/components/ui";
import { useLanguage } from "@/components/LanguageProvider";
import { clsx } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", labelKey: "overview", icon: Gauge },
  { href: "/dashboard/policies", labelKey: "policies", icon: ListChecks },
  { href: "/dashboard/subscriptions", labelKey: "subscriptions", icon: ClipboardCheck },
  { href: "/dashboard/approvals", labelKey: "approvals", icon: Bell },
  { href: "/dashboard/wallet", labelKey: "wallet", icon: WalletCards },
  { href: "/dashboard/audit", labelKey: "audit", icon: History },
  { href: "/developers", labelKey: "developers", icon: Code2 },
  { href: "/settings", labelKey: "settings", icon: Settings }
] as const;

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { p } = useLanguage();
  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-950">SubGuardian</p>
              <p className="text-xs font-medium text-slate-500">{p.common.appTagline}</p>
            </div>
          </Link>
          <div className="flex flex-col items-start gap-2 lg:items-end">
            <LanguageToggle />
            <div className="flex flex-wrap gap-2">
              <StatusPill tone="success">{p.common.live0GChain}</StatusPill>
              <StatusPill tone="warning">{p.common.storageComputeLabeled}</StatusPill>
              <StatusPill tone="neutral">
                <KeyRound className="mr-1 h-3 w-3" />
                {p.common.siweSession}
              </StatusPill>
            </div>
            <WalletConnect />
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:px-8">
        <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "inline-flex min-h-10 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-semibold transition",
                  active ? "bg-slate-950 text-white" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                )}
              >
                <Icon className="h-4 w-4" />
                {p.nav[item.labelKey]}
              </Link>
            );
          })}
        </nav>
        <section>{children}</section>
      </div>
    </main>
  );
}
