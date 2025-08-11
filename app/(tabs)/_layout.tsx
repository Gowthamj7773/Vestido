import React from 'react'
import { View } from 'react-native';
import { Tabs } from 'expo-router'
import Ionicons from '@expo/vector-icons/Ionicons';
import { useContext } from 'react';
import { ThemeContext } from '../Theme/ThemProvider';
export default function _layout() {
  const {theme} = useContext(ThemeContext);

  return (
<Tabs
  screenOptions={{
    tabBarBackground: ()=>(<View className={`flex-1 ${theme==='dark'?'bg-black':'bg-white'}`}></View>),
    tabBarShowLabel: false,
    headerShown: false,
    tabBarActiveTintColor: "#7B3AED",
    tabBarInactiveTintColor: "gray",
    tabBarStyle: {
      alignItems: "center",
      justifyContent: "center",
    },
  }}
>
      <Tabs.Screen name="home" options={{ tabBarIcon: ({ color }) => (<Ionicons name="home-outline" size={24} color={color} />) }} />
      <Tabs.Screen name="notification" options={{ tabBarIcon: ({ color }) => (<Ionicons name="notifications-outline" size={24} color={color} />) }} />
      <Tabs.Screen name="orders" options={{ tabBarIcon: ({ color }) => (<Ionicons name="receipt-outline" size={24} color={color} />) }} />
      <Tabs.Screen name="settings" options={{ tabBarIcon: ({ color }) => (<Ionicons name="settings-outline" size={24} color={color} />) }} />
    </Tabs>
  )
}