import { IconSymbol } from "@/components/ui/IconSymbol";
import type { SearchWord } from "@/utils/database";
import {
  createSearchWord,
  deleteSearchWord,
  getAllSearchWords,
  getGlobalSettings,
  getIDsUsingSearchWord,
  setGlobalSetting,
  updateSearchWordStatus,
} from "@/utils/database";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDarkMode } from "@/contexts/DarkModeContext";
import { Colors } from "@/constants/Colors";

const SEARCH_WORD_COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEAA7",
  "#DDA0DD",
  "#98D8C8",
  "#F7DC6F",
  "#BB8FCE",
  "#85C1E9",
];

export default function TagSettingsScreen() {
  const router = useRouter();
  const { colorScheme } = useDarkMode();
  const colors = Colors[colorScheme];
  const [searchWords, setSearchWords] = useState<SearchWord[]>([]);
  const [newWord, setNewWord] = useState<string>("");
  const [newWordColor, setNewWordColor] = useState<string>(
    SEARCH_WORD_COLORS[0]
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [useSearchWords, setUseSearchWords] = useState<boolean>(true);

  useEffect(() => {
    loadSearchWords();
    loadGlobalSettings();
  }, []);

  const loadGlobalSettings = async () => {
    const settings = await getGlobalSettings();
    setUseSearchWords(settings.useSearchWords);
  };

  const handleToggleUseSearchWords = async () => {
    const newValue = !useSearchWords;
    setUseSearchWords(newValue);
    await setGlobalSetting("useSearchWords", newValue);
  };

  const loadSearchWords = async () => {
    const words = await getAllSearchWords();
    setSearchWords(words);
    setIsLoading(false);
  };

  const handleAddWord = async () => {
    if (!newWord.trim()) {
      Alert.alert("エラー", "検索タグを入力してください");
      return;
    }

    try {
      await createSearchWord(newWord.trim(), newWordColor);
      setNewWord("");
      setNewWordColor(SEARCH_WORD_COLORS[0]);
      await loadSearchWords();
      Alert.alert("成功", "検索タグを追加しました");
    } catch (error) {
      console.error("Error adding search word:", error);
      Alert.alert("エラー", "検索タグの追加に失敗しました");
    }
  };

  const handleToggleWord = async (id: number, currentStatus: boolean) => {
    await updateSearchWordStatus(id, !currentStatus);
    await loadSearchWords();
  };

  const handleDeleteWord = async (id: number, word: string) => {
    try {
      // Check if this search word is being used by any IDs
      const relatedIDs = await getIDsUsingSearchWord(id);

      if (relatedIDs.length > 0) {
        // Show confirmation dialog with details about related IDs
        const idTitles = relatedIDs
          .slice(0, 3)
          .map((item) => `"${item.title}"`)
          .join(", ");
        const moreCount =
          relatedIDs.length > 3 ? ` など${relatedIDs.length}件` : "";

        Alert.alert(
          "削除の確認",
          `"${word}" は ${idTitles}${moreCount}のIDで使用されています。\n\n削除すると、これらのIDからも検索タグが削除されます。本当に削除してもよろしいですか？`,
          [
            { text: "キャンセル", style: "cancel" },
            {
              text: "削除",
              onPress: async () => {
                await deleteSearchWord(id);
                await loadSearchWords();
                Alert.alert("完了", "検索タグを削除しました");
              },
              style: "destructive",
            },
          ]
        );
      } else {
        // Standard confirmation dialog
        Alert.alert("削除の確認", `"${word}" を削除してもよろしいですか？`, [
          { text: "キャンセル", style: "cancel" },
          {
            text: "削除",
            onPress: async () => {
              await deleteSearchWord(id);
              await loadSearchWords();
              Alert.alert("完了", "検索タグを削除しました");
            },
            style: "destructive",
          },
        ]);
      }
    } catch (error) {
      console.error("Error checking related IDs:", error);
      Alert.alert("エラー", "検索タグの削除に失敗しました");
    }
  };

  const renderSearchWord = ({ item }: { item: SearchWord }) => (
    <View style={styles.wordItem}>
      <TouchableOpacity
        style={[
          styles.checkbox,
          !useSearchWords ? styles.checkboxDisabled : null,
        ]}
        onPress={() =>
          useSearchWords && handleToggleWord(item.id, item.isActive)
        }
        disabled={!useSearchWords}
      >
        <View
          style={[
            styles.checkboxInner,
            { borderColor: colorScheme === "dark" ? "#48484A" : "#C7C7CC" },
            item.isActive ? styles.checkboxChecked : null,
            !useSearchWords ? styles.checkboxInnerDisabled : null,
          ]}
        >
          {item.isActive ? (
            <IconSymbol
              name="checkmark"
              size={16}
              color={useSearchWords ? "#FFFFFF" : "#C7C7CC"}
            />
          ) : null}
        </View>
      </TouchableOpacity>
      <View style={styles.wordContent}>
        <View
          style={[
            styles.colorIndicator,
            { backgroundColor: item.color || "#007AFF" },
          ]}
        />
        <Text
          style={[
            styles.wordText,
            { color: colors.text },
            !item.isActive ? styles.wordTextInactive : null,
            !useSearchWords ? styles.wordTextDisabled : null,
          ]}
        >
          {item.word}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteWord(item.id, item.word)}
      >
        <IconSymbol name="trash" size={18} color="#FF3B30" />
      </TouchableOpacity>
    </View>
  );

  const getPreviewText = () => {
    if (!useSearchWords) return "1234567";
    const activeWords = searchWords
      .filter((w) => w.isActive)
      .map((w) => w.word);
    if (activeWords.length === 0) return "1234567";
    return `${activeWords.join(" ")} 1234567`;
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colorScheme === "dark" ? "#000000" : "#F2F2F7",
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 16,
      backgroundColor: colorScheme === "dark" ? "#1C1C1E" : "#FFFFFF",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 3,
      flexDirection: "row",
      alignItems: "center",
    },
    backButton: {
      marginRight: 16,
      padding: 8,
      marginLeft: -8,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: "700",
      color: colors.text,
    },
    content: {
      flex: 1,
      padding: 20,
    },
    section: {
      marginBottom: 32,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 16,
      letterSpacing: 0.2,
    },
    card: {
      backgroundColor: colorScheme === "dark" ? "#1C1C1E" : "#FFFFFF",
      padding: 20,
      borderRadius: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
      marginBottom: 16,
    },
    label: {
      fontSize: 17,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 8,
      letterSpacing: 0.2,
    },
    description: {
      fontSize: 14,
      color: colorScheme === "dark" ? "#8E8E93" : "#8E8E93",
      marginBottom: 16,
      lineHeight: 20,
    },
    addWordContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    input: {
      flex: 1,
      borderWidth: 0,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      backgroundColor: colorScheme === "dark" ? "#2C2C2E" : "#F2F2F7",
      color: colors.text,
      marginRight: 12,
    },
    addButton: {
      backgroundColor: "#007AFF",
      width: 48,
      height: 48,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: "#007AFF",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4,
    },
    wordItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colorScheme === "dark" ? "#2C2C2E" : "#F2F2F7",
    },
    checkbox: {
      marginRight: 12,
    },
    checkboxInner: {
      width: 24,
      height: 24,
      borderRadius: 6,
      borderWidth: 2,
      justifyContent: "center",
      alignItems: "center",
    },
    checkboxChecked: {
      backgroundColor: "#007AFF",
      borderColor: "#007AFF",
    },
    wordText: {
      flex: 1,
      fontSize: 16,
    },
    wordTextInactive: {
      opacity: 0.5,
    },
    deleteButton: {
      padding: 8,
    },
    emptyText: {
      fontSize: 16,
      color: colorScheme === "dark" ? "#8E8E93" : "#8E8E93",
      textAlign: "center",
      paddingVertical: 20,
    },
    previewContainer: {
      backgroundColor: colorScheme === "dark" ? "#2C2C2E" : "#F2F2F7",
      padding: 16,
      borderRadius: 12,
      flexDirection: "row",
      alignItems: "flex-start",
      flexWrap: "wrap",
    },
    previewLabel: {
      fontSize: 14,
      color: colorScheme === "dark" ? "#8E8E93" : "#8E8E93",
      marginRight: 8,
    },
    previewText: {
      fontSize: 16,
      color: colors.text,
      fontWeight: "500",
      flex: 1,
    },
    searchWordHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    toggle: {
      padding: 4,
    },
    toggleTrack: {
      width: 51,
      height: 31,
      borderRadius: 15.5,
      backgroundColor: colorScheme === "dark" ? "#48484A" : "#E9E9EA",
      padding: 2,
    },
    toggleTrackActive: {
      backgroundColor: "#34C759",
    },
    toggleThumb: {
      width: 27,
      height: 27,
      borderRadius: 13.5,
      backgroundColor: "#FFFFFF",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 3,
    },
    toggleThumbActive: {
      transform: [{ translateX: 20 }],
    },
    checkboxDisabled: {
      opacity: 0.5,
    },
    checkboxInnerDisabled: {
      borderColor: colorScheme === "dark" ? "#48484A" : "#E5E5EA",
      backgroundColor: colorScheme === "dark" ? "#2C2C2E" : "#F2F2F7",
    },
    wordTextDisabled: {
      opacity: 0.3,
    },
    colorSection: {
      marginTop: 16,
    },
    colorLabel: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 12,
      letterSpacing: 0.2,
    },
    colorPicker: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
      marginBottom: 16,
    },
    colorOption: {
      width: 40,
      height: 40,
      borderRadius: 20,
      borderWidth: 2,
      borderColor: "transparent",
    },
    selectedColor: {
      borderColor: "#007AFF",
      borderWidth: 3,
    },
    wordContent: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      marginLeft: 12,
      gap: 12,
    },
    colorIndicator: {
      width: 16,
      height: 16,
      borderRadius: 3,
    },
    previewCard: {
      marginBottom: 32,
    },
  });

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <IconSymbol name="chevron.left" size={24} color={colors.tint} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>タグ設定</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <IconSymbol name="chevron.left" size={24} color={colors.tint} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>タグ設定</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <View style={styles.card}>
              <Text style={styles.label}>検索タグ追加</Text>
              <Text style={styles.description}>
                ID検索時に追加される検索タグを設定します。
                複数の検索タグを登録し、必要なものを選択できます。
              </Text>

              <View style={styles.addWordContainer}>
                <TextInput
                  style={styles.input}
                  value={newWord}
                  onChangeText={setNewWord}
                  placeholder="新しい検索タグ"
                  placeholderTextColor="#C7C7CC"
                  onSubmitEditing={handleAddWord}
                />
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={handleAddWord}
                >
                  <IconSymbol name="plus" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <View style={styles.colorSection}>
                <Text style={styles.colorLabel}>検索タグの色</Text>
                <View style={styles.colorPicker}>
                  {SEARCH_WORD_COLORS.map((color) => (
                    <TouchableOpacity
                      key={color}
                      style={[
                        styles.colorOption,
                        { backgroundColor: color },
                        newWordColor === color && styles.selectedColor,
                      ]}
                      onPress={() => setNewWordColor(color)}
                    />
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.card}>
              <View style={styles.searchWordHeader}>
                <Text style={styles.label}>選択した検索タグを必ず使用</Text>
                <TouchableOpacity
                  style={styles.toggle}
                  onPress={handleToggleUseSearchWords}
                >
                  <View
                    style={[
                      styles.toggleTrack,
                      useSearchWords ? styles.toggleTrackActive : null,
                    ]}
                  >
                    <View
                      style={[
                        styles.toggleThumb,
                        useSearchWords ? styles.toggleThumbActive : null,
                      ]}
                    />
                  </View>
                </TouchableOpacity>
              </View>
              <Text style={styles.label}>検索タグ一覧</Text>
              {searchWords.length === 0 ? (
                <Text style={styles.emptyText}>
                  検索タグが登録されていません
                </Text>
              ) : (
                <FlatList
                  data={searchWords}
                  renderItem={renderSearchWord}
                  keyExtractor={(item) => item.id.toString()}
                  scrollEnabled={false}
                />
              )}
            </View>

            <View style={[styles.card, styles.previewCard]}>
              <View style={styles.previewContainer}>
                <Text style={styles.previewLabel}>検索文字列:</Text>
                <Text style={styles.previewText}>{getPreviewText()}</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}