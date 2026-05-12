export function Header() {
  return (
    <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400/20 to-cyan-400/20 ring-1 ring-white/10"
              aria-hidden
            >
              <svg
                className="h-6 w-6 text-emerald-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
                />
              </svg>
            </span>
            <div className="text-left">
              <p className="text-xs font-medium uppercase tracking-widest text-emerald-400/90">
                Hackathon Demo
              </p>
              <h1 className="bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-2xl font-semibold tracking-tight text-transparent sm:text-3xl">
                AI Scam Shield
              </h1>
            </div>
          </div>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
            Statik arayüz
          </span>
        </div>
        <p className="max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg">
          Yapay zekâ destekli dijital dolandırıcılık kalkanı
        </p>
      </div>
    </header>
  )
}
