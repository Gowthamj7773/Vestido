import { View, Text, SafeAreaView, Pressable} from 'react-native'
import React from 'react'
import { Link, router } from 'expo-router'
import AntDesign from '@expo/vector-icons/AntDesign'

//theme
import { useContext } from 'react';
import { ThemeContext } from '@/app/Theme/ThemProvider';

export default function LandingPage() {

    const {theme} = useContext(ThemeContext); // getting theme
    // custom options
    function Options({name , location}){
        return(
            <Pressable onPress={()=>router.push(location)} className={`flex flex-row my-3 p-5 items-center justify-between rounded-lg ${theme==='dark'?'bg-gray-600':'bg-GGray'}`}>
                <Text className={`text-xl font-medium ${theme==='dark' && 'text-white'}`}>{name}</Text>
                    <AntDesign name="right" size={30} color="gray" />                
            </Pressable>
        );
    }

return (
    <View className={`w-full flex-1 ${theme==='dark'?'bg-gray-800':'bg-white'}`}>
        <SafeAreaView className='mt-24 mx-5'>
            <View className='flex flex-row items-center'>
                <Link href="/(tabs)/home">
                    <AntDesign name="leftcircleo" size={40} color="gray" />
                </Link>
                <Text className={`text-2xl font-bold ml-7 ${theme==='dark'&&'text-white'}`}>ShortCut</Text>
            </View>
            <View className='mt-16'>
                <Options name={'My cart'} location={'/components/cart/MyCart'}/>
                <Options name={'My favorites'} location={'/components/cart/MyFavorite'}/>
            </View>
        </SafeAreaView>
    </View>
    
)
}