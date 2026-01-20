import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Title, Paragraph, Button, useTheme } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ResultsScreen() {
  const { worksheetData } = useLocalSearchParams();
  const router = useRouter();
  const theme = useTheme();

  let data: any[] = [];
  let title = "The Scroll";

  try {
    const parsed = worksheetData ? JSON.parse(worksheetData as string) : null;

    // Attempt to normalize the data structure
    if (parsed) {
        if (Array.isArray(parsed)) {
            data = parsed;
        } else if (Array.isArray(parsed.sentences)) {
            data = parsed.sentences;
        } else if (Array.isArray(parsed.results)) {
            data = parsed.results;
        } else if (parsed.worksheet && Array.isArray(parsed.worksheet)) {
             // Another potential structure
             data = parsed.worksheet;
        } else {
            // If it's just an object, maybe it has keys we can iterate, or we just display it as one item
            // But for safety, let's treat it as a single item if it looks like one, or empty
            console.warn("Unknown data structure received:", parsed);
            // If it has 'sentence' or 'text' key, treat as one item
            if (parsed.sentence || parsed.text) {
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Title style={styles.screenTitle}>{title}</Title>
        <Button mode="text" onPress={() => router.back()}>Back</Button>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {data.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>The scroll is empty.</Text>
            <Text style={styles.emptySubText}>No sentences were returned from the weaver.</Text>
          </View>
        ) : (
          data.map((item, index) => (
            <Card key={index} style={styles.card} mode="elevated">
              <Card.Content>
                {/* Main Sentence - Try various keys */}
                <Title style={styles.sentenceText}>
                    {item.sentence || item.text || item.content || `Sentence ${index + 1}`}
                </Title>

                {/* Ancient Context - Distinct Style */}
                {(item.ancient_context || item.context || item.explanation) && (
                    <Paragraph style={styles.ancientContext}>
                        {item.ancient_context || item.context || item.explanation}
                    </Paragraph>
                )}
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: 'rgba(255,255,255,0.5)', // slightly transparent if needed
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    marginBottom: 16,
    backgroundColor: '#fffcf5', // Slightly ancient paper color? Or stick to theme.
  },
  sentenceText: {
    fontSize: 18,
    marginBottom: 8,
    lineHeight: 26,
  },
  ancientContext: {
    fontSize: 16,
    fontFamily: 'serif', // Serif for ancient feel
    fontStyle: 'italic',
    color: '#555',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  emptyContainer: {
    marginTop: 80,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 16,
    opacity: 0.6,
  }
});
