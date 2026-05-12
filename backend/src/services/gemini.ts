import 'dotenv/config'
import { GoogleGenerativeAI } from '@google/generative-ai'

const MODEL_ID = 'gemini-2.5-flash'
const SCAM_ANALYSIS_MODEL_ID = 'gemini-2.5-flash'

const TEST_PROMPT = 'Reply with: AI Scam Shield connection successful'

const SCAM_ANALYSIS_PROMPT = `You are an expert fraud and scam analyst for "AI Scam Shield".

Analyze the attached image (SMS screenshot, email, payment or listing screen, QR-related UI, banking message, etc.) for:
- scam and phishing signals
- manipulation techniques (urgency, fear, fake authority, suspicious links or phone numbers, credential or payment requests)
- how a less tech-savvy or elderly person might be misled

You MUST reply with ONLY a single JSON object. No markdown, no prose, no code fences, no text before or after the JSON.

The JSON must match exactly this structure (all keys required):
{
  "riskScore": <number 0-100>,
  "riskLevel": "Düşük Risk" | "Orta Risk" | "Yüksek Risk",
  "scamType": "<short scam category label in Turkish>",
  "reasons": [<array of 3-6 concise strings in Turkish, each one concrete signal from the image>],
  "elderlyExplanation": "<2-4 short sentences in plain Turkish for elderly readers: what is risky and what to do instead (e.g. verify with family, do not click unknown links)>"
}

Strict rules:
- Output ONLY characters that form one valid JSON object parseable by JSON.parse.
- Do NOT wrap the JSON in \`\`\`json or \`\`\` or any other delimiters.
- riskLevel must be exactly one of: "Düşük Risk", "Orta Risk", "Yüksek Risk".
- reasons must be a non-empty array of strings.`

export type ScamAnalysisResult = {
  riskScore: number
  riskLevel: 'Düşük Risk' | 'Orta Risk' | 'Yüksek Risk'
  scamType: string
  reasons: string[]
  elderlyExplanation: string
}

function getApiKey(): string {
  const key = process.env.GEMINI_API_KEY?.trim()
  if (!key) {
    throw new Error('Missing GEMINI_API_KEY')
  }
  return key
}

function stripMarkdownJsonFences(text: string): string {
  const t = text.trim()
  const fenced = t.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fenced?.[1]) {
    return fenced[1].trim()
  }
  return t.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()
}

export async function testGeminiConnection(): Promise<string> {
  const genAI = new GoogleGenerativeAI(getApiKey())
  const model = genAI.getGenerativeModel({ model: MODEL_ID })
  const result = await model.generateContent(TEST_PROMPT)
  return result.response.text()
}

export async function analyzeScamImage(
  imageBuffer: Buffer,
  mimeType: string,
): Promise<ScamAnalysisResult> {
  const genAI = new GoogleGenerativeAI(getApiKey())
  const model = genAI.getGenerativeModel({ model: SCAM_ANALYSIS_MODEL_ID })

  const result = await model.generateContent([
    { text: SCAM_ANALYSIS_PROMPT },
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
    typeof o.elderlyExplanation !== 'string'
  ) {
    throw new Error('Invalid Gemini JSON response')
  }

  return {
    riskScore: o.riskScore,
    riskLevel: o.riskLevel as ScamAnalysisResult['riskLevel'],
    scamType: o.scamType,
    reasons: o.reasons as string[],
    elderlyExplanation: o.elderlyExplanation,
  }
}
