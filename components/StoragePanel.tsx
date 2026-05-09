"use client";

import { DatabaseZap, Loader2 } from "lucide-react";
import { StorageUploadResult } from "@/lib/types";
import { Panel, PanelHeader, PrimaryButton, StatusPill } from "@/components/ui";
import { useLanguage } from "@/components/LanguageProvider";

export function StoragePanel({
  result,
  loading,
  error,
  onUpload
}: {
  result: StorageUploadResult | null;
  loading: boolean;
  error: string;
  onUpload: () => void;
}) {
  const { t } = useLanguage();

  return (
    <Panel>
      <PanelHeader
        title={t.storage.title}
        eyebrow={t.storage.eyebrow}
        action={
          <PrimaryButton type="button" onClick={onUpload} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <DatabaseZap className="h-4 w-4" />}
            {t.storage.uploadButton}
          </PrimaryButton>
        }
      />
      {error ? <p className="mb-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}
      {result ? (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <StatusPill tone={result.encrypted ? "success" : "danger"}>{t.storage.encrypted}</StatusPill>
            <StatusPill tone={result.mockMode ? "warning" : "success"}>{result.mockMode ? t.storage.mockMode : t.storage.liveMode}</StatusPill>
          </div>
          <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t.storage.storageRootHash}</p>
            <p className="mt-1 break-all font-mono text-xs text-slate-800">{result.storageRootHash}</p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-md border border-slate-200 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t.storage.payloadSize}</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {result.payloadSize} {t.storage.bytes}
              </p>
            </div>
            <div className="rounded-md border border-slate-200 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t.storage.algorithm}</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{result.encryption.algorithm}</p>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-slate-600">{t.storage.empty}</p>
      )}
    </Panel>
  );
}
