import { Colors } from "@/constants/Colors";
import { useDarkMode } from "@/contexts/DarkModeContext";
import {
  IDItem,
  SearchWord,
  getAllSearchWords,
  updateSortOrder,
} from "@/utils/database";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from "react-native-draggable-flatlist";
import {
  GestureHandlerRootView,
  Swipeable,
} from "react-native-gesture-handler";
import { IconSymbol } from "./ui/IconSymbol";

interface IDListProps {
  ids: IDItem[];
  onSelectID: (id: IDItem) => void;
  onDeleteID: (id: number) => void;
  onRefresh: () => void;
  refreshing: boolean;
  onSearch: (query: string, item?: IDItem, includeNotes?: boolean) => void;
}

export function IDList({
  ids,
  onSelectID,
  onDeleteID,
  onRefresh,
  refreshing,
  onSearch,
}: IDListProps) {
  const { colorScheme } = useDarkMode();
  const colors = Colors[colorScheme];
  const [searchWords, setSearchWords] = useState<SearchWord[]>([]);
  const [data, setData] = useState(ids);
  const swipeableRefs = useRef<{ [key: number]: Swipeable | null }>({});

  useEffect(() => {
    loadSearchWords();
  }, []);

  useEffect(() => {
    loadSearchWords();
    setData(ids);
  }, [ids]);

  const loadSearchWords = async () => {
    try {
      const words = await getAllSearchWords();
      setSearchWords(words);
    } catch (error) {
      console.error("Error loading search words:", error);
    }
  };

  const getSelectedSearchWords = (searchWordIds?: number[]) => {
    if (!searchWordIds || searchWordIds.length === 0) return [];
    const selectedWords = searchWords.filter((word) =>
      searchWordIds.includes(word.id)
    );
    return selectedWords;
  };

  const handleDelete = (id: number, title: string) => {
    Alert.alert("削除の確認", `"${title}" を削除してもよろしいですか？`, [
      {
        text: "キャンセル",
        style: "cancel",
        onPress: () => swipeableRefs.current[id]?.close(),
      },
      {
        text: "削除",
        onPress: () => onDeleteID(id),
        style: "destructive",
      },
    ]);
  };

  const styles = StyleSheet.create({
    item: {
      backgroundColor: colorScheme === "dark" ? "#1C1C1E" : "#FFFFFF",
      padding: 20,
      marginHorizontal: 20,
      marginVertical: 6,
      borderRadius: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 3,
    },
    activeItem: {
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 8,
    },
    itemContent: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    itemInfo: {
      flex: 1,
      marginRight: 12,
    },
    titleContainer: {
      flexDirection: "column",
      marginBottom: 4,
      gap: 6,
    },
    title: {
      fontSize: 17,
      fontWeight: "600",
      color: colors.text,
      letterSpacing: 0.2,
    },
    searchWordBadges: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 6,
    },
    searchWordItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 3,
      backgroundColor: colorScheme === "dark" ? "#2C2C2E" : "#F2F2F7",
      paddingHorizontal: 4,
      paddingVertical: 2,
      borderRadius: 4,
    },
    colorIndicator: {
      width: 8,
      height: 8,
      borderRadius: 2,
    },
    searchWordText: {
      fontSize: 10,
      fontWeight: "500",
      color: colorScheme === "dark" ? "#8E8E93" : "#666666",
    },
    notes: {
      fontSize: 14,
      color: colorScheme === "dark" ? "#8E8E93" : "#8E8E93",
      lineHeight: 18,
    },
    searchButton: {
      padding: 10,
    },
    deleteAction: {
      backgroundColor: "#FF3B30",
      justifyContent: "center",
      alignItems: "flex-end",
      paddingHorizontal: 30,
      marginVertical: 6,
      marginRight: 20,
      borderRadius: 16,
    },
    deleteActionText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "600",
    },
    emptyContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 80,
    },
    emptyText: {
      fontSize: 17,
      color: colorScheme === "dark" ? "#8E8E93" : "#8E8E93",
      letterSpacing: 0.2,
    },
  });

  const renderRightActions = () => (
    <View style={styles.deleteAction}>
      <Text style={styles.deleteActionText}>削除</Text>
    </View>
  );

  const handleDragEnd = async ({ data: newData }: { data: IDItem[] }) => {
    setData(newData);

    // 並び順を保存
    const updates = newData.map((item, index) => ({
      id: item.id,
      sortOrder: index,
    }));
    await updateSortOrder(updates);
    onRefresh();
  };

  const renderItem = ({ item, drag, isActive }: RenderItemParams<IDItem>) => {
    return (
      <ScaleDecorator>
        <Swipeable
          ref={(ref) => {
            swipeableRefs.current[item.id] = ref;
          }}
          renderRightActions={renderRightActions}
          onSwipeableOpen={() => handleDelete(item.id, item.title)}
          rightThreshold={80}
          enabled={!isActive}
        >
          <TouchableOpacity
            style={[styles.item, isActive && styles.activeItem]}
            onPress={() => onSelectID(item)}
            onLongPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              drag();
            }}
            delayLongPress={200}
          >
            <View style={styles.itemContent}>
              <View style={styles.itemInfo}>
                <View style={styles.titleContainer}>
                  <Text style={styles.title}>{item.title}</Text>
                  {getSelectedSearchWords(item.searchWordIds).length > 0 && (
                    <View style={styles.searchWordBadges}>
                      {getSelectedSearchWords(item.searchWordIds).map(
                        (word) => (
                          <View key={word.id} style={styles.searchWordItem}>
                            <View
                              style={[
                                styles.colorIndicator,
                                { backgroundColor: word.color },
                              ]}
                            />
                            <Text style={styles.searchWordText}>
                              {word.word}
                            </Text>
                          </View>
                        )
                      )}
                    </View>
                  )}
                </View>
                {item.notes && (
                  <Text style={styles.notes} numberOfLines={2}>
                    {item.notes}
                  </Text>
                )}
              </View>
              <TouchableOpacity
                style={styles.searchButton}
                onPress={() => onSearch(item.title, item, true)}
                hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
              >
                <IconSymbol
                  name="magnifyingglass"
                  size={20}
                  color={colors.tint}
                />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Swipeable>
      </ScaleDecorator>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <DraggableFlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        onDragEnd={handleDragEnd}
        contentContainerStyle={{ paddingBottom: 150 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>IDが登録されていません</Text>
          </View>
        }
      />
    </GestureHandlerRootView>
  );
}
