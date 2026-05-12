import { useEffect, useId, useRef, useState, type ChangeEventHandler } from 'react'

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp'] as const
const ACCEPT_ATTR = ACCEPTED_TYPES.join(',')

export type UploadBoxProps = {
  selectedFile: File | null
  onFileChange: (file: File | null) => void
  isAnalyzing: boolean
  onAnalyze: () => void
  /** Gösterildiğinde kırmızı uyarı kutusu */
  errorMessage?: string | null
}

function isAcceptedImage(file: File): boolean {
  return (ACCEPTED_TYPES as readonly string[]).includes(file.type)
}

export function UploadBox({
  selectedFile,
  onFileChange,
  isAnalyzing,
  onAnalyze,
  errorMessage,
}: UploadBoxProps) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!selectedFile || !isAcceptedImage(selectedFile)) {
      setPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(selectedFile)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [selectedFile])

  const handleInputChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0] ?? null
    if (!file) {
      onFileChange(null)
      return
    }
    if (!isAcceptedImage(file)) {
      e.target.value = ''
      onFileChange(null)
      return
    }
    onFileChange(file)
  }

  const clearSelection = () => {
    onFileChange(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  const canAnalyze = Boolean(selectedFile) && !isAnalyzing

  return (
    <section
      className="flex min-h-[280px] flex-1 flex-col rounded-2xl border-2 border-dashed border-white/15 bg-slate-900/40 p-6 ring-1 ring-white/5 sm:min-h-[320px] sm:p-8 lg:min-h-0"
      aria-label="Dosya yükleme ve analiz (demo)"
    >
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={ACCEPT_ATTR}
        className="sr-only"
        onChange={handleInputChange}
        disabled={isAnalyzing}
      />

      <div className="flex flex-1 flex-col gap-6">
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <label
            htmlFor={inputId}
            className={`flex w-full max-w-md cursor-pointer flex-col items-center gap-4 rounded-xl transition ${
              isAnalyzing ? 'pointer-events-none opacity-60' : 'hover:opacity-95'
            }`}
          >
            <div className="rounded-2xl bg-emerald-500/10 p-4 ring-1 ring-emerald-500/25">
              <svg
                className="h-10 w-10 text-emerald-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.25}
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                />
              </svg>
            </div>
            <div className="max-w-md space-y-2">
              <p className="text-base font-medium text-slate-100 sm:text-lg">
                Şüpheli SMS, e-posta, QR veya ödeme ekranı görselini yükle
              </p>
              <p className="text-sm text-slate-500">
                Görsel seç; ardından backend analizi için &quot;Analiz Et&quot;e bas (sunucu{' '}
                <code className="rounded bg-white/10 px-1 py-0.5 text-xs text-slate-300">localhost:5000</code>
                ).
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
              <span className="rounded-md bg-white/5 px-2 py-1 ring-1 ring-white/10">PNG</span>
              <span className="rounded-md bg-white/5 px-2 py-1 ring-1 ring-white/10">JPEG</span>
              <span className="rounded-md bg-white/5 px-2 py-1 ring-1 ring-white/10">WebP</span>
            </div>
          </label>

          {selectedFile ? (
            <div className="w-full max-w-md space-y-3 text-left">
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm">
                <span className="min-w-0 flex-1 truncate font-medium text-slate-200" title={selectedFile.name}>
                  {selectedFile.name}
                </span>
                <button
                  type="button"
                  onClick={clearSelection}
                  disabled={isAnalyzing}
                  className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-slate-400 underline-offset-2 hover:text-slate-200 hover:underline disabled:pointer-events-none disabled:opacity-50"
                >
                  Kaldır
                </button>
              </div>
              {previewUrl ? (
                <div className="overflow-hidden rounded-xl border border-white/10 bg-black/30 ring-1 ring-white/5">
                  <img
                    src={previewUrl}
                    alt={`Seçilen dosya önizlemesi: ${selectedFile.name}`}
                    className="mx-auto max-h-48 w-full object-contain"
                  />
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        {errorMessage ? (
          <div
            role="alert"
            className="rounded-xl border border-rose-500/40 bg-rose-950/50 px-4 py-3 text-sm text-rose-100 ring-1 ring-rose-500/20"
          >
            {errorMessage}
          </div>
        ) : null}

        <div className="flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-center text-xs text-slate-500 sm:text-left">
            {isAnalyzing ? (
              <span className="inline-flex items-center gap-2 font-medium text-emerald-400/90">
                <span
                  className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-emerald-400/30 border-t-emerald-400"
                  aria-hidden
                />
                Analiz ediliyor...
              </span>
            ) : (
              'Dosya seçildikten sonra analiz başlatılabilir.'
            )}
          </p>
          <button
            type="button"
            onClick={onAnalyze}
            disabled={!canAnalyze}
            aria-busy={isAnalyzing}
            className={`w-full shrink-0 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-900/30 transition hover:from-emerald-400 hover:to-cyan-400 sm:w-auto ${
              isAnalyzing
                ? 'cursor-wait opacity-95'
                : 'disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none'
            }`}
          >
            {isAnalyzing ? 'Analiz ediliyor...' : 'Analiz Et'}
          </button>
        </div>
      </div>
    </section>
  )
}
