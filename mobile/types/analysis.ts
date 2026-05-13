export type SafeBrowsingResult = {
  url: string;
  status: 'safe' | 'malicious' | 'unknown';
  threatTypes: string[];
};

export type ScamAnalysisResult = {
  riskScore: number;
  riskLevel: string;
  scamType: string;
  reasons: string[];
  elderlyExplanation: string;
  extractedUrls?: string[];
  extractedDomains?: string[];
  extractedEmails?: string[];
  safeBrowsingResults?: SafeBrowsingResult[];
  /** Örn. qr-url-analysis */
  source?: string;
};

/** Backend: Gemini kota / rate limit (HTTP 200) */
export type QuotaExceededApiResponse = {
  quotaExceeded: true;
  message: string;
};

export type AnalyzeApiResponse = ScamAnalysisResult | QuotaExceededApiResponse;

export function isQuotaExceededResponse(
  r: AnalyzeApiResponse,
): r is QuotaExceededApiResponse {
  return 'quotaExceeded' in r && r.quotaExceeded === true;
}

function parseOptionalStringArray(value: unknown): string[] | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (
    !Array.isArray(value) ||
    !value.every((item) => typeof item === 'string')
  ) {
    throw new Error('Invalid response');
  }
  return value;
}

function parseSafeBrowsingResults(
  value: unknown,
): SafeBrowsingResult[] | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (!Array.isArray(value)) {
    throw new Error('Invalid response');
  }
  return value.map((item) => {
    if (!item || typeof item !== 'object') {
      throw new Error('Invalid response');
    }
    const o = item as Record<string, unknown>;
    if (typeof o.url !== 'string') {
      throw new Error('Invalid response');
    }
    if (
      o.status !== 'safe' &&
      o.status !== 'malicious' &&
      o.status !== 'unknown'
    ) {
      throw new Error('Invalid response');
    }
    if (
      !Array.isArray(o.threatTypes) ||
      !o.threatTypes.every((t) => typeof t === 'string')
    ) {
      throw new Error('Invalid response');
    }
    return {
      url: o.url,
      status: o.status,
      threatTypes: o.threatTypes,
    };
  });
}

export function parseAnalyzeApiResponse(data: unknown): AnalyzeApiResponse {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid response');
  }
  const o = data as Record<string, unknown>;
  if (o.quotaExceeded === true) {
    const fallback =
      'AI analiz servisi şu anda yoğun. Lütfen biraz sonra tekrar deneyin.';
    return {
      quotaExceeded: true,
      message: typeof o.message === 'string' ? o.message : fallback,
    };
  }
  return parseAnalysisResponse(data);
}

export function parseAnalysisResponse(data: unknown): ScamAnalysisResult {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid response');
  }
  const o = data as Record<string, unknown>;
  if (typeof o.riskScore !== 'number') {
    throw new Error('Invalid response');
  }
  if (typeof o.riskLevel !== 'string') {
    throw new Error('Invalid response');
  }
  if (typeof o.scamType !== 'string') {
    throw new Error('Invalid response');
  }
  if (
    !Array.isArray(o.reasons) ||
    !o.reasons.every((r) => typeof r === 'string')
  ) {
    throw new Error('Invalid response');
  }
  if (typeof o.elderlyExplanation !== 'string') {
    throw new Error('Invalid response');
  }
  const extractedUrls = parseOptionalStringArray(o.extractedUrls);
  const extractedDomains = parseOptionalStringArray(o.extractedDomains);
  const extractedEmails = parseOptionalStringArray(o.extractedEmails);
  const safeBrowsingResults = parseSafeBrowsingResults(o.safeBrowsingResults);
  if (o.source !== undefined && typeof o.source !== 'string') {
    throw new Error('Invalid response');
  }
  const source = typeof o.source === 'string' ? o.source : undefined;
  return {
    riskScore: o.riskScore,
    riskLevel: o.riskLevel,
    scamType: o.scamType,
    reasons: o.reasons,
    elderlyExplanation: o.elderlyExplanation,
    ...(extractedUrls !== undefined ? { extractedUrls } : {}),
    ...(extractedDomains !== undefined ? { extractedDomains } : {}),
    ...(extractedEmails !== undefined ? { extractedEmails } : {}),
    ...(safeBrowsingResults !== undefined ? { safeBrowsingResults } : {}),
    ...(source !== undefined ? { source } : {}),
  };
}
