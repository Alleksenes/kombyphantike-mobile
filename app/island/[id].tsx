import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconButton } from 'react-native-paper';
import PhilologyCard from '../../components/PhilologyCard';

// Dummy data for sentences
const MOCK_SENTENCES = [
  { id: 's1', sentence: 'ἡ γὰρ φύσις ἅπαντα ποιεῖ.', translation: 'For nature makes all things.' },
  { id: 's2', sentence: 'πάντα ῥεῖ καὶ οὐδὲν μένει.', translation: 'Everything flows and nothing stays.' },
  { id: 's3', sentence: 'γνῶθι σεαυτόν.', translation: 'Know thyself.' },
];

export default function WorkbenchScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  // Find mocked island title, or fallback
  const title = useMemo(() => {
    const titles: Record<string, string> = {
      '1': 'The Elements of Fire',
      '2': 'Justice and Law',
      '3': 'The Whispering Woods',
      '4': 'Athenian Democracy'
    };
    return typeof id === 'string' && titles[id] ? titles[id] : 'Unknown Island';
  }, [id]);

  // Handle token press
  const handleTokenPress = (token: any) => {
    console.log('Token pressed:', token);
  };

  const renderItem = ({ item }: { item: typeof MOCK_SENTENCES[0] }) => (
    <View style={styles.cardContainer}>
      <PhilologyCard
        sentence={item.sentence}
        translation={item.translation}
        onTokenPress={handleTokenPress}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <IconButton
          icon="chevron-left"
          iconColor="#C5A059"
          size={32}
          onPress={() => router.back()}
          style={styles.backButton}
        />
        <View style={styles.headerContent}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          <View style={styles.progressContainer}>
            <View style={[styles.progressFill, { width: '45%' }]} />
          </View>
        </View>
      </View>

      <FlatList
        data={MOCK_SENTENCES}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />
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
    paddingHorizontal: 8,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(197, 160, 89, 0.2)', // Dim gold
  },
  backButton: {
    margin: 0,
  },
  headerContent: {
    flex: 1,
    marginLeft: 8,
    marginRight: 24,
  },
  title: {
    fontFamily: 'GFSDidot',
    fontSize: 24,
    color: '#E3DCCB',
    marginBottom: 8,
  },
  progressContainer: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
    width: '100%',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#C5A059', // Gold progress
    borderRadius: 2,
  },
  listContent: {
    paddingVertical: 24,
  },
  cardContainer: {
    marginBottom: 24,
  },
});
