import { View, Text,TouchableOpacity ,Image} from 'react-native'
import React from 'react'
import { router } from 'expo-router'
// theme
import { useContext } from 'react'
import { ThemeContext } from '@/app/Theme/ThemProvider'

export default function Cat_card({name,image}) {

const {theme} = useContext(ThemeContext); 
return (
    <TouchableOpacity onPress={()=>router.replace(`/components/ItemList/${name}`)}  >
        <View className={`${theme === 'dark' ? 'bg-gray-600' : 'bg-GGray'} rounded-xl my-2 flex flex-row items-center`}>
            <View className='p-3'>
                <Image className='w-16 mx-2 h-16 rounded-full' source={{uri:image}}/>
            </View>
            <Text className={`text-base font-medium ${theme==='dark'&&'text-white'}`}>{name}</Text>
        </View>
    </TouchableOpacity>
)
}