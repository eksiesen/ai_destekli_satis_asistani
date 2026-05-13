import { Ionicons } from '@expo/vector-icons';
import { useCallback, useMemo, useState } from 'react';
import {
  LayoutAnimation,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  UIManager,
  View,
} from 'react-native';

import { colors } from '../theme/colors';

export type FamilyAlertTone = 'warning' | 'informative';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const DETAIL_WARNING =
  'Bu bildirim, özellikle yaşlı veya çocuk kullanıcıların yüksek riskli bağlantılara tıklamadan önce aile bireylerinden destek almasını amaçlar.';

const DETAIL_INFORMATIVE =
  'Bu bilgilendirme, ailenin sonucu birlikte değerlendirmesine yardımcı olur. Gerçek SMS veya e-posta gönderilmez; yalnızca demo arayüzdür.';

type Props = {
  tone: FamilyAlertTone;
  /** Durum satırında gösterilecek risk etiketi (örn. analiz riskLevel) */
  riskLevelLabel: string;
};

export function FamilyAlertCard({ tone, riskLevelLabel }: Props) {
  const [detailsOpen, setDetailsOpen] = useState(false);

  const toggleDetails = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setDetailsOpen((v) => !v);
  }, []);

  const mainMessage =
    tone === 'warning'
      ? 'Yüksek riskli içerik algılandı, kayıtlı aile bireyine bildirim gönderildi.'
      : 'Bu analiz sonucu bilgilendirme amacıyla kayıtlı aile bireyine gönderildi.';

  const detailCopy = tone === 'warning' ? DETAIL_WARNING : DETAIL_INFORMATIVE;

  const shell = useMemo(
    () =>
      tone === 'warning'
        ? {
            outer: [styles.outer, styles.outerWarning],
            glassTint: styles.glassTintWarning,
            iconWrap: [styles.iconWrap, styles.iconWrapWarning],
            iconColor: '#fbbf24' as const,
            statusBlock: [styles.statusBlock, styles.statusBlockWarning],
            statusRowBorder: styles.statusRowBorderWarning,
            statusValue: styles.statusValueWarning,
            detailBtn: [styles.detailBtn, styles.detailBtnWarning],
            detailBtnText: styles.detailBtnTextWarning,
            detailChevron: '#fcd34d' as const,
          }
        : {
            outer: [styles.outer, styles.outerInformative],
            glassTint: styles.glassTintInformative,
            iconWrap: [styles.iconWrap, styles.iconWrapInformative],
            iconColor: '#6ee7b7' as const,
            statusBlock: [styles.statusBlock, styles.statusBlockInformative],
            statusRowBorder: styles.statusRowBorderInformative,
            statusValue: styles.statusValueInformative,
            detailBtn: [styles.detailBtn, styles.detailBtnInformative],
            detailBtnText: styles.detailBtnTextInformative,
            detailChevron: '#38bdf8' as const,
          },
    [tone],
  );

  return (
    <View
      style={shell.outer}
      accessibilityRole="summary"
      accessibilityLabel="Aile güvenlik bildirimi"
    >
      <View style={[styles.glassTintBase, shell.glassTint]} pointerEvents="none" />
      <View style={styles.headerRow}>
        <View style={shell.iconWrap}>
          {tone === 'warning' ? (
            <Ionicons name="warning-outline" size={22} color={shell.iconColor} />
          ) : (
            <Ionicons
              name="information-circle-outline"
              size={22}
              color={shell.iconColor}
            />
          )}
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>Aile Güvenlik Bildirimi</Text>
        </View>
      </View>

      <Text style={styles.mainMessage}>{mainMessage}</Text>

      <Text style={styles.demoNote}>Demo bildirim sistemi</Text>

      <View style={shell.statusBlock}>
        <StatusRow
          label="Gönderilen kişi"
          value="Yakın Aile Üyesi"
          borderStyle={shell.statusRowBorder}
          valueStyle={shell.statusValue}
        />
        <StatusRow
          label="Bildirim zamanı"
          value="Şimdi"
          borderStyle={shell.statusRowBorder}
          valueStyle={shell.statusValue}
        />
        <StatusRow
          label="Risk seviyesi"
          value={riskLevelLabel}
          isLast
          borderStyle={shell.statusRowBorder}
          valueStyle={shell.statusValue}
        />
      </View>

      <Pressable
        onPress={toggleDetails}
        style={({ pressed }) => [
          shell.detailBtn,
          pressed && styles.detailBtnPressed,
        ]}
        accessibilityRole="button"
        accessibilityState={{ expanded: detailsOpen }}
        accessibilityLabel="Bildirim detayları"
      >
        <Text style={shell.detailBtnText}>Bildirim Detayları</Text>
        <Ionicons
          name={detailsOpen ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={shell.detailChevron}
        />
      </Pressable>

      {detailsOpen ? (
        <View style={styles.detailBox}>
          <Text style={styles.detailText}>{detailCopy}</Text>
        </View>
      ) : null}
    </View>
  );
}

function StatusRow({
  label,
  value,
  isLast,
  borderStyle,
  valueStyle,
}: {
  label: string;
  value: string;
  isLast?: boolean;
  borderStyle: object;
  valueStyle: object;
}) {
  return (
    <View
      style={[
        styles.statusRow,
        !isLast && borderStyle,
        isLast && styles.statusRowLast,
      ]}
    >
      <Text style={styles.statusLabel}>{label}</Text>
      <Text style={[styles.statusValueBase, valueStyle]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    alignSelf: 'stretch',
    marginTop: 16,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    padding: 16,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 16,
    elevation: 8,
  },
  outerWarning: {
    borderColor: '#f59e0b55',
    backgroundColor: '#1c1410e6',
    shadowColor: '#f59e0b',
    shadowOpacity: 0.22,
  },
  outerInformative: {
    borderColor: '#0ea5e955',
    backgroundColor: '#0f172ae8',
    shadowColor: '#0ea5e9',
    shadowOpacity: 0.15,
  },
  glassTintBase: {
    ...StyleSheet.absoluteFillObject,
  },
  glassTintWarning: {
    backgroundColor: '#f59e0b0a',
  },
  glassTintInformative: {
    backgroundColor: '#10b9810a',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapWarning: {
    backgroundColor: '#f59e0b22',
    borderColor: '#fbbf2466',
  },
  iconWrapInformative: {
    backgroundColor: '#10b98122',
    borderColor: '#34d39966',
  },
  headerText: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  mainMessage: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  demoNote: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 14,
    fontStyle: 'italic',
  },
  statusBlock: {
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 4,
    marginBottom: 12,
  },
  statusBlockWarning: {
    backgroundColor: '#0c0a08aa',
    borderColor: '#f59e0b33',
  },
  statusBlockInformative: {
    backgroundColor: '#0c1017aa',
    borderColor: '#0ea5e933',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 12,
  },
  statusRowBorderWarning: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#f59e0b22',
  },
  statusRowBorderInformative: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#0ea5e922',
  },
  statusRowLast: {
    borderBottomWidth: 0,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    flexShrink: 0,
  },
  statusValueBase: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'right',
    flex: 1,
  },
  statusValueWarning: {
    color: '#fecaca',
  },
  statusValueInformative: {
    color: '#94e4d4',
  },
  detailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  detailBtnWarning: {
    backgroundColor: '#f59e0b14',
    borderColor: '#f59e0b44',
  },
  detailBtnInformative: {
    backgroundColor: '#0ea5e914',
    borderColor: '#38bdf844',
  },
  detailBtnPressed: {
    opacity: 0.88,
  },
  detailBtnTextWarning: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fcd34d',
  },
  detailBtnTextInformative: {
    fontSize: 14,
    fontWeight: '700',
    color: '#7dd3fc',
  },
  detailBox: {
    marginTop: 12,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#00000055',
    borderWidth: 1,
    borderColor: '#ffffff12',
  },
  detailText: {
    fontSize: 13,
    lineHeight: 21,
    color: colors.textSecondary,
  },
});
