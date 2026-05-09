"use client";

import { AlertTriangle, BadgeDollarSign, Gauge, PiggyBank } from "lucide-react";
import { AnalysisResult, RenewalPolicy, SubscriptionItem } from "@/lib/types";
import { formatMoney, monthlyAmount } from "@/lib/utils";
import { useLanguage } from "@/components/LanguageProvider";

export function OverviewCards({
  subscriptions,
  policy,
  analysis
}: {
  subscriptions: SubscriptionItem[];
  policy: RenewalPolicy;
  analysis: AnalysisResult | null;
}) {
  const { t } = useLanguage();
  const monthlyTotal =
    analysis?.monthlyTotal ??
    subscriptions.reduce((total, subscription) => total + monthlyAmount(subscription.amount, subscription.billingCycle), 0);
  const potentialSavings =
    analysis?.recommendations.reduce((total, recommendation) => total + recommendation.estimatedMonthlySaving, 0) ?? 0;
  const riskLevel = analysis?.overallRisk ?? (monthlyTotal > policy.monthlyBudget ? "high" : monthlyTotal > policy.monthlyBudget * 0.85 ? "medium" : "low");

  const cards = [
    { label: t.overview.monthlyTotal, value: formatMoney(monthlyTotal), icon: BadgeDollarSign, tone: "text-slate-800" },
    { label: t.overview.budgetLimit, value: formatMoney(policy.monthlyBudget), icon: Gauge, tone: "text-emerald-700" },
    { label: t.overview.potentialSavings, value: formatMoney(potentialSavings), icon: PiggyBank, tone: "text-cyan-700" },
    {
      label: t.overview.riskLevel,
      value: t.values.riskLevel[riskLevel],
      icon: AlertTriangle,
      tone: riskLevel === "high" ? "text-rose-700" : riskLevel === "medium" ? "text-amber-700" : "text-emerald-700"
    }
  ];

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.label} className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-medium text-slate-500">{card.label}</p>
              <Icon className={`h-5 w-5 ${card.tone}`} />
            </div>
            <p className="mt-3 text-2xl font-bold tracking-normal text-slate-950">{card.value}</p>
          </div>
        );
      })}
    </section>
  );
}
