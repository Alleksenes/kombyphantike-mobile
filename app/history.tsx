import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, View, TouchableOpacity, Text } from 'react-native';
import { Button, IconButton, useTheme } from 'react-native-paper';
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
      // PERF: Pass raw JSON string to store to avoid blocking UI thread with JSON.parse
      // The Results screen will handle parsing.
      SessionStore.setDraft(item.json_data, true); // true = already filled
      SessionStore.setTheme(item.theme);
      router.push("/results");
    } catch (e) {
      console.error("Failed to set session data", e);
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    // Format: "Monday, January 1, 2024"
    const dateObj = new Date(item.date);
    const date = dateObj.toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });

    return (
      <TouchableOpacity
        className="py-6 border-b border-ink/10 flex-row justify-between items-center"
        activeOpacity={0.6}
        onPress={() => handleSessionPress(item)}
      >
          <View>
              <Text className="text-xl font-bold text-ink mb-1">
                  {item.theme || "Untitled Scroll"}
              </Text>
              <Text className="text-xs text-ink/50 uppercase tracking-[0.2em]">
                  {date}
              </Text>
          </View>
          <View className="opacity-50">
              <IconButton
                icon="arrow-right"
                size={20}
                iconColor={theme.colors.onSurface}
                style={{ margin: 0 }}
              />
          </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-paper">
      <View className="flex-row items-center justify-between px-2 py-2">
        <Button
          mode="text"
          onPress={() => router.back()}
          icon="arrow-left"
          textColor={theme.colors.onSurface}
          compact
        >
          Back
        </Button>
        <Text className="text-lg font-bold text-ink/70">
          Archived Scrolls
        </Text>
        <View className="w-12" />
      </View>

      <FlatList
        data={sessions}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
        className="flex-1"
        ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-20 opacity-40">
                <Text className="text-ink text-base italic">No scrolls found in the archives.</Text>
            </View>
        }
      />
    </SafeAreaView>
  );
}
