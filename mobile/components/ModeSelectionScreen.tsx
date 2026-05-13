import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '../theme/colors';

type Props = {
  onSelectNormal: () => void;
  onSelectElderly: () => void;
};

export function ModeSelectionScreen({
  onSelectNormal,
  onSelectElderly,
}: Props) {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.inner}>
        <Text style={styles.title}>AI Scam Shield</Text>
        <Text style={styles.subtitle}>Kullanım modunu seç</Text>

        <TouchableOpacity
          style={[styles.modeCard, styles.modeCardNormal]}
          onPress={onSelectNormal}
          activeOpacity={0.88}
          accessibilityRole="button"
          accessibilityLabel="Normal Mod"
        >
          <View style={styles.modeIconWrap}>
            <Ionicons name="analytics-outline" size={32} color={colors.accent} />
          </View>
          <Text style={styles.modeTitle}>Normal Mod</Text>
          <Text style={styles.modeDesc}>
            Detaylı risk analizi ve teknik sonuçlar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modeCard, styles.modeCardElderly]}
          onPress={onSelectElderly}
          activeOpacity={0.88}
          accessibilityRole="button"
          accessibilityLabel="Yaşlı Modu"
        >
          <View style={[styles.modeIconWrap, styles.modeIconWrapElderly]}>
            <Ionicons name="heart-outline" size={32} color={colors.elderlyAccent} />
          </View>
          <Text style={styles.modeTitle}>Yaşlı Modu</Text>
          <Text style={styles.modeDesc}>
            Sade, kısa ve anlaşılır güvenlik uyarıları
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 28,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 36,
  },
  modeCard: {
    borderRadius: 18,
    padding: 22,
    marginBottom: 16,
    borderWidth: 1,
  },
  modeCardNormal: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.border,
  },
  modeCardElderly: {
    backgroundColor: colors.elderlySurface,
    borderColor: colors.elderlyBorder,
  },
  modeIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  modeIconWrapElderly: {
    backgroundColor: '#064e3b55',
  },
  modeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  modeDesc: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
  },
});
