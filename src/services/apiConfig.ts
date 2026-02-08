import { Platform } from 'react-native';

/**
 * The base URL for the backend API.
 *
 * This value is primarily driven by the EXPO_PUBLIC_API_URL environment variable.
 * Centralizing this configuration prevents hardcoded URLs across the codebase
 * and allows for easy switching between development (HTTP) and production (HTTPS).
 *
 * @example
 * // .env file
 * EXPO_PUBLIC_API_URL=https://api.yourdomain.com
 */
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ||
  (Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000');

console.log(`[Config] API_BASE_URL is set to: ${API_BASE_URL}`);
