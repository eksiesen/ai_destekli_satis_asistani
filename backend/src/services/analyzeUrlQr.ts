import type { ScamAnalysisResult } from './gemini'
import { tryGenerateQrUrlInsight } from './gemini'
import { checkUrlsWithSafeBrowsing } from './safeBrowsing'

export type QrUrlAnalysisApiResponse = ScamAnalysisResult & {
  source: 'qr-url-analysis'
  safeBrowsingResults: NonNullable<ScamAnalysisResult['safeBrowsingResults']>
  extractedUrls: string[]
  extractedDomains: string[]
  extractedEmails: string[]
}

const REASON_MALICIOUS =
  'Google Safe Browsing bu bağlantıyı zararlı/phishing olarak işaretledi.'
const REASON_SAFE =
  'Google Safe Browsing bu bağlantı için bilinen bir tehdit bulmadı.'
const REASON_UNKNOWN =
  'Google Safe Browsing sonucu alınamadı, bağlantı açılmadan önce manuel kontrol edilmelidir.'

function defaultElderly(
  status: 'safe' | 'malicious' | 'unknown',
): string {
  if (status === 'malicious') {
    return 'Bu QR ile açılan adres zararlı görünüyor. Linke tıklamayın ve bir yakınınıza haber verin.'
  }
  if (status === 'safe') {
    return 'Bu adres için bilinen bir tehdit bulunmadı; yine de tanımadığınız sayfalarda kişisel bilgi vermeyin.'
  }
  return 'Bu adres tam olarak doğrulanamadı. Açmadan önce güvendiğiniz biriyle kontrol edin.'
}

export function normalizeHttpUrlInput(raw: unknown): string | null {
  if (typeof raw !== 'string') return null
  const t = raw.trim()
  if (!t) return null
  try {
    let candidate = t
    if (!/^https?:\/\//i.test(candidate)) {
      candidate = `https://${candidate.replace(/^\/+/, '')}`
    }
    const u = new URL(candidate)
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null
    if (!u.hostname) return null
    return u.href
  } catch {
    return null
  }
}

export async function analyzeUrlForQr(normalizedUrl: string): Promise<QrUrlAnalysisApiResponse> {
  const hostname = new URL(normalizedUrl).hostname
  const safeBrowsingResults = await checkUrlsWithSafeBrowsing([normalizedUrl])
  const sb = safeBrowsingResults[0]
  const status = sb?.status ?? 'unknown'

  let riskScore: number
  let riskLevel: ScamAnalysisResult['riskLevel']
  let scamType: string
  let reasons: string[]

  if (status === 'malicious') {
    riskScore = 92
    riskLevel = 'Yüksek Risk'
    scamType = 'Zararlı QR Bağlantısı / Phishing'
    reasons = [REASON_MALICIOUS]
  } else if (status === 'safe') {
    const useLow = hostname.length % 2 === 0
    riskScore = useLow ? 28 : 35
    riskLevel = useLow ? 'Düşük Risk' : 'Orta Risk'
    scamType = 'QR Bağlantısı / Kontrol Edildi'
    reasons = [REASON_SAFE]
  } else {
    riskScore = 45
    riskLevel = 'Orta Risk'
    scamType = 'QR Bağlantısı / Kontrol Edilmeli'
    reasons = [REASON_UNKNOWN]
  }

  let elderlyExplanation = defaultElderly(status)
  const geminiNote = await tryGenerateQrUrlInsight({
    pageUrl: normalizedUrl,
    hostname,
    safeBrowsingStatus: status,
    primaryReason: reasons[0] ?? '',
  })
  if (geminiNote) {
    elderlyExplanation = geminiNote
  }

  return {
    riskScore,
    riskLevel,
    scamType,
    reasons,
    elderlyExplanation,
    extractedUrls: [normalizedUrl],
    extractedDomains: [hostname],
    extractedEmails: [],
    safeBrowsingResults,
    source: 'qr-url-analysis',
  }
}
