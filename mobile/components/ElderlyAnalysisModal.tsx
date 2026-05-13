import { Ionicons } from '@expo/vector-icons';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';

import { colors } from '../theme/colors';

type RiskTone = 'high' | 'medium' | 'low';

function toneFromRiskLevel(riskLevel: string): RiskTone {
  if (riskLevel.includes('Yüksek')) return 'high';
  if (riskLevel.includes('Orta')) return 'medium';
  return 'low';
}

type Props = {
  visible: boolean;
  riskLevel: string;
  onClose: () => void;
};

const bodyCopy: Record<
  RiskTone,
  { title: string; message: string; emoji: string }
> = {
  high: {
    title: 'Dikkat!',
    message: 'Bu içerik güvenli görünmüyor. Linke tıklama.',
    emoji: '⚠️',
  },
  medium: {
    title: 'Dikkatli Ol',
    message:
      'Bu içerikte şüpheli işaretler var. Önce bir yakınına danış.',
    emoji: '🟡',
  },
  low: {
    title: 'Güvenli Görünüyor',
    message:
      'Ciddi bir risk bulunmadı. Yine de kişisel bilgilerini paylaşma.',
    emoji: '✅',
  },
};

const shellByTone: Record<
  RiskTone,
  { wrap: ViewStyle; border: string; titleColor: string }
> = {
  high: {
    wrap: { backgroundColor: '#2a1520f2' },
    border: colors.riskHighBorder,
    titleColor: colors.riskHighMuted,
  },
  medium: {
    wrap: { backgroundColor: '#2a2010f2' },
    border: colors.riskMediumBorder,
    titleColor: colors.riskMediumText,
  },
  low: {
    wrap: { backgroundColor: '#0f2419f2' },
    border: colors.riskLowBorder,
    titleColor: colors.riskLowBorder,
  },
};

export function ElderlyAnalysisModal({
  visible,
  riskLevel,
  onClose,
}: Props) {
  const tone = toneFromRiskLevel(riskLevel);
  const copy = bodyCopy[tone];
  const shell = shellByTone[tone];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay} pointerEvents="box-none">
        <View style={styles.backdrop} />
        <View style={styles.sheetWrap} pointerEvents="box-none">
          <View
            style={[styles.sheet, shell.wrap, { borderColor: shell.border }]}
          >
            <Pressable
              style={styles.closeIconBtn}
              onPress={onClose}
              hitSlop={14}
              accessibilityRole="button"
              accessibilityLabel="Kapat"
            >
              <Ionicons name="close" size={26} color={colors.textMuted} />
            </Pressable>

            <Text style={styles.emoji}>{copy.emoji}</Text>
            <Text style={[styles.title, { color: shell.titleColor }]}>
              {copy.title}
            </Text>
            <Text style={styles.message}>{copy.message}</Text>

            <Pressable
              style={[styles.okBtn, { borderColor: shell.border }]}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Tamam"
            >
              <Text style={[styles.okBtnText, { color: shell.titleColor }]}>
                Tamam
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.58)',
  },
  sheetWrap: {
    width: '88%',
    maxWidth: 400,
    alignSelf: 'center',
    zIndex: 2,
  },
  sheet: {
    borderRadius: 22,
    borderWidth: 2,
    paddingTop: 36,
    paddingBottom: 22,
    paddingHorizontal: 22,
    alignItems: 'center',
  },
  closeIconBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 2,
    padding: 4,
  },
  emoji: {
    fontSize: 56,
    marginBottom: 14,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 14,
    letterSpacing: -0.4,
  },
  message: {
    fontSize: 19,
    lineHeight: 28,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 26,
  },
  okBtn: {
    alignSelf: 'stretch',
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 2,
    backgroundColor: '#ffffff10',
    alignItems: 'center',
  },
  okBtnText: {
    fontSize: 18,
    fontWeight: '800',
  },
});
