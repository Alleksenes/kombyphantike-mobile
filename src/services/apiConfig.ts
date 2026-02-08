import { Platform } from 'react-native';

/**
 * The base URL for the backend API.
 *
 * This value is primarily driven by the EXPO_PUBLIC_API_URL environment variable.
 * Centralizing this configuration prevents hardcoded URLs across the codebase
 * and allows for easy switching between development (HTTP) and production (HTTPS).
 */
const getApiBaseUrl = (): string => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;

  // In production, we must prioritize secure connections and explicit configuration.
  if (!__DEV__) {
    if (!envUrl) {
      // In production, missing API URL is a critical configuration error.
      // We use a safe placeholder that will fail safely rather than falling back to localhost.
      console.error('[Config] Security Alert: EXPO_PUBLIC_API_URL is NOT set in production!');
      return 'https://api.missing-env-var.error';
    }

    if (envUrl.startsWith('http:')) {
      console.warn('[Config] Security Warning: Insecure API URL (HTTP) detected in production. HTTPS is strongly recommended.');
    }

    return envUrl;
  }

  // In development, we allow falling back to local addresses for developer convenience.
  return envUrl || (Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000');
};

export const API_BASE_URL = getApiBaseUrl();

console.log(`[Config] API_BASE_URL is set to: ${API_BASE_URL}`);
