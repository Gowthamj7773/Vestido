import { Stack } from "expo-router";
import './global.css';
import Toast from "react-native-toast-message";
import { View, Text } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import ThemeProvider from "./Theme/ThemProvider";
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useCallback } from 'react';

SplashScreen.preventAutoHideAsync(); // Keep splash visible until we manually hide

export default function RootLayout() {
  const toastConfig = {
    successToast: ({ text1, text2 }) => (
      <LinearGradient
        colors={['#34d399', '#059669']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="w-[90%] p-4 rounded-xl self-center mt-4 flex-row items-center shadow-lg"
      >
        <Ionicons name="checkmark-circle" size={28} color="white" />
        <View className="flex-1 ml-3">
          <Text className="text-white text-lg font-bold">{text1}</Text>
          {text2 && <Text className="text-white text-base mt-1">{text2}</Text>}
        </View>
      </LinearGradient>
    ),
    ErrorToast: ({ text1, text2 }) => (
      <LinearGradient
        colors={['#f87171', '#dc2626']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="w-[90%] p-4 rounded-xl self-center mt-4 flex-row items-center shadow-lg"
      >
        <Ionicons name="close-circle" size={28} color="white" />
        <View className="flex-1 ml-3">
          <Text className="text-white text-lg font-bold">{text1}</Text>
          <Text className="text-white text-base ml-1">{text2}</Text>
        </View>
      </LinearGradient>
    )
  };

  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const onLayoutRootView = useCallback(async () => {
    if (loaded) {
      // Small delay so user can actually see splash
      setTimeout(() => {
        SplashScreen.hideAsync();
      }, 1000);
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider>
      <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
        <Stack>
          <Stack.Screen name="auth/auth" options={{ headerShown: false }} />
          <Stack.Screen name="auth/signup" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="components/ItemDetails/[item_details]" options={{ headerShown: false }} />
          <Stack.Screen name="components/category_list/category" options={{ headerShown: false }} />
          <Stack.Screen name="components/ItemList/[List]" options={{ headerShown: false }} />
          <Stack.Screen name="components/cart/LandingPage" options={{ headerShown: false }} />
          <Stack.Screen name="components/cart/MyFavorite" options={{ headerShown: false }} />
          <Stack.Screen name="components/cart/MyCart" options={{ headerShown: false }} />
          <Stack.Screen name="components/cart/Payment" options={{ headerShown: false }} />
          <Stack.Screen name="components/order/[OrderDetail]" options={{ headerShown: false }} />
        </Stack>
        <Toast config={toastConfig} />
      </View>
    </ThemeProvider>
  );
}
