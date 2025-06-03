import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { DarkModeProvider, useDarkMode } from '@/contexts/DarkModeContext';

function RootLayoutContent() {
  const { colorScheme } = useDarkMode();
  
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="settings/search" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="settings/darkmode" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="settings/tag" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="settings/memo" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <DarkModeProvider>
        <RootLayoutContent />
      </DarkModeProvider>
    </GestureHandlerRootView>
  );
}
