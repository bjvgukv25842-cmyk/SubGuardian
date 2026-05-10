"use client";

import { Settings2 } from "lucide-react";
import { RenewalPolicy, RenewalDecision } from "@/lib/types";
import { FieldLabel, Panel, PanelHeader, SelectInput, TextInput } from "@/components/ui";
import { useLanguage } from "@/components/LanguageProvider";

export function PolicyPanel({ policy, onChange }: { policy: RenewalPolicy; onChange: (policy: RenewalPolicy) => void }) {
  const { t } = useLanguage();
  const update = <K extends keyof RenewalPolicy>(key: K, value: RenewalPolicy[K]) => {
    onChange({ ...policy, [key]: value });
  };

  return (
    <Panel>
      <PanelHeader title={t.policy.title} eyebrow={t.policy.eyebrow} action={<Settings2 className="h-5 w-5 text-slate-500" />} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <FieldLabel>{t.policy.monthlyBudget}</FieldLabel>
          <TextInput
            type="number"
            min={0}
            value={policy.monthlyBudget}
            onChange={(event) => update("monthlyBudget", Number(event.target.value))}
          />
        </div>
        <div>
          <FieldLabel>{t.policy.priceIncreaseLimit}</FieldLabel>
          <TextInput
            type="number"
            min={0}
            value={policy.priceIncreaseLimit}
            onChange={(event) => update("priceIncreaseLimit", Number(event.target.value))}
          />
        </div>
        <div>
          <FieldLabel>{t.policy.manualApprovalAbove}</FieldLabel>
          <TextInput
            type="number"
            min={0}
            value={policy.manualApprovalAbove ?? policy.requireManualApprovalAbove}
            onChange={(event) => {
              const value = Number(event.target.value);
              onChange({ ...policy, manualApprovalAbove: value, requireManualApprovalAbove: value });
            }}
          />
        </div>
        <div>
          <FieldLabel>{t.policy.autoApproveBelow}</FieldLabel>
          <TextInput
            type="number"
            min={0}
            value={policy.autoApproveBelow ?? 10}
            onChange={(event) => update("autoApproveBelow", Number(event.target.value))}
          />
        </div>
        <div>
          <FieldLabel>{t.policy.maxSingleSpend}</FieldLabel>
          <TextInput
            type="number"
            min={0}
            value={policy.maxSingleSpend ?? 100}
            onChange={(event) => update("maxSingleSpend", Number(event.target.value))}
          />
        </div>
        <div>
          <FieldLabel>{t.policy.renewalCooldownDays}</FieldLabel>
          <TextInput
            type="number"
            min={0}
            value={policy.renewalCooldownDays ?? 7}
            onChange={(event) => update("renewalCooldownDays", Number(event.target.value))}
          />
        </div>
        <div>
          <FieldLabel>{t.policy.defaultAction}</FieldLabel>
          <SelectInput value={policy.defaultAction} onChange={(event) => update("defaultAction", event.target.value as RenewalDecision)}>
            <option value="ask_user">{t.values.decisionOption.ask_user}</option>
            <option value="pause">{t.values.decisionOption.pause}</option>
            <option value="renew">{t.values.decisionOption.renew}</option>
          </SelectInput>
        </div>
        <label className="flex items-center gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-medium text-slate-700 sm:col-span-2">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 text-emerald-600"
            checked={policy.allowAutoRenewForHighUsage}
            onChange={(event) => update("allowAutoRenewForHighUsage", event.target.checked)}
          />
          {t.policy.allowAutoRenew}
        </label>
        <label className="flex items-center gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-medium text-slate-700 sm:col-span-2">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 text-emerald-600"
            checked={policy.requireApprovalForUnknownService ?? true}
            onChange={(event) => update("requireApprovalForUnknownService", event.target.checked)}
          />
          {t.policy.requireApprovalForUnknown}
        </label>
        <div className="sm:col-span-2">
          <FieldLabel>{t.policy.trustedServices}</FieldLabel>
          <TextInput
            value={(policy.trustedServices || []).join(", ")}
            onChange={(event) => update("trustedServices", splitServices(event.target.value))}
          />
        </div>
        <div className="sm:col-span-2">
          <FieldLabel>{t.policy.blockedServices}</FieldLabel>
          <TextInput
            value={(policy.blockedServices || []).join(", ")}
            onChange={(event) => update("blockedServices", splitServices(event.target.value))}
          />
        </div>
      </div>
    </Panel>
  );
}

function splitServices(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}
