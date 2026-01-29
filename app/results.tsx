import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import PhilologyCard from '../components/PhilologyCard';
import { saveSession } from '../src/services/Database';

export default function ResultsScreen() {
  const { draftData, instructionText } = useLocalSearchParams();
  const router = useRouter();
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const [containerHeight, setContainerHeight] = useState(0);
  
  // State for the data (starts with draft, updates with filled)
  const [data, setData] = useState<any[]>([]);
  const [isFilling, setIsFilling] = useState(false);

  // 1. Load Draft Immediately
  useEffect(() => {
    if (draftData) {
      try {
        const parsed = JSON.parse(draftData as string);
        setData(parsed);
        saveSession(instructionText as string || "Untitled", parsed);
        // Trigger AI Fill automatically
        fillCurriculum(parsed, instructionText as string);
      } catch (e) {
        console.error("Parse error", e);
      }
    }
  }, [draftData, instructionText]);

  // 2. The AI Fill Function
  const fillCurriculum = async (currentRows: any[], instructions: string) => {
    setIsFilling(true);
    const baseUrl = Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';
    const url = `${baseUrl}/fill_curriculum`;

    try {
        console.log("Igniting AI Generation...");
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                worksheet_data: currentRows,
                instruction_text: instructions
            })
        });

        if (!response.ok) throw new Error("AI Fill Failed");
        
        const json = await response.json();
        // Update state with the filled sentences
        setData(json.worksheet_data);
    } catch (e) {
        console.error(e);
        // Optional: Alert user
    } finally {
        setIsFilling(false);
    }
  };

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    // Map Snake Case Keys (New Backend Format)
    const modern = item.target_sentence || "Generating...";
    const ancient = item.ancient_context || "";
    const english = item.source_sentence || "";

    return (
      <PhilologyCard
        modernGreek={modern}
        ancientContext={ancient}
        englishTranslation={english}
        index={index}
        total={data.length}
        width={width}
        height={containerHeight}
      />
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Button mode="text" onPress={() => router.back()} icon="arrow-left">Back</Button>
        <Text variant="titleMedium">The Scroll</Text>
        {isFilling && <ActivityIndicator size="small" color={theme.colors.primary} />}
      </View>

      <View style={styles.listContainer} onLayout={(e) => setContainerHeight(e.nativeEvent.layout.height)}>
          <FlatList
            data={data}
            renderItem={renderItem}
            keyExtractor={(_, index) => index.toString()}
            pagingEnabled
            snapToAlignment="start"
            decelerationRate="fast"
            showsVerticalScrollIndicator={false}
          />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 8,
  },
  listContainer: { flex: 1 },
});