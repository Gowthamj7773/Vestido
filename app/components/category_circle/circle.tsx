import { View, Text ,Image, TouchableOpacity } from 'react-native'
import React from 'react'
import { router } from 'expo-router'
import { useContext } from 'react'
import { ThemeContext } from '@/app/Theme/ThemProvider'
export default function CircleUI({image,name}) {
    const {theme} = useContext(ThemeContext);
    return(
            <TouchableOpacity onPress={()=>router.push(`/components/ItemList/${name}`)}  >
                <Image className='w-20 mx-2 h-20 rounded-full' source={{uri:image}}/>
                <Text className={`${theme==='dark'?'text-white':'text-black'}  text-center pt-1`}>{name}</Text>
            </TouchableOpacity>
    )
}