import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import type { ScamAnalysisResult } from '../types/analysis';

type Props = {
  result: ScamAnalysisResult;
};

type RiskVariant = 'high' | 'medium' | 'low';

function getRiskVariant(level: string): RiskVariant {
  if (level.includes('Yüksek')) return 'high';
  if (level.includes('Orta')) return 'medium';
  return 'low';
}

export function AnalysisResultCard({ result }: Props) {
  const variant = getRiskVariant(result.riskLevel);
  const score = Math.round(result.riskScore);
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

      <View style={styles.elderlyBox}>
        <View style={styles.elderlyHeader}>
          <Ionicons name="heart-outline" size={18} color={colors.elderlyAccent} />
          <Text style={styles.elderlyTitle}>Yaşlı Modu Açıklaması</Text>
        </View>
        <Text style={styles.elderlyBody}>{result.elderlyExplanation}</Text>
      </View>
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
