import React, { useState } from 'react';
import { View, StyleSheet, FlatList, useWindowDimensions } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import PhilologyCard from '../components/PhilologyCard';

export default function ResultsScreen() {
  const { worksheetData } = useLocalSearchParams();
  const router = useRouter();
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const [containerHeight, setContainerHeight] = useState(0);

  let data: any[] = [];
  let title = "The Scroll";

  try {
    const parsed = worksheetData ? JSON.parse(worksheetData as string) : null;
    if (parsed) {
      if (Array.isArray(parsed)) {
        data = parsed;
      } else if (Array.isArray(parsed.sentences)) {
        data = parsed.sentences;
      } else if (Array.isArray(parsed.results)) {
        data = parsed.results;
      } else if (parsed.worksheet && Array.isArray(parsed.worksheet)) {
        data = parsed.worksheet;
      } else {
        if (parsed.sentence || parsed.text || parsed.modern_greek) {
          data = [parsed];
        }
      }
      if (parsed.title) {
        title = parsed.title;
      }
    }
  } catch (e) {
    console.error("Failed to parse data", e);
  }

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    // Robust data mapping
    const modern = item.modern_greek || item.sentence || item.text || item.content || "—";
    const ancient = item.ancient_context || item.context || item.etymology || item.explanation || "—";
    const english = item.english_translation || item.translation || item.english || item.definition || "—";

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
        <Button
          mode="text"
          onPress={() => router.back()}
          icon="arrow-left"
          textColor={theme.colors.onSurface}
        >
          Back
        </Button>
        <Text variant="titleMedium" style={styles.headerTitle}>{title}</Text>
        <View style={{ width: 80 }} />
      </View>

      <View
        style={styles.listContainer}
        onLayout={(e) => setContainerHeight(e.nativeEvent.layout.height)}
      >
        {containerHeight > 0 && (
          data.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text variant="headlineSmall" style={{ color: theme.colors.secondary }}>
                The scroll is empty.
              </Text>
            </View>
          ) : (
            <FlatList
              data={data}
              renderItem={renderItem}
              keyExtractor={(_, index) => index.toString()}
              pagingEnabled
              snapToAlignment="start"
              decelerationRate="fast"
              showsVerticalScrollIndicator={false}
            />
          )
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  headerTitle: {
    fontWeight: 'bold',
    opacity: 0.7,
  },
  listContainer: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
