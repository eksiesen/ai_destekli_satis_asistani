import { Ionicons } from '@expo/vector-icons';
import { CameraView } from 'expo-camera';
import { useCallback, useEffect, useRef } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '../theme/colors';

type Props = {
  visible: boolean;
  onClose: () => void;
  /** Ham QR yükü (URL doğrulaması üst bileşende) */
  onQrPayload: (data: string) => void;
};

export function QrScanModal({ visible, onClose, onQrPayload }: Props) {
  const scanLockRef = useRef(false);

  useEffect(() => {
    if (visible) {
      scanLockRef.current = false;
    }
  }, [visible]);

  const handleBarcodeScanned = useCallback(
    (event: { data: string }) => {
      if (!visible || scanLockRef.current) return;
      scanLockRef.current = true;
      onQrPayload(event.data);
    },
    [visible, onQrPayload],
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
          <View style={styles.topBar}>
            <Pressable
              onPress={onClose}
              style={styles.backBtn}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Geri"
            >
              <Ionicons name="chevron-back" size={26} color={colors.textPrimary} />
              <Text style={styles.backLabel}>Kapat</Text>
            </Pressable>
          </View>

          <Text style={styles.title}>QR Kodu Tara</Text>
          <Text style={styles.subtitle}>
            QR kodu kameraya göster, bağlantıyı otomatik analiz edelim.
          </Text>
          <Text style={styles.hint}>
            Telefonu QR koda doğru tutun; kod otomatik okunacaktır.
          </Text>
        </SafeAreaView>

        <View style={styles.cameraShell}>
          {visible ? (
            <CameraView
              style={StyleSheet.absoluteFillObject}
              facing="back"
              active={visible}
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
              onBarcodeScanned={handleBarcodeScanned}
            />
          ) : null}
          <View style={styles.scanFrame} pointerEvents="none" />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safe: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingRight: 10,
  },
  backLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  hint: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
    marginBottom: 4,
  },
  cameraShell: {
    flex: 1,
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#000',
  },
  scanFrame: {
    position: 'absolute',
    top: '12%',
    left: '12%',
    right: '12%',
    bottom: '12%',
    borderWidth: 2,
    borderColor: colors.accent,
    borderRadius: 12,
  },
});
