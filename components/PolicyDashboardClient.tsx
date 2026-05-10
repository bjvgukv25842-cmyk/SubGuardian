"use client";

import { useEffect, useState } from "react";
import { PauseCircle, Save, ShieldCheck } from "lucide-react";
import { DashboardShell } from "@/components/DashboardShell";
import { useLanguage } from "@/components/LanguageProvider";
import { FieldLabel, PrimaryButton, SelectInput, StatusPill, TextInput } from "@/components/ui";

interface PolicyState {
  monthlyBudget: number;
  manualApprovalAbove: number;
  autoApproveBelow: number;
  maxSingleSpend: number;
  dailyLimit: number;
  weeklyLimit: number;
  monthlyLimit: number;
  unknownServiceAction: string;
  defaultAction: string;
  trustedServices: string[];
  blockedServices: string[];
  emergencyPauseAll: boolean;
  agentPolicies: Record<string, unknown>;
  merchantPolicies: Record<string, unknown>;
}

export function PolicyDashboardClient() {
  const { p } = useLanguage();
  const [policy, setPolicy] = useState<PolicyState | null>(null);
  const [trustedServices, setTrustedServices] = useState("");
  const [blockedServices, setBlockedServices] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/user/policy")
      .then((response) => response.json().then((payload) => ({ response, payload })))
      .then(({ response, payload }) => {
        if (!response.ok) throw new Error(payload.error || p.policy.loadFailed);
        setPolicy(payload.policy);
        setTrustedServices(payload.policy.trustedServices.join(", "));
        setBlockedServices(payload.policy.blockedServices.join(", "));
      })
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : p.policy.loadFailed));
  }, [p.policy.loadFailed]);

  const save = async () => {
    if (!policy) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const nextPolicy = {
        ...policy,
        trustedServices: trustedServices.split(",").map((item) => item.trim()).filter(Boolean),
        blockedServices: blockedServices.split(",").map((item) => item.trim()).filter(Boolean)
      };
      const response = await fetch("/api/user/policy", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ policy: nextPolicy })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || p.policy.saveFailed);
      setPolicy(payload.policy);
      setMessage(`${p.policy.saved} policyHash ${payload.policyHash}`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : p.policy.saveFailed);
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardShell>
      <section className="space-y-5">
        <div className="border-b border-slate-200 pb-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">{p.policy.eyebrow}</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-950">{p.policy.title}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{p.policy.body}</p>
        </div>

        {error ? <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}
        {message ? <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{message}</p> : null}

        {policy ? (
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <NumberField label={p.policy.fields.monthlyBudget} value={policy.monthlyBudget} onChange={(value) => setPolicy({ ...policy, monthlyBudget: value, monthlyLimit: value })} />
                <NumberField label={p.policy.fields.singleSpendCap} value={policy.maxSingleSpend} onChange={(value) => setPolicy({ ...policy, maxSingleSpend: value })} />
                <NumberField label={p.policy.fields.manualApprovalAbove} value={policy.manualApprovalAbove} onChange={(value) => setPolicy({ ...policy, manualApprovalAbove: value })} />
                <NumberField label={p.policy.fields.autoAllowBelow} value={policy.autoApproveBelow} onChange={(value) => setPolicy({ ...policy, autoApproveBelow: value })} />
                <NumberField label={p.policy.fields.dailyLimit} value={policy.dailyLimit} onChange={(value) => setPolicy({ ...policy, dailyLimit: value })} />
                <NumberField label={p.policy.fields.weeklyLimit} value={policy.weeklyLimit} onChange={(value) => setPolicy({ ...policy, weeklyLimit: value })} />
                <NumberField label={p.policy.fields.monthlyLimit} value={policy.monthlyLimit} onChange={(value) => setPolicy({ ...policy, monthlyLimit: value })} />
                <div>
                  <FieldLabel>{p.policy.fields.unknownServiceDefault}</FieldLabel>
                  <SelectInput value={policy.unknownServiceAction} onChange={(event) => setPolicy({ ...policy, unknownServiceAction: event.target.value })}>
                    <option value="ask_user">ask_user</option>
                    <option value="pause">pause</option>
                    <option value="reject">reject</option>
                    <option value="allow">allow</option>
                  </SelectInput>
                </div>
                <div>
                  <FieldLabel>{p.policy.fields.policyDefault}</FieldLabel>
                  <SelectInput value={policy.defaultAction} onChange={(event) => setPolicy({ ...policy, defaultAction: event.target.value })}>
                    <option value="ask_user">ask_user</option>
                    <option value="pause">pause</option>
                    <option value="reject">reject</option>
                    <option value="allow">allow</option>
                  </SelectInput>
                </div>
                <div className="md:col-span-2">
                  <FieldLabel>{p.policy.fields.whitelist}</FieldLabel>
                  <TextInput value={trustedServices} onChange={(event) => setTrustedServices(event.target.value)} />
                </div>
                <div className="md:col-span-2">
                  <FieldLabel>{p.policy.fields.blacklist}</FieldLabel>
                  <TextInput value={blockedServices} onChange={(event) => setBlockedServices(event.target.value)} />
                </div>
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <PrimaryButton type="button" onClick={save} disabled={saving}>
                  <Save className="h-4 w-4" />
                  {saving ? p.policy.saving : p.policy.save}
                </PrimaryButton>
                <button
                  type="button"
                  onClick={() => setPolicy({ ...policy, emergencyPauseAll: !policy.emergencyPauseAll })}
                  className="inline-flex min-h-10 items-center gap-2 rounded-md border border-amber-300 bg-amber-50 px-4 text-sm font-semibold text-amber-900"
                >
                  <PauseCircle className="h-4 w-4" />
                  {policy.emergencyPauseAll ? p.policy.disablePause : p.policy.enablePause}
                </button>
              </div>
            </section>

            <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-700" />
                <h2 className="text-lg font-semibold text-slate-950">{p.policy.stateTitle}</h2>
              </div>
              <div className="mt-4 space-y-3">
                <StatusPill tone={policy.emergencyPauseAll ? "warning" : "success"}>
                  {policy.emergencyPauseAll ? p.policy.pauseEnabled : p.policy.normalAuthorization}
                </StatusPill>
                <p className="text-sm leading-6 text-slate-600">{p.policy.stateBody}</p>
                <p className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                  {p.policy.smartAccountNote}
                </p>
              </div>
            </aside>
          </div>
        ) : null}
      </section>
    </DashboardShell>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <TextInput type="number" min={0} step="0.01" value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </div>
  );
}
