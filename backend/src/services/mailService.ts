import 'dotenv/config'
import nodemailer from 'nodemailer'

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function assertSmtpEnvConfigured(): void {
  const host = process.env.SMTP_HOST?.trim() ?? ''
  const portRaw = process.env.SMTP_PORT?.trim() ?? ''
  const user = process.env.SMTP_USER?.trim() ?? ''
  const pass = process.env.SMTP_PASS?.trim() ?? ''
  if (host === '' || portRaw === '' || user === '' || pass === '') {
    throw new Error('Missing SMTP configuration')
  }
  const portNum = Number(portRaw)
  if (!Number.isFinite(portNum) || portNum <= 0) {
    throw new Error('Missing SMTP configuration')
  }
}

function getFromDisplayName(): string {
  const fromNameRaw = process.env.SMTP_FROM_NAME?.trim()
  return fromNameRaw != null && fromNameRaw !== ''
    ? fromNameRaw
    : 'AI Scam Shield'
}

function buildFamilyAlertHtml(params: {
  userFullName: string
  riskScore: number
  riskLevel: string
  scamType: string
  reasons: string[]
  analyzedUrl?: string
  elderlyExplanation?: string
}): string {
  const reasonsItems =
    params.reasons.length > 0
      ? `<ul>${params.reasons.map((r) => `<li>${escapeHtml(r)}</li>`).join('')}</ul>`
      : `<p>${escapeHtml('—')}</p>`

  const urlTrimmed = params.analyzedUrl?.trim() ?? ''
  const urlBlock =
    urlTrimmed !== ''
      ? `<p><strong>Analiz edilen bağlantı</strong><br/><a href="${escapeHtml(urlTrimmed)}">${escapeHtml(urlTrimmed)}</a></p>`
      : ''

  const elderlyTrimmed = params.elderlyExplanation?.trim() ?? ''
  const elderlyBlock =
    elderlyTrimmed !== ''
      ? `<p><strong>Yaşlı modu özeti</strong><br/>${escapeHtml(elderlyTrimmed)}</p>`
      : ''

  return `
<!DOCTYPE html>
<html lang="tr">
<head><meta charset="utf-8" /></head>
<body style="font-family: system-ui, sans-serif; line-height: 1.5; color: #0f172a;">
  <h1 style="font-size: 1.25rem;">Yakınınız için güvenlik uyarısı</h1>
  <p>AI Scam Shield, kayıtlı yakınınız adına aşağıdaki risk bilgisini paylaşmanız için bu e-postayı gönderdi.</p>
  <table style="border-collapse: collapse; margin: 1rem 0;">
    <tr><td style="padding: 4px 12px 4px 0;"><strong>Kullanıcı adı</strong></td><td>${escapeHtml(params.userFullName)}</td></tr>
    <tr><td style="padding: 4px 12px 4px 0;"><strong>Risk skoru</strong></td><td>${escapeHtml(String(params.riskScore))}</td></tr>
    <tr><td style="padding: 4px 12px 4px 0;"><strong>Risk seviyesi</strong></td><td>${escapeHtml(params.riskLevel)}</td></tr>
    <tr><td style="padding: 4px 12px 4px 0;"><strong>Scam türü</strong></td><td>${escapeHtml(params.scamType)}</td></tr>
  </table>
  <p><strong>Risk sebepleri</strong></p>
  ${reasonsItems}
  ${urlBlock}
  ${elderlyBlock}
  <p style="margin-top: 1.5rem; font-size: 0.875rem; color: #64748b;">Bu mesaj otomatik olarak gönderilmiştir.</p>
</body>
</html>
`.trim()
}

export async function sendFamilyAlertEmail(params: {
  to: string
  userFullName: string
  riskScore: number
  riskLevel: string
  scamType: string
  reasons: string[]
  analyzedUrl?: string
  elderlyExplanation?: string
}): Promise<void> {
  assertSmtpEnvConfigured()

  const secure = process.env.SMTP_SECURE === "true"

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    requireTLS: !secure,
    connectionTimeout: 60000,
    greetingTimeout: 60000,
    socketTimeout: 60000,
  })

  const fromName = getFromDisplayName()
  const safeFromName = fromName.replace(/"/g, "'")
  const smtpUser = process.env.SMTP_USER as string
  const fromHeader = `"${safeFromName}" <${smtpUser}>`
  const subject = 'AI Scam Shield - Güvenlik Uyarısı'
  const html = buildFamilyAlertHtml(params)

  try {
    await transporter.verify()
    console.log("SMTP transporter verified")

    await transporter.sendMail({
      from: fromHeader,
      to: params.to,
      subject,
      html,
    })
    console.log(`Family alert email sent to: ${params.to}`)
  } catch (error) {
    console.error('Family alert email failed:', error)
    throw error
  }
}
