"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { KeyRound, Plus } from "lucide-react";
import { DashboardShell } from "@/components/DashboardShell";
import { useLanguage } from "@/components/LanguageProvider";
import { FieldLabel, PrimaryButton, SecondaryButton, TextInput } from "@/components/ui";

interface Merchant {
  id: string;
  name: string;
  agentId?: string;
  webhookUrl?: string;
  status: string;
}

export function DevelopersPortalClient() {
  const { p } = useLanguage();
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [name, setName] = useState("Example Agent");
  const [agentId, setAgentId] = useState("research-agent");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [newKey, setNewKey] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const response = await fetch("/api/merchants");
    const payload = await response.json();
    if (response.ok) setMerchants(payload.merchants);
    else setError(payload.error || p.developers.signInError);
  }, [p.developers.signInError]);

  useEffect(() => {
    load();
  }, [load]);

  const createMerchant = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    const response = await fetch("/api/merchants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, agentId, webhookUrl })
    });
    const payload = await response.json();
    if (!response.ok) {
      setError(payload.error || p.developers.createMerchantFailed);
      return;
    }
    setMerchants([payload, ...merchants]);
  };

  const createKey = async (merchantId: string) => {
    const response = await fetch(`/api/merchants/${merchantId}/api-keys`, { method: "POST" });
    const payload = await response.json();
    if (!response.ok) {
      setError(payload.error || p.developers.createKeyFailed);
      return;
    }
    setNewKey(payload.apiKey);
  };

  return (
    <DashboardShell>
      <div className="space-y-5">
        <div className="border-b border-slate-200 pb-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">{p.developers.eyebrow}</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-950">{p.developers.title}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{p.developers.body}</p>
        </div>

        {error ? <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}
        {newKey ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <p className="font-semibold text-amber-950">{p.developers.newKey}</p>
            <p className="mt-2 break-all font-mono text-sm text-amber-950">{newKey}</p>
            <p className="mt-2 text-sm text-amber-900">{p.developers.keyWarning}</p>
          </div>
        ) : null}

        <section className="grid grid-cols-1 gap-5 xl:grid-cols-[420px_minmax(0,1fr)]">
          <form onSubmit={createMerchant} className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
            <h2 className="text-lg font-semibold text-slate-950">{p.developers.register}</h2>
            <div className="mt-4 space-y-3">
              <div>
                <FieldLabel>{p.developers.name}</FieldLabel>
                <TextInput value={name} onChange={(event) => setName(event.target.value)} />
              </div>
              <div>
                <FieldLabel>{p.developers.agentId}</FieldLabel>
                <TextInput value={agentId} onChange={(event) => setAgentId(event.target.value)} />
              </div>
              <div>
                <FieldLabel>{p.developers.webhookUrl}</FieldLabel>
                <TextInput value={webhookUrl} onChange={(event) => setWebhookUrl(event.target.value)} placeholder="https://merchant.example/webhooks/subguardian" />
              </div>
              <PrimaryButton type="submit">
                <Plus className="h-4 w-4" />
                {p.developers.createMerchant}
              </PrimaryButton>
            </div>
          </form>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
            <h2 className="text-lg font-semibold text-slate-950">{p.developers.registered}</h2>
            <div className="mt-4 space-y-3">
              {merchants.map((merchant) => (
                <div key={merchant.id} className="rounded-md border border-slate-200 p-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-950">{merchant.name}</p>
                      <p className="text-sm text-slate-500">{merchant.id}</p>
                      <p className="text-sm text-slate-500">agentId {merchant.agentId || p.common.notSet}</p>
                    </div>
                    <SecondaryButton type="button" onClick={() => createKey(merchant.id)}>
                      <KeyRound className="h-4 w-4" />
                      {p.developers.createApiKey}
                    </SecondaryButton>
                  </div>
                </div>
              ))}
              {!merchants.length ? <p className="text-sm text-slate-600">{p.developers.noMerchants}</p> : null}
            </div>
          </section>
        </section>
      </div>
    </DashboardShell>
  );
}
