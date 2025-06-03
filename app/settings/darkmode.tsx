import { IconSymbol } from "@/components/ui/IconSymbol";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDarkMode } from "@/contexts/DarkModeContext";
import { Colors } from "@/constants/Colors";

type DarkModeOption = "system" | "light" | "dark";

export default function DarkModeSettingsScreen() {
  const router = useRouter();
  const { colorScheme, darkModeOption: currentOption, updateDarkMode } = useDarkMode();
  const colors = Colors[colorScheme];
  const [darkModeOption, setDarkModeOption] = useState<DarkModeOption>(currentOption);
  const [isLoading, setIsLoading] = useState(false);

  const handleOptionChange = async (option: DarkModeOption) => {
    setDarkModeOption(option);
    await updateDarkMode(option);
  };

  const renderOption = (option: DarkModeOption, label: string, description: string) => (
    <TouchableOpacity
      style={[
        styles.optionCard,
        { backgroundColor: colorScheme === "dark" ? "#1C1C1E" : "#FFFFFF" },
        darkModeOption === option && styles.optionCardSelected,
      ]}
      onPress={() => handleOptionChange(option)}
    >
      <View style={styles.optionContent}>
        <View style={styles.optionTextContainer}>
          <Text style={[styles.optionLabel, { color: colors.text }]}>{label}</Text>
          <Text style={styles.optionDescription}>{description}</Text>
        </View>
        <View
          style={[
            styles.radioButton,
            { borderColor: colorScheme === "dark" ? "#48484A" : "#C7C7CC" },
            darkModeOption === option && styles.radioButtonSelected,
          ]}
        >
          {darkModeOption === option && (
            <View style={styles.radioButtonInner} />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

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
    optionCard: {
      padding: 20,
      borderRadius: 16,
      marginBottom: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    optionCardSelected: {
      borderWidth: 2,
      borderColor: "#007AFF",
    },
    optionContent: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    optionTextContainer: {
      flex: 1,
      marginRight: 16,
    },
    optionLabel: {
      fontSize: 17,
      fontWeight: "600",
      marginBottom: 4,
      letterSpacing: 0.2,
    },
    optionDescription: {
      fontSize: 14,
      color: colorScheme === "dark" ? "#8E8E93" : "#8E8E93",
      lineHeight: 20,
    },
    radioButton: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      justifyContent: "center",
      alignItems: "center",
    },
    radioButtonSelected: {
      borderColor: "#007AFF",
    },
    radioButtonInner: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: "#007AFF",
    },
    previewSection: {
      marginTop: 32,
    },
    previewCard: {
      backgroundColor: colorScheme === "dark" ? "#1C1C1E" : "#FFFFFF",
      padding: 20,
      borderRadius: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    previewTitle: {
      fontSize: 17,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 16,
      letterSpacing: 0.2,
    },
    previewContent: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-around",
    },
    previewItem: {
      alignItems: "center",
    },
    previewIcon: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: colorScheme === "dark" ? "#2C2C2E" : "#F2F2F7",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 8,
    },
    previewItemLabel: {
      fontSize: 14,
      color: colorScheme === "dark" ? "#8E8E93" : "#8E8E93",
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
          <Text style={styles.headerTitle}>ダークモード設定</Text>
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
        <Text style={styles.headerTitle}>ダークモード設定</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>表示モード</Text>
          
          {renderOption(
            "system",
            "システム設定に従う",
            "デバイスの設定に合わせて自動的に切り替わります"
          )}
          
          {renderOption(
            "light",
            "ライトモード",
            "常にライトモードで表示します"
          )}
          
          {renderOption(
            "dark",
            "ダークモード",
            "常にダークモードで表示します"
          )}
        </View>

        <View style={styles.previewSection}>
          <View style={styles.previewCard}>
            <Text style={styles.previewTitle}>現在の表示</Text>
            <View style={styles.previewContent}>
              <View style={styles.previewItem}>
                <View style={styles.previewIcon}>
                  <IconSymbol
                    name={colorScheme === "dark" ? "moon.fill" : "sun.max.fill"}
                    size={30}
                    color={colors.tint}
                  />
                </View>
                <Text style={styles.previewItemLabel}>
                  {colorScheme === "dark" ? "ダークモード" : "ライトモード"}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}