import { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { IconButton } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PhilologicalColors as C, PhilologicalFonts as F } from '../../src/theme';

const RECENT_KEY = '@recent_discoveries';

export default function OrreryHubScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(RECENT_KEY).then((data) => {
      if (data) {
        try {
          const parsed = JSON.parse(data);
          if (Array.isArray(parsed)) setRecent(parsed);
        } catch (e) {}
      }
    });
  }, []);

  const saveRecent = async (word: string) => {
    const updated = [word, ...recent.filter(w => w !== word)].slice(0, 5);
    setRecent(updated);
    await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  };

  const handleSearch = () => {
    const trimmed = query.trim().toLowerCase();
    if (trimmed) {
      saveRecent(trimmed);
      router.push(`/orrery/${encodeURIComponent(trimmed)}`);
    }
  };

  const handleRecentPress = (word: string) => {
    setQuery(word);
    saveRecent(word);
    router.push(`/orrery/${encodeURIComponent(word)}`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <IconButton icon="arrow-left" iconColor={C.GOLD} size={24} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.eyebrow}>THE SEARCH HUB</Text>
            <Text style={styles.title}>Obsidian Orrery</Text>
          </View>
          <View style={{ width: 48 }} />
        </View>

        <View style={styles.searchSection}>
          <Text style={styles.prompt}>Enter a Greek lemma to trace its lineage</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={query}
              onChangeText={setQuery}
              placeholder="e.g. κόσμος, λόγος..."
              placeholderTextColor="rgba(156, 163, 175, 0.5)"
              onSubmitEditing={handleSearch}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
            />
            <TouchableOpacity
              style={[styles.searchButton, !query.trim() && styles.searchButtonDisabled]}
              onPress={handleSearch}
              disabled={!query.trim()}
            >
              <IconButton icon="magnify" iconColor={C.BACKGROUND} size={20} />
            </TouchableOpacity>
          </View>
        </View>

        {recent.length > 0 && (
          <View style={styles.recentSection}>
            <Text style={styles.recentTitle}>Recent Discoveries</Text>
            <FlatList
              data={recent}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.recentItem} onPress={() => handleRecentPress(item)}>
                  <IconButton icon="history" iconColor={C.GOLD_DIM} size={16} />
                  <Text style={styles.recentItemText}>{item}</Text>
                  <IconButton icon="chevron-right" iconColor="rgba(197, 160, 89, 0.3)" size={16} />
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.recentList}
              scrollEnabled={false}
            />
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(197, 160, 89, 0.1)',
  },
  backButton: {
    width: 48,
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  eyebrow: {
    fontFamily: F.LABEL,
    fontSize: 10,
    color: C.GOLD,
    letterSpacing: 2,
    fontWeight: 'bold',
  },
  title: {
    fontFamily: F.DISPLAY,
    fontSize: 24,
    color: C.PARCHMENT,
    marginTop: 4,
  },
  searchSection: {
    padding: 24,
    gap: 16,
    marginTop: 40,
  },
  prompt: {
    fontFamily: F.DISPLAY,
    fontSize: 16,
    color: C.GRAY_TEXT,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(197, 160, 89, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(197, 160, 89, 0.3)',
    borderRadius: 12,
    paddingLeft: 16,
    paddingRight: 4,
    height: 56,
  },
  input: {
    flex: 1,
    fontFamily: F.DISPLAY,
    fontSize: 20,
    color: C.PARCHMENT,
    height: '100%',
  },
  searchButton: {
    backgroundColor: C.GOLD,
    borderRadius: 8,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  searchButtonDisabled: {
    opacity: 0.5,
    backgroundColor: C.GOLD_DIM,
  },
  recentSection: {
    paddingHorizontal: 24,
    marginTop: 32,
  },
  recentTitle: {
    fontFamily: F.LABEL,
    fontSize: 12,
    color: C.GOLD,
    letterSpacing: 1,
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  recentList: {
    gap: 8,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(197, 160, 89, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(197, 160, 89, 0.1)',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  recentItemText: {
    flex: 1,
    fontFamily: F.DISPLAY,
    fontSize: 18,
    color: 'rgba(227, 220, 203, 0.8)',
    marginLeft: 8,
  },
});
