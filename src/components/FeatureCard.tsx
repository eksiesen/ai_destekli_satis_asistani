import type { ReactNode } from 'react'

export type FeatureCardProps = {
  title: string
  description?: string
  icon: ReactNode
}

export function FeatureCard({ title, description, icon }: FeatureCardProps) {
  return (
    <article className="group flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-900/50 p-5 shadow-lg shadow-black/20 ring-1 ring-white/5 transition hover:border-emerald-500/30 hover:bg-slate-900/80 hover:ring-emerald-500/20">
      <div className="flex items-start gap-4">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20 transition group-hover:bg-emerald-500/15"
          aria-hidden
        >
          {icon}
        </div>
        <div className="min-w-0 text-left">
          <h2 className="text-sm font-semibold text-slate-100 sm:text-base">{title}</h2>
          {description ? (
            <p className="mt-1 text-xs leading-relaxed text-slate-500 sm:text-sm">{description}</p>
          ) : null}
        </div>
      </div>
    </article>
  )
}
