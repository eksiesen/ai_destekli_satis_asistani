export type ScamAnalysisResult = {
  riskScore: number;
  riskLevel: string;
  scamType: string;
  reasons: string[];
  elderlyExplanation: string;
};

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
  return {
    riskScore: o.riskScore,
    riskLevel: o.riskLevel,
    scamType: o.scamType,
    reasons: o.reasons,
    elderlyExplanation: o.elderlyExplanation,
  };
}
