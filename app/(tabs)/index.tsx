import Slider from '@react-native-community/slider';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, View } from 'react-native';
import { Button, Surface, Text, TextInput, Title, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
// Import the store we just created
import { SessionStore } from '../../services/SessionStore';
import { MockScroll } from '../../src/dev/mockData';

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

    if (__DEV__) {
      console.log("[Weaver] DEV MODE: Loading Mock Data...");
      setTimeout(() => {
        SessionStore.setDraft(MockScroll.worksheet_data, true);
        SessionStore.setInstructions(MockScroll.instruction_text);
        SessionStore.setTheme(themeInput);

        console.log("Mock data loaded. Navigating...");
        setLoading(false);
        router.push("/results");
      }, 800);
      return;
    }

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
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 p-5 justify-center">
        <Surface className="p-6 rounded-2xl bg-card" elevation={2}>
          <Title className="text-3xl font-bold text-center mb-1 text-text">The Weaver</Title>
          <Text className="text-sm text-center mb-8 opacity-70 text-text">Compose your curriculum</Text>

          <TextInput
            label="Theme"
            placeholder="e.g. Ancient Rome, Quantum Physics"
            value={themeInput}
            onChangeText={setThemeInput}
            mode="outlined"
            className="mb-6 bg-card"
            textColor={theme.colors.onSurface}
            activeOutlineColor={theme.colors.primary}
            disabled={loading}
          />

          <View className="mb-8">
            <View className="flex-row justify-between mb-2">
              <Text className="text-base text-text">Sentence Count</Text>
              <Text className="text-lg font-bold text-accent">{count}</Text>
            </View>
            <Slider
              style={{ width: '100%', height: 40 }}
              minimumValue={5}
              maximumValue={50}
              step={1}
              value={count}
              onValueChange={setCount}
              minimumTrackTintColor={theme.colors.primary}
              maximumTrackTintColor={theme.colors.onSurfaceVariant}
              thumbTintColor={theme.colors.primary}
            />
          </View>

          <Button
            mode="contained"
            onPress={handleWeave}
            loading={loading}
            disabled={loading}
            className="rounded-lg"
            contentStyle={{ paddingVertical: 8 }}
            buttonColor={theme.colors.primary}
            textColor={theme.colors.onPrimary}
          >
            {loading ? "Weaving Draft..." : "Weave Curriculum"}
          </Button>
        </Surface>
      </View>
    </SafeAreaView>
  );
}
