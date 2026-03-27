import Constants from 'expo-constants';
import { Platform } from 'react-native';

const API_PORT = '8000';

const getBaseUrl = () => {
    const explicitUrl = process.env.EXPO_PUBLIC_API_URL;

    // 1. If an explicit URL is set in .env, use it.
    if (explicitUrl) {
        // SAFETY CATCH: If you are running on Web but your .env says 10.0.2.2 (Android IP),
        // we must override it, because Web browsers cannot route to 10.0.2.2.
        if (Platform.OS === 'web' && explicitUrl.includes('10.0.2.2')) {
            return `http://127.0.0.1:${API_PORT}`;
        }
        return explicitUrl;
    }

    // 2. Automatic IP detection (Grabs your PC's IP if using Expo Go app on physical phone)
    const debuggerHost = Constants.expoConfig?.hostUri;
    if (debuggerHost) {
        const ip = debuggerHost.split(':')[0];
        return `http://${ip}:${API_PORT}`;
    }

    // 3. Platform-specific fallbacks
    if (Platform.OS === 'android') {
        // 10.0.2.2 is the Android Emulator's alias for your PC's localhost
        return `http://10.0.2.2:${API_PORT}`;
    }

    // For iOS simulators and Web browsers
    return `http://127.0.0.1:${API_PORT}`;
};

export const API_BASE_URL = getBaseUrl();
console.log("API URL:", API_BASE_URL);