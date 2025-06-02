import { IconSymbol } from "@/components/ui/IconSymbol";
import type { SearchWord } from "@/utils/database";
import {
  createSearchWord,
  deleteSearchWord,
  getAllSearchWords,
  updateSearchWordStatus,
} from "@/utils/database";
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

export default function SettingsScreen() {
  const [searchWords, setSearchWords] = useState<SearchWord[]>([]);
  const [newWord, setNewWord] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadSearchWords();
  }, []);

  const loadSearchWords = async () => {
    const words = await getAllSearchWords();
    setSearchWords(words);
    setIsLoading(false);
  };

  const handleAddWord = async () => {
    if (!newWord.trim()) {
      Alert.alert("エラー", "検索ワードを入力してください");
      return;
    }

    await createSearchWord(newWord.trim());
    setNewWord("");
    await loadSearchWords();
  };

  const handleToggleWord = async (id: number, currentStatus: boolean) => {
    await updateSearchWordStatus(id, !currentStatus);
    await loadSearchWords();
  };

  const handleDeleteWord = async (id: number, word: string) => {
    Alert.alert("削除の確認", `"${word}" を削除してもよろしいですか？`, [
      { text: "キャンセル", style: "cancel" },
      {
        text: "削除",
        onPress: async () => {
          await deleteSearchWord(id);
          await loadSearchWords();
        },
        style: "destructive",
      },
    ]);
  };

  const renderSearchWord = ({ item }: { item: SearchWord }) => (
    <View style={styles.wordItem}>
      <TouchableOpacity
        style={styles.checkbox}
        onPress={() => handleToggleWord(item.id, item.isActive)}
      >
        <View
          style={[
            styles.checkboxInner,
            item.isActive ? styles.checkboxChecked : null,
          ]}
        >
          {item.isActive ? (
            <IconSymbol name="checkmark" size={16} color="#FFFFFF" />
          ) : null}
        </View>
      </TouchableOpacity>
      <Text
        style={[
          styles.wordText,
          !item.isActive ? styles.wordTextInactive : null,
        ]}
      >
        {item.word}
      </Text>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteWord(item.id, item.word)}
      >
        <IconSymbol name="trash" size={18} color="#FF3B30" />
      </TouchableOpacity>
    </View>
  );

  const getPreviewText = () => {
    const activeWords = searchWords
      .filter((w) => w.isActive)
      .map((w) => w.word);
    if (activeWords.length === 0) return "1234567";
    return `${activeWords.join(" ")} 1234567`;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>設定</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>設定</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>検索設定</Text>

            <View style={styles.card}>
              <Text style={styles.label}>検索ワード追加</Text>
              <Text style={styles.description}>
                ID検索時に追加される検索ワードを設定します。
                複数の検索ワードを登録し、必要なものを選択できます。
              </Text>

              <View style={styles.addWordContainer}>
                <TextInput
                  style={styles.input}
                  value={newWord}
                  onChangeText={setNewWord}
                  placeholder="新しい検索ワード"
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
            </View>

            <View style={styles.card}>
              <Text style={styles.label}>登録済み検索ワード</Text>
              {searchWords.length === 0 ? (
                <Text style={styles.emptyText}>
                  検索ワードが登録されていません
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

            <View style={styles.card}>
              <View style={styles.previewContainer}>
                <Text style={styles.previewLabel}>検索例:</Text>
                <Text style={styles.previewText}>{getPreviewText()}</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    color: "#000000",
    marginBottom: 16,
    letterSpacing: 0.2,
  },
  card: {
    backgroundColor: "#FFFFFF",
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
    color: "#000000",
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  description: {
    fontSize: 14,
    color: "#8E8E93",
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
    backgroundColor: "#F2F2F7",
    color: "#000000",
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
    borderBottomColor: "#F2F2F7",
  },
  checkbox: {
    marginRight: 12,
  },
  checkboxInner: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#C7C7CC",
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
    color: "#000000",
  },
  wordTextInactive: {
    color: "#8E8E93",
  },
  deleteButton: {
    padding: 8,
  },
  emptyText: {
    fontSize: 16,
    color: "#8E8E93",
    textAlign: "center",
    paddingVertical: 20,
  },
  previewContainer: {
    backgroundColor: "#F2F2F7",
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  previewLabel: {
    fontSize: 14,
    color: "#8E8E93",
    marginRight: 8,
  },
  previewText: {
    fontSize: 16,
    color: "#000000",
    fontWeight: "500",
  },
});
