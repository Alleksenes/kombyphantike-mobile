import Constants from 'expo-constants';
import { Platform } from 'react-native';

const API_PORT = '8000';

const getBaseUrl = () => {
    // 1. Explicit environment variable always wins (dev & production)
    const explicitUrl = process.env.EXPO_PUBLIC_API_URL;
    if (explicitUrl) {
        return explicitUrl;
    }

    // 2. In production, require the env var — no silent localhost fallback
    if (!__DEV__) {
        console.error('EXPO_PUBLIC_API_URL is required in production builds.');
        return 'https://api.missing-env-var.error';
    }

    // 3. Development: platform-aware auto-detection
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
console.log('API URL:', API_BASE_URL);
