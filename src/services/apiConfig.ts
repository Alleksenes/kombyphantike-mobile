import { Platform } from 'react-native';

/**
 * The base URL for the backend API.
 *
 * This value is primarily driven by the EXPO_PUBLIC_API_URL environment variable.
 * Centralizing this configuration prevents hardcoded URLs across the codebase
 * and allows for easy switching between development (HTTP) and production (HTTPS).
 */
const API_PORT = '8000';

// THE MAGIC TUNNEL
// 10.0.2.2 is the special IP Android Emulators use to see "Localhost" on your PC.
const LOCAL_IP = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';

export const API_BASE_URL = `http://${LOCAL_IP}:${API_PORT}`;
console.log(`[Config] API_BASE_URL is set to: ${API_BASE_URL}`);
