import { IDForm } from "@/components/IDForm";
import { IDList } from "@/components/IDList";
import { IconSymbol } from "@/components/ui/IconSymbol";
import {
  IDItem,
  createID,
  deleteID,
  getActiveSearchWords,
  getAllIDs,
  initDatabase,
  searchIDs,
  updateID,
  getGlobalSettings,
} from "@/utils/database";
import { Linking } from "react-native";
import React, { useEffect, useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const [ids, setIds] = useState<IDItem[]>([]);
  const [filteredIds, setFilteredIds] = useState<IDItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingID, setEditingID] = useState<IDItem | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    initializeApp();
  }, []);

  useEffect(() => {
    setFilteredIds(ids);
  }, [ids]);

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

  const handleWebSearch = async () => {
    if (!searchQuery.trim()) return;
    
    const settings = await getGlobalSettings();
    let fullSearchQuery = searchQuery;
    
    if (settings.useSearchWords) {
      const activeWords = await getActiveSearchWords();
      const prefixes = activeWords.map((w) => w.word).join(" ");
      fullSearchQuery = prefixes ? `${prefixes} ${searchQuery}` : searchQuery;
    }
    
    // Use x-web-search URL scheme to let the OS decide which browser to use
    const url = `x-web-search://?${encodeURIComponent(fullSearchQuery)}`;
    try {
      await Linking.openURL(url);
    } catch (error) {
      // Fallback to Google search if x-web-search is not supported
      const fallbackUrl = `https://www.google.com/search?q=${encodeURIComponent(fullSearchQuery)}`;
      await Linking.openURL(fallbackUrl);
    }
  };

  const handleItemWebSearch = async (query: string) => {
    const settings = await getGlobalSettings();
    let fullSearchQuery = query;
    
    if (settings.useSearchWords) {
      const activeWords = await getActiveSearchWords();
      const prefixes = activeWords.map((w) => w.word).join(" ");
      fullSearchQuery = prefixes ? `${prefixes} ${query}` : query;
    }
    
    // Use x-web-search URL scheme to let the OS decide which browser to use
    const url = `x-web-search://?${encodeURIComponent(fullSearchQuery)}`;
    try {
      await Linking.openURL(url);
    } catch (error) {
      // Fallback to Google search if x-web-search is not supported
      const fallbackUrl = `https://www.google.com/search?q=${encodeURIComponent(fullSearchQuery)}`;
      await Linking.openURL(fallbackUrl);
    }
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
          {searchQuery !== "" && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <IconSymbol name="xmark.circle.fill" size={20} color="#8E8E93" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleWebSearch}
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
        onSearch={handleItemWebSearch}
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
            onDelete={
              editingID
                ? (id) => {
                    handleDelete(id);
                    setShowForm(false);
                  }
                : undefined
            }
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
    backgroundColor: "#F2F2F7",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#000000",
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: "#000000",
  },
  searchButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  searchButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  fab: {
    position: "absolute",
    right: 30,
    bottom: 120,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
