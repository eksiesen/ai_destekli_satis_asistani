export type AnalysisResult = {
  riskScore: number
  scamType: string
  riskLevel: string
  reasons: string[]
  elderlyExplanation: string
}

/** Demo kartı (RiskPreview) ile backend mock yanıtı için referans; App bu sabiti kullanmaz. */
export const MOCK_ANALYSIS_RESULT: AnalysisResult = {
  riskScore: 92,
  scamType: 'Phishing',
  riskLevel: 'Yüksek Risk',
  reasons: [
    'Aciliyet baskısı içeriyor',
    'Sahte bağlantı yönlendirmesi olabilir',
    'Resmi kurum taklidi yapıyor',
  ],
  elderlyExplanation:
    'Bu mesaj seni korkutup hızlıca işlem yaptırmaya çalışıyor olabilir. Linke tıklamadan önce güvendiğin bir aile bireyine danış.',
}
