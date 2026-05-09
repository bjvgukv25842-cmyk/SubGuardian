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
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t.analysis.risk}</p>
              <p className="mt-1 text-lg font-bold text-slate-950">{t.values.riskLevel[analysis.overallRisk]}</p>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t.analysis.budgetStatus}</p>
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
                <p className="mt-2 text-xs font-medium text-slate-500">
                  {t.analysis.riskSaving
                    .replace("{score}", String(recommendation.riskScore))
                    .replace("{saving}", formatMoney(recommendation.estimatedMonthlySaving))}
                </p>
              </div>
            ))}
          </div>
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
