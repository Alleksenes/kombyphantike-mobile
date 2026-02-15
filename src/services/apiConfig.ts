import Constants from 'expo-constants';
import { Platform } from 'react-native';

const API_PORT = '8000';

const getBaseUrl = () => {
    // 1. Check for explicit environment variable override
    const explicitUrl = process.env.EXPO_PUBLIC_API_URL;

    // In production, we enforce usage of the environment variable
    if (!__DEV__) {
        if (!explicitUrl) {
            return 'https://api.missing-env-var.error';
        }
        if (explicitUrl.startsWith('http://')) {
            console.warn('Insecure API URL (HTTP) detected in production');
        }
        return explicitUrl;
    }

    // In development, allow override if present
    if (explicitUrl) {
        return explicitUrl;
    }

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

    return `http://localhost:${API_PORT}`;
};

export const API_BASE_URL = getBaseUrl();

if (__DEV__) {
    console.log("API URL:", API_BASE_URL);
}
