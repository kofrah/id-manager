import {
  IDItem,
  SearchWord,
  buildSearchQuery,
  createSearchWord,
  getAllSearchWords,
} from "@/utils/database";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { IconSymbol } from "./ui/IconSymbol";
import { useDarkMode } from "@/contexts/DarkModeContext";
import { Colors } from "@/constants/Colors";

interface IDFormProps {
  initialData?: IDItem | null;
  onSave: (title: string, notes?: string, searchWordIds?: number[]) => void;
  onCancel: () => void;
  onDelete?: (id: number) => void;
}

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

export function IDForm({
  initialData,
  onSave,
  onCancel,
  onDelete,
}: IDFormProps) {
  const { colorScheme } = useDarkMode();
  const colors = Colors[colorScheme];
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [searchWords, setSearchWords] = useState<SearchWord[]>([]);
  const [selectedSearchWordIds, setSelectedSearchWordIds] = useState<number[]>(
    []
  );
  const [newSearchWord, setNewSearchWord] = useState("");
  const [newSearchWordColor, setNewSearchWordColor] = useState(
    SEARCH_WORD_COLORS[0]
  );
  const [showAddNewWord, setShowAddNewWord] = useState(false);
  const [searchPreview, setSearchPreview] = useState("");

  const updateSearchPreview = useCallback(async () => {
    if (title.trim()) {
      const preview = await buildSearchQuery(
        title.trim(),
        selectedSearchWordIds
      );
      setSearchPreview(preview);
    } else {
      setSearchPreview("");
    }
  }, [title, selectedSearchWordIds]);

  useEffect(() => {
    loadSearchWords();
    if (initialData) {
      setTitle(initialData.title);
      setNotes(initialData.notes || "");
      setSelectedSearchWordIds(initialData.searchWordIds || []);
    }
  }, [initialData]);

  useEffect(() => {
    updateSearchPreview();
  }, [updateSearchPreview]);

  const loadSearchWords = async () => {
    const words = await getAllSearchWords();
    setSearchWords(words);
  };

  const handleSave = () => {
    if (!title.trim()) {
      alert("IDは必須です");
      return;
    }
    onSave(
      title.trim(),
      notes.trim(),
      selectedSearchWordIds.length > 0 ? selectedSearchWordIds : undefined
    );
  };

  const handleToggleSearchWord = (wordId: number) => {
    setSelectedSearchWordIds((prev) =>
      prev.includes(wordId)
        ? prev.filter((id) => id !== wordId)
        : [...prev, wordId]
    );
  };

  const handleAddNewSearchWord = async () => {
    if (!newSearchWord.trim()) {
      alert("検索タグを入力してください");
      return;
    }
    try {
      await createSearchWord(newSearchWord.trim(), newSearchWordColor);
      setNewSearchWord("");
      setNewSearchWordColor(SEARCH_WORD_COLORS[0]);
      setShowAddNewWord(false);
      await loadSearchWords();
      alert("検索タグを追加しました");
    } catch (error) {
      console.error("Error adding search word:", error);
      alert("検索タグの追加に失敗しました");
    }
  };

  const handleDelete = () => {
    if (!initialData || !onDelete) return;

    Alert.alert(
      "削除の確認",
      `"${initialData.title}" を削除してもよろしいですか？`,
      [
        { text: "キャンセル", style: "cancel" },
        {
          text: "削除",
          onPress: () => {
            onDelete(initialData.id);
          },
          style: "destructive",
        },
      ]
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colorScheme === "dark" ? "#000000" : "#F2F2F7",
    },
    scrollView: {
      flex: 1,
    },
    scrollViewContent: {
      flexGrow: 1,
      paddingBottom: 40,
    },
    form: {
      padding: 24,
      paddingBottom: 24,
    },
    inputGroup: {
      marginBottom: 24,
    },
    label: {
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 10,
      color: colors.text,
      letterSpacing: 0.2,
    },
    input: {
      borderWidth: 0,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      backgroundColor: colorScheme === "dark" ? "#1C1C1E" : "#FFFFFF",
      color: colors.text,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 2,
    },
    notesInput: {
      height: 120,
      textAlignVertical: "top",
      paddingTop: 16,
    },
    searchWordHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10,
    },
    addNewButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    addNewButtonText: {
      color: colorScheme === "dark" ? "#0A84FF" : "#007AFF",
      fontSize: 14,
      fontWeight: "500",
    },
    newWordContainer: {
      backgroundColor: colorScheme === "dark" ? "#1C1C1E" : "#FFFFFF",
      padding: 16,
      borderRadius: 12,
      marginBottom: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 2,
    },
    colorPicker: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginTop: 12,
      marginBottom: 16,
    },
    colorOption: {
      width: 32,
      height: 32,
      borderRadius: 16,
      borderWidth: 2,
      borderColor: "transparent",
    },
    selectedColor: {
      borderColor: colorScheme === "dark" ? "#0A84FF" : "#007AFF",
      borderWidth: 3,
    },
    newWordActions: {
      flexDirection: "row",
      gap: 12,
    },
    button: {
      flex: 1,
      flexDirection: "row",
      padding: 18,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 3,
    },
    cancelNewWordButton: {
      backgroundColor: colorScheme === "dark" ? "#48484A" : "#E5E5EA",
    },
    cancelNewWordButtonText: {
      color: colors.text,
      fontSize: 15,
      fontWeight: "600",
    },
    addNewWordButton: {
      backgroundColor: colorScheme === "dark" ? "#0A84FF" : "#007AFF",
    },
    addNewWordButtonText: {
      color: "#FFFFFF",
      fontSize: 15,
      fontWeight: "600",
    },
    searchWordsList: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
    },
    searchWordItem: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colorScheme === "dark" ? "#1C1C1E" : "#FFFFFF",
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      gap: 8,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    checkbox: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: colorScheme === "dark" ? "#48484A" : "#C7C7CC",
      justifyContent: "center",
      alignItems: "center",
    },
    checkboxSelected: {
      backgroundColor: colorScheme === "dark" ? "#0A84FF" : "#007AFF",
      borderColor: colorScheme === "dark" ? "#0A84FF" : "#007AFF",
    },
    colorIndicator: {
      width: 12,
      height: 12,
      borderRadius: 3,
    },
    searchWordText: {
      fontSize: 14,
      color: colors.text,
      fontWeight: "500",
    },
    previewContainer: {
      backgroundColor: colorScheme === "dark" ? "#1C1C1E" : "#FFFFFF",
      padding: 16,
      borderRadius: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 2,
    },
    previewText: {
      fontSize: 15,
      color: colors.text,
      lineHeight: 20,
    },
    buttonContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 40,
      gap: 12,
    },
    cancelButton: {
      backgroundColor: colorScheme === "dark" ? "#48484A" : "#E5E5EA",
    },
    saveButton: {
      backgroundColor: colorScheme === "dark" ? "#0A84FF" : "#007AFF",
      shadowColor: colorScheme === "dark" ? "#0A84FF" : "#007AFF",
      shadowOpacity: 0.3,
    },
    cancelButtonText: {
      color: colors.text,
      fontSize: 17,
      fontWeight: "600",
      letterSpacing: 0.2,
      marginLeft: 8,
    },
    saveButtonText: {
      color: "#FFFFFF",
      fontSize: 17,
      fontWeight: "600",
      letterSpacing: 0.2,
      marginLeft: 8,
    },
    deleteButton: {
      marginTop: 20,
      backgroundColor: "#FF3B30",
      shadowColor: "#FF3B30",
      shadowOpacity: 0.3,
    },
    deleteButtonText: {
      color: "#FFFFFF",
      fontSize: 17,
      fontWeight: "600",
      letterSpacing: 0.2,
      marginLeft: 8,
    },
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>ID * (必須)</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="例: 1234567"
              placeholderTextColor={colorScheme === "dark" ? "#8E8E93" : "#999"}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>メモ</Text>
            <TextInput
              style={[styles.input, styles.notesInput]}
              value={notes}
              onChangeText={setNotes}
              placeholder="IDの説明 (例: かわいい子犬の動画)"
              placeholderTextColor={colorScheme === "dark" ? "#8E8E93" : "#999"}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.searchWordHeader}>
              <Text style={styles.label}>検索タグ</Text>
              <TouchableOpacity
                style={styles.addNewButton}
                onPress={() => setShowAddNewWord(!showAddNewWord)}
              >
                <IconSymbol name="plus" size={16} color={colorScheme === "dark" ? "#0A84FF" : "#007AFF"} />
                <Text style={styles.addNewButtonText}>新規追加</Text>
              </TouchableOpacity>
            </View>

            {showAddNewWord && (
              <View style={styles.newWordContainer}>
                <TextInput
                  style={styles.input}
                  value={newSearchWord}
                  onChangeText={setNewSearchWord}
                  placeholder="新しい検索タグ"
                  placeholderTextColor={colorScheme === "dark" ? "#8E8E93" : "#999"}
                />
                <View style={styles.colorPicker}>
                  {SEARCH_WORD_COLORS.map((color) => (
                    <TouchableOpacity
                      key={color}
                      style={[
                        styles.colorOption,
                        { backgroundColor: color },
                        newSearchWordColor === color && styles.selectedColor,
                      ]}
                      onPress={() => setNewSearchWordColor(color)}
                    />
                  ))}
                </View>
                <View style={styles.newWordActions}>
                  <TouchableOpacity
                    style={[styles.button, styles.cancelNewWordButton]}
                    onPress={() => {
                      setShowAddNewWord(false);
                      setNewSearchWord("");
                    }}
                  >
                    <Text style={styles.cancelNewWordButtonText}>
                      キャンセル
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.addNewWordButton]}
                    onPress={handleAddNewSearchWord}
                  >
                    <Text style={styles.addNewWordButtonText}>追加</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <View style={styles.searchWordsList}>
              {searchWords.map((word) => (
                <TouchableOpacity
                  key={word.id}
                  style={styles.searchWordItem}
                  onPress={() => handleToggleSearchWord(word.id)}
                >
                  <View
                    style={[
                      styles.checkbox,
                      selectedSearchWordIds.includes(word.id) &&
                        styles.checkboxSelected,
                    ]}
                  >
                    {selectedSearchWordIds.includes(word.id) && (
                      <IconSymbol name="checkmark" size={12} color="#FFFFFF" />
                    )}
                  </View>
                  <View
                    style={[
                      styles.colorIndicator,
                      { backgroundColor: word.color },
                    ]}
                  />
                  <Text style={styles.searchWordText}>{word.word}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {searchPreview && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>検索プレビュー</Text>
              <View style={styles.previewContainer}>
                <Text style={styles.previewText}>{searchPreview}</Text>
              </View>
            </View>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
            >
              <IconSymbol
                name="arrow.uturn.backward"
                size={20}
                color={colors.text}
              />
              <Text style={styles.cancelButtonText}>キャンセル</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}
            >
              <IconSymbol name="checkmark" size={20} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>保存</Text>
            </TouchableOpacity>
          </View>

          {initialData && onDelete && (
            <TouchableOpacity
              style={[styles.button, styles.deleteButton]}
              onPress={handleDelete}
            >
              <IconSymbol name="trash" size={20} color="#FFFFFF" />
              <Text style={styles.deleteButtonText}>削除</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
