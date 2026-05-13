import { ANALYZE_QR_URL } from '../config/api';
import { parseAnalyzeApiResponse, type AnalyzeApiResponse } from '../types/analysis';

export async function postAnalyzeUrl(url: string): Promise<AnalyzeApiResponse> {
  const response = await fetch(ANALYZE_QR_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });

  const rawText = await response.text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText) as unknown;
  } catch {
    throw new Error(`Analyze URL: invalid JSON (${response.status})`);
  }

  if (!response.ok) {
    const err =
      parsed &&
      typeof parsed === 'object' &&
      'error' in parsed &&
      typeof (parsed as { error: unknown }).error === 'string'
        ? (parsed as { error: string }).error
        : `HTTP ${response.status}`;
    throw new Error(err);
  }

  return parseAnalyzeApiResponse(parsed);
}
