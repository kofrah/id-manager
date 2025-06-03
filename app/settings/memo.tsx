import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { useDarkMode } from "@/contexts/DarkModeContext";
import { getGlobalSettings, setGlobalSetting } from "@/utils/database";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MemoSettingsScreen() {
  const router = useRouter();
  const { colorScheme } = useDarkMode();
  const colors = Colors[colorScheme];
  const [searchInMemo, setSearchInMemo] = useState<boolean>(true);

  useEffect(() => {
    loadGlobalSettings();
  }, []);

  const loadGlobalSettings = async () => {
    const settings = await getGlobalSettings();
    setSearchInMemo(settings.searchInMemo);
  };

  const handleToggleSearchInMemo = async () => {
    const newValue = !searchInMemo;
    setSearchInMemo(newValue);
    await setGlobalSetting("searchInMemo", newValue);
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
    settingRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    settingInfo: {
      flex: 1,
      marginRight: 16,
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
      lineHeight: 20,
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
    infoCard: {
      backgroundColor: colorScheme === "dark" ? "#2C2C2E" : "#F2F2F7",
      padding: 16,
      borderRadius: 12,
      marginTop: 20,
    },
    infoTitle: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 8,
    },
    infoText: {
      fontSize: 14,
      color: colorScheme === "dark" ? "#8E8E93" : "#8E8E93",
      lineHeight: 20,
    },
    exampleCard: {
      backgroundColor: colorScheme === "dark" ? "#2C2C2E" : "#F2F2F7",
      padding: 16,
      borderRadius: 12,
      marginTop: 12,
    },
    exampleLabel: {
      fontSize: 13,
      fontWeight: "600",
      color: colorScheme === "dark" ? "#8E8E93" : "#666666",
      marginBottom: 4,
    },
    exampleText: {
      fontSize: 14,
      color: colors.text,
      fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <IconSymbol name="chevron.left" size={24} color={colors.tint} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>メモ設定</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.label}>メモを検索対象に含める</Text>
                <Text style={styles.description}>
                  有効にすると、IDと検索タグに加えてメモも検索文字列に含まれます。
                </Text>
              </View>
              <TouchableOpacity
                style={styles.toggle}
                onPress={handleToggleSearchInMemo}
              >
                <View
                  style={[
                    styles.toggleTrack,
                    searchInMemo ? styles.toggleTrackActive : null,
                  ]}
                >
                  <View
                    style={[
                      styles.toggleThumb,
                      searchInMemo ? styles.toggleThumbActive : null,
                    ]}
                  />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
