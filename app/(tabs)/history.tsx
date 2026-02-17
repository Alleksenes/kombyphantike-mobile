import { useCallback, useEffect, memo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { Text, IconButton, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import OmegaLoader from '../../components/OmegaLoader';
import { getHistory, getSession } from '../../src/services/Database';
import { SessionStore } from '../../services/SessionStore';

const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateString;
  }
};

const HistoryItem = memo(({ item, onPress, theme }: { item: any; onPress: (item: any) => void; theme: any }) => (
  <Pressable
    onPress={() => onPress(item)}
    style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
  >
    <View style={styles.itemContent}>
      <View style={styles.itemText}>
        <Text style={styles.itemTitle} numberOfLines={1}>
          {item.theme || 'Untitled Scroll'}
        </Text>
        <Text style={styles.itemDate}>
          {formatDate(item.date)}
        </Text>
      </View>
      <IconButton icon="chevron-right" iconColor={theme.colors.onSurfaceVariant} size={20} />
    </View>
  </Pressable>
));

export default function HistoryScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const data = await getHistory(50, 0);
      setSessions(data);
    } catch (e) {
      console.error('Failed to load sessions', e);
    } finally {
      setLoading(false);
    }
  };

  const handlePress = useCallback(async (session: any) => {
    setLoading(true);
    try {
      const fullSession = await getSession(session.id);
      if (fullSession && fullSession.json_data) {
        SessionStore.setDraft(fullSession.json_data, true);
        SessionStore.setTheme(fullSession.theme);
        router.push('/results');
      } else {
        console.error('Session data missing');
      }
    } catch (e) {
      console.error('Failed to open session', e);
    } finally {
      setLoading(false);
    }
  }, [router]);

  const renderItem = useCallback(({ item }: { item: any }) => (
    <HistoryItem item={item} onPress={handlePress} theme={theme} />
  ), [handlePress, theme]);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.headerTitle}>
          Archived Scrolls
        </Text>
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <OmegaLoader />
        </View>
      ) : (
        <FlatList
          data={sessions}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No scrolls found.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerTitle: {
    fontFamily: 'NeueHaasGrotesk-Display',
    fontWeight: 'bold',
    color: '#E3DCCB',
    marginLeft: 4,
  },
  listContent: {
    paddingBottom: 24,
    paddingTop: 8,
  },
  item: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(15, 5, 24, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(197, 160, 89, 0.2)',
    // Shadow iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  itemPressed: {
    opacity: 0.7,
  },
  itemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  itemText: {
    flex: 1,
    marginRight: 8,
  },
  itemTitle: {
    fontFamily: 'NeueHaasGrotesk-Display',
    fontSize: 17,
    fontWeight: 'bold',
    color: '#E3DCCB',
    marginBottom: 4,
  },
  itemDate: {
    fontFamily: 'NeueHaasGrotesk-Text',
    fontSize: 12,
    color: 'rgba(197, 160, 89, 0.7)',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 80,
  },
  emptyText: {
    fontFamily: 'GFSDidot',
    fontSize: 16,
    color: 'rgba(197, 160, 89, 0.6)',
    fontStyle: 'italic',
  },
});
