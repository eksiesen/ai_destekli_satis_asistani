import 'dotenv/config'
import cors from 'cors'
import express, { type Request, type Response } from 'express'
import multer from 'multer'
import {
  adjustScamTypeForBalancedAnalysis,
  applyCorporateTrustCap,
  filterWeakMisleadingReasons,
  shouldApplyCorporateTrustCap,
  syncRiskLevelFromScore,
} from './services/analysisPostProcess'
import {
  analyzeScamImage,
  isGeminiQuotaOrRateLimitError,
  testGeminiConnection,
} from './services/gemini'
import { checkUrlsWithSafeBrowsing } from './services/safeBrowsing'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
})

const app = express()
const port = Number(process.env.PORT) || 5000

app.use(cors())
app.use(express.json())

app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'AI Scam Shield Backend',
  })
})

app.get('/api/test-gemini', async (_req: Request, res: Response) => {
  try {
    await testGeminiConnection()
    res.json({
      success: true,
      message: 'AI Scam Shield connection successful',
    })
  } catch (error) {
    console.error('Gemini test error:', error)
    console.error('Gemini test error details:', error)
    if (error instanceof Error) {
      console.error('Gemini error message:', error.message)
    }
    res.status(500).json({
      success: false,
      error: 'Gemini connection failed',
    })
  }
})

app.post(
  '/api/analyze',
  upload.single('file'),
  async (req: Request, res: Response) => {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' })
      return
    }
    try {
      const analysis = await analyzeScamImage(req.file.buffer, req.file.mimetype)
      console.log('Gemini scam analysis completed')

      const analysisResult = { ...analysis }
      let reasons = filterWeakMisleadingReasons([...analysis.reasons])

      const extractedUrls = analysisResult.extractedUrls ?? []
      if (extractedUrls.length > 0) {
        analysisResult.safeBrowsingResults =
          await checkUrlsWithSafeBrowsing(extractedUrls)
      }

      const maliciousCount =
        analysisResult.safeBrowsingResults?.filter((r) => r.status === 'malicious')
          .length ?? 0

      let riskScore = analysisResult.riskScore
      let riskLevel = analysisResult.riskLevel

      if (maliciousCount >= 1) {
        riskLevel = 'Yüksek Risk'
        if (maliciousCount >= 2) {
          riskScore = Math.max(riskScore, 95)
        } else {
          riskScore = Math.max(riskScore, 85)
        }
        const safeBrowsingReason =
          'Google Safe Browsing sistemi bu bağlantıyı zararlı/phishing olarak işaretledi.'
        if (!reasons.includes(safeBrowsingReason)) {
          reasons.push(safeBrowsingReason)
        }
      } else if (
        shouldApplyCorporateTrustCap({
          safeBrowsingResults: analysisResult.safeBrowsingResults,
          extractedDomains: analysisResult.extractedDomains,
          extractedUrls: analysisResult.extractedUrls,
          scamType: analysis.scamType,
          reasonsOriginal: analysis.reasons,
          elderlyExplanation: analysisResult.elderlyExplanation,
        })
      ) {
        const capped = applyCorporateTrustCap(riskScore)
        riskScore = capped.riskScore
        riskLevel = capped.riskLevel
      }

      riskLevel = syncRiskLevelFromScore(riskScore)

      const scamTypeAdjusted = adjustScamTypeForBalancedAnalysis(
        analysisResult.scamType,
        riskLevel,
        maliciousCount >= 1,
      )

      res.json({
        ...analysisResult,
        riskScore,
        riskLevel,
        reasons,
        scamType: scamTypeAdjusted,
      })
    } catch (error) {
      if (isGeminiQuotaOrRateLimitError(error)) {
        res.status(200).json({
          quotaExceeded: true,
          message:
            'AI analiz servisi şu anda yoğun. Lütfen biraz sonra tekrar deneyin.',
        })
        return
      }
      console.error('Gemini analysis error:', error)
      res.status(500).json({
        error: 'AI analysis failed',
      })
    }
  },
)

app.listen(port, () => {
  console.log(`AI Scam Shield backend listening on http://localhost:${port}`)
})
