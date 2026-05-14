import type { ScamAnalysisResult } from '../types/analysis';

export function shouldShowFamilyAlert(result: ScamAnalysisResult): boolean {
  if (result.riskLevel === 'Yüksek Risk') {
    return true;
  }
  const rows = result.safeBrowsingResults ?? [];
  return rows.some((r) => r.status === 'malicious');
}
