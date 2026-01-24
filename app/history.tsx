import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, Surface, Title, useTheme, IconButton, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getHistory, clearHistory, HistoryItem } from '../services/storage';

export default function HistoryScreen() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const router = useRouter();
  const theme = useTheme();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const data = await getHistory();
    setHistory(data);
  };

  const handleClear = async () => {
      await clearHistory();
      setHistory([]);
  };

  const openScroll = (item: HistoryItem) => {
    router.push({
      pathname: "/results",
      params: {
          worksheetData: JSON.stringify(item.data),
          titleOverride: item.theme // Optional: Pass title if results supports it
      }
    });
  };

  const renderItem = ({ item }: { item: HistoryItem }) => {
    const date = new Date(item.date).toLocaleDateString(undefined, {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    return (
      <TouchableOpacity onPress={() => openScroll(item)}>
        <Surface style={styles.card} elevation={1}>
          <View style={styles.cardContent}>
              <View style={styles.iconContainer}>
                 <IconButton icon="scroll" size={24} iconColor={theme.colors.primary} />
              </View>
              <View style={styles.textContainer}>
                  <Text variant="titleMedium" style={styles.themeTitle}>{item.theme}</Text>
                  <Text variant="bodySmall" style={styles.dateText}>{date}</Text>
              </View>
              <IconButton icon="chevron-right" iconColor={theme.colors.outline} />
          </View>
        </Surface>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Button
            icon="arrow-left"
            mode="text"
            onPress={() => router.back()}
            textColor={theme.colors.onSurface}
        >
            Back
        </Button>
        <Title style={styles.screenTitle}>Archived Scrolls</Title>
        <Button
            mode="text"
            onPress={handleClear}
            textColor={theme.colors.error}
            disabled={history.length === 0}
        >
            Clear
        </Button>
      </View>

      <View style={styles.content}>
        {history.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No scrolls in the archive.</Text>
            <Text style={styles.emptySubtext}>Weave a new curriculum to save it here.</Text>
          </View>
        ) : (
          <FlatList
            data={history}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'serif',
  },
  content: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  card: {
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  iconContainer: {
    padding: 4,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 8,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  themeTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  dateText: {
    opacity: 0.5,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.6,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
  }
});
