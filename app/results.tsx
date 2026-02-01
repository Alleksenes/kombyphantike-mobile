import { useRouter } from 'expo-router';
import { useEffect, useState, useRef, useCallback } from 'react';
import { FlatList, Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import { ActivityIndicator, Button, IconButton, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet from '@gorhom/bottom-sheet';
import PhilologyCard from '../components/PhilologyCard';
import InspectorSheet from '../components/InspectorSheet';
import { Token } from '../components/WordChip';
// Import the store
import { SessionStore } from '../services/SessionStore';
import { saveSession } from '../src/services/Database';

export default function ResultsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const { width } = useWindowDimensions();
  const bottomSheetRef = useRef<BottomSheet>(null);

  // State for the data
  const [data, setData] = useState<any[]>([]);
  const [isFilling, setIsFilling] = useState(false);

  // State for Inspector
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [selectedContext, setSelectedContext] = useState<string>('');

  useEffect(() => {
    // 1. Load Draft from Store immediately
    const draft = SessionStore.getDraft();
    const instructions = SessionStore.getInstructions();
    const isFilled = SessionStore.isFilled();

    if (draft && Array.isArray(draft)) {
      console.log("Loaded Draft from Store:", draft.length, "items");
      setData(draft);

      // 2. Trigger AI Fill (The Slow Part)
      if (!isFilled) {
        fillCurriculum(draft, instructions);
      } else {
        console.log("Loaded fully filled curriculum from history.");
      }
    } else {
      console.error("No draft found in store.");
    }
  }, []);

  const fillCurriculum = async (draftData: any[], instructions: string) => {
    setIsFilling(true);
    console.log("Igniting AI Generation...");

    const baseUrl = Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';

    try {
      const response = await fetch(`${baseUrl}/fill_curriculum`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          worksheet_data: draftData,
          instruction_text: instructions
        }),
      });

      if (!response.ok) throw new Error("Fill failed");

      const result = await response.json();

      // 3. Update UI with filled sentences
      if (result.worksheet_data) {
        console.log("AI Generation Complete.");
        setData(result.worksheet_data);

        // Save to DB
        const currentTheme = SessionStore.getTheme() || "Unknown Theme";
        saveSession(currentTheme, result.worksheet_data);
      }
    } catch (e) {
      console.error("AI Fill Failed", e);
    } finally {
      setIsFilling(false);
    }
  };

  const handleTokenPress = useCallback((token: Token, context: string) => {
    setSelectedToken(token);
    setSelectedContext(context);
    // Snap to the first open point (index 0, which is 45%)
    bottomSheetRef.current?.snapToIndex(0);
  }, []);

  const renderItem = useCallback(({ item, index }: { item: any; index: number }) => {
    // Map Snake_Case to UI Props
    const modern = item.target_sentence || "Generating..."; // Show placeholder while filling
    const ancient = item.ancient_context || "NO_CITATION_FOUND";
    const english = item.source_sentence || "Pending translation...";
    const tokens = item.target_tokens || undefined;
    const knot = item.grammar_nuance || item.knot || item.nuance || "Grammar note pending...";

    return (
      <View style={{ width: width, alignItems: 'center' }}>
        <PhilologyCard
          modernGreek={modern}
          targetTokens={tokens}
          ancientContext={ancient}
          englishTranslation={english}
          knot={knot}
          index={index}
          total={data.length}
          onTokenPress={(token) => handleTokenPress(token, ancient)}
        />
      </View>
    );
  }, [width, data.length, handleTokenPress]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <Button mode="text" onPress={() => router.back()} icon="arrow-left" textColor={theme.colors.onSurface}>
            Back
          </Button>
          <Text variant="titleMedium" style={styles.headerTitle}>The Scroll</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {isFilling && <ActivityIndicator animating={true} size="small" style={{ marginRight: 8 }} />}
            <IconButton
              icon={colorScheme === 'dark' ? 'weather-sunny' : 'weather-night'}
              onPress={toggleColorScheme}
              iconColor={theme.colors.onSurface}
            />
          </View>
        </View>

        <View style={styles.listContainer}>
          <FlatList
            data={data}
            renderItem={renderItem}
            keyExtractor={(_, index) => index.toString()}
            horizontal
            pagingEnabled
            snapToAlignment="center"
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 20 }}
          />
        </View>

        <InspectorSheet
          ref={bottomSheetRef}
          selectedToken={selectedToken}
          ancientContext={selectedContext}
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8, paddingVertical: 8 },
  headerTitle: { fontWeight: 'bold', opacity: 0.7 },
  listContainer: { flex: 1 },
});