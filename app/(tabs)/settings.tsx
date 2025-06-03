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
  icon: string;
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

export default function SettingsScreen() {
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
    footer: {
      paddingHorizontal: 20,
      paddingVertical: 20,
      alignItems: "center",
    },
    versionText: {
      fontSize: 14,
      color: colorScheme === "dark" ? "#8E8E93" : "#8E8E93",
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>設定</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>一般</Text>

          <SettingItem
            icon="magnifyingglass"
            title="検索設定"
            subtitle="検索時のタグとメモの設定"
            onPress={() => router.push("/settings/search")}
            colorScheme={colorScheme}
            colors={colors}
            styles={styles}
          />

          <SettingItem
            icon="moon.fill"
            title="ダークモード"
            subtitle="表示モードの設定"
            onPress={() => router.push("/settings/darkmode")}
            colorScheme={colorScheme}
            colors={colors}
            styles={styles}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.versionText}>ID Manager v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
