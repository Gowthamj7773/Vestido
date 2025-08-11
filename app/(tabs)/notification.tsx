import { View, Text ,SafeAreaView } from 'react-native'
import React from 'react'
import Ionicons from '@expo/vector-icons/Ionicons';
import { useContext } from 'react';
import { ThemeContext } from '../Theme/ThemProvider';
export default function Notification() {
  
  const {theme} = useContext(ThemeContext);
  return (
    <View className={`w-full flex-1 ${theme==='dark'?'bg-gray-800':'bg-white'}`}>
        <SafeAreaView className='mt-20 mx-5'>
          <View className='h-full items-center justify-center flex'>
          <Ionicons name="notifications" size={50} color="#8e6cef" />
          <Text className={`text-2xl font-bold mt-5 ${theme==='dark'&&'text-white'}`}>You're all caught up!</Text>
          </View>
        </SafeAreaView>
    </View>
  )
}