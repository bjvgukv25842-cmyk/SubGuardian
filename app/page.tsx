"use client";

import Link from "next/link";
import { ArrowRight, Code2, Database, FileCheck2, ShieldCheck, WalletCards } from "lucide-react";
import { WalletConnect } from "@/components/WalletConnect";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useLanguage } from "@/components/LanguageProvider";
import { StatusPill } from "@/components/ui";

export default function Home() {
  const { p } = useLanguage();
  const featureIcons = [
    <WalletCards key="wallet" className="h-5 w-5 text-emerald-700" />,
    <ShieldCheck key="policy" className="h-5 w-5 text-emerald-700" />,
    <FileCheck2 key="api" className="h-5 w-5 text-emerald-700" />,
    <Database key="audit" className="h-5 w-5 text-emerald-700" />
  ];
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_430px] lg:px-8">
          <div>
            <div className="mb-5 flex justify-end">
              <LanguageToggle />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-600 text-white">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">SubGuardian</p>
                <h1 className="text-3xl font-bold tracking-normal text-slate-950">{p.home.title}</h1>
              </div>
            </div>
            <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600">{p.home.body}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <StatusPill tone="success">{p.home.badges.chain}</StatusPill>
              <StatusPill tone="warning">{p.home.badges.mock}</StatusPill>
              <StatusPill tone="neutral">{p.home.badges.eoa}</StatusPill>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/dashboard" className="inline-flex min-h-10 items-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-800">
                {p.home.openDashboard}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/developers" className="inline-flex min-h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 hover:bg-slate-50">
                <Code2 className="h-4 w-4" />
                {p.home.developerDemo}
              </Link>
            </div>
          </div>

          <aside className="rounded-lg border border-slate-200 bg-slate-50 p-5">
            <h2 className="text-lg font-semibold text-slate-950">{p.home.signInTitle}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{p.home.signInBody}</p>
            <div className="mt-5">
              <WalletConnect />
            </div>
          </aside>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-4 py-6 sm:px-6 md:grid-cols-2 xl:grid-cols-4 lg:px-8">
        {p.home.features.map((feature, index) => (
          <Feature key={feature.title} icon={featureIcons[index]} title={feature.title} body={feature.body} />
        ))}
      </section>
    </main>
  );
}

function Feature({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
      {icon}
      <h2 className="mt-3 font-semibold text-slate-950">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
    </div>
  );
}
