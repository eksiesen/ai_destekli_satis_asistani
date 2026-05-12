import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';

export function HeroHeader() {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>AI Scam Shield</Text>
      <Text style={styles.subtitle}>
        Yapay zekâ destekli dijital dolandırıcılık kalkanı
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 28,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textSecondary,
  },
});
