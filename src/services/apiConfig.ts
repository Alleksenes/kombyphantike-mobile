import Constants from 'expo-constants';
import { Platform } from 'react-native';

const API_PORT = '8000';

const getBaseUrl = () => {
    if (Platform.OS === 'web') return `http://localhost:${API_PORT}`;

    // AUTOMATIC IP DETECTION
    // This grabs the IP of your computer from the Expo Runner
    const debuggerHost = Constants.expoConfig?.hostUri;
    
    if (debuggerHost) {
        const ip = debuggerHost.split(':')[0];
        return `http://${ip}:${API_PORT}`;
    }

    // Fallback if detection fails (e.g. release build)
    return `http://10.0.2.2:${API_PORT}`;
};

// export const API_BASE_URL = "http://10.0.2.2:8000";
export const API_BASE_URL = getBaseUrl();
// export const API_BASE_URL"http://10.54.5.119:8000";
console.log("API URL:", API_BASE_URL) 