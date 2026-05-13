import type { SafeBrowsingResult } from './safeBrowsing'
import type { ScamAnalysisResult } from './gemini'

const WEAK_REASON_PATTERNS: RegExp[] = [
  /son\s*ödeme\s*tarihi.*ileri|ileri\s*tarih/i,
  /online\s*işlem\s*şifresi|şifre\s*ile\s*giriş|işlem\s*şifresi\s*ile/i,
  /link\s*bulunuyor|bağlantı\s*bulunuyor|link\s*var/i,
  /fatura\s*bilgisi\s*var/i,
]

function reasonMatchesWeakPattern(reason: string): boolean {
  const t = reason.trim()
  if (!t) return false
  return WEAK_REASON_PATTERNS.some((re) => re.test(t))
}

/**
 * Removes Gemini reasons that are misleading as standalone high-risk signals.
 * Ensures at least one reason remains (neutral fallback).
 */
export function filterWeakMisleadingReasons(reasons: string[]): string[] {
  const filtered = reasons.filter((r) => !reasonMatchesWeakPattern(r))
  if (filtered.length > 0) {
    return filtered
  }
  return [
    'Görüntülenen içerik kurumsal fatura veya bilgilendirme ekranına benzeyebilir; yine de bağlantıları resmi kanallardan doğrulayın.',
  ]
}

function hostnameFromUrl(url: string): string | null {
  try {
    const u = new URL(url.startsWith('http') ? url : `https://${url}`)
    return u.hostname.toLowerCase()
  } catch {
    return null
  }
}

function domainEndsWithComTr(domain: string): boolean {
  const d = domain.trim().toLowerCase().replace(/^www\./, '')
  return d.endsWith('.com.tr')
}

export function hasTurkishCorporateComTrDomain(
  extractedDomains: string[],
  extractedUrls: string[],
): boolean {
  if (extractedDomains.some(domainEndsWithComTr)) {
    return true
  }
  for (const url of extractedUrls) {
    const host = hostnameFromUrl(url)
    if (host && domainEndsWithComTr(host)) {
      return true
    }
  }
  return false
}

function billOrInfoContextBlob(
  scamType: string,
  reasons: string[],
  elderlyExplanation: string,
): string {
  return `${scamType}\n${reasons.join('\n')}\n${elderlyExplanation}`.toLowerCase()
}

const BILL_CONTEXT_KEYWORDS = [
  'fatura',
  'ödeme',
  'abonelik',
  'kurumsal',
  'bilgilendirme',
  'tahakkuk',
  'borç',
  'senet',
  'telekom',
  'turkcell',
  'vodafone',
  'operatör',
  'banka',
  'elektrik',
  'doğalgaz',
  'hesap özet',
  'online işlem',
]

export function looksLikeBillPaymentOrCorporateInfo(textBlob: string): boolean {
  return BILL_CONTEXT_KEYWORDS.some((k) => textBlob.includes(k))
}

export function reasonsAreOnlyWeak(reasons: string[]): boolean {
  if (reasons.length === 0) return false
  return reasons.every(reasonMatchesWeakPattern)
}

export type CorporateCapInput = {
  safeBrowsingResults: SafeBrowsingResult[] | undefined
  extractedDomains: string[]
  extractedUrls: string[]
  scamType: string
  reasonsOriginal: string[]
  elderlyExplanation: string
}

export function shouldApplyCorporateTrustCap(input: CorporateCapInput): boolean {
  const malicious =
    input.safeBrowsingResults?.some((r) => r.status === 'malicious') ?? false
  if (malicious) return false

  if (!hasTurkishCorporateComTrDomain(input.extractedDomains, input.extractedUrls)) {
    return false
  }

  const blob = billOrInfoContextBlob(
    input.scamType,
    input.reasonsOriginal,
    input.elderlyExplanation,
  )
  if (!looksLikeBillPaymentOrCorporateInfo(blob)) {
    return false
  }

  if (!reasonsAreOnlyWeak(input.reasonsOriginal)) {
    return false
  }

  return true
}

/** Caps score and forces Orta Risk band alignment when corporate-trust rule fires */
export function applyCorporateTrustCap(
  riskScore: number,
): { riskScore: number; riskLevel: ScamAnalysisResult['riskLevel'] } {
  const capped = Math.min(Math.round(riskScore), 65)
  return {
    riskScore: capped,
    riskLevel: syncRiskLevelFromScore(capped),
  }
}

export function syncRiskLevelFromScore(
  riskScore: number,
): ScamAnalysisResult['riskLevel'] {
  const s = Math.max(0, Math.min(100, Math.round(riskScore)))
  if (s <= 30) return 'Düşük Risk'
  if (s <= 65) return 'Orta Risk'
  return 'Yüksek Risk'
}

export function adjustScamTypeForBalancedAnalysis(
  scamType: string,
  riskLevel: ScamAnalysisResult['riskLevel'],
  hasMaliciousUrl: boolean,
): string {
  if (hasMaliciousUrl) return scamType
  if (riskLevel === 'Yüksek Risk') return scamType

  const looksPhishing =
    /phishing|kimlik\s*avı|kimlik avı|sahte\s*kurum|dolandırıcılık/i.test(scamType)

  if (
    /fatura|ödeme|abonelik|kurumsal\s*bildirim|bilgilendirme/i.test(scamType) &&
    !looksPhishing
  ) {
    return 'Fatura Bilgilendirmesi / Düşük-Orta Risk'
  }

  if (looksPhishing) {
    return 'Kurumsal Bildirim / Kontrol Edilmeli'
  }

  return 'Kurumsal Bildirim / Kontrol Edilmeli'
}
