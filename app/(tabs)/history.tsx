import { useEffect, useState } from 'react';
import { FlatList, View, Pressable } from 'react-native';
import { Text, IconButton, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import OmegaLoader from '../../components/OmegaLoader';
import { getHistory, getSession } from '../../src/services/Database';
import { SessionStore } from '../../services/SessionStore';

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
      const data = await getHistory(50, 0); // Fetch top 50
      setSessions(data);
    } catch (e) {
      console.error("Failed to load sessions", e);
    } finally {
      setLoading(false);
    }
  };

  const handlePress = async (session: any) => {
    // Show loading while fetching full details
    setLoading(true);
    try {
      const fullSession = await getSession(session.id);
      if (fullSession && fullSession.json_data) {
         // JSON is stored as string in DB, but SessionStore expects object or string.
         // Database.ts: saveSession does JSON.stringify.
         // SessionStore.ts: "if draft is string, parse it".
         // So passing string is fine.
         SessionStore.setDraft(fullSession.json_data, true);
         SessionStore.setTheme(fullSession.theme);
         router.push('/results');
      } else {
        console.error("Session data missing");
      }
    } catch (e) {
      console.error("Failed to open session", e);
    } finally {
      setLoading(false);
    }
  };

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
    } catch (e) {
      return dateString;
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <Pressable
      onPress={() => handlePress(item)}
      className="mb-4 mx-4 p-4 rounded-lg bg-background border border-accent/30 active:opacity-70"
      style={{
         shadowColor: '#000',
         shadowOffset: { width: 0, height: 2 },
         shadowOpacity: 0.1,
         shadowRadius: 4,
         elevation: 2,
      }}
    >
      <View className="flex-row justify-between items-center">
          <View className="flex-1 mr-4">
            <Text className="text-xl font-bold text-text mb-1" numberOfLines={1}>
                {item.theme || "Untitled Scroll"}
            </Text>
            <Text className="text-sm text-ancient">
                {formatDate(item.date)}
            </Text>
          </View>
          <View>
             <IconButton icon="chevron-right" iconColor={theme.colors.onSurfaceVariant} size={20} />
          </View>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView className="flex-1 bg-background" style={{ backgroundColor: theme.colors.background }}>
      <View className="flex-row items-center justify-between px-2 py-2">
        <Text variant="headlineSmall" className="font-bold text-text ml-2">
          Archived Scrolls
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <OmegaLoader />
        </View>
      ) : (
        <FlatList
          data={sessions}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 24, paddingTop: 8 }}
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center mt-20">
              <Text className="text-ancient text-lg italic">No scrolls found.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
