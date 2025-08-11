import { View, SafeAreaView ,Text, Pressable, FlatList, ScrollView, TouchableOpacity, Alert } from 'react-native'
import React, { use, useEffect, useState } from 'react'
import { Link, router } from 'expo-router'
import AntDesign from '@expo/vector-icons/AntDesign'
import axios from 'axios'
import  Constants  from 'expo-constants'
import AsyncStorage from '@react-native-async-storage/async-storage'
import CartCard from './CartCard'
import {SwipeListView} from 'react-native-swipe-list-view'
import { Dimensions } from 'react-native';
//icon
import Feather from '@expo/vector-icons/Feather'
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
//theme
import { useContext } from 'react';
import { ThemeContext } from '@/app/Theme/ThemProvider';

export default function MyCart() {

    const {theme} = useContext(ThemeContext); // getting theme
    const BASE_URL = Constants.expoConfig?.extra.SUPABASE_URL;
    const API_KEY = Constants.expoConfig?.extra.SUPABASE_KEY;
    const [userId,setUserId] = useState(null);
    const [cart,setCart] = useState([]); // for storing records from cart table
    const [subTotal,setSubTotal] = useState(0); // for storing sub-total price of all products (total = subTotal + tax + shipping fee)
    var tax = 0.02 // changable tax for producing total price

// getting user_id
useEffect(()=>{
            async function GetID() {
    try{
        const id = await AsyncStorage.getItem("user_id");
        console.log("user_id from home: ",id);
        if(!id){
            console.error("User_id is not available in AsyncStorage");
            return;
        }
        setUserId(id);
    }
    catch(err){
        console.error('error in fetching user_id',err);
    }
}

    GetID();
},[])

// getting cart details for the user
async function GetCart(){
        try{
    const res = await axios.get(`${BASE_URL}/rest/v1/cart`,{
    params:{
        user_id:`eq.${userId}`,
        order: 'cart_id.asc'
    },
    headers:{
        apikey:API_KEY,
        Authorization:`Bearer ${API_KEY}`
    }
    })
    console.log('cart: ',res.data);
    setCart(res.data);
    }
    catch(err){
        console.error("error in fetching cart records",err);
    }
    }

useEffect(()=>{
    if(!userId)
        return
    GetCart();
},[userId]);

// to delete all products in the cart
async function DeleteAll(){
    try{
    const res = await axios.delete(`${BASE_URL}/rest/v1/cart`,{
    params:{
        user_id:`eq.${userId}`,
    },
    headers:{
        apikey:API_KEY,
        Authorization:`Bearer ${API_KEY}`
    }
    })
    console.log('user\'s cart deleted! ');
    setCart(res.data);
    }
    catch(err){
        console.error("error in deleting user's cart records ",err);
    }
}
// to delete specific products from cart
async function DeleteSpecificProduct(cart_id){
    try{
    const res = await axios.delete(`${BASE_URL}/rest/v1/cart`,{
    params:{
        cart_id:`eq.${cart_id}`
    },
    headers:{
        apikey:API_KEY,
        Authorization:`Bearer ${API_KEY}`
    }
    })
    console.log('specific product deleted! ');
    GetCart();
    }
    catch(err){
        console.error("error in deleting user's cart records ",err);
    }
}
// for storing subtotal
useEffect(()=>{
    if (cart){
            var total = 0;
            for(const item of cart){
                total += item.total_price;
            }
            setSubTotal(total);
    }

},[cart])

// for showing bill details under cart list
function BillDetails({name,price}){
    return(
            <View className='flex flex-row justify-between my-4'>
                <Text className={`text-xl  ${theme==='dark'? 'text-white':'text-gray-400'}`}>{name}</Text>
                <Text className={`text-xl ${theme==='dark'&&'text-white'}`}>₹ {price}</Text>
            </View>
    );
}

return (
    <View className={`w-full flex-1 ${theme==='dark'?'bg-gray-800':'bg-white'}`}>
        <SafeAreaView className='mt-24 mx-5'>
    {cart.length === 0 ? (
        <ScrollView showsVerticalScrollIndicator={false}>
        <View className='flex flex-row items-center'>
            <Link href="/components/cart/LandingPage">
            <AntDesign name="leftcircleo" size={40} color="gray" />
            </Link>
            <Text className={`${theme==='dark'&&'text-white'} text-2xl font-bold ml-7`}>My cart</Text>
        </View>
        <Pressable className='mt-5 flex items-end'>
            <Text className={`text-lg ${theme==='dark'?'text-white':'text-gray-600'}  font-medium`}>Remove All</Text>
        </Pressable>
        <View className='flex h-[500px] justify-center items-center'>
            <FontAwesome6 name="cart-shopping" size={64} color="#8e6cef" />
            <Text className={`text-2xl pt-2 font-medium ${theme==='dark'&&'text-white'}`}>Your cart is empty</Text>
        </View>
        </ScrollView>
    ) : (
        <SwipeListView 
        data={cart}
        renderItem={({ item }) => (
            <CartCard HandleCartData={GetCart} user_id={item.user_id} prod_id={item.prod_id} quantity={item.quantity} />
        )}
        keyExtractor={item => item.cart_id}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
            <>
            <View className='flex flex-row items-center'>
                <Link href="/components/cart/LandingPage">
                <AntDesign name="leftcircleo" size={40} color="gray" />
                </Link>
                <Text className={`text-2xl font-bold ml-7 ${theme==='dark'&&'text-white'}`}>My cart</Text>
            </View>
            <Pressable className='mt-5 flex items-end'>
                <Text
                className={`text-lg ${theme==='dark'?'text-white':'bg-gray-500'} font-medium`}
                onPress={() => {
                    cart.length !== 0 && Alert.alert("My Cart","do you want to remove all",[{text:"cancel"}, {text:'ok',onPress:DeleteAll}]);
                }}
                >
                Remove All
                </Text>
            </Pressable>
            </>
        }
        ListFooterComponent={
            <View className='my-5'>
            <BillDetails name={'Subtotal'} price={subTotal} />
            <BillDetails name={'Shiping cost'} price={30} />
            <BillDetails name={'Tax (2%)'} price={(subTotal * tax).toFixed(2)} />
            <BillDetails name={'Total'} price={subTotal + Number((subTotal* tax).toFixed(2))} />
            <TouchableOpacity className='p-4 rounded-full bg-GViolet flex items-center mt-5' onPress={() => router.push('/components/cart/Payment')}>
                <Text className='text-2xl text-white font-medium'>Buy now</Text>
            </TouchableOpacity>
            </View>
        }
    renderHiddenItem={({ item }) => (
    <View className="flex-1 justify-center items-end ">
        <Pressable
        onPress={() => {console.log('deleted!!'),DeleteSpecificProduct(item.cart_id)}}
        className="bg-red-500 p-4 rounded"
        >
<Feather name="trash-2" size={24} color="white" />
        </Pressable>
    </View>
    )}
    rightOpenValue={-80}
    contentContainerStyle={{ paddingBottom: 20 }}
    disableRightSwipe
    />
    )}
    </SafeAreaView>
    </View>

)
}