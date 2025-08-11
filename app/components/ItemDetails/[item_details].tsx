import { View, Text, Pressable, ImageBackground, ScrollView } from 'react-native'
import React from 'react'
import { router, useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context';
import  Constants  from 'expo-constants';
import { useEffect ,useState } from 'react';
import axios from 'axios';
//icons
import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';

// toast alert
import Toast from 'react-native-toast-message';
import ReviewCard from './ReviewCard';

//theme
import { useContext } from 'react';
import { ThemeContext } from '@/app/Theme/ThemProvider';

export default function ItemDetails() {

    const {theme} = useContext(ThemeContext); // getting theme
    const {user_id , prod_id , image , rating , product_name , price ,quantity} = useLocalSearchParams();
    const SUPABASE_API_KEY = Constants.expoConfig?.extra.SUPABASE_KEY // API key;
    const BASE_URL = Constants.expoConfig?.extra.SUPABASE_URL // base url;

    var stars = [];
    const [itemQuantity,setItemQuantity] = useState(1); // for sending item quantity to cart table , editable by user
    const [isLiked ,setIsLiked] = useState(false);
    const [ratingTable,setRatingTable] = useState([]); // storing rating for the selected product

// for fetching liked items icon , rating data
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
    async function GetRating() {
    try {
        const res = await axios.get(`${BASE_URL}/rest/v1/rating`,{
            params:{prod_id:`eq.${prod_id}`},
            headers:{apikey:SUPABASE_API_KEY , Authorization:`Bearer ${SUPABASE_API_KEY}`}
        })
        console.log("each card --> ",res.data);
        setRatingTable(res.data);
    }
    catch(err){
        console.error('error in getting likes ',err);
    }
    }

GetLiked();
GetRating();
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

// for updating cart items
async function PutCartItems(ItemCount) {
    try {
        
        const res = await axios.get(`${BASE_URL}/rest/v1/cart`,{
            params:{user_id:`eq.${user_id}`,prod_id:`eq.${prod_id}`},
            headers:{apikey:SUPABASE_API_KEY , Authorization:`Bearer ${SUPABASE_API_KEY}`}
        })
        console.log('checked',res.data);
        if(res.data.length === 0){
            const res = await axios.post(
            `${BASE_URL}/rest/v1/cart`,
            [{
                user_id: user_id,
                prod_id: prod_id,
                quantity: ItemCount,
                total_price: ItemCount*Number(price)
            }],
            {
                headers: {
                apikey: SUPABASE_API_KEY,
                Authorization: `Bearer ${SUPABASE_API_KEY}`,  
                },
            }
            );
            Toast.show({
            type: 'successToast',
            text1: 'Success!',
            text2: 'Your item was added to cart',
            });
            console.log('posted', res.data);
        }
        else if(res.data){
            try{
                const res = axios.patch(`${BASE_URL}/rest/v1/cart?user_id=eq.${user_id}&prod_id=eq.${prod_id}`,
                    {quantity:ItemCount , total_price:ItemCount*Number(price)},{
                        headers: {
                        apikey: SUPABASE_API_KEY,
                        Authorization: `Bearer ${SUPABASE_API_KEY}`,  
                        },
                    }
                );

            Toast.show({
            type: 'successToast',
            text1: 'Success!',
            text2: 'Your item was added to cart',
            });

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
    <SafeAreaView className={`${theme==='dark'?'bg-gray-800':'bg-white'}`}>
        <Pressable onPress={()=>router.replace('/(tabs)/home')}>
            <View className={`w-full py-7 px-5 flex flex-row ${theme==='dark'?'bg-gray-900':'bg-white'} items-center`}>
                <AntDesign name='arrowleft' size={20} color={`${theme==='dark'?'white':'black'}`}/>
                <Text className={`mx-2 text-xl ${theme==='dark'&&'text-white'}`}>Gverse</Text>
            </View>
        </Pressable>
        <ScrollView className='w-full h-[600px]' showsVerticalScrollIndicator={false}>
            <View className="w-full h-[500px] rounded-b-3xl border border-gray-300 overflow-hidden">
                <ImageBackground source={{ uri: image }} className="w-full h-full items-end" resizeMode="cover">
                    <Pressable className='p-2 m-2 rounded-full bg-black/50' onPress={()=>{const isNewLiked = !isLiked; setIsLiked(isNewLiked); PutLiked(isNewLiked)}}>
                        {isLiked ? <AntDesign name="heart" size={18} color="#FF69B4"  />: <AntDesign name="hearto" size={18} color="white" /> }
                    </Pressable>
                    {
                    Number(quantity) === 0 &&  
                    <View className='w-full h-full absolute z-10 justify-center'>
                        <View className=' bg-black/50'>
                            <Text className='text-white text-center p-4 text-2xl font-medium'>Out of Stock</Text>
                        </View>
                    </View>
                    }
                </ImageBackground>
            </View>
                <View className='p-3 px-5'>
                    <View className='flex flex-row'>
                        {
                        stars.map((item,id) => (
                                <Text key={id} className='flex text-yellow-600 text-2xl mt-2'>{item}</Text>
                        ))
                        }
                    </View>
                    <Text className={`${theme==='dark'&&'text-white'} text-lg`}>{product_name}</Text>
                    <Text className={`text-xl font-bold text-GViolet`}>₹ {price}</Text>
                </View>
                <View className={`mx-2 flex flex-row items-center justify-between border ${theme==='dark'?'border-gray-800 bg-gray-700':'border-gray-300 bg-gray-200'}  rounded-full  p-4`}>
                    <Text className={`${theme==='dark'&&'text-white'} text-lg font-medium`}>Quantity</Text>
                    <View className='flex flex-row items-center justify-between'>
                        <Pressable className='p-3 bg-GViolet rounded-full 'onPress={()=>{if(itemQuantity < Number(quantity)) setItemQuantity(itemQuantity+1)}}><Feather name="plus" size={25} color="white" /></Pressable>
                        <Text className={`mx-3 text-lg font-medium ${theme==='dark'&&'text-white'}`}>{itemQuantity}</Text>
                        <Pressable className='p-3 bg-GViolet rounded-full 'onPress={()=>{if(itemQuantity>1) setItemQuantity(itemQuantity-1)}} ><AntDesign name="minus" size={25} color="white" /></Pressable>
                    </View>
                </View>
                <View className='px-5'>
                    <Text className={`${theme==='dark'&&'text-white'} text-xl font-bold mt-10 mb-2`}>Reviews</Text>
                    <Text className={`${theme==='dark'&&'text-white'} text-3xl font-bold my-2`}>{rating} Ratings</Text>
                    <Text className={`text-lg ${theme==='dark'?'text-white':'text-gray-500'} my-2`}>{Object.keys(ratingTable).length} Reviews</Text>
                    <View className='mt-5'>
                    {
                        ratingTable.map((item ,id)=>(
                            <ReviewCard key={id} user_id={item.user_id} individual_rating={item.rating} comment={item.comment}/>
                        ))
                    }                        
                    </View>
                </View>
        </ScrollView>
        {
            Number(quantity) === 0 ?
            <Pressable className='mx-3 bg-gray-400 p-7 flex flex-row justify-between rounded-full'>
                <Text className='text-lg text-white font-medium'>₹ {Number(price) * itemQuantity}</Text>
                <Text className='text-lg text-white font-medium'>Out Of Stock</Text>
            </Pressable> :
            <Pressable className='mx-3 bg-GViolet p-7 flex flex-row justify-between rounded-full' onPress={()=>{const ItemCount = itemQuantity ; PutCartItems(ItemCount)}}>
                <Text className='text-lg text-white font-medium'>₹ {Number(price) * itemQuantity}</Text>
                <Text className='text-lg text-white font-medium'>Add to cart</Text>
            </Pressable>
        }
    </SafeAreaView>
)
}