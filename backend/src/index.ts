import 'dotenv/config'
import cors from 'cors'
import express, { type Request, type Response } from 'express'
import multer from 'multer'
import { analyzeScamImage, testGeminiConnection } from './services/gemini'

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
    console.error("Gemini test error:", error)
    console.error("Gemini test error details:", error)
    if (error instanceof Error) {
      console.error("Gemini error message:", error.message)
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
      console.log("Gemini scam analysis completed")
      res.json(analysis)
    } catch (error) {
      console.error("Gemini analysis error:", error)
      res.status(500).json({
        error: 'AI analysis failed',
      })
    }
  },
)

app.listen(port, () => {
  console.log(`AI Scam Shield backend listening on http://localhost:${port}`)
})
