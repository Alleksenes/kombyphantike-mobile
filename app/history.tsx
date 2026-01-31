import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View, TouchableOpacity } from 'react-native';
import { Button, Text, useTheme, Surface, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getSessions } from '../src/services/Database';
import { SessionStore } from '../services/SessionStore';

export default function HistoryScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [sessions, setSessions] = useState<any[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const data = await getSessions();
    setSessions(data);
  };

  const handleSessionPress = (item: any) => {
    try {
      const parsedData = JSON.parse(item.json_data);
      SessionStore.setDraft(parsedData, true); // true = already filled
      SessionStore.setTheme(item.theme);
      router.push("/results");
    } catch (e) {
      console.error("Failed to parse session data", e);
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const date = new Date(item.date).toLocaleDateString() + ' ' + new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return (
      <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={1}>
        <TouchableOpacity onPress={() => handleSessionPress(item)} style={styles.cardContent}>
            <View>
                <Text variant="titleMedium" style={{color: theme.colors.primary, fontWeight: 'bold'}}>{item.theme || "Untitled Theme"}</Text>
                <Text variant="bodySmall" style={{color: theme.colors.onSurfaceVariant}}>{date}</Text>
            </View>
            <IconButton icon="chevron-right" iconColor={theme.colors.onSurfaceVariant} />
        </TouchableOpacity>
      </Surface>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Button mode="text" onPress={() => router.back()} icon="arrow-left" textColor={theme.colors.onSurface}>
          Back
        </Button>
        <Text variant="titleMedium" style={styles.headerTitle}>History</Text>
        <View style={{ width: 48 }} />
      </View>

      <FlatList
        data={sessions}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
            <View style={styles.emptyContainer}>
                <Text style={{color: theme.colors.onSurfaceVariant}}>No saved curriculums yet.</Text>
            </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8, paddingVertical: 8 },
  headerTitle: { fontWeight: 'bold', opacity: 0.7 },
  listContent: { padding: 16 },
  card: { marginBottom: 12, borderRadius: 12, overflow: 'hidden' },
  cardContent: { padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  emptyContainer: { padding: 40, alignItems: 'center' }
});
