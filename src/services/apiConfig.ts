import { Platform } from 'react-native';

export const getBaseUrl = () => {
    // 1. If we are on the Android Emulator, force the magic loopback tunnel.
    // This bypasses Windows Firewall and .env typos completely.
    if (Platform.OS === 'android') {
        return 'http://10.0.2.2:8000';
    }

    // 2. If we are on Web, force localhost.
    else {
        return 'http://localhost:8000';
    }

};

export const API_BASE_URL = getBaseUrl();
console.log("API URL STRIPPED AND FORCED:", API_BASE_URL);