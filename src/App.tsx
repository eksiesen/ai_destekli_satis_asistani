import { useCallback, useState } from 'react'
import { FeatureCard } from './components/FeatureCard'
import { Header } from './components/Header'
import { RiskPreview } from './components/RiskPreview'
import { UploadBox } from './components/UploadBox'
import { analyzeFile } from './services/api'
import type { AnalysisResult } from './types/analysis'

const features = [
  {
    title: 'SMS Analizi',
    description: 'Kısa mesajlarda dolandırıcılık kalıplarını işaretler.',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"
        />
      </svg>
    ),
  },
  {
    title: 'E-posta Analizi',
    description: 'Başlık, gönderen ve bağlantı ipuçlarını özetler.',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
        />
      </svg>
    ),
  },
  {
    title: 'QR Kod Kontrolü',
    description: 'Yönlendirilen adresin risk sinyallerini gösterir.',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.725c.621 0 1.125.504 1.125 1.125v4.725c0 .621-.504 1.125-1.125 1.125H4.875A1.125 1.125 0 0 1 3.75 9.6V4.875ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.725c.621 0 1.125.504 1.125 1.125v4.725c0 .621-.504 1.125-1.125 1.125H4.875a1.125 1.125 0 0 1-1.125-1.125v-4.725ZM14.625 3.75c0-.621.504-1.125 1.125-1.125h4.725c.621 0 1.125.504 1.125 1.125v4.725c0 .621-.504 1.125-1.125 1.125h-4.725A1.125 1.125 0 0 1 14.625 9.6V4.875Z"
        />
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 15.75h3m-3 3h3m-6-6h.008v.008H11.25V15.75Z" />
      </svg>
    ),
  },
  {
    title: 'İlan / Ödeme Ekranı Analizi',
    description: 'Ekran görüntüsündeki ödeme ve kimlik taleplerini vurgular.',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m0 0H21"
        />
      </svg>
    ),
  },
  {
    title: 'Yaşlı Modu',
    description: 'Daha büyük yazı ve sade uyarılarla güvenli kullanım.',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
        />
      </svg>
    ),
  },
  {
    title: 'Aile Bildirimi',
    description: 'Şüpheli içerik yakalandığında yakınlara haber verir.',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M18 18.72a9.09 9.09 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.645-5.896-1.747.884-2.59 3.356-4.45 6.296-4.45 1.531 0 2.966.524 4.096 1.478"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
        />
      </svg>
    ),
  },
] as const

const ANALYZE_USER_ERROR =
  'Analiz sırasında bir hata oluştu. Lütfen tekrar deneyin.'

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [analyzeError, setAnalyzeError] = useState<string | null>(null)

  const handleFileChange = useCallback((file: File | null) => {
    setSelectedFile(file)
    setAnalysisResult(null)
    setAnalyzeError(null)
  }, [])

  const handleAnalyze = useCallback(async () => {
    if (!selectedFile || isAnalyzing) return
    setAnalyzeError(null)
    setIsAnalyzing(true)
    try {
      const result = await analyzeFile(selectedFile)
      setAnalysisResult(result)
    } catch {
      setAnalyzeError(ANALYZE_USER_ERROR)
    } finally {
      setIsAnalyzing(false)
    }
  }, [selectedFile, isAnalyzing])

  return (
    <div className="min-h-dvh bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-slate-100">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 top-0 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -right-32 top-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-64 w-[120%] -translate-x-1/2 bg-gradient-to-t from-slate-950 to-transparent" />
      </div>

      <div className="relative">
        <Header />

        <main className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8 lg:pb-20 lg:pt-10">
          <section aria-labelledby="features-heading">
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 id="features-heading" className="text-lg font-semibold text-slate-100 sm:text-xl">
                  Koruma modülleri
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Aile ve bireyler için çok kanallı dolandırıcılık kalkanı (demo).
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {features.map((f) => (
                <FeatureCard key={f.title} title={f.title} description={f.description} icon={f.icon} />
              ))}
            </div>
          </section>

          <section
            className="mt-10 lg:mt-14"
            aria-labelledby="workspace-heading"
          >
            <h2 id="workspace-heading" className="sr-only">
              Analiz çalışma alanı
            </h2>
            <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch lg:gap-8">
              <UploadBox
                selectedFile={selectedFile}
                onFileChange={handleFileChange}
                isAnalyzing={isAnalyzing}
                onAnalyze={handleAnalyze}
                errorMessage={analyzeError}
              />
              <RiskPreview analysisResult={analysisResult} />
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

export default App
