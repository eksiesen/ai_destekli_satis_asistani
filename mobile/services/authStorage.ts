import AsyncStorage from '@react-native-async-storage/async-storage';

import type { UserSession } from '../types/auth';

const USER_SESSION_KEY = "AI_SCAM_SHIELD_USER_SESSION";

export async function saveUserSession(session: UserSession): Promise<void> {
  await AsyncStorage.setItem(USER_SESSION_KEY, JSON.stringify(session));
}

export async function getUserSession(): Promise<UserSession | null> {
  const raw = await AsyncStorage.getItem(USER_SESSION_KEY);
  if (raw == null || raw === '') {
    return null;
  }
  try {
    return JSON.parse(raw) as UserSession;
  } catch (err) {
    console.error('authStorage: failed to parse user session JSON', err);
    return null;
  }
}

/** Oturumu kapatır; kayıtlı kullanıcı bilgileri cihazda kalır. */
export async function logoutUserSession(): Promise<void> {
  const session = await getUserSession();
  if (session == null) {
    return;
  }

  await saveUserSession({
    ...session,
    isLoggedIn: false,
  });
}

/** Kayıtlı oturumu tamamen siler (hesap verisini kaldırmak için). Çıkış için kullanmayın. */
export async function clearUserSession(): Promise<void> {
  await AsyncStorage.removeItem(USER_SESSION_KEY);
}
