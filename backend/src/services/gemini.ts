import 'dotenv/config'
import { GoogleGenerativeAI } from '@google/generative-ai'

import type { SafeBrowsingResult } from './safeBrowsing'

const MODEL_ID = 'gemini-2.5-flash'
const SCAM_ANALYSIS_MODEL_ID = 'gemini-2.5-flash'

const TEST_PROMPT = 'Reply with: AI Scam Shield connection successful'

const SCAM_ANALYSIS_PROMPT = `You are an expert fraud and scam analyst for "AI Scam Shield".

Analyze the attached image (SMS screenshot, email, payment or listing screen, QR-related UI, banking message, etc.) for:
- scam and phishing signals
- manipulation techniques (urgency, fear, fake authority, suspicious links or phone numbers, credential or payment requests)
- how a less tech-savvy or elderly person might be misled
- any visible URLs, domain/host names, and email addresses (copy them exactly as shown when readable)

Interpret any dates, deadlines, "son ödeme tarihi", billing periods, and "ileri tarih" ONLY relative to the CURRENT DATE line provided at the top of this prompt (Europe/Istanbul calendar day). A near-future payment due date, invoice date, or application date that is chronologically consistent with the current date is NOT by itself suspicious "future dating" and must NOT be treated as a scam signal on its own.

You MUST reply with ONLY a single JSON object. No markdown, no prose, no code fences, no text before or after the JSON.

The JSON must match exactly this structure (all keys required):
{
  "riskScore": <number 0-100>,
  "riskLevel": "Düşük Risk" | "Orta Risk" | "Yüksek Risk",
  "scamType": "<short scam category label in Turkish>",
  "reasons": [<array of 3-6 concise strings in Turkish, each one concrete signal from the image>],
  "elderlyExplanation": "<at most 2 short sentences in plain Turkish for elderly readers>",
  "extractedUrls": [<full URLs visible in the image, e.g. https://... or http://...>],
  "extractedDomains": [<domain or hostname strings visible without full URL, e.g. example.com or sub.example.co.uk>],
  "extractedEmails": [<email addresses visible in the image>]
}

Extraction rules:
- If the image shows full URLs (http/https or www…), put each distinct URL in extractedUrls (deduplicate).
- For host/domain text shown without a scheme, use extractedDomains (not duplicated as full URLs if already listed as URL).
- For email-like text (user@domain), use extractedEmails.
- If none are visible for a category, use an empty array [] for that category.

riskLevel MUST align with riskScore (use these bands consistently):
- riskScore 0–30 → riskLevel "Düşük Risk"
- riskScore 31–65 → riskLevel "Orta Risk"
- riskScore 66–100 → riskLevel "Yüksek Risk"

Balanced risk scoring (critical):

1) A link or URL alone is NOT a high-risk reason. The mere presence of a link must NEVER by itself push riskScore above 70. Do not give 90+ scores only because a link appears in an otherwise normal or trustworthy-looking message.

2) riskScore 90+ ONLY with very strong scam/phishing evidence visible in the image, such as: explicit requests for passwords, card numbers, Turkish national ID (T.C./kimlik), bank or sensitive personal data; payment, penalty/fine, or debt threats; urgent pressure to act immediately; impersonation of an institution with a fake login or landing page; or a domain that clearly mimics a real official domain. Also patterns equivalent to a known-malicious link ONLY if the screenshot clearly shows a phishing/credential-harvesting UI. Without such proof, keep riskScore below 90 (external URL reputation APIs are applied separately by the app—you must judge only the image).

3) If the sender or From domain looks reputable/trustworthy but the visible link targets a clearly different domain (sender vs link domain mismatch):
   - Usually "Orta Risk"; riskScore typically 40–65.
   - Prefer "should be verified / kontrol edilmeli" wording over claiming definite scam unless other strong signals exist.
   - When this mismatch is visible, include EXACTLY this sentence as one reason: "Gönderen domaini ile bağlantı domaini farklı, bu nedenle kontrol edilmeli"
   - Do NOT assign "Yüksek Risk" for mismatch alone.

4) If there is NO payment request, NO password/card/ID request, and NO urgent threat or coercion in the content:
   - riskScore must not exceed 70.
   - If the only notable issue is external links, prefer "Orta Risk" (scores usually in 31–65).

5) elderlyExplanation: max 2 short sentences; tone must match risk—avoid stating definite fraud when evidence is moderate; suggest caution and checking with someone trusted.

6) scamType and reasons must reflect only what is visible; do not exaggerate.

Legitimate invoices, subscriptions, banks, mobile operators, utilities, and official service screens:
- Phrases like login, verification, or "online işlem şifresi ile giriş" in a normal corporate bill/payment context are NOT standalone phishing proof (they describe standard customer flows).
- If the domain looks corporate/official, the payment/bill context is coherent, and there is no strong independent scam signal, keep riskScore at or below 70. Do NOT label as phishing in scamType without strong evidence.
- Do NOT assign "Yüksek Risk" only because: a link exists, a payment due date exists, the word "şifre" appears in a login instruction, or generic "fatura bilgisi" is shown.
- Typical genuine invoice/payment screens should usually fall in Düşük–Orta risk, not high, unless strong evidence exists.

Strong evidence required for "Yüksek Risk" / high scores (in addition to earlier rules), such as: clearly spoofed/fake domain vs brand name; obvious mismatch between claimed institution and URL; aggressive penalty/shutdown threats demanding immediate payment to unknown channels; explicit harvest of card numbers, full TC ID, or bank credentials; abnormal money transfer / IBAN to unrelated persons; or (when visually obvious) a phishing-style fake login—NOT routine operator login wording.

When uncertain but not proven as scam, prefer "Orta Risk" and cautious wording—never claim definitive fraud.

Strict rules:
- Output ONLY characters that form one valid JSON object parseable by JSON.parse.
- Do NOT wrap the JSON in \`\`\`json or \`\`\` or any other delimiters.
- riskLevel must be exactly one of: "Düşük Risk", "Orta Risk", "Yüksek Risk".
- reasons must be a non-empty array of strings.
- elderlyExplanation must be at most 2 short sentences.
- extractedUrls, extractedDomains, extractedEmails must each be an array (possibly empty) of strings.`

export type ScamAnalysisResult = {
  riskScore: number
  riskLevel: 'Düşük Risk' | 'Orta Risk' | 'Yüksek Risk'
  scamType: string
  reasons: string[]
  elderlyExplanation: string
  extractedUrls: string[]
  extractedDomains: string[]
  extractedEmails: string[]
  safeBrowsingResults?: SafeBrowsingResult[]
}

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((item) => typeof item === 'string')
}

function getApiKey(): string {
  const key = process.env.GEMINI_API_KEY?.trim()
  if (!key) {
    throw new Error('Missing GEMINI_API_KEY')
  }
  return key
}

export function getCurrentDateIsoIstanbul(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Istanbul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

function stripMarkdownJsonFences(text: string): string {
  const t = text.trim()
  const fenced = t.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fenced?.[1]) {
    return fenced[1].trim()
  }
  return t.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()
}

function safeJsonSnippet(obj: object): string {
  try {
    return JSON.stringify(obj)
  } catch {
    return ''
  }
}

/** Gemini / Google API kota veya rate limit (429, RESOURCE_EXHAUSTED, vb.) */
export function isGeminiQuotaOrRateLimitError(error: unknown): boolean {
  const nested = collectErrorProbeText(error).toLowerCase()
  if (nested.includes('429')) return true
  if (nested.includes('too many requests')) return true
  if (nested.includes('rate limit') || nested.includes('rate-limit')) return true
  if (nested.includes('quota exceeded') || nested.includes('exceeded quota')) return true
  if (nested.includes('quota') && nested.includes('exceed')) return true
  if (nested.includes('resource exhausted') || nested.includes('resource_exhausted')) return true

  if (error && typeof error === 'object') {
    const o = error as Record<string, unknown>
    if (o.status === 429 || o.code === 429) return true
    const inner = o.error
    if (inner && typeof inner === 'object') {
      const e = inner as Record<string, unknown>
      if (e.code === 429 || e.status === 'RESOURCE_EXHAUSTED') return true
    }
  }
  return false
}

function collectErrorProbeText(error: unknown): string {
  const parts: string[] = []
  let current: unknown = error
  let depth = 0
  while (current != null && depth < 12) {
    if (current instanceof Error) {
      parts.push(current.name, current.message)
    } else if (typeof current === 'object') {
      parts.push(safeJsonSnippet(current as object))
    } else {
      parts.push(String(current))
    }
    const next: unknown =
      current instanceof Error && current.cause != null
        ? current.cause
        : typeof current === 'object' &&
            current !== null &&
            'cause' in current &&
            (current as { cause: unknown }).cause != null
          ? (current as { cause: unknown }).cause
          : null
    if (next === current) break
    current = next
    depth += 1
  }
  return parts.join(' ')
}

export async function testGeminiConnection(): Promise<string> {
  const genAI = new GoogleGenerativeAI(getApiKey())
  const model = genAI.getGenerativeModel({ model: MODEL_ID })
  const result = await model.generateContent(TEST_PROMPT)
  return result.response.text()
}

/**
 * QR URL analizi için kısa Türkçe yorum; API anahtarı yoksa, kota/rate limit veya
 * diğer hatalarda null döner (çağıran taraf kural tabanlı metne düşer).
 */
export async function tryGenerateQrUrlInsight(params: {
  pageUrl: string
  hostname: string
  safeBrowsingStatus: 'safe' | 'malicious' | 'unknown'
  primaryReason: string
}): Promise<string | null> {
  try {
    const key = process.env.GEMINI_API_KEY?.trim()
    if (!key) return null

    const genAI = new GoogleGenerativeAI(key)
    const model = genAI.getGenerativeModel({ model: SCAM_ANALYSIS_MODEL_ID })
    const prompt = `Sen "AI Scam Shield" için Türkçe konuşan bir güvenlik asistanısın.

Kullanıcı bir QR kod okuttu ve şu web adresi çıktı:
- Tam URL: ${params.pageUrl}
- Domain (hostname): ${params.hostname}
- Google Safe Browsing özeti: ${params.safeBrowsingStatus}
- Sistem değerlendirmesi: ${params.primaryReason}

Görev: Yaşlı veya az deneyimli okuyucular için en fazla 2 kısa cümle yaz; sade Türkçe, net ve sakin bir ton kullan. Kesin suçlama yapma; Safe Browsing "safe" ise yine de temkinli olmayı hatırlat.

Kurallar:
- Sadece düz metin; markdown, JSON, liste veya kod bloğu kullanma.
- En fazla 2 kısa cümle.`

    const result = await model.generateContent(prompt)
    const text = result.response.text().trim()
    if (!text) return null
    return text.length > 600 ? text.slice(0, 600) : text
  } catch (error) {
    if (isGeminiQuotaOrRateLimitError(error)) {
      return null
    }
    console.warn('tryGenerateQrUrlInsight failed:', error)
    return null
  }
}

export async function analyzeScamImage(
  imageBuffer: Buffer,
  mimeType: string,
): Promise<ScamAnalysisResult> {
  const genAI = new GoogleGenerativeAI(getApiKey())
  const model = genAI.getGenerativeModel({ model: SCAM_ANALYSIS_MODEL_ID })

  const datePreamble = `Current date: ${getCurrentDateIsoIstanbul()}\n\n`

  const result = await model.generateContent([
    { text: datePreamble + SCAM_ANALYSIS_PROMPT },
    {
      inlineData: {
        mimeType,
        data: imageBuffer.toString('base64'),
      },
    },
  ])

  const rawText = result.response.text()
  const jsonText = stripMarkdownJsonFences(rawText)

  let parsed: unknown
  try {
    parsed = JSON.parse(jsonText)
  } catch {
    throw new Error('Invalid Gemini JSON response')
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Invalid Gemini JSON response')
  }

  const o = parsed as Record<string, unknown>
  const riskLevels = ['Düşük Risk', 'Orta Risk', 'Yüksek Risk'] as const
  const riskLevelOk =
    typeof o.riskLevel === 'string' && riskLevels.includes(o.riskLevel as (typeof riskLevels)[number])

  if (
    typeof o.riskScore !== 'number' ||
    !riskLevelOk ||
    typeof o.scamType !== 'string' ||
    !Array.isArray(o.reasons) ||
    o.reasons.length === 0 ||
    !o.reasons.every((r) => typeof r === 'string') ||
    typeof o.elderlyExplanation !== 'string' ||
    !isStringArray(o.extractedUrls) ||
    !isStringArray(o.extractedDomains) ||
    !isStringArray(o.extractedEmails)
  ) {
    throw new Error('Invalid Gemini JSON response')
  }

  return {
    riskScore: o.riskScore,
    riskLevel: o.riskLevel as ScamAnalysisResult['riskLevel'],
    scamType: o.scamType,
    reasons: o.reasons as string[],
    elderlyExplanation: o.elderlyExplanation,
    extractedUrls: o.extractedUrls,
    extractedDomains: o.extractedDomains,
    extractedEmails: o.extractedEmails,
  }
}
