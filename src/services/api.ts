import type { AnalysisResult } from '../types/analysis'

const ANALYZE_URL = 'http://localhost:5000/api/analyze'

export class AnalyzeApiError extends Error {
  status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.name = 'AnalyzeApiError'
    this.status = status
  }
}

function isAnalysisResult(data: unknown): data is AnalysisResult {
  if (!data || typeof data !== 'object') return false
  const o = data as Record<string, unknown>
  return (
    typeof o.riskScore === 'number' &&
    typeof o.scamType === 'string' &&
    typeof o.riskLevel === 'string' &&
    Array.isArray(o.reasons) &&
    o.reasons.every((r) => typeof r === 'string') &&
    typeof o.elderlyExplanation === 'string'
  )
}

export async function analyzeFile(file: File): Promise<AnalysisResult> {
  const formData = new FormData()
  formData.append('file', file)

  let response: Response
  try {
    response = await fetch(ANALYZE_URL, {
      method: 'POST',
      body: formData,
    })
  } catch {
    throw new AnalyzeApiError(
      "Sunucuya bağlanılamadı. Bağlantını ve backend'in çalıştığını kontrol et.",
    )
  }

  const rawText = await response.text()
  let parsed: unknown
  try {
    parsed = rawText ? JSON.parse(rawText) : null
  } catch {
    throw new AnalyzeApiError(`Sunucu yanıtı okunamadı (HTTP ${response.status}).`)
  }

  if (!response.ok) {
    const serverError =
      parsed &&
      typeof parsed === 'object' &&
      'error' in parsed &&
      typeof (parsed as { error: unknown }).error === 'string'
        ? (parsed as { error: string }).error
        : null
    const detail = serverError ?? `HTTP ${response.status}`
    throw new AnalyzeApiError(`Analiz isteği başarısız: ${detail}`, response.status)
  }

  if (!isAnalysisResult(parsed)) {
    throw new AnalyzeApiError('Sunucu yanıtı beklenen analiz formatında değil.')
  }

  return parsed
}
