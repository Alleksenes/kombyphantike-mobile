import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Platform, Alert, Animated, Easing } from 'react-native';
import { TextInput, Button, Text, Surface, Title, useTheme, ProgressBar } from 'react-native-paper';
import Slider from '@react-native-community/slider';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

export default function WeaverScreen() {
  const [themeInput, setThemeInput] = useState('');
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const defaultBaseUrl = Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';
  const [baseUrl] = useState(defaultBaseUrl);

  const router = useRouter();
  const theme = useTheme();

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();
  }, []);

  const handleWeave = async () => {
    setErrorMsg(null);
    if (!themeInput.trim()) {
       const msg = "Please enter a theme";
       setErrorMsg(msg);
       if (Platform.OS !== 'web') Alert.alert("Error", msg);
       return;
    }
    setLoading(true);

    // Use the draft_curriculum endpoint for instant feedback
    const url = `${baseUrl}/draft_curriculum`;

    try {
      console.log(`[Weaver] Requesting draft ${url} with theme: ${themeInput}, count: ${count}`);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          theme: themeInput,
          count: count,
          // complete_with_ai removed as we now fill later
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Server error: ${response.status} ${text}`);
      }

      const data = await response.json();
      console.log("[Weaver] Draft data received, navigating...");

      // NOTE: We do NOT save to history yet. We save only fully filled curriculums in results.tsx.

      router.push({
        pathname: "/results",
        params: {
            worksheetData: JSON.stringify(data),
            isDraft: "true"
        }
      });
    } catch (error: any) {
        console.error("[Weaver] Error:", error);
        let msg = error.message || "Could not connect to the loom.";

        if (Platform.OS === 'web' && msg.includes('Failed to fetch')) {
            msg += " (Check CORS config on backend or ensure server is running)";
        }

        setErrorMsg(msg);
        if (Platform.OS !== 'web') {
        Alert.alert("Weaving Failed", msg);
        }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style="dark" />
      <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>

        <View style={styles.header}>
            <Text style={styles.headerEyebrow}>KOMBYPHANTIKE</Text>
            <Title style={styles.title}>The Weaver</Title>
            <Text style={styles.subtitle}>Compose your curriculum from the threads of history.</Text>
        </View>

        <Surface style={styles.formCard} elevation={0}>
          <TextInput
            label="Historical Theme"
            placeholder="e.g. The Fall of Troy, Plato's Cave"
            value={themeInput}
            onChangeText={setThemeInput}
            mode="flat"
            style={styles.input}
            underlineColor={theme.colors.primary}
            activeUnderlineColor={theme.colors.primary}
            contentStyle={{ backgroundColor: 'transparent' }}
            disabled={loading}
            error={!!errorMsg}
          />

          <View style={styles.sliderContainer}>
            <View style={styles.sliderLabelRow}>
              <Text style={styles.label}>Complexity (Sentences)</Text>
              <Text style={styles.countValue}>{count}</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={5}
              maximumValue={50}
              step={1}
              value={count}
              onValueChange={setCount}
              minimumTrackTintColor={theme.colors.primary}
              maximumTrackTintColor="#d7d7d7"
              thumbTintColor={theme.colors.primary}
            />
          </View>

          {errorMsg && (
            <View style={styles.errorContainer}>
               <Text style={[styles.errorText, { color: theme.colors.error }]}>{errorMsg}</Text>
            </View>
          )}

          <View>
            <Button
                mode="contained"
                onPress={handleWeave}
                style={styles.button}
                loading={loading}
                disabled={loading}
                contentStyle={styles.buttonContent}
                labelStyle={styles.buttonLabel}
            >
                {loading ? "Preparing threads..." : "Begin Weaving"}
            </Button>

            <Button
            mode="text"
            onPress={() => router.push('/history')}
            style={styles.historyButton}
            textColor={theme.colors.secondary}
            disabled={loading}
            >
                View Archived Scrolls
            </Button>
          </View>

        </Surface>

        <View style={styles.footer}>
             <Text style={styles.footerText}>Connected to {baseUrl}</Text>
        </View>

      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
      alignItems: 'center',
      marginBottom: 48,
  },
  headerEyebrow: {
      fontSize: 12,
      letterSpacing: 3,
      fontWeight: '600',
      opacity: 0.5,
      marginBottom: 8,
      textTransform: 'uppercase',
  },
  title: {
    fontSize: 42,
    fontFamily: 'serif',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.6,
    fontFamily: 'serif',
    fontStyle: 'italic',
    maxWidth: '80%',
  },
  formCard: {
    backgroundColor: 'transparent',
    alignItems: 'stretch',
  },
  input: {
    marginBottom: 32,
    backgroundColor: 'transparent',
    fontSize: 18,
  },
  sliderContainer: {
    marginBottom: 48,
  },
  sliderLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  countValue: {
    fontSize: 24,
    fontWeight: '300',
    fontFamily: 'serif',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  button: {
    borderRadius: 4,
    elevation: 0,
    backgroundColor: '#2A2A2A',
  },
  buttonContent: {
    paddingVertical: 12,
  },
  buttonLabel: {
      fontSize: 16,
      letterSpacing: 1,
      fontWeight: 'bold',
  },
  historyButton: {
      marginTop: 16,
  },
  errorContainer: {
    marginBottom: 24,
    padding: 12,
    backgroundColor: '#ffebee',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffcdd2',
  },
  errorText: {
    textAlign: 'center',
    fontSize: 14,
  },
  footer: {
      position: 'absolute',
      bottom: 20,
      alignSelf: 'center',
  },
  footerText: {
      fontSize: 10,
      opacity: 0.3,
  }
});
