import { useRouter } from 'expo-router';
import { useEffect, useState, useRef } from 'react';
import { FlatList, Platform, useWindowDimensions, View } from 'react-native';
import { Button, IconButton, Text, useTheme, SegmentedButtons } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet from '@gorhom/bottom-sheet';
import PhilologyCard from '../components/PhilologyCard';
import InspectorSheet from '../components/InspectorSheet';
import { Token } from '../components/WordChip';
import OmegaLoader from '../components/OmegaLoader';
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

  // State for Interaction Mode
  const [mode, setMode] = useState<'read' | 'analyze' | 'drill'>('read');

  // State for Inspector
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [selectedContext, setSelectedContext] = useState<string>('');
  const [selectedKnotContext, setSelectedKnotContext] = useState<string>('');

  useEffect(() => {
    // 1. Load Draft from Store immediately
    let draft = SessionStore.getDraft();
    const instructions = SessionStore.getInstructions();
    const isFilled = SessionStore.isFilled();

    // PERF: Handle lazy parsing if draft was passed as a string (from History)
    if (typeof draft === 'string') {
      try {
        draft = JSON.parse(draft);
        // Update store with parsed object to maintain consistency for other consumers
        SessionStore.setDraft(draft, isFilled);
      } catch (e) {
        console.error("Failed to parse draft from store", e);
        draft = [];
      }
    }

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

  const handleTokenPress = (token: Token, context: string, knotContext: string) => {
    setSelectedToken(token);
    setSelectedContext(context);
    setSelectedKnotContext(knotContext);
    // Snap to the first open point (index 0, which is 45%)
    bottomSheetRef.current?.snapToIndex(0);
  };

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    // Map Snake_Case to UI Props
    const modern = item.target_sentence || "Generating..."; // Show placeholder while filling
    const ancient = item.ancient_context || "NO_CITATION_FOUND";
    const english = item.source_sentence || "Pending translation...";
    const tokens = item.target_tokens || undefined;
    const knot = item.grammar_nuance || item.knot || item.nuance || "Grammar note pending...";
    const knotContext = item.knot_context;

    return (
      <View style={{ width: width, alignItems: 'center' }}>
        <PhilologyCard
          modernGreek={modern}
          targetTokens={tokens}
          ancientContext={ancient}
          englishTranslation={english}
          knot={knot}
          knotContext={knotContext}
          index={index}
          total={data.length}
          onTokenPress={(token) => handleTokenPress(token, ancient, knotContext)}
          mode={mode}
          selectedToken={selectedToken}
        />
      </View>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-row items-center justify-between px-2 py-2">
          <Button mode="text" onPress={() => router.back()} icon="arrow-left" textColor={theme.colors.onSurface}>
            Back
          </Button>
          <Text variant="titleMedium" className="font-bold opacity-70 text-text">The Scroll</Text>
          <View className="flex-row items-center">
            {isFilling && (
              <View className="mr-2">
                <OmegaLoader size={24} color={theme.colors.tertiary} />
              </View>
            )}
            <IconButton
              icon={colorScheme === 'dark' ? 'weather-sunny' : 'weather-night'}
              onPress={toggleColorScheme}
              iconColor={theme.colors.onSurface}
            />
          </View>
        </View>

        <View className="px-4 mb-2">
            <SegmentedButtons
              value={mode}
              onValueChange={(val) => setMode(val as any)}
              buttons={[
                { value: 'read', label: 'Read', icon: 'book-open-variant' },
                { value: 'analyze', label: 'Analyze', icon: 'magnify' },
                { value: 'drill', label: 'Drill', icon: 'school' },
              ]}
              theme={{ colors: { secondaryContainer: theme.colors.tertiary, onSecondaryContainer: 'black' } }}
            />
        </View>

        <View className="flex-1">
          <FlatList
            data={data}
            extraData={[mode, selectedToken]}
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
          knotContext={selectedKnotContext}
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
