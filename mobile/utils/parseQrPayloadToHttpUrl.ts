/**
 * QR içeriğinden http(s) URL üretir; geçerli bir bağlantı yoksa null.
 * (Backend `normalizeHttpUrlInput` ile aynı mantık.)
 */
export function parseQrPayloadToHttpUrl(raw: string): string | null {
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
