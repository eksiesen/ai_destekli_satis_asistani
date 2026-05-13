import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import type { ScamAnalysisResult } from '../types/analysis';

type Props = {
  result: ScamAnalysisResult;
};

type ElderlyVariant = 'high' | 'medium' | 'low';

function getVariant(level: string): ElderlyVariant {
  if (level.includes('Yüksek')) return 'high';
  if (level.includes('Orta')) return 'medium';
  return 'low';
}

function getContent(result: ScamAnalysisResult): {
  title: string;
  message: string;
  variant: ElderlyVariant;
  emoji: string;
} {
  const variant = getVariant(result.riskLevel);

  if (variant === 'high') {
    const fallback =
      'Bu içerik seni kandırmaya çalışıyor olabilir. Linke tıklama ve bir aile bireyine danış.';
    const msg = result.elderlyExplanation?.trim()
      ? result.elderlyExplanation
      : fallback;
    return {
      title: 'Bu sayfa güvenli görünmüyor',
      message: msg,
      variant: 'high',
      emoji: '⚠️',
    };
  }

  if (variant === 'medium') {
    return {
      title: 'Bu içerik şüpheli olabilir',
      message: 'Devam etmeden önce güvendiğin bir kişiye danış.',
      variant: 'medium',
      emoji: '🟡',
    };
  }

  return {
    title: 'Ciddi bir risk bulunmadı',
    message: 'Yine de kişisel bilgilerini paylaşmadan önce dikkatli ol.',
    variant: 'low',
    emoji: '✅',
  };
}

export function ElderlyModeResultCard({ result }: Props) {
  const { title, message, variant, emoji } = getContent(result);

  const shellStyle = [
    styles.shell,
    variant === 'high' && styles.shellHigh,
    variant === 'medium' && styles.shellMedium,
    variant === 'low' && styles.shellLow,
  ];

  const titleStyle = [
    styles.title,
    variant === 'high' && styles.titleHigh,
    variant === 'medium' && styles.titleMedium,
    variant === 'low' && styles.titleLow,
  ];

  return (
    <View style={shellStyle}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={titleStyle}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    alignSelf: 'stretch',
    marginTop: 20,
    paddingVertical: 28,
    paddingHorizontal: 22,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: 'center',
  },
  shellHigh: {
    backgroundColor: colors.riskHighSurface,
    borderColor: colors.riskHighBorder,
  },
  shellMedium: {
    backgroundColor: colors.riskMediumSurface,
    borderColor: colors.riskMediumBorder,
  },
  shellLow: {
    backgroundColor: colors.riskLowSurface,
    borderColor: colors.riskLowBorder,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 30,
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  titleHigh: {
    color: colors.riskHighMuted,
  },
  titleMedium: {
    color: colors.riskMediumText,
  },
  titleLow: {
    color: colors.riskLowBorder,
  },
  message: {
    fontSize: 19,
    lineHeight: 30,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },
});
