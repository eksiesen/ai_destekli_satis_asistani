import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import type { ScamAnalysisResult } from '../types/analysis';

type Props = {
  result: ScamAnalysisResult;
  /** Normal modda kapalı; varsayılan false */
  showElderlyExplanation?: boolean;
};

type RiskVariant = 'high' | 'medium' | 'low';

function getRiskVariant(level: string): RiskVariant {
  if (level.includes('Yüksek')) return 'high';
  if (level.includes('Orta')) return 'medium';
  return 'low';
}

export function AnalysisResultCard({
  result,
  showElderlyExplanation = false,
}: Props) {
  const variant = getRiskVariant(result.riskLevel);
  const score = Math.round(result.riskScore);
  const extractedUrls = result.extractedUrls ?? [];
  const extractedDomains = result.extractedDomains ?? [];
  const extractedEmails = result.extractedEmails ?? [];
  const safeBrowsingResults = result.safeBrowsingResults ?? [];
  const hasMaliciousUrl = safeBrowsingResults.some(
    (r) => r.status === 'malicious',
  );
  const hasExtractedLinks =
    extractedUrls.length > 0 ||
    extractedDomains.length > 0 ||
    extractedEmails.length > 0;
  const scoreHeroStyle = [
    styles.scoreHero,
    variant === 'high' && styles.scoreHeroHigh,
    variant === 'medium' && styles.scoreHeroMedium,
    variant === 'low' && styles.scoreHeroLow,
  ];
  const levelBadgeStyle = [
    styles.levelBadge,
    variant === 'high' && styles.levelBadgeHigh,
    variant === 'medium' && styles.levelBadgeMedium,
    variant === 'low' && styles.levelBadgeLow,
  ];

  return (
    <View style={styles.outer}>
      <View style={styles.cardHeader}>
        <View style={styles.headerIconWrap}>
          <Ionicons name="shield-checkmark" size={22} color={colors.accent} />
        </View>
        <View>
          <Text style={styles.cardTitle}>Analiz özeti</Text>
          <Text style={styles.cardSubtitle}>Yapay zekâ değerlendirmesi</Text>
        </View>
      </View>

      {hasMaliciousUrl ? (
        <View style={styles.safeBrowsingWarning}>
          <Ionicons name="warning" size={22} color={colors.danger} />
          <Text style={styles.safeBrowsingWarningText}>
            Bu içerikte Google Safe Browsing tarafından zararlı olarak işaretlenen
            bağlantılar bulundu.
          </Text>
        </View>
      ) : null}

      <View style={scoreHeroStyle}>
        <Text style={styles.scoreLabel}>Risk Skoru</Text>
        <Text
          style={[
            styles.scoreValue,
            variant === 'high' && styles.scoreValueHigh,
            variant === 'medium' && styles.scoreValueMedium,
            variant === 'low' && styles.scoreValueLow,
          ]}
        >
          %{score}
        </Text>
        <View style={styles.scoreBarTrack}>
          <View
            style={[
              styles.scoreBarFill,
              { width: `${Math.min(100, Math.max(0, score))}%` },
              variant === 'high' && styles.scoreBarFillHigh,
              variant === 'medium' && styles.scoreBarFillMedium,
              variant === 'low' && styles.scoreBarFillLow,
            ]}
          />
        </View>
      </View>

      <View style={styles.fieldBlock}>
        <Text style={styles.fieldLabel}>Risk Seviyesi</Text>
        <View style={levelBadgeStyle}>
          <Text
            style={[
              styles.levelBadgeText,
              variant === 'high' && styles.levelBadgeTextHigh,
              variant === 'medium' && styles.levelBadgeTextMedium,
              variant === 'low' && styles.levelBadgeTextLow,
            ]}
          >
            {result.riskLevel}
          </Text>
        </View>
      </View>

      <View style={styles.fieldBlock}>
        <Text style={styles.fieldLabel}>Scam Türü</Text>
        <Text style={styles.fieldValueStrong}>{result.scamType}</Text>
      </View>

      {hasExtractedLinks ? (
        <View style={styles.linksSection}>
          <Text style={styles.sectionHeading}>Tespit Edilen Bağlantılar</Text>
          {extractedUrls.length > 0 ? (
            <View style={styles.linkGroup}>
              <Text style={styles.linkSubheading}>URL</Text>
              {extractedUrls.map((url, i) => (
                <Text
                  key={`url-${i}`}
                  style={styles.linkLine}
                  selectable
                >
                  {url}
                </Text>
              ))}
            </View>
          ) : null}
          {extractedDomains.length > 0 ? (
            <View style={styles.linkGroup}>
              <Text style={styles.linkSubheading}>Domain</Text>
              {extractedDomains.map((domain, i) => (
                <Text
                  key={`domain-${i}`}
                  style={styles.linkLine}
                  selectable
                >
                  {domain}
                </Text>
              ))}
            </View>
          ) : null}
          {extractedEmails.length > 0 ? (
            <View style={[styles.linkGroup, styles.linkGroupLast]}>
              <Text style={styles.linkSubheading}>E-posta</Text>
              {extractedEmails.map((email, i) => (
                <Text
                  key={`email-${i}`}
                  style={styles.linkLine}
                  selectable
                >
                  {email}
                </Text>
              ))}
            </View>
          ) : null}
        </View>
      ) : null}

      {safeBrowsingResults.length > 0 ? (
        <View style={styles.safeBrowsingSection}>
          <Text style={styles.sectionHeading}>Bağlantı Güvenlik Kontrolü</Text>
          {safeBrowsingResults.map((row, i) => (
            <View
              key={`sb-${i}-${row.url}`}
              style={[
                styles.safeBrowsingRow,
                i === safeBrowsingResults.length - 1 && styles.safeBrowsingRowLast,
              ]}
            >
              <Text style={styles.safeBrowsingUrl} selectable numberOfLines={3}>
                {row.url}
              </Text>
              <View style={styles.safeBrowsingMeta}>
                {row.status === 'safe' ? (
                  <View style={[styles.sbBadge, styles.sbBadgeSafe]}>
                    <Text style={[styles.sbBadgeText, styles.sbBadgeTextSafe]}>
                      Güvenli
                    </Text>
                  </View>
                ) : null}
                {row.status === 'malicious' ? (
                  <View style={[styles.sbBadge, styles.sbBadgeMalicious]}>
                    <Text
                      style={[styles.sbBadgeText, styles.sbBadgeTextMalicious]}
                    >
                      Zararlı
                    </Text>
                  </View>
                ) : null}
                {row.status === 'unknown' ? (
                  <View style={[styles.sbBadge, styles.sbBadgeUnknown]}>
                    <Text
                      style={[styles.sbBadgeText, styles.sbBadgeTextUnknown]}
                    >
                      Bilinmiyor
                    </Text>
                  </View>
                ) : null}
                {row.threatTypes.length > 0 ? (
                  <Text style={styles.sbThreatTypes} selectable>
                    {row.threatTypes.join('\n')}
                  </Text>
                ) : null}
              </View>
            </View>
          ))}
        </View>
      ) : null}

      <View style={styles.reasonsSection}>
        <Text style={styles.sectionHeading}>Risk Sebepleri</Text>
        <View style={styles.reasonList}>
          {result.reasons.map((reason, i) => (
            <View key={`reason-${i}`} style={styles.reasonRow}>
              <View style={styles.reasonBullet}>
                <View style={styles.reasonDot} />
              </View>
              <Text style={styles.reasonText}>{reason}</Text>
            </View>
          ))}
        </View>
      </View>

      {showElderlyExplanation ? (
        <View style={styles.elderlyBox}>
          <View style={styles.elderlyHeader}>
            <Ionicons name="heart-outline" size={18} color={colors.elderlyAccent} />
            <Text style={styles.elderlyTitle}>Yaşlı Modu Açıklaması</Text>
          </View>
          <Text style={styles.elderlyBody}>{result.elderlyExplanation}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    alignSelf: 'stretch',
    marginTop: 20,
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 18,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  headerIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  cardSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  scoreHero: {
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginBottom: 18,
    alignItems: 'center',
  },
  scoreHeroHigh: {
    backgroundColor: colors.riskHighSurface,
    borderWidth: 1,
    borderColor: colors.riskHighBorder,
  },
  scoreHeroMedium: {
    backgroundColor: colors.riskMediumSurface,
    borderWidth: 1,
    borderColor: colors.riskMediumBorder,
  },
  scoreHeroLow: {
    backgroundColor: colors.riskLowSurface,
    borderWidth: 1,
    borderColor: colors.riskLowBorder,
  },
  scoreLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 56,
    fontWeight: '800',
    letterSpacing: -2,
    lineHeight: 62,
  },
  scoreValueHigh: {
    color: colors.riskHighMuted,
  },
  scoreValueMedium: {
    color: colors.riskMediumText,
  },
  scoreValueLow: {
    color: colors.riskLowBorder,
  },
  scoreBarTrack: {
    alignSelf: 'stretch',
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffffff14',
    marginTop: 14,
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  scoreBarFillHigh: {
    backgroundColor: '#fb7185',
  },
  scoreBarFillMedium: {
    backgroundColor: '#fbbf24',
  },
  scoreBarFillLow: {
    backgroundColor: '#34d399',
  },
  fieldBlock: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  fieldValueStrong: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    lineHeight: 22,
  },
  levelBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  levelBadgeHigh: {
    backgroundColor: colors.riskHighGlow,
    borderColor: colors.riskHighBorder,
  },
  levelBadgeMedium: {
    backgroundColor: '#fbbf2422',
    borderColor: colors.riskMediumBorder,
  },
  levelBadgeLow: {
    backgroundColor: '#34d39922',
    borderColor: colors.riskLowBorder,
  },
  levelBadgeText: {
    fontSize: 15,
    fontWeight: '700',
  },
  levelBadgeTextHigh: {
    color: colors.riskHighMuted,
  },
  levelBadgeTextMedium: {
    color: colors.riskMediumText,
  },
  levelBadgeTextLow: {
    color: colors.riskLowBorder,
  },
  safeBrowsingWarning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 18,
    padding: 14,
    borderRadius: 14,
    backgroundColor: colors.riskHighSurface,
    borderWidth: 1,
    borderColor: colors.riskHighBorder,
  },
  safeBrowsingWarningText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '600',
    color: colors.riskHighMuted,
  },
  linksSection: {
    marginBottom: 18,
  },
  safeBrowsingSection: {
    marginBottom: 18,
  },
  safeBrowsingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  safeBrowsingRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  safeBrowsingUrl: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  safeBrowsingMeta: {
    alignItems: 'flex-end',
    gap: 6,
    maxWidth: '42%',
  },
  sbBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  sbBadgeSafe: {
    backgroundColor: '#34d39922',
    borderColor: colors.riskLowBorder,
  },
  sbBadgeMalicious: {
    backgroundColor: colors.riskHighGlow,
    borderColor: colors.riskHighBorder,
  },
  sbBadgeUnknown: {
    backgroundColor: '#fbbf2418',
    borderColor: '#78716c',
  },
  sbBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  sbBadgeTextSafe: {
    color: colors.riskLowBorder,
  },
  sbBadgeTextMalicious: {
    color: colors.riskHighMuted,
  },
  sbBadgeTextUnknown: {
    color: '#a8a29e',
  },
  sbThreatTypes: {
    fontSize: 10,
    lineHeight: 14,
    color: colors.textMuted,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
  linkGroup: {
    marginBottom: 14,
  },
  linkGroupLast: {
    marginBottom: 0,
  },
  linkSubheading: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  linkLine: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.accent,
    marginBottom: 6,
  },
  reasonsSection: {
    marginBottom: 18,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 12,
  },
  reasonList: {
    gap: 12,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  reasonBullet: {
    paddingTop: 8,
  },
  reasonDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
  reasonText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 24,
    color: colors.textSecondary,
  },
  elderlyBox: {
    backgroundColor: colors.elderlySurface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.elderlyBorder,
    padding: 16,
  },
  elderlyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  elderlyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.elderlyAccent,
    letterSpacing: 0.2,
  },
  elderlyBody: {
    fontSize: 15,
    lineHeight: 24,
    color: colors.textPrimary,
  },
});
