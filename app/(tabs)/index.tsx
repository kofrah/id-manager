import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IDList } from '@/components/IDList';
import { IDForm } from '@/components/IDForm';
import { IconSymbol } from '@/components/ui/IconSymbol';
import * as WebBrowser from 'expo-web-browser';
import { 
  initDatabase, 
  getAllIDs, 
  createID, 
  updateID, 
  deleteID, 
  searchIDs,
  IDItem 
} from '@/utils/database';
import { getActiveSearchWords } from '@/utils/database';

export default function HomeScreen() {
  const [ids, setIds] = useState<IDItem[]>([]);
  const [filteredIds, setFilteredIds] = useState<IDItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingID, setEditingID] = useState<IDItem | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    initializeApp();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      handleSearch(searchQuery);
    } else {
      setFilteredIds(ids);
    }
  }, [searchQuery, ids]);

  const initializeApp = async () => {
    await initDatabase();
    await loadIDs();
  };

  const loadIDs = async () => {
    const data = await getAllIDs();
    setIds(data);
    setFilteredIds(data);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadIDs();
    setRefreshing(false);
  };

  const handleSearch = async (query: string) => {
    if (query.trim()) {
      const results = await searchIDs(query);
      setFilteredIds(results);
    } else {
      setFilteredIds(ids);
    }
  };

  const handleAddNew = () => {
    setEditingID(null);
    setShowForm(true);
  };

  const handleSelectID = (id: IDItem) => {
    setEditingID(id);
    setShowForm(true);
  };


  const handleSave = async (title: string, notes?: string) => {
    if (editingID) {
      await updateID(editingID.id, title, notes);
    } else {
      await createID(title, notes);
    }
    setShowForm(false);
    await loadIDs();
  };

  const handleDelete = async (id: number) => {
    await deleteID(id);
    await loadIDs();
  };

  const handleWebSearch = async (query: string) => {
    const activeWords = await getActiveSearchWords();
    const prefixes = activeWords.map(w => w.word).join(' ');
    const searchQuery = prefixes ? `${prefixes} ${query}` : query;
    const url = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
    await WebBrowser.openBrowserAsync(url);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ID管理</Text>
      </View>

      <View style={styles.searchWrapper}>
        <View style={styles.searchContainer}>
          <IconSymbol name="magnifyingglass" size={20} color="#8E8E93" />
          <TextInput
            style={styles.searchInput}
            placeholder="IDを検索"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#C7C7CC"
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <IconSymbol name="xmark.circle.fill" size={20} color="#8E8E93" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity 
          style={styles.searchButton} 
          onPress={() => handleSearch(searchQuery)}
        >
          <Text style={styles.searchButtonText}>検索</Text>
        </TouchableOpacity>
      </View>

      <IDList
        ids={filteredIds}
        onSelectID={handleSelectID}
        onDeleteID={handleDelete}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        onSearch={handleWebSearch}
      />

      <Modal
        visible={showForm}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <IDForm
            initialData={editingID}
            onSave={handleSave}
            onCancel={() => setShowForm(false)}
            onDelete={editingID ? (id) => {
              handleDelete(id);
              setShowForm(false);
            } : undefined}
          />
        </SafeAreaView>
      </Modal>

      <TouchableOpacity style={styles.fab} onPress={handleAddNew}>
        <IconSymbol name="plus" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#000000',
  },
  searchButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 120,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
