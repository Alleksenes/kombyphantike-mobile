import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import OmegaLoader from '../components/OmegaLoader';
import TheInspector from '../components/ui/TheInspector';
import CosmicBackground from '../components/ui/CosmicBackground';
import { initDatabase } from '../src/services/Database';
import { ScriptoriumTheme } from '../src/theme';
import '../global.css';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'GFSDidot': require('../assets/fonts/GFSDidot.otf'),
    'NeueHaasGrotesk-Display': require('../assets/fonts/NeueHaasGrotesk.otf'),
    'NeueHaasGrotesk-Text': require('../assets/fonts/NeueHaasGroteskLight.otf'),
  });

  useEffect(() => {
    initDatabase();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={styles.loaderContainer}>
        <OmegaLoader />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: '#0f0518' }}>
        {/* 1. The Universe (Global Background) */}
        <CosmicBackground />

        {/* 2. The Interaction Layer */}
        <GestureHandlerRootView style={{ flex: 1, backgroundColor: 'transparent' }}>
          <PaperProvider theme={ScriptoriumTheme}>
            <StatusBar style="light" />
            <Stack
              screenOptions={{
                headerShown: false,
                // CRITICAL: Make the stack transparent so we see the stars
                contentStyle: { backgroundColor: 'transparent' },
                sceneStyle: { backgroundColor: 'transparent' },
                animation: 'fade',
              }}
            >
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="results" />
              <Stack.Screen name="constellation" />
            </Stack>
            <TheInspector />
          </PaperProvider>
        </GestureHandlerRootView>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a0b2e',
  },
});
