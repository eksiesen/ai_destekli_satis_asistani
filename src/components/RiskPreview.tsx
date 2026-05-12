import { MOCK_ANALYSIS_RESULT, type AnalysisResult } from '../types/analysis'

export type RiskPreviewProps = {
  analysisResult: AnalysisResult | null
}

function ReasonList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((reason) => (
        <li
          key={reason}
          className="flex items-start gap-2 rounded-lg bg-black/25 px-3 py-2 text-slate-200 ring-1 ring-white/5"
        >
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" aria-hidden />
          <span>{reason}</span>
        </li>
      ))}
    </ul>
  )
}

export function RiskPreview({ analysisResult }: RiskPreviewProps) {
  const isDemo = analysisResult === null
  const riskScore = analysisResult?.riskScore ?? MOCK_ANALYSIS_RESULT.riskScore
  const scamType = analysisResult?.scamType ?? MOCK_ANALYSIS_RESULT.scamType
  const riskLevel = analysisResult?.riskLevel
  const reasons = analysisResult?.reasons ?? MOCK_ANALYSIS_RESULT.reasons
  const elderlyExplanation = analysisResult?.elderlyExplanation

  return (
    <aside className="w-full shrink-0 lg:w-[340px]">
      <div className="sticky top-6 rounded-2xl border border-rose-500/25 bg-gradient-to-b from-rose-950/50 to-slate-900/80 p-6 shadow-xl shadow-rose-950/20 ring-1 ring-rose-500/10">
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-rose-200/90">
            {isDemo ? 'Örnek risk özeti' : 'Analiz sonucu'}
          </h2>
          <span className="rounded-full bg-rose-500/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-rose-300">
            {isDemo ? 'Demo' : 'Mock'}
          </span>
        </div>

        <dl className="space-y-5 text-sm">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Risk Skoru</dt>
            <dd className="mt-1 text-4xl font-bold tabular-nums tracking-tight text-rose-400 sm:text-5xl">
              %{riskScore}
            </dd>
          </div>

          {!isDemo && riskLevel ? (
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Risk Seviyesi</dt>
              <dd className="mt-1 text-base font-semibold text-amber-200">{riskLevel}</dd>
            </div>
          ) : null}

          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Scam Türü</dt>
            <dd className="mt-1 text-lg font-semibold text-slate-100">{scamType}</dd>
          </div>

          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Risk Sebepleri</dt>
            <dd className="mt-2">
              <ReasonList items={reasons} />
            </dd>
          </div>

          {!isDemo && elderlyExplanation ? (
            <div className="border-t border-white/10 pt-4">
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Yaşlı modu özeti</dt>
              <dd className="mt-2 rounded-lg bg-emerald-950/40 px-3 py-3 text-sm leading-relaxed text-emerald-100/95 ring-1 ring-emerald-500/20">
                {elderlyExplanation}
              </dd>
            </div>
          ) : null}
        </dl>
      </div>
    </aside>
  )
}
