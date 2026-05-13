import 'dotenv/config'

export type SafeBrowsingResult = {
  url: string
  status: 'safe' | 'malicious' | 'unknown'
  threatTypes: string[]
}

type ThreatMatch = {
  threatType?: string
  threat?: { url?: string }
}

type FindThreatMatchesResponse = {
  matches?: ThreatMatch[]
}

function applyMatchesToUrls(
  urls: string[],
  matches: ThreatMatch[] | undefined,
): SafeBrowsingResult[] {
  const maliciousByUrl = new Map<string, string[]>()

  for (const match of matches ?? []) {
    const matchedUrl = match.threat?.url
    const threatType = match.threatType
    if (!matchedUrl || !threatType) continue

    const existing = maliciousByUrl.get(matchedUrl)
    if (existing) {
      if (!existing.includes(threatType)) {
        existing.push(threatType)
      }
    } else {
      maliciousByUrl.set(matchedUrl, [threatType])
    }
  }

  return urls.map((url) => {
    const threatTypes = maliciousByUrl.get(url)
    if (threatTypes && threatTypes.length > 0) {
      return { url, status: 'malicious' as const, threatTypes }
    }
    return { url, status: 'safe' as const, threatTypes: [] }
  })
}

export async function checkUrlsWithSafeBrowsing(urls: string[]): Promise<SafeBrowsingResult[]> {
  if (urls.length === 0) {
    return []
  }

  const apiKey = process.env.SAFE_BROWSING_API_KEY?.trim()
  if (!apiKey) {
    console.warn('SAFE_BROWSING_API_KEY missing, returning unknown results')
    return urls.map((url) => ({
      url,
      status: 'unknown' as const,
      threatTypes: [],
    }))
  }

  const endpoint = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${encodeURIComponent(apiKey)}`

  const body = {
    client: {
      clientId: 'ai-scam-shield',
      clientVersion: '1.0.0',
    },
    threatInfo: {
      threatTypes: [
        'MALWARE',
        'SOCIAL_ENGINEERING',
        'UNWANTED_SOFTWARE',
        'POTENTIALLY_HARMFUL_APPLICATION',
      ],
      platformTypes: ['ANY_PLATFORM'],
      threatEntryTypes: ['URL'],
      threatEntries: urls.map((url) => ({ url })),
    },
  }

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`Safe Browsing HTTP ${res.status}: ${text}`)
    }

    const data = (await res.json()) as FindThreatMatchesResponse
    return applyMatchesToUrls(urls, data.matches)
  } catch (error) {
    console.error('Safe Browsing error:', error)
    return urls.map((url) => ({
      url,
      status: 'unknown' as const,
      threatTypes: [],
    }))
  }
}
