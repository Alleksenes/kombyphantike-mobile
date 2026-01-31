import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase;

try {
  db = SQLite.openDatabaseSync('philology.db');
} catch (error) {
  console.error("Failed to open database", error);
}

export const initDatabase = async () => {
  if (!db) return;
  try {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        theme TEXT,
        json_data TEXT
      );
      CREATE TABLE IF NOT EXISTS word_stats (
        lemma TEXT PRIMARY KEY,
        strength INTEGER DEFAULT 0,
        last_seen TEXT
      );
    `);
    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
};

export const saveSession = async (theme: string, jsonData: any) => {
    if (!db) return;
    try {
        const date = new Date().toISOString();
        const jsonString = JSON.stringify(jsonData);
        await db.runAsync(
            'INSERT INTO sessions (date, theme, json_data) VALUES (?, ?, ?)',
            date, theme, jsonString
        );
        console.log("Session saved successfully");
    } catch (error) {
        console.error("Error saving session:", error);
    }
};

export const getSessions = async () => {
    if (!db) return [];
    try {
        const result = await db.getAllAsync('SELECT * FROM sessions ORDER BY date DESC');
        return result;
    } catch (error) {
        console.error("Error fetching sessions:", error);
        return [];
    }
};
