import { Ionicons } from '@expo/vector-icons';
import { useCameraPermissions } from 'expo-camera';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import {
  AnalysisToast,
  getAnalysisToastPayload,
  type AnalysisToastPayload,
} from './components/AnalysisToast';
import { AnalysisResultCard } from './components/AnalysisResultCard';
import { ElderlyAnalysisModal } from './components/ElderlyAnalysisModal';
import { ElderlyModeResultCard } from './components/ElderlyModeResultCard';
import { FamilyAlertCard } from './components/FamilyAlertCard';
import { HeroHeader } from './components/HeroHeader';
import { QuotaBusyCard } from './components/QuotaBusyCard';
import { AuthScreen } from './components/AuthScreen';
import { ModeSelectionScreen } from './components/ModeSelectionScreen';
import { QrScanModal } from './components/QrScanModal';
import { getUserSession, logoutUserSession } from './services/authStorage';
import { colors } from './theme/colors';
import type { UserSession } from './types/auth';
import {
  isQuotaExceededResponse,
  parseAnalyzeApiResponse,
  type ScamAnalysisResult,
} from './types/analysis';
import type { SelectedImage } from './types/selectedImage';
import { ANALYZE_IMAGE_URL } from './config/api';
import { postAnalyzeUrl } from './services/analyzeUrl';
import { parseQrPayloadToHttpUrl } from './utils/parseQrPayloadToHttpUrl';
import { shouldShowFamilyAlert } from './utils/shouldShowFamilyAlert';

type AppMode = 'normal' | 'elderly' | null;

function shortUrlDisplay(url: string, max = 56): string {
  if (url.length <= max) return url;
  return `${url.slice(0, max - 1)}…`;
}

function labelFromAsset(asset: ImagePicker.ImagePickerAsset): string {
  const name = asset.fileName?.trim();
  if (name) return name;
  try {
    const segment = asset.uri.split('/').pop()?.split('?')[0];
    if (segment) return decodeURIComponent(segment);
  } catch {
    /* ignore */
  }
  return 'Görsel seçildi';
}

export default function App() {
  const [, requestCameraPermission] = useCameraPermissions();
  const lastQrAnalyzeUrlRef = useRef<string | null>(null);

  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [mode, setMode] = useState<AppMode>(null);
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ScamAnalysisResult | null>(null);
  const [showQuotaBusy, setShowQuotaBusy] = useState(false);
  const [showAnalysisError, setShowAnalysisError] = useState(false);
  const [toastPayload, setToastPayload] = useState<AnalysisToastPayload | null>(
    null,
  );
  const [elderlyModalVisible, setElderlyModalVisible] = useState(false);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [qrInvalidWarning, setQrInvalidWarning] = useState<string | null>(null);
  const [scannedUrlPreview, setScannedUrlPreview] = useState<string | null>(null);
  const [familyAlertManualOpen, setFamilyAlertManualOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const session = await getUserSession();
        if (cancelled) return;
        if (session != null && session.isLoggedIn) {
          setUserSession(session);
        } else {
          setUserSession(null);
        }
      } finally {
        if (!cancelled) {
          setAuthLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setFamilyAlertManualOpen(false);
  }, [analysis]);

  const dismissToast = useCallback(() => {
    setToastPayload(null);
  }, []);

  const resetModeSelection = useCallback(() => {
    setSelectedImage(null);
    setAnalysis(null);
    setShowQuotaBusy(false);
    setShowAnalysisError(false);
    setToastPayload(null);
    setElderlyModalVisible(false);
    setQrModalVisible(false);
    setQrInvalidWarning(null);
    setScannedUrlPreview(null);
    lastQrAnalyzeUrlRef.current = null;
    setFamilyAlertManualOpen(false);
    setMode(null);
  }, []);

  const handlePick = useCallback(async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.92,
      });

      if (result.canceled || result.assets.length === 0) {
        return;
      }

      const asset = result.assets[0];
      const uploadName = (asset.fileName?.trim() || 'image.jpg').replace(
        /[/\\?%*:|"<>]/g,
        '-',
      );
      setSelectedImage({
        uri: asset.uri,
        label: labelFromAsset(asset),
        mimeType: asset.mimeType ?? 'image/jpeg',
        fileName: uploadName,
        file: asset.file ?? undefined,
      });
      setAnalysis(null);
      setShowQuotaBusy(false);
      setShowAnalysisError(false);
      setToastPayload(null);
      setElderlyModalVisible(false);
      setScannedUrlPreview(null);
      setQrInvalidWarning(null);
      lastQrAnalyzeUrlRef.current = null;
    } catch {
      /* picker iptali / hata */
    }
  }, []);

  const analyzeUrlFlow = useCallback(async (url: string) => {
    lastQrAnalyzeUrlRef.current = url;
    setIsAnalyzing(true);
    setShowAnalysisError(false);
    setShowQuotaBusy(false);
    setAnalysis(null);
    setToastPayload(null);
    setElderlyModalVisible(false);
    try {
      const result = await postAnalyzeUrl(url);
      if (isQuotaExceededResponse(result)) {
        setAnalysis(null);
        setShowQuotaBusy(true);
        setToastPayload(null);
        setElderlyModalVisible(false);
        return;
      }
      setShowQuotaBusy(false);
      setAnalysis(result);
      if (mode === 'normal') {
        setToastPayload(getAnalysisToastPayload(result));
      }
      if (mode === 'elderly') {
        setElderlyModalVisible(true);
      }
    } catch (error) {
      console.log('QR URL analyze error:', error);
      setShowAnalysisError(true);
    } finally {
      setIsAnalyzing(false);
    }
  }, [mode]);

  const handleQrPayload = useCallback(
    (raw: string) => {
      setQrModalVisible(false);
      const parsedUrl = parseQrPayloadToHttpUrl(raw);
      if (!parsedUrl) {
        setQrInvalidWarning('QR kod içinde geçerli bir bağlantı bulunamadı.');
        setScannedUrlPreview(null);
        return;
      }
      setQrInvalidWarning(null);
      setScannedUrlPreview(parsedUrl);
      void analyzeUrlFlow(parsedUrl);
    },
    [analyzeUrlFlow],
  );

  const openQrScanner = useCallback(async () => {
    const permissionResponse = await requestCameraPermission();
    if (!permissionResponse.granted) {
      Alert.alert(
        'Kamera izni gerekli',
        'Kamera izni olmadan QR tarama yapılamaz.',
      );
      return;
    }
    setQrInvalidWarning(null);
    setQrModalVisible(true);
  }, [requestCameraPermission]);

  const handleAnalyze = async () => {
    console.log('Analyze pressed');
    if (!selectedImage) return;
    lastQrAnalyzeUrlRef.current = null;
    setScannedUrlPreview(null);
    setQrInvalidWarning(null);
    setIsAnalyzing(true);
    setShowAnalysisError(false);
    setShowQuotaBusy(false);
    setAnalysis(null);
    setToastPayload(null);
    setElderlyModalVisible(false);
    try {
      console.log('Selected image:', selectedImage);

      const formData = new FormData();
      if (selectedImage.file) {
        formData.append('file', selectedImage.file);
      } else {
        formData.append(
          'file',
          {
            uri: selectedImage.uri,
            name: selectedImage.fileName || 'upload.jpg',
            type: selectedImage.mimeType || 'image/jpeg',
          } as any,
        );
      }

      console.log('FormData prepared with file field');
      console.log('Sending analyze request to:', ANALYZE_IMAGE_URL);

      const response = await fetch(ANALYZE_IMAGE_URL, {
        method: 'POST',
        body: formData,
      });

      console.log('Analyze response status:', response.status);

      const rawText = await response.text();
      console.log('Analyze raw response:', rawText);

      const parsed: unknown = JSON.parse(rawText);
      const result = parseAnalyzeApiResponse(parsed);
      if (isQuotaExceededResponse(result)) {
        console.warn('Gemini quota exceeded');
        setAnalysis(null);
        setShowQuotaBusy(true);
        setToastPayload(null);
        setElderlyModalVisible(false);
        return;
      }
      setShowQuotaBusy(false);
      setAnalysis(result);
      if (mode === 'normal') {
        setToastPayload(getAnalysisToastPayload(result));
      }
      if (mode === 'elderly') {
        setElderlyModalVisible(true);
      }
    } catch (error) {
      console.log('Analyze error:', error);
      setShowAnalysisError(true);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const familyAutoTrigger =
    analysis != null && !showQuotaBusy && shouldShowFamilyAlert(analysis);
  const showFamilyAlertCard =
    analysis != null &&
    !showQuotaBusy &&
    (familyAutoTrigger || familyAlertManualOpen);
  const familyCardTone = familyAutoTrigger ? 'warning' : 'informative';

  const handleFamilyNotifyPress = useCallback(() => {
    if (!analysis || showQuotaBusy) return;
    if (shouldShowFamilyAlert(analysis)) return;
    setFamilyAlertManualOpen((open) => !open);
  }, [analysis, showQuotaBusy]);

  const handleLogout = useCallback(async () => {
    await logoutUserSession();
    resetModeSelection();
    setIsAnalyzing(false);
    setUserSession(null);
  }, [resetModeSelection]);

  if (authLoading) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.authLoadingRoot} edges={['top', 'left', 'right', 'bottom']}>
          <ActivityIndicator color={colors.accent} size="large" />
          <Text style={styles.authLoadingText}>AI Scam Shield yükleniyor...</Text>
        </SafeAreaView>
        <StatusBar style="light" />
      </SafeAreaProvider>
    );
  }

  if (userSession == null) {
    return (
      <SafeAreaProvider>
        <AuthScreen onAuthenticated={setUserSession} />
        <StatusBar style="light" />
      </SafeAreaProvider>
    );
  }

  if (mode === null) {
    return (
      <SafeAreaProvider>
        <ModeSelectionScreen
          onSelectNormal={() => setMode('normal')}
          onSelectElderly={() => setMode('elderly')}
        />
        <StatusBar style="light" />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <View style={styles.appRoot}>
        <SafeAreaView
          style={styles.safe}
          edges={['top', 'left', 'right', 'bottom']}
        >
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.topBar}>
              <View style={styles.userBlock}>
                <Text
                  style={styles.welcomeText}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  Hoş geldin, {userSession.fullName}
                </Text>
                <TouchableOpacity
                  style={styles.logoutBtn}
                  onPress={handleLogout}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  accessibilityLabel="Çıkış yap"
                >
                  <Text style={styles.logoutBtnText}>Çıkış Yap</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={styles.modeChangeBtn}
                onPress={resetModeSelection}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Mod değiştir"
              >
                <Text style={styles.modeChangeText}>Mod Değiştir</Text>
              </TouchableOpacity>
            </View>

            <HeroHeader />

            <View style={styles.card}>
              {selectedImage ? (
                <View style={styles.previewWrap}>
                  <Image
                    source={{ uri: selectedImage.uri }}
                    style={styles.previewImage}
                    resizeMode="contain"
                    accessibilityLabel="Seçilen görsel önizlemesi"
                  />
                </View>
              ) : (
                <View style={styles.iconCircle}>
                  <Ionicons
                    name="images-outline"
                    size={36}
                    color={colors.accent}
                  />
                </View>
              )}

              <Text style={styles.prompt}>Şüpheli ekran görüntüsünü yükle</Text>

              {selectedImage ? (
                <Text style={styles.status} numberOfLines={2}>
                  {selectedImage.label}
                </Text>
              ) : null}

              <TouchableOpacity
                style={styles.pickButton}
                onPress={handlePick}
                activeOpacity={0.88}
                accessibilityRole="button"
                accessibilityLabel="Görsel seç"
              >
                <Text style={styles.pickButtonText}>Görsel Seç</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.qrButton, isAnalyzing && styles.qrButtonDisabled]}
                onPress={openQrScanner}
                disabled={isAnalyzing}
                activeOpacity={0.88}
                accessibilityRole="button"
                accessibilityLabel="QR tara"
              >
                <Ionicons
                  name="qr-code-outline"
                  size={20}
                  color={colors.accent}
                  style={styles.qrButtonIcon}
                />
                <Text style={styles.qrButtonText}>QR Tara</Text>
              </TouchableOpacity>

              {scannedUrlPreview ? (
                <View style={styles.qrPreviewBox} accessibilityLiveRegion="polite">
                  <Text style={styles.qrPreviewLabel}>Okunan bağlantı</Text>
                  <Text style={styles.qrPreviewUrl} selectable numberOfLines={3}>
                    {shortUrlDisplay(scannedUrlPreview)}
                  </Text>
                </View>
              ) : null}

              {qrInvalidWarning ? (
                <View style={styles.qrWarnBox} accessibilityLiveRegion="polite">
                  <Ionicons
                    name="information-circle-outline"
                    size={22}
                    color={colors.riskMediumText}
                    style={styles.errorIcon}
                  />
                  <Text style={styles.qrWarnText}>{qrInvalidWarning}</Text>
                </View>
              ) : null}

              {selectedImage != null ? (
                <TouchableOpacity
                  style={[
                    styles.analyzeButton,
                    isAnalyzing && styles.analyzeButtonDisabled,
                  ]}
                  onPress={handleAnalyze}
                  disabled={isAnalyzing}
                  activeOpacity={0.88}
                  accessibilityRole="button"
                  accessibilityLabel={
                    isAnalyzing ? 'Analiz ediliyor' : 'Analiz et'
                  }
                >
                  <Text style={styles.analyzeButtonText}>
                    {isAnalyzing ? 'Analiz ediliyor...' : 'Analiz Et'}
                  </Text>
                </TouchableOpacity>
              ) : null}

              {isAnalyzing ? (
                <View
                  style={styles.analyzingBanner}
                  accessibilityLiveRegion="polite"
                  accessibilityLabel="Analiz ediliyor"
                >
                  <ActivityIndicator color={colors.accent} size="small" />
                  <Text style={styles.analyzingText}>Analiz ediliyor...</Text>
                </View>
              ) : null}

              {showAnalysisError ? (
                <View style={styles.errorBox} accessibilityLiveRegion="polite">
                  <Ionicons
                    name="alert-circle-outline"
                    size={22}
                    color={colors.danger}
                    style={styles.errorIcon}
                  />
                  <Text style={styles.errorTitle}>Analiz tamamlanamadı</Text>
                  <Text style={styles.errorBody}>
                    İnternet bağlantınızı kontrol edin ve bir süre sonra tekrar
                    deneyin. Sorun sürerse farklı bir ağ veya sunucu adresini
                    doğrulayın.
                  </Text>
                </View>
              ) : null}

              {showQuotaBusy ? (
                <QuotaBusyCard
                  onRetry={() => {
                    const u = lastQrAnalyzeUrlRef.current;
                    if (u) void analyzeUrlFlow(u);
                    else void handleAnalyze();
                  }}
                  retryDisabled={isAnalyzing}
                />
              ) : null}

              {!showQuotaBusy && analysis && mode === 'normal' ? (
                <>
                  <AnalysisResultCard result={analysis} />
                  <TouchableOpacity
                    style={[
                      styles.familyNotifyBtn,
                      isAnalyzing && styles.familyNotifyBtnDisabled,
                    ]}
                    onPress={handleFamilyNotifyPress}
                    disabled={isAnalyzing}
                    activeOpacity={0.88}
                    accessibilityRole="button"
                    accessibilityLabel="Aileye bildir"
                  >
                    <Ionicons
                      name="people-outline"
                      size={18}
                      color="#a7f3d0"
                      style={styles.familyNotifyIcon}
                    />
                    <Text style={styles.familyNotifyBtnText}>Aileye Bildir</Text>
                  </TouchableOpacity>
                  {showFamilyAlertCard ? (
                    <FamilyAlertCard
                      tone={familyCardTone}
                      riskLevelLabel={analysis.riskLevel}
                    />
                  ) : null}
                </>
              ) : null}
              {!showQuotaBusy && analysis && mode === 'elderly' ? (
                <>
                  <ElderlyModeResultCard result={analysis} />
                  <TouchableOpacity
                    style={[
                      styles.familyNotifyBtn,
                      isAnalyzing && styles.familyNotifyBtnDisabled,
                    ]}
                    onPress={handleFamilyNotifyPress}
                    disabled={isAnalyzing}
                    activeOpacity={0.88}
                    accessibilityRole="button"
                    accessibilityLabel="Aileye bildir"
                  >
                    <Ionicons
                      name="people-outline"
                      size={18}
                      color="#a7f3d0"
                      style={styles.familyNotifyIcon}
                    />
                    <Text style={styles.familyNotifyBtnText}>Aileye Bildir</Text>
                  </TouchableOpacity>
                  {showFamilyAlertCard ? (
                    <FamilyAlertCard
                      tone={familyCardTone}
                      riskLevelLabel={analysis.riskLevel}
                    />
                  ) : null}
                </>
              ) : null}
            </View>
          </ScrollView>
        </SafeAreaView>
        {mode === 'normal' ? (
          <AnalysisToast payload={toastPayload} onDismiss={dismissToast} />
        ) : null}
        {mode === 'elderly' ? (
          <ElderlyAnalysisModal
            visible={elderlyModalVisible}
            riskLevel={analysis?.riskLevel ?? ''}
            onClose={() => setElderlyModalVisible(false)}
          />
        ) : null}
        <QrScanModal
          visible={qrModalVisible}
          onClose={() => setQrModalVisible(false)}
          onQrPayload={handleQrPayload}
        />
      </View>
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  authLoadingRoot: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 16,
  },
  authLoadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  topBar: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 10,
  },
  userBlock: {
    flex: 1,
    minWidth: 0,
  },
  welcomeText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 6,
  },
  logoutBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  logoutBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.danger,
  },
  modeChangeBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modeChangeText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  appRoot: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 8,
    flexGrow: 1,
  },
  card: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 16,
    paddingHorizontal: 18,
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  previewWrap: {
    alignSelf: 'stretch',
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  previewImage: {
    width: '100%',
    aspectRatio: 4 / 3,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  prompt: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
    alignSelf: 'stretch',
  },
  status: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
    paddingHorizontal: 4,
    alignSelf: 'stretch',
  },
  pickButton: {
    backgroundColor: colors.buttonPick,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
    alignItems: 'center',
    width: '100%',
  },
  pickButtonText: {
    color: colors.buttonOnPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  qrButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 12,
    width: '100%',
    borderWidth: 1,
    borderColor: colors.accent,
  },
  qrButtonDisabled: {
    opacity: 0.55,
  },
  qrButtonIcon: {
    marginRight: 2,
  },
  qrButtonText: {
    color: colors.accent,
    fontSize: 16,
    fontWeight: '700',
  },
  qrPreviewBox: {
    marginTop: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignSelf: 'stretch',
    backgroundColor: colors.accentMuted,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  qrPreviewLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  qrPreviewUrl: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  qrWarnBox: {
    marginTop: 14,
    padding: 14,
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#fbbf2418',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.riskMediumBorder,
  },
  qrWarnText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '600',
    color: colors.riskMediumText,
  },
  familyNotifyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    alignSelf: 'stretch',
    marginTop: 14,
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#0c4a6e55',
    borderWidth: 1,
    borderColor: '#0ea5e988',
  },
  familyNotifyBtnDisabled: {
    opacity: 0.5,
  },
  familyNotifyIcon: {
    marginRight: 0,
  },
  familyNotifyBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#7dd3fc',
    letterSpacing: 0.2,
  },
  analyzeButton: {
    backgroundColor: '#10b981',
    paddingVertical: 16,
    borderRadius: 18,
    marginTop: 16,
    alignItems: 'center',
    width: '100%',
  },
  analyzeButtonDisabled: {
    opacity: 0.85,
  },
  analyzeButtonText: {
    color: '#021014',
    fontSize: 18,
    fontWeight: '800',
  },
  analyzingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignSelf: 'stretch',
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  analyzingText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  errorBox: {
    marginTop: 18,
    padding: 16,
    alignSelf: 'stretch',
    backgroundColor: '#7f1d1d28',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#f8717166',
    alignItems: 'center',
  },
  errorIcon: {
    marginBottom: 8,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.danger,
    textAlign: 'center',
    marginBottom: 8,
  },
  errorBody: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
