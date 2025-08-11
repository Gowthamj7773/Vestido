import { View, Text ,Image } from 'react-native'
import React, { useState } from 'react'
import { useEffect } from 'react'
import  Constants  from 'expo-constants'
import axios from 'axios'

//theme
import { useContext } from 'react';
import { ThemeContext } from '@/app/Theme/ThemProvider';

export default function ReviewCard({user_id ,individual_rating ,comment}) {

    const {theme} = useContext(ThemeContext); // getting theme
    const SUPABASE_API_KEY = Constants.expoConfig?.extra.SUPABASE_KEY // API key;
    const BASE_URL = Constants.expoConfig?.extra.SUPABASE_URL // base url;
    const [userName,setUserName] = useState(''); // setting name of reviwer
    const [profilePic,setProfilePic] = useState(''); // setting their profile pic
    var stars = [];

    useEffect(()=>{
    async function GetUserDetails() {
        if(!user_id)
            return;
    try {
        const res = await axios.get(`${BASE_URL}/rest/v1/users`,{
            params:{user_id:`eq.${user_id}`,select:'name , image'},
            headers:{apikey:SUPABASE_API_KEY , Authorization:`Bearer ${SUPABASE_API_KEY}`}
        })
        //console.log("user =====> ",res.data)
        setUserName(res.data[0].name);
        setProfilePic(res.data[0].image);
    }
    catch(err){
        console.error('error in getting name, image',err);
    }
    }
    GetUserDetails();

},[user_id])


    for (var i = 0;i<individual_rating;i++)
    stars.push('★');
if(individual_rating<5){
    for ( i = individual_rating;i<5;i++)
        stars.push('☆');
}

    return (
    <View className={`border ${theme==='dark'?'border-gray-600': 'border-gray-300'}  p-4 my-1 rounded-lg`}>
        <View className='flex flex-row justify-between'>
            <View className='flex flex-row items-center'>
                <Image className='w-16 h-16 rounded-full' source={{uri:profilePic || "dummy"}}/>
                <Text className={`ml-2 font-bold text-lg ${theme==='dark'&&'text-white'}`}>{userName}</Text>
            </View>
            <View className='flex flex-row'>
                {stars.map((item,id) => (
                        <Text key={id} className='flex text-yellow-600 text-xl mt-2'>{item}</Text>
                ))}
            </View>
        </View>
        <Text className={`mt-3 ${theme==='dark'?'text-gray-300':'text-gray-600'} `}>"{comment}"</Text>
    </View>
    )
}