"use client";

import { BrainCircuit, Loader2 } from "lucide-react";
import { AnalysisResult } from "@/lib/types";
import { Panel, PanelHeader, PrimaryButton, StatusPill } from "@/components/ui";
import { decisionTone, formatMoney } from "@/lib/utils";
import { useLanguage } from "@/components/LanguageProvider";
import { localizeDisplayText } from "@/lib/i18n";

export function AnalysisPanel({
  analysis,
  loading,
  error,
  onAnalyze
}: {
  analysis: AnalysisResult | null;
  loading: boolean;
  error: string;
  onAnalyze: () => void;
}) {
  const { language, t } = useLanguage();

  return (
    <Panel>
      <PanelHeader
        title={t.analysis.title}
        eyebrow={t.analysis.eyebrow}
        action={
          <PrimaryButton type="button" onClick={onAnalyze} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <BrainCircuit className="h-4 w-4" />}
            {t.analysis.analyzeButton}
          </PrimaryButton>
        }
      />
      {error ? <p className="mb-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}
      {analysis ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t.analysis.renewalRisk}</p>
              <p className="mt-1 text-lg font-bold text-slate-950">{t.values.riskLevel[analysis.overallRisk]}</p>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t.analysis.budgetPressure}</p>
              <p className="mt-1 text-lg font-bold text-slate-950">{t.values.budgetStatus[analysis.budgetStatus]}</p>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t.analysis.tee}</p>
              <p className="mt-1">
                <StatusPill tone={analysis.teeVerified ? "success" : "warning"}>
                  {analysis.teeVerified ? t.analysis.verified : t.analysis.notVerified}
                </StatusPill>
              </p>
            </div>
          </div>
          <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">{t.analysis.preSpendResult}</p>
            <p className="mt-1 text-sm text-emerald-900">{t.analysis.preSpendBody}</p>
          </div>
          <p className="text-sm text-slate-700">{localizeDisplayText(analysis.summary, language)}</p>
          <div className="space-y-2">
            {analysis.recommendations.map((recommendation) => (
              <div key={recommendation.serviceName} className="rounded-md border border-slate-200 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-slate-950">{recommendation.serviceName}</p>
                  <StatusPill tone={decisionTone(recommendation.decision) as "neutral" | "success" | "warning" | "danger"}>
                    {t.values.decision[recommendation.decision]}
                  </StatusPill>
                </div>
                <p className="mt-1 text-sm text-slate-600">{localizeDisplayText(recommendation.reason, language)}</p>
                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-4">
                  <MiniMetric label={t.analysis.renewalRisk} value={`${recommendation.riskScore}/100`} />
                  <MiniMetric
                    label={t.analysis.budgetPressure}
                    value={t.values.budgetStatus[recommendation.budgetPressure || analysis.budgetStatus]}
                  />
                  <MiniMetric label={t.analysis.estimatedSaving} value={formatMoney(recommendation.estimatedMonthlySaving)} />
                  <MiniMetric
                    label={t.analysis.approval}
                    value={recommendation.requiresUserApproval ? t.analysis.approvalRequired : t.analysis.approvalNotRequired}
                  />
                </div>
                {recommendation.nextAction ? (
                  <p className="mt-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600">
                    {t.analysis.nextAction}: {localizeDisplayText(recommendation.nextAction, language)}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
          {analysis.nextActions.length ? (
            <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t.analysis.nextActions}</p>
              <ul className="mt-2 space-y-1 text-sm text-slate-700">
                {analysis.nextActions.map((action) => (
                  <li key={action}>{localizeDisplayText(action, language)}</li>
                ))}
              </ul>
            </div>
          ) : null}
          <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t.analysis.traceId}</p>
            <p className="mt-1 break-all font-mono text-xs text-slate-700">{analysis.traceId}</p>
          </div>
        </div>
      ) : (
        <p className="text-sm text-slate-600">{t.analysis.empty}</p>
      )}
    </Panel>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 break-words text-xs font-semibold text-slate-800">{value}</p>
    </div>
  );
}
