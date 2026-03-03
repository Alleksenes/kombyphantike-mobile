import { useCallback } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import IslandCard, { IslandCardProps } from '../../components/IslandCard';
import MonolithButton from '../../components/ui/MonolithButton';

const MOCK_ISLANDS: IslandCardProps[] = [
  { id: '1', title: 'The Elements of Fire', level: 'A1', progress: 100, status: 'Mastered' },
  { id: '2', title: 'Justice and Law', level: 'A2', progress: 45, status: 'Draft' },
  { id: '3', title: 'The Whispering Woods', level: 'B1', progress: 10, status: 'Draft' },
  { id: '4', title: 'Athenian Democracy', level: 'B2', progress: 85, status: 'Draft' },
];

export default function ShipyardScreen() {
  const router = useRouter();

  const handlePress = useCallback((id: string) => {
    router.push(`/island/${id}`);
  }, [router]);

  const renderItem = useCallback(({ item }: { item: IslandCardProps }) => (
    <IslandCard {...item} onPress={handlePress} />
  ), [handlePress]);

  const handleForge = () => {
    // Navigate back to weaver for now
    router.push('/');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.headerTitle}>
          The Archipelago
        </Text>
      </View>

      <FlatList
        data={MOCK_ISLANDS}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No islands found. Forge a new one.</Text>
          </View>
        }
      />

      <View style={styles.footer}>
        <MonolithButton
          label="Forge New Island"
          onPress={handleForge}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 8,
  },
  headerTitle: {
    fontFamily: 'NeueHaasGrotesk-Display',
    fontWeight: 'bold',
    color: '#E3DCCB',
    textAlign: 'center',
    fontSize: 24,
  },
  listContent: {
    paddingBottom: 24,
    paddingTop: 8,
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
  footer: {
    padding: 24,
    alignItems: 'center',
  }
});
