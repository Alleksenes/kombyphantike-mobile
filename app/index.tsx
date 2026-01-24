import React, { useState } from 'react';
import { View, StyleSheet, Platform, Alert } from 'react-native';
import { TextInput, Button, Text, Surface, Title, useTheme, HelperText } from 'react-native-paper';
import Slider from '@react-native-community/slider';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WeaverScreen() {
  const [themeInput, setThemeInput] = useState('');
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Allow user to override base URL for debugging if needed (could be an env var later)
  // For now, robust default detection.
  const defaultBaseUrl = Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';
  const [baseUrl, setBaseUrl] = useState(defaultBaseUrl);

  const router = useRouter();
  const theme = useTheme();

  const handleWeave = async () => {
    setErrorMsg(null);
    if (!themeInput.trim()) {
       const msg = "Please enter a theme";
       setErrorMsg(msg);
       if (Platform.OS !== 'web') Alert.alert("Error", msg);
       return;
    }
    setLoading(true);

    const url = `${baseUrl}/generate_worksheet`;

    try {
      console.log(`[Weaver] Requesting ${url} with theme: ${themeInput}, count: ${count}`);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          theme: themeInput,
          count: count,
          complete_with_ai: true,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Server error: ${response.status} ${text}`);
      }

      const data = await response.json();
      console.log("[Weaver] Response data:", JSON.stringify(data, null, 2));

      router.push({
        pathname: "/results",
        params: { worksheetData: JSON.stringify(data) }
      });
    } catch (error: any) {
      console.error("[Weaver] Error:", error);
      let msg = error.message || "Could not connect to the loom.";

      if (Platform.OS === 'web' && msg.includes('Failed to fetch')) {
          msg += " (Check CORS config on backend or ensure server is running)";
      }

      setErrorMsg(msg);
      // On mobile, also show alert
      if (Platform.OS !== 'web') {
        Alert.alert("Weaving Failed", msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.contentContainer}>
        <Surface style={styles.surface} elevation={2}>
          <Title style={styles.title}>The Weaver</Title>
          <Text style={styles.subtitle}>Compose your curriculum</Text>

          <TextInput
            label="Theme"
            placeholder="e.g. Ancient Rome, Quantum Physics"
            value={themeInput}
            onChangeText={setThemeInput}
            mode="outlined"
            style={styles.input}
            disabled={loading}
            error={!!errorMsg}
          />

          <View style={styles.sliderContainer}>
            <View style={styles.sliderLabelRow}>
              <Text style={styles.label}>Sentence Count</Text>
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
              maximumTrackTintColor={theme.colors.surfaceVariant}
              thumbTintColor={theme.colors.primary}
            />
            <View style={styles.sliderBounds}>
              <Text style={styles.boundText}>5</Text>
              <Text style={styles.boundText}>50</Text>
            </View>
          </View>

          {errorMsg && (
            <View style={styles.errorContainer}>
               <Text style={[styles.errorText, { color: theme.colors.error }]}>{errorMsg}</Text>
            </View>
          )}

          <Button
            mode="contained"
            onPress={handleWeave}
            loading={loading}
            disabled={loading}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            {loading ? "Weaving..." : "Weave Curriculum"}
          </Button>

          <Text style={styles.debugInfo}>
             Target: {baseUrl}
          </Text>
        </Surface>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  surface: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'stretch',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.7,
  },
  input: {
    marginBottom: 24,
  },
  sliderContainer: {
    marginBottom: 24,
  },
  sliderLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
  },
  countValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6200ee',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderBounds: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  boundText: {
    fontSize: 12,
    opacity: 0.5,
  },
  button: {
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  errorContainer: {
    marginBottom: 16,
    padding: 8,
    backgroundColor: '#ffebee',
    borderRadius: 4,
  },
  errorText: {
    textAlign: 'center',
    fontSize: 14,
  },
  debugInfo: {
      textAlign: 'center',
      fontSize: 10,
      marginTop: 16,
      opacity: 0.4
  }
});
