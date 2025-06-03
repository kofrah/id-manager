import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

export interface IDItem {
  id: number;
  title: string;
  notes?: string;
  searchWordIds?: number[];
  sortOrder?: number;
  createdAt: string;
  updatedAt: string;
}

export interface SearchWord {
  id: number;
  word: string;
  color: string;
  isActive: boolean;
  createdAt: string;
}

export interface GlobalSettings {
  useSearchWords: boolean;
  searchInMemo: boolean;
  darkMode?: "system" | "light" | "dark";
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
  
  // Check if search_words table exists and has color column
  let needsSearchWordsTableCreation = false;
  try {
    const searchWordsTableInfo = await database.getAllAsync('PRAGMA table_info(search_words)');
    const hasColorColumn = searchWordsTableInfo.some((col: any) => col.name === 'color');
    
    if (searchWordsTableInfo.length === 0) {
      // Table doesn't exist
      needsSearchWordsTableCreation = true;
    } else if (!hasColorColumn) {
      // Table exists but doesn't have color column - need migration
      console.log('Migrating search_words table to add color column');
      
      // Create new search_words table with color column
      await database.execAsync(`
        CREATE TABLE search_words_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          word TEXT NOT NULL,
          color TEXT NOT NULL DEFAULT '#007AFF',
          isActive INTEGER NOT NULL DEFAULT 1,
          createdAt TEXT NOT NULL
        );
      `);
      
      // Copy existing data with default color
      await database.execAsync(`
        INSERT INTO search_words_new (id, word, color, isActive, createdAt)
        SELECT id, word, '#007AFF', isActive, createdAt FROM search_words;
      `);
      
      // Drop old table and rename new table
      await database.execAsync('DROP TABLE search_words;');
      await database.execAsync('ALTER TABLE search_words_new RENAME TO search_words;');
      
      console.log('Search words table migration completed successfully');
    }
  } catch (error) {
    console.error('Error checking search_words table:', error);
    needsSearchWordsTableCreation = true;
  }

  if (needsSearchWordsTableCreation) {
    // Create search_words table
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS search_words (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        word TEXT NOT NULL,
        color TEXT NOT NULL DEFAULT '#007AFF',
        isActive INTEGER NOT NULL DEFAULT 1,
        createdAt TEXT NOT NULL
      );
    `);
  }

  // Create id_search_words junction table
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS id_search_words (
      id_item_id INTEGER NOT NULL,
      search_word_id INTEGER NOT NULL,
      PRIMARY KEY (id_item_id, search_word_id),
      FOREIGN KEY (id_item_id) REFERENCES ids(id) ON DELETE CASCADE,
      FOREIGN KEY (search_word_id) REFERENCES search_words(id) ON DELETE CASCADE
    );
  `);
  
  // Create global_settings table
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS global_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // Initialize default global settings
  const useSearchWordsExists = await database.getFirstAsync('SELECT * FROM global_settings WHERE key = ?', ['useSearchWords']);
  if (!useSearchWordsExists) {
    await database.runAsync('INSERT INTO global_settings (key, value) VALUES (?, ?)', ['useSearchWords', 'true']);
  }
  
  const searchInMemoExists = await database.getFirstAsync('SELECT * FROM global_settings WHERE key = ?', ['searchInMemo']);
  if (!searchInMemoExists) {
    await database.runAsync('INSERT INTO global_settings (key, value) VALUES (?, ?)', ['searchInMemo', 'true']);
  }
  
  const darkModeExists = await database.getFirstAsync('SELECT * FROM global_settings WHERE key = ?', ['darkMode']);
  if (!darkModeExists) {
    await database.runAsync('INSERT INTO global_settings (key, value) VALUES (?, ?)', ['darkMode', 'system']);
  }

  // Initialize default search word if table is empty
  const count = await database.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM search_words');
  if (count && count.count === 0) {
    const now = new Date().toISOString();
    await database.runAsync('INSERT INTO search_words (word, color, isActive, createdAt) VALUES (?, ?, ?, ?)', ['ID', '#007AFF', 1, now]);
  }

  // First create the table if it doesn't exist
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS ids (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      notes TEXT,
      sortOrder INTEGER,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
  `);

  // Check if migration is needed
  try {
    const tableInfo = await database.getAllAsync('PRAGMA table_info(ids)');
    const hasUsernameColumn = tableInfo.some((col: any) => col.name === 'username');
    const hasPasswordColumn = tableInfo.some((col: any) => col.name === 'password');
    const hasSearchWordColumn = tableInfo.some((col: any) => col.name === 'searchWord');
    const hasSearchWordColorColumn = tableInfo.some((col: any) => col.name === 'searchWordColor');
    const hasSortOrderColumn = tableInfo.some((col: any) => col.name === 'sortOrder');
    
    if (hasUsernameColumn || hasPasswordColumn || hasSearchWordColumn || hasSearchWordColorColumn) {
      // Create new table with updated schema
      await database.execAsync(`
        CREATE TABLE ids_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          notes TEXT,
          sortOrder INTEGER,
          createdAt TEXT NOT NULL,
          updatedAt TEXT NOT NULL
        );
      `);
      
      // Copy data from old table to new table (excluding removed columns)
      await database.execAsync(`
        INSERT INTO ids_new (id, title, notes, sortOrder, createdAt, updatedAt)
        SELECT id, title, notes, NULL, createdAt, updatedAt FROM ids;
      `);
      
      // Drop old table and rename new table
      await database.execAsync('DROP TABLE ids;');
      await database.execAsync('ALTER TABLE ids_new RENAME TO ids;');
    } else if (!hasSortOrderColumn) {
      // Add sortOrder column if it doesn't exist
      await database.execAsync('ALTER TABLE ids ADD COLUMN sortOrder INTEGER;');
      // Initialize sortOrder based on current ordering
      const allItems = await database.getAllAsync<{ id: number }>('SELECT id FROM ids ORDER BY updatedAt DESC');
      for (let i = 0; i < allItems.length; i++) {
        await database.runAsync('UPDATE ids SET sortOrder = ? WHERE id = ?', [i, allItems[i].id]);
      }
    }
  } catch {
    console.log('Migration check completed or not needed');
  }
  
  // Additional migration check is now handled in the main table creation logic above

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
          await database.runAsync('INSERT INTO search_words (word, color, isActive, createdAt) VALUES (?, ?, ?, ?)', [oldPrefix.value, '#007AFF', 1, now]);
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
  const result = await database.getAllAsync<Omit<IDItem, 'searchWordIds'>>('SELECT * FROM ids ORDER BY COALESCE(sortOrder, 999999), updatedAt DESC');
  
  // Get search word IDs for each item
  const itemsWithSearchWords = await Promise.all(
    result.map(async (item) => {
      const searchWordIds = await database.getAllAsync<{ search_word_id: number }>(
        'SELECT search_word_id FROM id_search_words WHERE id_item_id = ?',
        [item.id]
      );
      const finalSearchWordIds = searchWordIds.map(row => row.search_word_id);
      console.log(`ID ${item.id} (${item.title}) has search word IDs:`, finalSearchWordIds);
      return {
        ...item,
        searchWordIds: finalSearchWordIds
      };
    })
  );
  
  return itemsWithSearchWords;
};

export const getIDById = async (id: number): Promise<IDItem | null> => {
  const database = ensureDatabase();
  const result = await database.getFirstAsync<Omit<IDItem, 'searchWordIds'>>('SELECT * FROM ids WHERE id = ?', [id]);
  if (!result) return null;
  
  // Get search word IDs for this item
  const searchWordIds = await database.getAllAsync<{ search_word_id: number }>(
    'SELECT search_word_id FROM id_search_words WHERE id_item_id = ?',
    [id]
  );
  
  return {
    ...result,
    searchWordIds: searchWordIds.map(row => row.search_word_id)
  };
};

export const createID = async (title: string, notes?: string, searchWordIds?: number[]): Promise<void> => {
  const database = ensureDatabase();
  const now = new Date().toISOString();
  
  // Get the current minimum sortOrder to add new item at the top
  const minSort = await database.getFirstAsync<{ minOrder: number | null }>('SELECT MIN(sortOrder) as minOrder FROM ids');
  const newSortOrder = (minSort?.minOrder ?? 0) - 1;
  
  const result = await database.runAsync(
    'INSERT INTO ids (title, notes, sortOrder, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)',
    [title, notes || '', newSortOrder, now, now]
  );
  
  const insertedId = result.lastInsertRowId;
  
  // Insert search word relationships
  if (searchWordIds && searchWordIds.length > 0) {
    for (const wordId of searchWordIds) {
      await database.runAsync(
        'INSERT INTO id_search_words (id_item_id, search_word_id) VALUES (?, ?)',
        [insertedId, wordId]
      );
    }
  }
};

export const updateID = async (id: number, title: string, notes?: string, searchWordIds?: number[]): Promise<void> => {
  const database = ensureDatabase();
  const now = new Date().toISOString();
  
  await database.runAsync(
    'UPDATE ids SET title = ?, notes = ?, updatedAt = ? WHERE id = ?',
    [title, notes || '', now, id]
  );
  
  // Remove existing search word relationships
  await database.runAsync('DELETE FROM id_search_words WHERE id_item_id = ?', [id]);
  
  // Insert new search word relationships
  if (searchWordIds && searchWordIds.length > 0) {
    for (const wordId of searchWordIds) {
      await database.runAsync(
        'INSERT INTO id_search_words (id_item_id, search_word_id) VALUES (?, ?)',
        [id, wordId]
      );
    }
  }
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

export const createSearchWord = async (word: string, color: string = '#007AFF'): Promise<void> => {
  const database = ensureDatabase();
  
  // Debug: Check table structure before insertion
  try {
    const tableInfo = await database.getAllAsync('PRAGMA table_info(search_words)');
    console.log('search_words table structure:', tableInfo);
  } catch (error) {
    console.error('Error checking table structure:', error);
  }
  
  const now = new Date().toISOString();
  await database.runAsync('INSERT INTO search_words (word, color, isActive, createdAt) VALUES (?, ?, ?, ?)', [word, color, 1, now]);
};

export const updateSearchWordStatus = async (id: number, isActive: boolean): Promise<void> => {
  const database = ensureDatabase();
  await database.runAsync('UPDATE search_words SET isActive = ? WHERE id = ?', [isActive ? 1 : 0, id]);
};

export const getIDsUsingSearchWord = async (searchWordId: number): Promise<IDItem[]> => {
  const database = ensureDatabase();
  const result = await database.getAllAsync<Omit<IDItem, 'searchWordIds'>>(
    `SELECT DISTINCT i.* FROM ids i 
     INNER JOIN id_search_words isw ON i.id = isw.id_item_id 
     WHERE isw.search_word_id = ? 
     ORDER BY i.updatedAt DESC`,
    [searchWordId]
  );
  
  // Get search word IDs for each item
  const itemsWithSearchWords = await Promise.all(
    result.map(async (item) => {
      const searchWordIds = await database.getAllAsync<{ search_word_id: number }>(
        'SELECT search_word_id FROM id_search_words WHERE id_item_id = ?',
        [item.id]
      );
      return {
        ...item,
        searchWordIds: searchWordIds.map(row => row.search_word_id)
      };
    })
  );
  
  return itemsWithSearchWords;
};

export const deleteSearchWord = async (id: number): Promise<void> => {
  const database = ensureDatabase();
  // Delete the search word relationships first (CASCADE should handle this, but being explicit)
  await database.runAsync('DELETE FROM id_search_words WHERE search_word_id = ?', [id]);
  // Delete the search word itself
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

export const getGlobalSettings = async (): Promise<GlobalSettings> => {
  const database = ensureDatabase();
  const useSearchWords = await database.getFirstAsync<{ value: string }>('SELECT value FROM global_settings WHERE key = ?', ['useSearchWords']);
  const searchInMemo = await database.getFirstAsync<{ value: string }>('SELECT value FROM global_settings WHERE key = ?', ['searchInMemo']);
  const darkMode = await database.getFirstAsync<{ value: string }>('SELECT value FROM global_settings WHERE key = ?', ['darkMode']);
  
  return {
    useSearchWords: useSearchWords?.value === 'true',
    searchInMemo: searchInMemo?.value === 'true',
    darkMode: (darkMode?.value as "system" | "light" | "dark") || "system"
  };
};

export const setGlobalSetting = async (key: keyof GlobalSettings, value: boolean | string): Promise<void> => {
  const database = ensureDatabase();
  await database.runAsync('UPDATE global_settings SET value = ? WHERE key = ?', [value.toString(), key]);
};

export const buildSearchQuery = async (baseQuery: string, itemSearchWordIds?: number[]): Promise<string> => {
  const settings = await getGlobalSettings();
  let searchWords: string[] = [];
  
  // グローバル設定がオンの場合、アクティブな検索タグを追加
  if (settings.useSearchWords) {
    const activeWords = await getActiveSearchWords();
    searchWords.push(...activeWords.map(w => w.word));
  }
  
  // アイテム固有の検索タグがある場合は必ず追加（重複除去）
  if (itemSearchWordIds && itemSearchWordIds.length > 0) {
    const itemWords = await getAllSearchWords();
    const itemSpecificWords = itemWords
      .filter(w => itemSearchWordIds.includes(w.id))
      .map(w => w.word);
    
    // 重複を除去して追加
    itemSpecificWords.forEach(word => {
      if (!searchWords.includes(word)) {
        searchWords.push(word);
      }
    });
  }
  
  return searchWords.length > 0 ? `${searchWords.join(' ')} ${baseQuery}` : baseQuery;
};

export const updateSortOrder = async (items: { id: number; sortOrder: number }[]): Promise<void> => {
  const database = ensureDatabase();
  
  // バッチ更新のためにトランザクションを使用
  await database.withTransactionAsync(async () => {
    for (const item of items) {
      await database.runAsync('UPDATE ids SET sortOrder = ? WHERE id = ?', [item.sortOrder, item.id]);
    }
  });
};