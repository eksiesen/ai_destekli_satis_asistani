import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '../theme/colors';
import type { ScamAnalysisResult } from '../types/analysis';

export type AnalysisToastVariant = 'high' | 'medium' | 'low' | 'malicious';

export type AnalysisToastPayload = {
  message: string;
  variant: AnalysisToastVariant;
};

export function getAnalysisToastPayload(
  result: ScamAnalysisResult,
): AnalysisToastPayload {
  const hasMalicious =
    result.safeBrowsingResults?.some((r) => r.status === 'malicious') ?? false;
  if (hasMalicious) {
    return {
      message: '🚨 Zararlı bağlantı tespit edildi.',
      variant: 'malicious',
    };
  }
  if (result.riskLevel.includes('Yüksek')) {
    return {
      message: '⚠️ Bu içerik yüksek riskli görünüyor.',
      variant: 'high',
    };
  }
  if (result.riskLevel.includes('Orta')) {
    return {
      message: '🟡 Bu içerikte şüpheli işaretler bulundu.',
      variant: 'medium',
    };
  }
  return {
    message: '✅ Ciddi bir risk tespit edilmedi.',
    variant: 'low',
  };
}

type Props = {
  payload: AnalysisToastPayload | null;
  onDismiss: () => void;
};

const AUTO_HIDE_MS = 3000;

const variantStyles: Record<
  AnalysisToastVariant,
  { card: ViewStyle; accent: string; border: string }
> = {
  high: {
    card: { backgroundColor: '#2a1520e6' },
    accent: colors.riskHighMuted,
    border: colors.riskHighBorder,
  },
  medium: {
    card: { backgroundColor: '#2a2010e6' },
    accent: colors.riskMediumText,
    border: colors.riskMediumBorder,
  },
  low: {
    card: { backgroundColor: '#0f2419e6' },
    accent: colors.riskLowBorder,
    border: colors.riskLowBorder,
  },
  malicious: {
    card: { backgroundColor: '#450a0acc' },
    accent: '#fca5a5',
    border: '#ef4444',
  },
};

export function AnalysisToast({ payload, onDismiss }: Props) {
  const insets = useSafeAreaInsets();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-28)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const dismissWithAnimation = useCallback(() => {
    clearTimer();
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -20,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismissRef.current();
    });
  }, [clearTimer, opacity, translateY]);

  const dismissWithAnimationRef = useRef(dismissWithAnimation);
  dismissWithAnimationRef.current = dismissWithAnimation;

  useEffect(() => {
    if (!payload) {
      return;
    }

    opacity.setValue(0);
    translateY.setValue(-28);
    clearTimer();

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        friction: 9,
        tension: 65,
        useNativeDriver: true,
      }),
    ]).start();

    timerRef.current = setTimeout(() => {
      dismissWithAnimationRef.current();
    }, AUTO_HIDE_MS);

    return () => {
      clearTimer();
    };
  }, [payload, clearTimer, opacity, translateY]);

  if (!payload) {
    return null;
  }

  const vs = variantStyles[payload.variant];

  return (
    <View
      pointerEvents="box-none"
      style={[styles.overlay, { paddingTop: insets.top + 10 }]}
    >
      <Animated.View
        pointerEvents="auto"
        style={[
          styles.card,
          vs.card,
          {
            borderColor: vs.border,
            opacity,
            transform: [{ translateY }],
          },
        ]}
      >
        <View style={[styles.accentBar, { backgroundColor: vs.border }]} />
        <Text style={[styles.message, { color: vs.accent }]}>{payload.message}</Text>
        <Pressable
          onPress={dismissWithAnimation}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Bildirimi kapat"
          style={styles.closeBtn}
        >
          <Ionicons name="close" size={22} color={colors.textMuted} />
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'flex-start',
    zIndex: 999,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '92%',
    maxWidth: 440,
    paddingVertical: 14,
    paddingHorizontal: 16,
    paddingLeft: 14,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 16,
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  message: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
    paddingRight: 8,
  },
  closeBtn: {
    padding: 4,
  },
});
