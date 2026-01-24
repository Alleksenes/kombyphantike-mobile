import React, { useState, useMemo } from 'react';
import { View, StyleSheet, FlatList, useWindowDimensions, Platform, Share, Alert } from 'react-native';
import { Text, Button, useTheme, IconButton, Snackbar } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import PhilologyCard from '../components/PhilologyCard';

export default function ResultsScreen() {
  const { worksheetData } = useLocalSearchParams();
  const router = useRouter();
  const theme = useTheme();
  const { width, height: windowHeight } = useWindowDimensions();
  const [listHeight, setListHeight] = useState<number>(windowHeight - 100);
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const { data, title, error } = useMemo(() => {
    let data: any[] = [];
    let title = "The Scroll";
    let error = null;

    try {
      if (!worksheetData) {
        return { data: [], title, error: "No data received from the weaver." };
      }

      const raw = Array.isArray(worksheetData) ? worksheetData[0] : worksheetData;
      const parsed = JSON.parse(raw as string);

      if (parsed) {
        if (Array.isArray(parsed)) {
          data = parsed;
        } else if (Array.isArray(parsed.sentences)) {
          data = parsed.sentences;
        } else if (Array.isArray(parsed.results)) {
          data = parsed.results;
        } else if (parsed.worksheet && Array.isArray(parsed.worksheet)) {
          data = parsed.worksheet;
        } else {
          if (parsed.sentence || parsed.text || parsed.modern_greek) {
            data = [parsed];
          }
        }
        if (parsed.title) {
          title = parsed.title;
        }
      }

      if (data.length === 0) {
        console.log("Parsed data but found no array:", parsed);
        error = "The weaver produced a thread, but no sentences were found.";
      }

    } catch (e: any) {
      console.error("Failed to parse data", e);
      error = `Failed to unravel the scroll: ${e.message}`;
    }

    return { data, title, error };
  }, [worksheetData]);

  const handleShare = async () => {
      if (data.length === 0) return;

      const text = data.map((item, i) => {
          const modern = item.modern_greek || item.sentence || "";
          const ancient = item.ancient_context || "";
          const english = item.english_translation || "";
          return `${i+1}. ${modern}\n   [${ancient}]\n   (${english})`;
      }).join('\n\n');

      const message = `${title}\n\n${text}`;

      if (Platform.OS === 'web') {
          await Clipboard.setStringAsync(message);
          setSnackbarVisible(true);
      } else {
          try {
              const result = await Share.share({
                  message: message,
                  title: title,
              });
          } catch (error: any) {
              Alert.alert(error.message);
          }
      }
  };

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    const modern = item.modern_greek || item.sentence || item.text || item.content || "—";
    const ancient = item.ancient_context || item.context || item.etymology || item.explanation || "—";
    const english = item.english_translation || item.translation || item.english || item.definition || "—";

    return (
      <PhilologyCard
        modernGreek={modern}
        ancientContext={ancient}
        englishTranslation={english}
        index={index}
        total={data.length}
        width={width}
        height={listHeight}
      />
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Button
          mode="text"
          onPress={() => router.back()}
          icon="arrow-left"
          textColor={theme.colors.onSurface}
        >
          Back
        </Button>
        <Text variant="titleMedium" style={styles.headerTitle}>{title}</Text>
        <IconButton
            icon="share-variant"
            onPress={handleShare}
            disabled={data.length === 0}
        />
      </View>

      <View
        style={styles.listContainer}
        onLayout={(e) => {
            const { height } = e.nativeEvent.layout;
            if (height > 0) setListHeight(height);
        }}
      >
        {error ? (
          <View style={styles.centerContainer}>
            <Text variant="bodyLarge" style={{ color: theme.colors.error, textAlign: 'center', padding: 20 }}>
              {error}
            </Text>
            <Text variant="bodySmall" style={{ opacity: 0.5, marginTop: 10 }}>
                Debug: {typeof worksheetData === 'string' ? worksheetData.slice(0, 50) + '...' : 'Invalid Type'}
            </Text>
          </View>
        ) : data.length === 0 ? (
          <View style={styles.centerContainer}>
             <Text variant="headlineSmall" style={{ color: theme.colors.secondary }}>
                The scroll is empty.
              </Text>
          </View>
        ) : (
          <FlatList
            data={data}
            renderItem={renderItem}
            keyExtractor={(_, index) => index.toString()}
            pagingEnabled
            snapToAlignment="start"
            decelerationRate="fast"
            showsVerticalScrollIndicator={false}
            getItemLayout={(data, index) => (
                {length: listHeight, offset: listHeight * index, index}
            )}
          />
        )}
      </View>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={2000}
      >
        Curriculum copied to clipboard.
      </Snackbar>
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
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  headerTitle: {
    fontWeight: 'bold',
    opacity: 0.7,
    flex: 1,
    textAlign: 'center',
  },
  listContainer: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
