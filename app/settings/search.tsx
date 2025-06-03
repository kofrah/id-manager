import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { useDarkMode } from "@/contexts/DarkModeContext";
import { useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface SettingItemProps {
  icon: any;
  title: string;
  subtitle?: string;
  onPress: () => void;
  showArrow?: boolean;
  colorScheme: "light" | "dark";
  colors: typeof Colors.light;
  styles: any;
}

const SettingItem: React.FC<SettingItemProps> = ({
  icon,
  title,
  subtitle,
  onPress,
  showArrow = true,
  colorScheme,
  colors,
  styles,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.settingItem,
        { backgroundColor: colorScheme === "dark" ? "#1C1C1E" : "#FFFFFF" },
      ]}
      onPress={onPress}
    >
      <View style={styles.settingItemLeft}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: colorScheme === "dark" ? "#2C2C2E" : "#F2F2F7" },
          ]}
        >
          <IconSymbol name={icon} size={24} color={colors.tint} />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.settingTitle, { color: colors.text }]}>
            {title}
          </Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {showArrow && (
        <IconSymbol
          name="chevron.right"
          size={20}
          color={colorScheme === "dark" ? "#48484A" : "#C7C7CC"}
        />
      )}
    </TouchableOpacity>
  );
};

export default function SearchSettingsScreen() {
  const router = useRouter();
  const { colorScheme } = useDarkMode();
  const colors = Colors[colorScheme];

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
      paddingTop: 20,
    },
    section: {
      marginBottom: 32,
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: "600",
      color: colorScheme === "dark" ? "#8E8E93" : "#6C6C70",
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginLeft: 20,
      marginBottom: 8,
    },
    settingItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 16,
      marginHorizontal: 20,
      marginBottom: 12,
      borderRadius: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 1,
    },
    settingItemLeft: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    iconContainer: {
      width: 44,
      height: 44,
      borderRadius: 10,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 16,
    },
    textContainer: {
      flex: 1,
    },
    settingTitle: {
      fontSize: 17,
      fontWeight: "600",
      letterSpacing: 0.2,
    },
    settingSubtitle: {
      fontSize: 14,
      color: colorScheme === "dark" ? "#8E8E93" : "#8E8E93",
      marginTop: 2,
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
        <Text style={styles.headerTitle}>検索設定</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>検索設定</Text>

          <SettingItem
            icon="tag.fill"
            title="タグ設定"
            subtitle="検索用タグの設定"
            onPress={() => router.push("/settings/tag")}
            colorScheme={colorScheme}
            colors={colors}
            styles={styles}
          />

          <SettingItem
            icon="note.text"
            title="メモ設定"
            subtitle="メモを検索文字列に含めるかの設定"
            onPress={() => router.push("/settings/memo")}
            colorScheme={colorScheme}
            colors={colors}
            styles={styles}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
