import Slider from '@react-native-community/slider';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, StyleSheet, View } from 'react-native';
import { Button, Surface, Text, TextInput, Title, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
// Import the store we just created
import { SessionStore } from '../../services/SessionStore';

export default function WeaverScreen() {
  const [themeInput, setThemeInput] = useState('Cosmos'); // Default for testing
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const theme = useTheme();

  const handleWeave = async () => {
    if (!themeInput.trim()) {
      Alert.alert("Error", "Please enter a theme");
      return;
    }
    setLoading(true);

    // 1. Determine API URL
    const baseUrl = Platform.OS === 'android'
      ? 'http://10.0.2.2:8000'
      : 'http://localhost:8000';

    // 2. Call the DRAFT endpoint (Fast)
    const url = `${baseUrl}/draft_curriculum`;

    try {
      console.log(`[Weaver] Requesting Draft from ${url}`);

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme: themeInput,
          count: count
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Server error: ${response.status} ${text}`);
      }

      const data = await response.json();

      // 3. Save to SessionStore (Memory)
      // The API returns { worksheet_data: [...], instruction_text: "..." }
      if (data.worksheet_data) {
        SessionStore.setDraft(data.worksheet_data);
        SessionStore.setInstructions(data.instruction_text);
        SessionStore.setTheme(themeInput);

        console.log("Draft saved to store. Navigating...");

        // 4. Navigate WITHOUT params (Clean URL)
        router.push("/results");
      } else {
        throw new Error("Invalid API response format");
      }

    } catch (error: any) {
      Alert.alert("Weaving Failed", error.message);
      console.error(error);
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
          </View>

          <Button
            mode="contained"
            onPress={handleWeave}
            loading={loading}
            disabled={loading}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            {loading ? "Weaving Draft..." : "Weave Curriculum"}
          </Button>
        </Surface>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { flex: 1, padding: 20, justifyContent: 'center' },
  surface: { padding: 24, borderRadius: 16 },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 14, textAlign: 'center', marginBottom: 32, opacity: 0.7 },
  input: { marginBottom: 24 },
  sliderContainer: { marginBottom: 32 },
  sliderLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  label: { fontSize: 16 },
  countValue: { fontSize: 18, fontWeight: 'bold', color: '#6200ee' },
  slider: { width: '100%', height: 40 },
  button: { borderRadius: 8 },
  buttonContent: { paddingVertical: 8 }
});
