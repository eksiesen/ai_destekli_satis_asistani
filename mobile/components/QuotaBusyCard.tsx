import { Ionicons } from '@expo/vector-icons';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { colors } from '../theme/colors';

type Props = {
  onRetry: () => void;
  retryDisabled?: boolean;
};

export function QuotaBusyCard({ onRetry, retryDisabled }: Props) {
  return (
    <View
      style={styles.wrap}
      accessibilityRole="summary"
      accessibilityLabel="AI servisi yoğun, daha sonra tekrar deneyin"
    >
      <View style={styles.iconCircle}>
        <Ionicons name="hourglass-outline" size={28} color="#fbbf24" />
      </View>
      <Text style={styles.title}>AI Servisi Yoğun</Text>
      <Text style={styles.body}>
        Şu anda analiz servisi yoğun olduğu için sonuç oluşturulamadı. Lütfen
        biraz sonra tekrar deneyin.
      </Text>
      <TouchableOpacity
        style={[styles.retryBtn, retryDisabled && styles.retryBtnDisabled]}
        onPress={onRetry}
        disabled={retryDisabled}
        activeOpacity={0.88}
        accessibilityRole="button"
        accessibilityLabel="Tekrar dene"
      >
        <Ionicons
          name="refresh-outline"
          size={20}
          color={retryDisabled ? colors.textMuted : '#0c1017'}
          style={styles.retryIcon}
        />
        <Text
          style={[styles.retryLabel, retryDisabled && styles.retryLabelMuted]}
        >
          Tekrar dene
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const amberFill = '#f59e0b24';
const amberBorder = '#f59e0b55';
const amberTitle = '#fde68a';

const styles = StyleSheet.create({
  wrap: {
    marginTop: 18,
    alignSelf: 'stretch',
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: amberFill,
    borderWidth: 1,
    borderColor: amberBorder,
    alignItems: 'center',
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#f59e0b18',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#fbbf2444',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: amberTitle,
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: -0.2,
  },
  body: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
    backgroundColor: '#fbbf24',
    alignSelf: 'stretch',
    maxWidth: 280,
  },
  retryBtnDisabled: {
    opacity: 0.55,
    backgroundColor: '#92400e66',
  },
  retryIcon: {
    marginRight: 8,
  },
  retryLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0c1017',
  },
  retryLabelMuted: {
    color: colors.textMuted,
  },
});
