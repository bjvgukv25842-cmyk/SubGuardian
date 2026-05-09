"use client";

import { Plus, ShieldAlert } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { AnalysisResult, BillingCycle, SubscriptionCategory, SubscriptionItem } from "@/lib/types";
import { FieldLabel, Panel, PanelHeader, PrimaryButton, SelectInput, StatusPill, TextInput } from "@/components/ui";
import { decisionTone, formatMoney } from "@/lib/utils";
import { useLanguage } from "@/components/LanguageProvider";
import { localizeDisplayText } from "@/lib/i18n";

const categories: SubscriptionCategory[] = ["AI Tool", "Web3 Infra", "SaaS", "API", "Other"];

const emptyForm: Omit<SubscriptionItem, "id"> = {
  serviceName: "",
  category: "AI Tool" as SubscriptionCategory,
  amount: 0,
  currency: "USDT",
  billingCycle: "monthly",
  nextRenewalDate: "2026-06-01",
  usageScore: 50,
  notes: ""
};

export function SubscriptionTable({
  subscriptions,
  analysis,
  onAdd
}: {
  subscriptions: SubscriptionItem[];
  analysis: AnalysisResult | null;
  onAdd: (subscription: SubscriptionItem) => void;
}) {
  const { language, t } = useLanguage();
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  const recommendations = useMemo(() => {
    return new Map((analysis?.recommendations || []).map((recommendation) => [recommendation.serviceName, recommendation]));
  }, [analysis]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setError("");

    if (!form.serviceName.trim()) {
      setError(t.subscription.errors.serviceRequired);
      return;
    }

    if (form.amount <= 0) {
      setError(t.subscription.errors.amountPositive);
      return;
    }

    onAdd({
      ...form,
      id: `sub-${crypto.randomUUID()}`
    });
    setForm(emptyForm);
  };

  return (
    <Panel className="xl:col-span-2">
      <PanelHeader title={t.subscription.title} eyebrow={t.subscription.eyebrow} action={<ShieldAlert className="h-5 w-5 text-slate-500" />} />
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead>
            <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="py-3 pr-4">{t.subscription.columns.service}</th>
              <th className="py-3 pr-4">{t.subscription.columns.category}</th>
              <th className="py-3 pr-4">{t.subscription.columns.amount}</th>
              <th className="py-3 pr-4">{t.subscription.columns.cycle}</th>
              <th className="py-3 pr-4">{t.subscription.columns.usage}</th>
              <th className="py-3 pr-4">{t.subscription.columns.nextRenewal}</th>
              <th className="py-3 pr-4">{t.subscription.columns.aiDecision}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {subscriptions.map((subscription) => {
              const recommendation = recommendations.get(subscription.serviceName);
              return (
                <tr key={subscription.id} className="align-top">
                  <td className="py-3 pr-4">
                    <p className="font-semibold text-slate-950">{subscription.serviceName}</p>
                    <p className="mt-1 max-w-xs text-xs text-slate-500">{localizeDisplayText(subscription.notes, language)}</p>
                  </td>
                  <td className="py-3 pr-4 text-slate-700">{t.values.category[subscription.category]}</td>
                  <td className="py-3 pr-4 font-medium text-slate-900">{formatMoney(subscription.amount, subscription.currency)}</td>
                  <td className="py-3 pr-4 text-slate-700">{t.values.billingCycle[subscription.billingCycle]}</td>
                  <td className="py-3 pr-4">
                    <div className="flex min-w-24 items-center gap-2">
                      <div className="h-2 w-16 rounded-full bg-slate-200">
                        <div className="h-2 rounded-full bg-emerald-600" style={{ width: `${subscription.usageScore}%` }} />
                      </div>
                      <span className="font-medium text-slate-800">{subscription.usageScore}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-slate-700">{subscription.nextRenewalDate}</td>
                  <td className="py-3 pr-4">
                    <StatusPill tone={decisionTone(recommendation?.decision) as "neutral" | "success" | "warning" | "danger"}>
                      {recommendation ? t.values.decision[recommendation.decision] : t.values.pending}
                    </StatusPill>
                    {recommendation ? <p className="mt-1 max-w-xs text-xs text-slate-500">{localizeDisplayText(recommendation.reason, language)}</p> : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <form onSubmit={submit} className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <div className="mb-3 flex items-center gap-2">
          <Plus className="h-4 w-4 text-emerald-700" />
          <h3 className="text-sm font-semibold text-slate-950">{t.subscription.formTitle}</h3>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <div className="md:col-span-2">
            <FieldLabel>{t.subscription.fields.serviceName}</FieldLabel>
            <TextInput value={form.serviceName} onChange={(event) => setForm({ ...form, serviceName: event.target.value })} />
          </div>
          <div>
            <FieldLabel>{t.subscription.fields.category}</FieldLabel>
            <SelectInput value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value as SubscriptionCategory })}>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {t.values.category[category]}
                </option>
              ))}
            </SelectInput>
          </div>
          <div>
            <FieldLabel>{t.subscription.fields.amount}</FieldLabel>
            <TextInput type="number" min={0} value={form.amount} onChange={(event) => setForm({ ...form, amount: Number(event.target.value) })} />
          </div>
          <div>
            <FieldLabel>{t.subscription.fields.currency}</FieldLabel>
            <TextInput value={form.currency} onChange={(event) => setForm({ ...form, currency: event.target.value })} />
          </div>
          <div>
            <FieldLabel>{t.subscription.fields.cycle}</FieldLabel>
            <SelectInput
              value={form.billingCycle}
              onChange={(event) => setForm({ ...form, billingCycle: event.target.value as BillingCycle })}
            >
              <option value="monthly">{t.values.billingCycle.monthly}</option>
              <option value="yearly">{t.values.billingCycle.yearly}</option>
            </SelectInput>
          </div>
          <div>
            <FieldLabel>{t.subscription.fields.nextRenewal}</FieldLabel>
            <TextInput type="date" value={form.nextRenewalDate} onChange={(event) => setForm({ ...form, nextRenewalDate: event.target.value })} />
          </div>
          <div>
            <FieldLabel>{t.subscription.fields.usageScore}</FieldLabel>
            <TextInput
              type="number"
              min={0}
              max={100}
              value={form.usageScore}
              onChange={(event) => setForm({ ...form, usageScore: Number(event.target.value) })}
            />
          </div>
          <div className="md:col-span-4">
            <FieldLabel>{t.subscription.fields.notes}</FieldLabel>
            <TextInput value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <PrimaryButton type="submit">
            <Plus className="h-4 w-4" />
            {t.subscription.addButton}
          </PrimaryButton>
          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        </div>
      </form>
    </Panel>
  );
}
