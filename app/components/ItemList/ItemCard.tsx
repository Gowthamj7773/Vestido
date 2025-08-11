import { View, Text, TouchableWithoutFeedback, Image, ImageBackground, Pressable } from 'react-native';
import React, { useEffect, useState } from 'react';
import AntDesign from '@expo/vector-icons/AntDesign';
import axios from 'axios';
import  Constants  from 'expo-constants';
import { router } from 'expo-router';
import { useContext } from 'react';
import { ThemeContext } from '@/app/Theme/ThemProvider';
export default function ItemCard({ rating ,user_id ,prod_id, url, product_name ,price, quantity}) {

const {theme} = useContext(ThemeContext); // sys theme
const SUPABASE_API_KEY = Constants.expoConfig?.extra.SUPABASE_KEY; // api key
const BASE_URL = Constants.expoConfig?.extra.SUPABASE_URL // base url

const [isLiked ,setIsLiked] = useState(false);
var stars = [];
// for fetching liked items icon
useEffect(()=>{
    async function GetLiked() {
    try {
        const res = await axios.get(`${BASE_URL}/rest/v1/likes`,{
            params:{user_id:`eq.${user_id}`,prod_id:`eq.${prod_id}`},
            headers:{apikey:SUPABASE_API_KEY , Authorization:`Bearer ${SUPABASE_API_KEY}`}
        })
        //console.log("each card --> ",res.data)
        if(res.data.length !== 0){
            setIsLiked(res.data[0].is_liked);
            return;
        }
        else{
            setIsLiked(false);
        }
    }
    catch(err){
        console.error('error in getting likes ',err);
    }
    }
GetLiked();
},[])

// for updating liked items icon
async function PutLiked(isNewLiked) {
    try {
        const res = await axios.get(`${BASE_URL}/rest/v1/likes`,{
            params:{user_id:`eq.${user_id}`,prod_id:`eq.${prod_id}`},
            headers:{apikey:SUPABASE_API_KEY , Authorization:`Bearer ${SUPABASE_API_KEY}`}
        })
        console.log('checked',res.data);
        if(res.data.length === 0){
            const res = await axios.post(
            `${BASE_URL}/rest/v1/likes`,
            [{
                user_id: user_id,
                prod_id: prod_id,
                is_liked: isNewLiked,
            }],
            {
                headers: {
                apikey: SUPABASE_API_KEY,
                Authorization: `Bearer ${SUPABASE_API_KEY}`,  
                },
            }
            );
            console.log('posted', res.data);
        }
        else if(res.data){
            try{
                const res = axios.patch(`${BASE_URL}/rest/v1/likes?user_id=eq.${user_id}&prod_id=eq.${prod_id}`,
                    {is_liked:isNewLiked},{
                        headers: {
                        apikey: SUPABASE_API_KEY,
                        Authorization: `Bearer ${SUPABASE_API_KEY}`,  
                        },
                    }
                )
                console.log('updated',(await res).data);
            }
            catch(err){
                console.error('can\'t be updated',err);
            }
        }
    } catch (err) {
        console.error('Error in updating likes ', err);
    }
}

for (var i = 0;i<rating;i++)
    stars.push('★');
if(rating<5){
    for ( i = rating;i<5;i++)
        stars.push('☆');
}


return (
    <Pressable onPress={()=>router.push({pathname:'/components/ItemDetails/[item_details]', params:{user_id:user_id,prod_id:prod_id,image:url,rating:rating,product_name:product_name,price:price,quantity:quantity }})}>
    <View className={`${theme==='dark'?'bg-gray-600':'bg-GGray'} bg-GGray p-2 rounded-xl shadow-sm m-1`}>
        <ImageBackground className='w-[100%] h-72 overflow-hidden rounded-lg z-0 relative' source={{ uri: url }} >
            <View className='flex justify-end items-end'>
                <Pressable className='p-2 m-2 rounded-full bg-black/50' onPress={()=>{const isNewLiked = !isLiked; setIsLiked(isNewLiked); PutLiked(isNewLiked)}}>
                    {isLiked ? <AntDesign name="heart" size={18} color="#FF69B4"  />: <AntDesign name="hearto" size={18} color="white" /> }
                </Pressable>
            </View>
            {
            quantity === 0 &&  
            <View className='w-[100%] h-72 absolute z-10 justify-center'>
                <View className=' bg-black/50'>
                    <Text className='text-white text-center p-2'>Out of Stock</Text>
                </View>
            </View>
            }
        </ImageBackground>
                    <View className='flex flex-row'>
                        {stars.map((item,id) => (
                                <Text key={id} className='flex text-yellow-600 text-xl mt-2'>{item}</Text>
                        ))}
                    </View>
        <Text className={`${theme==='dark'?'text-white':'text-black'} my-2 text-gray-800`}>{product_name}</Text>
        <Text className={`${theme==='dark'?'text-white':'text-black'} font-bold`}>₹{price}</Text>
    </View>
    </Pressable>
);
}
