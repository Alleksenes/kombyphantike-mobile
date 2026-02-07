import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider } from 'react-native-paper';
import OmegaLoader from '../components/OmegaLoader';
import '../global.css';
import Atmosphere from '../src/components/Atmosphere';
import { initDatabase } from '../src/services/Database';
import { ScriptoriumTheme } from '../src/theme';

export default function RootLayout() {
  const { colorScheme, setColorScheme } = useColorScheme();


  const [fontsLoaded] = useFonts({
    'GFSDidot': require('../assets/fonts/GFSDidot.otf'),
    'NeueHaasGrotesk': require('../assets/fonts/NeueHaasGrotesk.otf'),
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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider theme={ScriptoriumTheme}>
        <StatusBar style="light" />
        {/* Atmosphere Background */}
        <Atmosphere />

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