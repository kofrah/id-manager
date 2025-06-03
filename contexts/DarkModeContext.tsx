import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useColorScheme as useSystemColorScheme } from "react-native";
import { getGlobalSettings, setGlobalSetting } from "@/utils/database";

type DarkModeOption = "system" | "light" | "dark";
type ColorScheme = "light" | "dark";

interface DarkModeContextType {
  darkModeOption: DarkModeOption;
  colorScheme: ColorScheme;
  updateDarkMode: (option: DarkModeOption) => Promise<void>;
}

const DarkModeContext = createContext<DarkModeContextType>({
  darkModeOption: "system",
  colorScheme: "light",
  updateDarkMode: async () => {},
});

export const useDarkMode = () => {
  const context = useContext(DarkModeContext);
  if (!context) {
    throw new Error("useDarkMode must be used within DarkModeProvider");
  }
  return context;
};

export const DarkModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useSystemColorScheme();
  const [darkModeOption, setDarkModeOption] = useState<DarkModeOption>("system");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDarkModeSetting();
  }, []);

  const loadDarkModeSetting = async () => {
    try {
      const settings = await getGlobalSettings();
      setDarkModeOption(settings.darkMode || "system");
    } catch (error) {
      console.error("Error loading dark mode setting:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateDarkMode = useCallback(async (option: DarkModeOption) => {
    setDarkModeOption(option);
    await setGlobalSetting("darkMode", option);
  }, []);

  const getActualColorScheme = (): ColorScheme => {
    if (darkModeOption === "system") {
      return systemColorScheme ?? "light";
    }
    return darkModeOption === "dark" ? "dark" : "light";
  };

  const colorScheme = getActualColorScheme();

  if (isLoading) {
    return null;
  }

  return (
    <DarkModeContext.Provider value={{ darkModeOption, colorScheme, updateDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
};