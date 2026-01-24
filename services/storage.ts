import AsyncStorage from '@react-native-async-storage/async-storage';

const HISTORY_KEY = 'KOMBYPHANTIKE_HISTORY_V1';
const MAX_HISTORY_ITEMS = 10;

export interface HistoryItem {
  id: string;
  theme: string;
  date: string; // ISO string
  data: any; // The full worksheet JSON
}

export const saveToHistory = async (theme: string, worksheetData: any) => {
  try {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      theme: theme || "Untitled Scroll",
      date: new Date().toISOString(),
      data: worksheetData,
    };

    const existingHistoryJson = await AsyncStorage.getItem(HISTORY_KEY);
    let history: HistoryItem[] = existingHistoryJson ? JSON.parse(existingHistoryJson) : [];

    // Add new item to the beginning
    history.unshift(newItem);

    // Limit to MAX_HISTORY_ITEMS
    if (history.length > MAX_HISTORY_ITEMS) {
      history = history.slice(0, MAX_HISTORY_ITEMS);
    }

    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    console.log(`[Storage] Saved scroll '${theme}' to history.`);
    return true;
  } catch (e) {
    console.error('[Storage] Failed to save history:', e);
    return false;
  }
};

export const getHistory = async (): Promise<HistoryItem[]> => {
  try {
    const json = await AsyncStorage.getItem(HISTORY_KEY);
    return json ? JSON.parse(json) : [];
  } catch (e) {
    console.error('[Storage] Failed to fetch history:', e);
    return [];
  }
};

export const clearHistory = async () => {
    try {
        await AsyncStorage.removeItem(HISTORY_KEY);
    } catch(e) {
        console.error('[Storage] Failed to clear history', e);
    }
}
