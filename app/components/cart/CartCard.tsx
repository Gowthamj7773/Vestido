import { View, Text,Image ,Pressable} from 'react-native'
import React, { useState } from 'react'
import { useEffect } from 'react';
import axios from 'axios';
import  Constants  from 'expo-constants';

// icon
import Feather from '@expo/vector-icons/Feather';
import AntDesign from '@expo/vector-icons/AntDesign';

//theme
import { useContext } from 'react';
import { ThemeContext } from '@/app/Theme/ThemProvider';

export default function CartCard({user_id,prod_id,quantity , HandleCartData}) {

    const {theme} = useContext(ThemeContext); // getting theme
    const BASE_URL = Constants.expoConfig?.extra.SUPABASE_URL;
    const API_KEY = Constants.expoConfig?.extra.SUPABASE_KEY;
    const [product,setProduct] = useState([]);
    const [itemQuantity,setItemQuantity] = useState(quantity); // editable quantity by user
    var stars = [] // this is for setting stars

    //getting product details from product table
    useEffect(()=>{
        if(!prod_id) return;
    async function GetCart(){
        try{
    const res = await axios.get(`${BASE_URL}/rest/v1/product`,{
    params:{
        prod_id:`eq.${prod_id}`,
        select:'image , product_name , price , quantity, rating'
    },
    headers:{
        apikey:API_KEY,
        Authorization:`Bearer ${API_KEY}`
    }
    })
    console.log('selected prods: ',res.data);
    setProduct(res.data);
    }
    catch(err){
        console.error("error in fetching selected prod: ",err);
    }
    }
    GetCart();
    },[prod_id]);

useEffect(()=>{
    async function PutCartItemQuantity()
    {
        if(!(itemQuantity && product[0].price))
            return;
            try{
            const res = axios.patch(`${BASE_URL}/rest/v1/cart?user_id=eq.${user_id}&prod_id=eq.${prod_id}`,
                {quantity:itemQuantity , total_price:itemQuantity*product[0].price},{
                    headers: {
                    apikey: API_KEY,
                    Authorization: `Bearer ${API_KEY}`,  
                    },
                }
            )
            console.log('updated',(await res).data);
            HandleCartData();
        }
        catch(err){
            console.error('can\'t be updated',err);
        }
    }
    PutCartItemQuantity();
},[itemQuantity,prod_id]);

const rating  = product[0]?.rating;
for (var i = 0;i<rating;i++)
    stars.push('★');
if(rating<5){
    for ( i = rating;i<5;i++)
        stars.push('☆');
}


    return (
        <View className={`${theme==='dark'?'bg-gray-600':'bg-GGray'} rounded-lg flex flex-row justify-between items-center p-1 my-3`}>
            <Image className='w-20 h-20 m-1 overflow-hidden rounded-md  flex flex-2' source={{uri:product[0]?.image}}/>
            <View className='flex-1 mx-1'>
                <Text className={`${theme==='dark'&&'text-white'}`}>{product[0]?.product_name}</Text>
                    <View className='flex flex-row'>
                        {stars.map((item,id) => (
                                <Text key={id} className='flex text-yellow-600 text-xl mt-2'>{item}</Text>
                        ))}
                    </View>
            </View>
            <View className='flex flex-2 items-center'>
                    <Text className={`font-bold my-1 text-lg ${theme==='dark'&&'text-white'}`}>₹ {product[0]?.price * itemQuantity}</Text>
                    <View className='flex flex-row items-center justify-between mx-1'>
                        <Pressable className='p-3 bg-GViolet rounded-full ' onPress={()=>{if(itemQuantity < product[0]?.quantity) setItemQuantity(itemQuantity+1)}}><Feather name="plus" size={15} color="white" /></Pressable>
                        <Text className={`mx-3 text-lg font-medium ${theme==='dark'&&'text-white'}`}>{itemQuantity}</Text>
                        <Pressable className='p-3 bg-GViolet rounded-full 'onPress={()=>{if(itemQuantity>1) setItemQuantity(itemQuantity-1)}}><AntDesign name="minus" size={15} color="white" /></Pressable>
                    </View>
            </View>
        </View>
    )
}