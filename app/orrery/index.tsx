import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PhilologicalColors as C, PhilologicalFonts as F } from '../../src/theme';

const STORAGE_KEY = '@recent_discoveries';

export default function OrreryHub() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    loadRecent();
  }, []);

  const loadRecent = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setRecent(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Failed to load recent discoveries', e);
    }
  };

  const saveRecent = async (newQuery: string) => {
    try {
      const trimmed = newQuery.trim();
      if (!trimmed) return;
      const updated = [trimmed, ...recent.filter((w) => w !== trimmed)].slice(0, 5);
      setRecent(updated);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save recent discoveries', e);
    }
  };

  const handleSearch = () => {
    if (query.trim()) {
      saveRecent(query.trim());
      router.push(`/orrery/${encodeURIComponent(query.trim())}`);
    }
  };

  const handleRecentPress = (word: string) => {
    router.push(`/orrery/${encodeURIComponent(word)}`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.eyebrow}>OBSIDIAN ORRERY HUB</Text>
          <Text style={styles.title}>Explore the Diachronic Semantic Neighborhoods</Text>
        </View>

        <View style={styles.searchSection}>
          <TextInput
            style={styles.searchInput}
            placeholder="Enter a Greek lemma (e.g., κόσμος)"
            placeholderTextColor="rgba(197, 160, 89, 0.4)"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Pressable
            style={({ pressed }) => [styles.searchButton, pressed && styles.searchButtonPressed]}
            onPress={handleSearch}
          >
            <Text style={styles.searchButtonText}>Search</Text>
          </Pressable>
        </View>

        {recent.length > 0 && (
          <View style={styles.recentSection}>
            <Text style={styles.recentTitle}>Recent Discoveries</Text>
            <View style={styles.recentList}>
              {recent.map((word) => (
                <Pressable
                  key={word}
                  style={({ pressed }) => [styles.recentItem, pressed && styles.recentItemPressed]}
                  onPress={() => handleRecentPress(word)}
                >
                  <Text style={styles.recentItemText}>{word}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  container: {
    padding: 24,
    gap: 32,
  },
  header: {
    gap: 8,
    marginTop: 40,
    alignItems: 'center',
  },
  eyebrow: {
    fontFamily: F.LABEL,
    fontSize: 10,
    fontWeight: 'bold',
    color: C.GOLD,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: F.DISPLAY,
    fontSize: 24,
    color: C.PARCHMENT,
    textAlign: 'center',
    lineHeight: 32,
  },
  searchSection: {
    gap: 16,
  },
  searchInput: {
    backgroundColor: 'rgba(15, 5, 24, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(197, 160, 89, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: F.BODY,
    fontSize: 16,
    color: C.PARCHMENT,
  },
  searchButton: {
    backgroundColor: C.GOLD_DIM,
    borderWidth: 1,
    borderColor: 'rgba(197, 160, 89, 0.3)',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  searchButtonPressed: {
    backgroundColor: 'rgba(197, 160, 89, 0.25)',
    borderColor: C.GOLD,
  },
  searchButtonText: {
    fontFamily: F.LABEL,
    fontSize: 13,
    fontWeight: 'bold',
    color: C.GOLD,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  recentSection: {
    gap: 16,
    marginTop: 16,
  },
  recentTitle: {
    fontFamily: F.LABEL,
    fontSize: 11,
    fontWeight: 'bold',
    color: C.GRAY_TEXT,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  recentList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  recentItem: {
    backgroundColor: 'rgba(197, 160, 89, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(197, 160, 89, 0.2)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  recentItemPressed: {
    backgroundColor: 'rgba(197, 160, 89, 0.15)',
    borderColor: C.GOLD,
  },
  recentItemText: {
    fontFamily: F.DISPLAY,
    fontSize: 14,
    color: C.PARCHMENT,
  },
});
