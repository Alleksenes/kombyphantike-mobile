import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider } from 'react-native-paper';
import OmegaLoader from '../components/OmegaLoader';
import CosmicBackground from '../components/ui/CosmicBackground';
import '../global.css';
import { initDatabase } from '../src/services/Database';
import { ScriptoriumTheme } from '../src/theme';

export default function RootLayout() {
  const { colorScheme, setColorScheme } = useColorScheme();


  const [fontsLoaded] = useFonts({
    'GFSDidot': require('../assets/fonts/GFSDidot.otf'),
    'NeueHaasGrotesk-Display': require('../assets/fonts/NeueHaasGrotesk.otf'),
    'NeueHaasGrotesk-Text': require('../assets/fonts/NeueHaasGroteskLight.otf'),
  });

  useEffect(() => {
    initDatabase();
    // Force NativeWind to dark mode
    if (colorScheme !== 'dark') {
      setColorScheme('dark');
    }
  }, [colorScheme, setColorScheme]);

  if (!fontsLoaded) {
    return (
      <View style={styles.loaderContainer}>
        <OmegaLoader />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#1a1918' }}>
      <CosmicBackground />
      <GestureHandlerRootView style={{ flex: 1 }}>
        <PaperProvider theme={ScriptoriumTheme}>
          <StatusBar style="light" />

          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: 'transparent' },
              animation: 'fade',
            }}
          >
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="results" />
          </Stack>
        </PaperProvider>
      </GestureHandlerRootView>
    </View>
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