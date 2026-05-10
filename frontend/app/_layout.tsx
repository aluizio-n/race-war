import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  Montserrat_700Bold,
  Montserrat_900Black,
} from '@expo-google-fonts/montserrat';
import { View } from 'react-native';
import '../global.css';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Montserrat_700Bold,
    Montserrat_900Black,
  });

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: '#0F172A' }} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
      <StatusBar style="light" backgroundColor="#0F172A" />
      <Stack screenOptions={{ headerShown: false, animation: 'fade', contentStyle: { backgroundColor: '#0F172A' } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="activity" />
        <Stack.Screen name="challenges" options={{ animation: 'slide_from_bottom' }} />
      </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
