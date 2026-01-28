import React, { useState, useMemo, useEffect, useRef } from 'react';
import { View, StyleSheet, FlatList, useWindowDimensions, Platform, Share, Alert } from 'react-native';
import { Text, Button, useTheme, IconButton, Snackbar } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import PhilologyCard from '../components/PhilologyCard';
import { saveToHistory } from '../services/storage';

export default function ResultsScreen() {
  const { worksheetData, isDraft } = useLocalSearchParams();
  const router = useRouter();
  const theme = useTheme();
  const { width, height: windowHeight } = useWindowDimensions();
  const [listHeight, setListHeight] = useState<number>(windowHeight - 100);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // State for the filled data
  const [filledData, setFilledData] = useState<any[] | null>(null);
  const [isFilling, setIsFilling] = useState(isDraft === 'true');
  const [fillError, setFillError] = useState<string | null>(null);

  const defaultBaseUrl = Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';

  const { draftData, title, parseError } = useMemo(() => {
    let draftData: any[] = [];
    let title = "The Scroll";
    let parseError = null;

    try {
      if (!worksheetData) {
        return { draftData: [], title, parseError: "No data received from the weaver." };
      }

      const raw = Array.isArray(worksheetData) ? worksheetData[0] : worksheetData;
      const parsed = JSON.parse(raw as string);

      if (parsed) {
        if (Array.isArray(parsed)) {
            draftData = parsed;
        } else if (Array.isArray(parsed.sentences)) {
            draftData = parsed.sentences;
        } else if (Array.isArray(parsed.results)) {
            draftData = parsed.results;
        } else if (parsed.worksheet && Array.isArray(parsed.worksheet)) {
            draftData = parsed.worksheet;
        } else {
          if (parsed.sentence || parsed.text || parsed.modern_greek) {
            draftData = [parsed];
          }
        }
        if (parsed.title) {
          title = parsed.title;
        }
      }

      if (draftData.length === 0) {
        parseError = "The weaver produced a thread, but no sentences were found.";
      }

    } catch (e: any) {
      console.error("Failed to parse data", e);
      parseError = `Failed to unravel the scroll: ${e.message}`;
    }

    return { draftData, title, parseError };
  }, [worksheetData]);

  // Effect to trigger /fill_curriculum if it's a draft
  useEffect(() => {
      if (isDraft === 'true' && draftData.length > 0 && !filledData) {
          fillCurriculum();
      } else if (isDraft !== 'true' && !filledData) {
          // If not a draft (e.g. from History), just set the data directly
          setFilledData(draftData);
      }
  }, [isDraft, draftData]);

  const fillCurriculum = async () => {
      setIsFilling(true);
      setFillError(null);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 90000); // 90s timeout for filling

      try {
          // Must reconstruct the full body expected by /fill_curriculum
          // Assuming /fill_curriculum expects { worksheet: [...], title: ... } or similar
          // Based on typical pattern, we send back exactly what we got or the "draft" structure

          // Re-parsing to get the full original object structure if possible,
          // or constructing a valid payload.
          // If draftData came from `parsed.worksheet` or similar, we should ideally send that wrapper back.
          // For simplicity, let's wrap draftData in the expected structure if known, or send it as `worksheet`.

          const raw = Array.isArray(worksheetData) ? worksheetData[0] : worksheetData;
          const parsed = JSON.parse(raw as string);

          const payload = {
              ...parsed, // Keep title, count, etc.
              complete_with_ai: true // Instruction to fill
          };

          const url = `${defaultBaseUrl}/fill_curriculum`;
          console.log(`[Results] Requesting fill from ${url}`);

          const response = await fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
              signal: controller.signal
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
              throw new Error(`Server error: ${response.status}`);
          }

          const newData = await response.json();
          console.log("[Results] Filled data received");

          // Normalize again just in case structure changes
          let normalizedFilled: any[] = [];
          if (Array.isArray(newData)) normalizedFilled = newData;
          else if (Array.isArray(newData.sentences)) normalizedFilled = newData.sentences;
          else if (Array.isArray(newData.results)) normalizedFilled = newData.results;
          else if (newData.worksheet && Array.isArray(newData.worksheet)) normalizedFilled = newData.worksheet;

          setFilledData(normalizedFilled);

          // Save to history now that we have the full scroll
          saveToHistory(title, newData).catch(e => console.error("Failed to save history", e));

      } catch (e: any) {
          console.error("[Results] Fill failed", e);
          setFillError("The Oracle went silent. Showing draft only.");
          setSnackbarMessage("Failed to generate full sentences.");
          setSnackbarVisible(true);
      } finally {
          setIsFilling(false);
      }
  };

  const currentData = filledData || draftData;

  const handleShare = async () => {
      if (currentData.length === 0) return;
      // ... (Same share logic)
       const text = currentData.map((item, i) => {
          const modern = item.modern_greek || item.sentence || "";
          const ancient = item.ancient_context || "";
          const english = item.english_translation || "";
          return `${i+1}. ${modern}\n   [${ancient}]\n   (${english})`;
      }).join('\n\n');

      const message = `${title}\n\n${text}`;

      if (Platform.OS === 'web') {
          await Clipboard.setStringAsync(message);
          setSnackbarMessage("Curriculum copied to clipboard.");
          setSnackbarVisible(true);
      } else {
          try {
              await Share.share({ message, title });
          } catch (error: any) {
              Alert.alert(error.message);
          }
      }
  };

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    // If filling, use placeholder for missing fields, but show ancient context
    const modern = item.modern_greek || item.sentence || item.text || item.content || "";
    const ancient = item.ancient_context || item.context || item.etymology || item.explanation || "—";
    const english = item.english_translation || item.translation || item.english || item.definition || "";

    return (
      <PhilologyCard
        modernGreek={modern}
        ancientContext={ancient}
        englishTranslation={english}
        index={index}
        total={currentData.length}
        width={width}
        height={listHeight}
        loading={isFilling && (!modern || !english)}
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
            disabled={currentData.length === 0 || isFilling}
        />
      </View>

      <View
        style={styles.listContainer}
        onLayout={(e) => {
            const { height } = e.nativeEvent.layout;
            if (height > 0) setListHeight(height);
        }}
      >
        {parseError ? (
          <View style={styles.centerContainer}>
            <Text variant="bodyLarge" style={{ color: theme.colors.error, textAlign: 'center', padding: 20 }}>
              {parseError}
            </Text>
          </View>
        ) : currentData.length === 0 ? (
          <View style={styles.centerContainer}>
             <Text variant="headlineSmall" style={{ color: theme.colors.secondary }}>
                The scroll is empty.
              </Text>
          </View>
        ) : (
          <FlatList
            data={currentData}
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
        duration={3000}
      >
        {snackbarMessage}
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
