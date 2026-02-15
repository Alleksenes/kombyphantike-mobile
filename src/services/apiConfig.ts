import Constants from 'expo-constants';
import { Platform } from 'react-native';

const API_PORT = '8000';

const getBaseUrl = () => {
    // 1. Prioritize Environment Variable
    if (process.env.EXPO_PUBLIC_API_URL) {
        const url = process.env.EXPO_PUBLIC_API_URL;
        // Check for insecure protocol in production
        if (!__DEV__ && url.startsWith('http://')) {
            console.warn('Insecure API URL (HTTP) detected in production: ' + url);
        }
        return url;
    }

    // 2. Production Fallback (Error)
    // If we are in production and no env var is set, return a placeholder error URL
    // so we don't accidentally connect to localhost or 10.0.2.2 which won't work or is insecure.
    if (!__DEV__) {
        return 'https://api.missing-env-var.error';
    }

    // 3. Development Auto-Detection
    if (Platform.OS === 'web') return `http://localhost:${API_PORT}`;

    // AUTOMATIC IP DETECTION
    // This grabs the IP of your computer from the Expo Runner
    const debuggerHost = Constants.expoConfig?.hostUri;
    
    if (debuggerHost) {
        const ip = debuggerHost.split(':')[0];
        return `http://${ip}:${API_PORT}`;
    }

    // Fallback if detection fails
    if (Platform.OS === 'android') {
        return `http://10.0.2.2:${API_PORT}`;
    }

    // For iOS and others, localhost usually works for simulators
    return `http://localhost:${API_PORT}`;
};

export const API_BASE_URL = getBaseUrl();
console.log("API URL:", API_BASE_URL);
