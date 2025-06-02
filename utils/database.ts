import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

export interface IDItem {
  id: number;
  title: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SearchWord {
  id: number;
  word: string;
  isActive: boolean;
  createdAt: string;
}

let db: SQLite.SQLiteDatabase | null = null;

// Initialize database connection only on mobile platforms
if (Platform.OS === 'ios' || Platform.OS === 'android') {
  try {
    db = SQLite.openDatabaseSync('idmanager.db');
  } catch (error) {
    console.error('Failed to open database:', error);
  }
}

// Helper function to check if database is available
const ensureDatabase = () => {
  if (!db) {
    throw new Error('Database not available. SQLite is only supported on iOS and Android.');
  }
  return db;
};

export const initDatabase = async () => {
  const database = ensureDatabase();
  
  // Create search_words table
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS search_words (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      word TEXT NOT NULL,
      isActive INTEGER NOT NULL DEFAULT 1,
      createdAt TEXT NOT NULL
    );
  `);
  
  // Initialize default search word if table is empty
  const count = await database.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM search_words');
  if (count && count.count === 0) {
    const now = new Date().toISOString();
    await database.runAsync('INSERT INTO search_words (word, isActive, createdAt) VALUES (?, ?, ?)', ['ID', 1, now]);
  }

  // First create the table if it doesn't exist
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS ids (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      notes TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
  `);

  // Check if the username or password column exists and migrate if necessary
  try {
    const tableInfo = await database.getAllAsync('PRAGMA table_info(ids)');
    const hasUsernameColumn = tableInfo.some((col: any) => col.name === 'username');
    const hasPasswordColumn = tableInfo.some((col: any) => col.name === 'password');
    
    if (hasUsernameColumn || hasPasswordColumn) {
      // Create new table without username and password columns
      await database.execAsync(`
        CREATE TABLE ids_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          notes TEXT,
          createdAt TEXT NOT NULL,
          updatedAt TEXT NOT NULL
        );
      `);
      
      // Copy data from old table to new table (excluding username and password)
      await database.execAsync(`
        INSERT INTO ids_new (id, title, notes, createdAt, updatedAt)
        SELECT id, title, notes, createdAt, updatedAt FROM ids;
      `);
      
      // Drop old table and rename new table
      await database.execAsync('DROP TABLE ids;');
      await database.execAsync('ALTER TABLE ids_new RENAME TO ids;');
    }
  } catch {
    console.log('Migration check completed or not needed');
  }
  
  // Migrate from old settings table to new search_words table if needed
  try {
    const settingsExists = await database.getFirstAsync('SELECT name FROM sqlite_master WHERE type="table" AND name="settings"');
    if (settingsExists) {
      const oldPrefix = await database.getFirstAsync<{ value: string }>('SELECT value FROM settings WHERE key = ?', ['search_prefix']);
      if (oldPrefix && oldPrefix.value && oldPrefix.value !== 'ID') {
        // Check if this word already exists in search_words
        const exists = await database.getFirstAsync('SELECT * FROM search_words WHERE word = ?', [oldPrefix.value]);
        if (!exists) {
          const now = new Date().toISOString();
          await database.runAsync('INSERT INTO search_words (word, isActive, createdAt) VALUES (?, ?, ?)', [oldPrefix.value, 1, now]);
        }
      }
      // Drop the old settings table
      await database.execAsync('DROP TABLE settings;');
    }
  } catch {
    console.log('Settings migration completed or not needed');
  }
};

export const getAllIDs = async (): Promise<IDItem[]> => {
  const database = ensureDatabase();
  const result = await database.getAllAsync<IDItem>('SELECT * FROM ids ORDER BY updatedAt DESC');
  return result;
};

export const getIDById = async (id: number): Promise<IDItem | null> => {
  const database = ensureDatabase();
  const result = await database.getFirstAsync<IDItem>('SELECT * FROM ids WHERE id = ?', [id]);
  return result;
};

export const createID = async (title: string, notes?: string): Promise<void> => {
  const database = ensureDatabase();
  const now = new Date().toISOString();
  await database.runAsync(
    'INSERT INTO ids (title, notes, createdAt, updatedAt) VALUES (?, ?, ?, ?)',
    [title, notes || '', now, now]
  );
};

export const updateID = async (id: number, title: string, notes?: string): Promise<void> => {
  const database = ensureDatabase();
  const now = new Date().toISOString();
  await database.runAsync(
    'UPDATE ids SET title = ?, notes = ?, updatedAt = ? WHERE id = ?',
    [title, notes || '', now, id]
  );
};

export const deleteID = async (id: number): Promise<void> => {
  const database = ensureDatabase();
  await database.runAsync('DELETE FROM ids WHERE id = ?', [id]);
};

export const searchIDs = async (query: string): Promise<IDItem[]> => {
  const database = ensureDatabase();
  const searchPattern = `%${query}%`;
  const result = await database.getAllAsync<IDItem>(
    'SELECT * FROM ids WHERE title LIKE ? OR notes LIKE ? ORDER BY updatedAt DESC',
    [searchPattern, searchPattern]
  );
  return result;
};

// Search words functions
export const getAllSearchWords = async (): Promise<SearchWord[]> => {
  const database = ensureDatabase();
  const result = await database.getAllAsync<any>('SELECT * FROM search_words ORDER BY createdAt DESC');
  return result.map(row => ({
    ...row,
    isActive: row.isActive === 1
  }));
};

export const getActiveSearchWords = async (): Promise<SearchWord[]> => {
  const database = ensureDatabase();
  const result = await database.getAllAsync<any>('SELECT * FROM search_words WHERE isActive = 1 ORDER BY createdAt DESC');
  return result.map(row => ({
    ...row,
    isActive: true  // We know it's active since we're filtering by isActive = 1
  }));
};

export const createSearchWord = async (word: string): Promise<void> => {
  const database = ensureDatabase();
  const now = new Date().toISOString();
  await database.runAsync('INSERT INTO search_words (word, isActive, createdAt) VALUES (?, ?, ?)', [word, 1, now]);
};

export const updateSearchWordStatus = async (id: number, isActive: boolean): Promise<void> => {
  const database = ensureDatabase();
  await database.runAsync('UPDATE search_words SET isActive = ? WHERE id = ?', [isActive ? 1 : 0, id]);
};

export const deleteSearchWord = async (id: number): Promise<void> => {
  const database = ensureDatabase();
  await database.runAsync('DELETE FROM search_words WHERE id = ?', [id]);
};

// Legacy compatibility
export const getSearchPrefix = async (): Promise<string> => {
  const activeWords = await getActiveSearchWords();
  return activeWords.map(w => w.word).join(' ');
};

export const setSearchPrefix = async (_prefix: string): Promise<void> => {
  // Legacy function - no longer used
};