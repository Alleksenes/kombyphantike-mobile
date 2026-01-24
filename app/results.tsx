import React, { useState, useMemo } from 'react';
import { View, StyleSheet, FlatList, useWindowDimensions, Dimensions } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import PhilologyCard from '../components/PhilologyCard';

export default function ResultsScreen() {
  const { worksheetData } = useLocalSearchParams();
  const router = useRouter();
  const theme = useTheme();
  const { width, height: windowHeight } = useWindowDimensions();
  // Default to window height if layout hasn't happened yet, just to show something
  const [listHeight, setListHeight] = useState<number>(windowHeight - 100);

  const { data, title, error } = useMemo(() => {
    let data: any[] = [];
    let title = "The Scroll";
    let error = null;

    try {
      if (!worksheetData) {
        return { data: [], title, error: "No data received from the weaver." };
      }

      const raw = Array.isArray(worksheetData) ? worksheetData[0] : worksheetData;
      const parsed = JSON.parse(raw as string);

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
          // Single item fallback
          if (parsed.sentence || parsed.text || parsed.modern_greek) {
            data = [parsed];
          }
        }
        if (parsed.title) {
          title = parsed.title;
        }
      }

      if (data.length === 0) {
        // Debugging: Log what we got if we couldn't find an array
        console.log("Parsed data but found no array:", parsed);
        error = "The weaver produced a thread, but no sentences were found.";
      }

    } catch (e: any) {
      console.error("Failed to parse data", e);
      error = `Failed to unravel the scroll: ${e.message}`;
    }

    return { data, title, error };
  }, [worksheetData]);

  const renderItem = ({ item, index }: { item: any; index: number }) => {
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
        height={listHeight}
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
        onLayout={(e) => {
            const { height } = e.nativeEvent.layout;
            if (height > 0) setListHeight(height);
        }}
      >
        {error ? (
          <View style={styles.centerContainer}>
            <Text variant="bodyLarge" style={{ color: theme.colors.error, textAlign: 'center', padding: 20 }}>
              {error}
            </Text>
            {/* Optional: Show raw data in dev mode for debugging */}
            <Text variant="bodySmall" style={{ opacity: 0.5, marginTop: 10 }}>
                Debug: {typeof worksheetData === 'string' ? worksheetData.slice(0, 50) + '...' : 'Invalid Type'}
            </Text>
          </View>
        ) : data.length === 0 ? (
          <View style={styles.centerContainer}>
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
            getItemLayout={(data, index) => (
                {length: listHeight, offset: listHeight * index, index}
            )}
          />
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
