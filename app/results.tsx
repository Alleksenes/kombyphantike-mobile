import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import { ActivityIndicator, Button, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import PhilologyCard from '../components/PhilologyCard';
// Import the store
import { SessionStore } from '../services/SessionStore';

export default function ResultsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { width } = useWindowDimensions();

  // State for the data
  const [data, setData] = useState<any[]>([]);
  const [isFilling, setIsFilling] = useState(false);

  useEffect(() => {
    // 1. Load Draft from Store immediately
    const draft = SessionStore.getDraft();
    const instructions = SessionStore.getInstructions();

    if (draft && Array.isArray(draft)) {
      console.log("Loaded Draft from Store:", draft.length, "items");
      setData(draft);

      // 2. Trigger AI Fill (The Slow Part)
      fillCurriculum(draft, instructions);
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
      }
    } catch (e) {
      console.error("AI Fill Failed", e);
    } finally {
      setIsFilling(false);
    }
  };

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    // Map Snake_Case to UI Props
    const modern = item.target_sentence || "Generating..."; // Show placeholder while filling
    const ancient = item.ancient_context || "NO_CITATION_FOUND";
    const english = item.source_sentence || "Pending translation...";
    const tokens = item.target_tokens || undefined;

    return (
      <View style={{ width: width, alignItems: 'center' }}>
        <PhilologyCard
          modernGreek={modern}
          targetTokens={tokens}
          ancientContext={ancient}
          englishTranslation={english}
          index={index}
          total={data.length}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Button mode="text" onPress={() => router.back()} icon="arrow-left" textColor={theme.colors.onSurface}>
          Back
        </Button>
        <Text variant="titleMedium" style={styles.headerTitle}>The Scroll</Text>
        {isFilling && <ActivityIndicator animating={true} size="small" />}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8, paddingVertical: 8 },
  headerTitle: { fontWeight: 'bold', opacity: 0.7 },
  listContainer: { flex: 1 },
});