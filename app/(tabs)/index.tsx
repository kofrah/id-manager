import { IDForm } from "@/components/IDForm";
import { IDList } from "@/components/IDList";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { FilterIcon } from "@/components/FilterIcon";
import {
  IDItem,
  buildSearchQuery,
  createID,
  deleteID,
  getAllIDs,
  getAllSearchWords,
  SearchWord,
  initDatabase,
  updateID,
} from "@/utils/database";
import React, { useEffect, useState } from "react";
import {
  Linking,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GestureHandlerRootView, PanGestureHandler } from "react-native-gesture-handler";
import { useDarkMode } from "@/contexts/DarkModeContext";
import { Colors } from "@/constants/Colors";
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from "react-native-reanimated";

export default function HomeScreen() {
  const { colorScheme } = useDarkMode();
  const colors = Colors[colorScheme];
  const [ids, setIds] = useState<IDItem[]>([]);
  const [filteredIds, setFilteredIds] = useState<IDItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingID, setEditingID] = useState<IDItem | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [selectedKeywords, setSelectedKeywords] = useState<number[]>([]);
  const [allKeywords, setAllKeywords] = useState<SearchWord[]>([]);

  // Swipeable modal animation values
  const translateY = useSharedValue(0);
  const { height } = Dimensions.get("window");

  useEffect(() => {
    initializeApp();
  }, []);

  useEffect(() => {
    loadKeywords();
  }, []);

  useEffect(() => {
    let filtered = ids;
    
    // テキスト検索でフィルタリング
    if (searchQuery.trim() !== "") {
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.notes &&
            item.notes.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // キーワードフィルターでフィルタリング
    if (selectedKeywords.length > 0) {
      filtered = filtered.filter((item) => {
        if (!item.searchWordIds || item.searchWordIds.length === 0) {
          return false;
        }
        // 選択されたキーワードのいずれかを含むアイテムを表示
        return selectedKeywords.some(keywordId => 
          item.searchWordIds!.includes(keywordId)
        );
      });
    }
    
    setFilteredIds(filtered);
  }, [ids, searchQuery, selectedKeywords]);

  const initializeApp = async () => {
    await initDatabase();
    await loadIDs();
  };

  const loadKeywords = async () => {
    const keywords = await getAllSearchWords();
    setAllKeywords(keywords);
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

  const handleSave = async (
    title: string,
    notes?: string,
    searchWordIds?: number[]
  ) => {
    if (editingID) {
      await updateID(editingID.id, title, notes, searchWordIds);
    } else {
      await createID(title, notes, searchWordIds);
    }
    setShowForm(false);
    await loadIDs();
  };

  const handleCancel = () => {
    setShowForm(false);
    // IDFormで検索ワードが追加された可能性があるため、IDリストを再読み込み
    loadIDs();
  };

  // Gesture handler for swipe to dismiss
  const gestureHandler = useAnimatedGestureHandler({
    onStart: () => {
      translateY.value = 0;
    },
    onActive: (event) => {
      // Only allow downward swipes
      if (event.translationY > 0) {
        translateY.value = event.translationY;
      }
    },
    onEnd: (event) => {
      if (event.translationY > height * 0.2 || event.velocityY > 800) {
        // If swiped more than 20% of screen height or with high velocity, close the modal
        translateY.value = withSpring(height, {
          damping: 20,
          stiffness: 90,
        });
        runOnJS(handleCancel)();
      } else {
        // Otherwise, snap back to original position
        translateY.value = withSpring(0, {
          damping: 20,
          stiffness: 200,
        });
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  // Reset animation when modal opens
  useEffect(() => {
    if (showForm) {
      translateY.value = 0;
    }
  }, [showForm]);

  const handleDelete = async (id: number) => {
    await deleteID(id);
    await loadIDs();
  };

  const handleWebSearch = async () => {
    if (!searchQuery.trim()) return;

    const fullSearchQuery = await buildSearchQuery(searchQuery, selectedKeywords);

    // Use x-web-search URL scheme to let the OS decide which browser to use
    const url = `x-web-search://?${encodeURIComponent(fullSearchQuery)}`;
    try {
      await Linking.openURL(url);
    } catch (error) {
      // Fallback to Google search if x-web-search is not supported
      const fallbackUrl = `https://www.google.com/search?q=${encodeURIComponent(
        fullSearchQuery
      )}`;
      await Linking.openURL(fallbackUrl);
    }
  };

  const handleFilterPress = () => {
    setShowFilterDialog(true);
  };

  const handleKeywordToggle = (keywordId: number) => {
    setSelectedKeywords(prev => 
      prev.includes(keywordId)
        ? prev.filter(id => id !== keywordId)
        : [...prev, keywordId]
    );
  };

  const clearFilter = () => {
    setSelectedKeywords([]);
    setShowFilterDialog(false);
  };

  const handleAppSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleItemWebSearch = async (query: string, item?: IDItem) => {
    const fullSearchQuery = await buildSearchQuery(query, item?.searchWordIds);

    // Use x-web-search URL scheme to let the OS decide which browser to use
    const url = `x-web-search://?${encodeURIComponent(fullSearchQuery)}`;
    try {
      await Linking.openURL(url);
    } catch (error) {
      // Fallback to Google search if x-web-search is not supported
      const fallbackUrl = `https://www.google.com/search?q=${encodeURIComponent(
        fullSearchQuery
      )}`;
      await Linking.openURL(fallbackUrl);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colorScheme === "dark" ? "#000000" : "#F2F2F7",
    },
    header: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: colorScheme === "dark" ? "#1C1C1E" : "#FFFFFF",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 3,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: "700",
      color: colors.text,
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
      backgroundColor: colorScheme === "dark" ? "#1C1C1E" : "#FFFFFF",
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
      color: colors.text,
    },
    filterButton: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    filterButtonInactive: {
      backgroundColor: colorScheme === "dark" ? "#1C1C1E" : "#FFFFFF",
    },
    filterButtonActive: {
      backgroundColor: "#007AFF",
    },
    modalContainer: {
      flex: 1,
      backgroundColor: colorScheme === "dark" ? "#000000" : "#F2F2F7",
    },
    dragIndicatorContainer: {
      alignItems: "center",
      paddingTop: 8,
      paddingBottom: 4,
    },
    dragIndicator: {
      width: 36,
      height: 5,
      backgroundColor: colorScheme === "dark" ? "#48484A" : "#C7C7CC",
      borderRadius: 3,
    },
    filterDialogOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.4)",
      justifyContent: "flex-end",
    },
    filterDialog: {
      backgroundColor: colorScheme === "dark" ? "#1C1C1E" : "#FFFFFF",
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingTop: 8,
      paddingBottom: 34,
      maxHeight: "70%",
    },
    filterHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colorScheme === "dark" ? "#2C2C2E" : "#F2F2F7",
    },
    filterTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 8,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
    },
    smallClearButton: {
      paddingHorizontal: 12,
      paddingVertical: 4,
    },
    smallClearButtonText: {
      fontSize: 14,
      color: "#007AFF",
    },
    keywordList: {
      paddingHorizontal: 20,
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
      paddingTop: 12,
    },
    keywordItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 10,
      backgroundColor: colorScheme === "dark" ? "#2C2C2E" : "#F2F2F7",
      borderRadius: 20,
    },
    keywordItemSelected: {
      backgroundColor: "#007AFF",
    },
    keywordText: {
      fontSize: 14,
      color: colors.text,
    },
    keywordTextSelected: {
      color: "#FFFFFF",
    },
    keywordColor: {
      width: 20,
      height: 20,
      borderRadius: 10,
      marginRight: 8,
    },
    keywordCheckbox: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colorScheme === "dark" ? "#48484A" : "#C7C7CC",
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    keywordCheckboxChecked: {
      backgroundColor: "#007AFF",
      borderColor: "#007AFF",
    },
    keywordLabel: {
      flex: 1,
      fontSize: 16,
      color: colors.text,
    },
    clearButton: {
      marginHorizontal: 20,
      marginTop: 16,
      paddingVertical: 12,
      backgroundColor: colorScheme === "dark" ? "#48484A" : "#E5E5EA",
      borderRadius: 10,
      alignItems: "center",
    },
    clearButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
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
            placeholder="ID・メモを検索"
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
          style={[
            styles.filterButton,
            selectedKeywords.length > 0 ? styles.filterButtonActive : styles.filterButtonInactive
          ]} 
          onPress={handleFilterPress}
        >
          <FilterIcon 
            size={20} 
            color={selectedKeywords.length > 0 ? "#FFFFFF" : "#8E8E93"} 
          />
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
        onRequestClose={handleCancel}
      >
        <GestureHandlerRootView style={{ flex: 1 }}>
          <PanGestureHandler onGestureEvent={gestureHandler}>
            <Animated.View style={[{ flex: 1 }, animatedStyle]}>
              <SafeAreaView style={styles.modalContainer}>
                <View style={styles.dragIndicatorContainer}>
                  <View style={styles.dragIndicator} />
                </View>
                <IDForm
                  initialData={editingID}
                  onSave={handleSave}
                  onCancel={handleCancel}
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
            </Animated.View>
          </PanGestureHandler>
        </GestureHandlerRootView>
      </Modal>

      <Modal
        visible={showFilterDialog}
        animationType="slide"
        transparent={true}
      >
        <TouchableOpacity 
          style={styles.filterDialogOverlay}
          activeOpacity={1}
          onPress={() => setShowFilterDialog(false)}
        >
          <TouchableOpacity style={styles.filterDialog} activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <View style={styles.filterHeader}>
              <Text style={styles.filterTitle}>フィルター</Text>
              <TouchableOpacity onPress={() => setShowFilterDialog(false)}>
                <IconSymbol name="xmark" size={20} color="#8E8E93" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>キーワード</Text>
              <TouchableOpacity style={styles.smallClearButton} onPress={clearFilter}>
                <Text style={styles.smallClearButtonText}>クリア</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.keywordList}>
              {allKeywords.map((keyword) => (
                <TouchableOpacity
                  key={keyword.id}
                  style={[
                    styles.keywordItem,
                    selectedKeywords.includes(keyword.id) && styles.keywordItemSelected
                  ]}
                  onPress={() => handleKeywordToggle(keyword.id)}
                >
                  <View style={[styles.keywordColor, { backgroundColor: keyword.color }]} />
                  <Text style={[
                    styles.keywordText,
                    selectedKeywords.includes(keyword.id) && styles.keywordTextSelected
                  ]}>
                    {keyword.word}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <TouchableOpacity style={styles.fab} onPress={handleAddNew}>
        <IconSymbol name="plus" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
