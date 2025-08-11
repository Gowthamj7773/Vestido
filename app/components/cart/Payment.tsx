import { View, Text ,SafeAreaView, Pressable ,Modal, ActivityIndicator} from 'react-native'
import { Link, router } from 'expo-router'
import AntDesign from '@expo/vector-icons/AntDesign'
import React from 'react'
import { useState ,useEffect } from 'react'
import Feather from '@expo/vector-icons/Feather'
import axios from 'axios'
import  Constants  from 'expo-constants'
import AsyncStorage from '@react-native-async-storage/async-storage'

//theme
import { useContext } from 'react';
import { ThemeContext } from '@/app/Theme/ThemProvider';

export default function Payment() {

    const {theme} = useContext(ThemeContext); // getting theme
    const [showModal ,setShowModal] = useState(false); // for showing payment modal
    const [showLoading , setShowLoading] = useState(false); // for showing loading icon
    const SUPABASE_API_KEY = Constants.expoConfig?.extra.SUPABASE_KEY; //API key
    const BASE_URL = Constants.expoConfig?.extra.SUPABASE_URL; // base URL
    const [userId ,setUserId]  = useState(null);

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

    // adding order
    async function PlaceOrder(){
        if (!userId)
            return;

        //getting cart for posting into order
        try{
    const res = await axios.get(`${BASE_URL}/rest/v1/cart`,{
        params:{
            user_id:`eq.${userId}`,
            order: 'cart_id.asc'
        },
        headers:{
            apikey:SUPABASE_API_KEY,
            Authorization:`Bearer ${SUPABASE_API_KEY}`
        }
    })
    console.log('payment, cart: ',res.data);
    const filtered = res.data.map((item)=>{
        return{
        user_id : item.user_id,
        prod_id : item.prod_id,
        quantity: item.quantity,
        feedback : false
    }})
    //post into order
            try{
    const post = await axios.post(`${BASE_URL}/rest/v1/order`,filtered,{headers:{
            apikey:SUPABASE_API_KEY,
            Authorization:`Bearer ${SUPABASE_API_KEY}`,
            'Content-Type': 'application/json'      
    }}
    )
    console.log('payment, posted to order');

    // delete cart
    try{
        const del = await axios.delete(`${BASE_URL}/rest/v1/cart?user_id=eq.${userId}`,{
            headers:{
                    apikey:SUPABASE_API_KEY,
                    Authorization:`Bearer ${SUPABASE_API_KEY}`,
            }
        })
        console.log('payment, deleted cart');

        // getting product quantity
    try{
        const stock = await axios.get(`${BASE_URL}/rest/v1/product`,{
            params:{prod_id:`eq.${res.data[0]?.prod_id}` ,select:'quantity'},
            headers:{
                    apikey:SUPABASE_API_KEY,
                    Authorization:`Bearer ${SUPABASE_API_KEY}`,
            }
        })
        console.log('stock aug: ',stock.data);

        // upadating product quantity in product table
        try{
            const put = await axios.patch(`${BASE_URL}/rest/v1/product?prod_id=eq.${res.data[0].prod_id}`,
                {quantity:(stock.data[0].quantity - res.data[0].quantity)},
            {headers:{
                    apikey:SUPABASE_API_KEY,
                    Authorization:`Bearer ${SUPABASE_API_KEY}`,
            }})
            console.log('quantity updated');
            setShowModal(true);
        }
        catch(err){
        console.error('can\'t patch stock in product',err)
        }
    }
    catch(err){
        console.error('cannot able to get qunatity from product ',err);
    }
    }
    catch(err){
        console.error('error in deleting fields in cart',err);
    }
    }
    catch(err){
        console.error('error in posting into order table',err);
    }
}
    catch(err){
        console.error("error in fetching cart records",err);
    }
    }

    // showing payment success modal
    function PaymentSuccess(){
        return(
        <Modal visible={showModal} transparent animationType="slide">
            <View className={`flex-1 ${theme==='dark'?'bg-gray-800':'bg-white'} justify-start`}>
                <View className="flex flex-row items-center mt-16 mx-4">
                    <Link href="/components/cart/MyCart" onPress={()=>setShowModal(false)}>
                        <AntDesign name="leftcircleo" size={40} color="gray" />
                    </Link>
                    <Text className={`text-2xl font-bold ml-7 ${theme==='dark'&&'text-white'}`}>Payment Options</Text>
                </View>
                <View className="flex-1 justify-center items-center px-4">
                    <Feather name="check-circle" size={120} color="green" />
                    <Text className="text-3xl font-bold mt-6 text-green-700">Payment Successful!</Text>
                    <Pressable className="mt-10" onPress={()=>router.replace('/(tabs)/orders')}>
                        <Text className={`${theme==='dark'?'text-white':'text-black'} font-bold text-lg`}>View Order</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
        );
    }

    // showing loading spinner modal
    function LoadingModal(){
        return(
            <Modal visible={!showModal && showLoading} transparent>
            <View className={`flex-1 justify-center items-center ${theme==='dark'?'bg-gray-800':'bg-white'}`}>
                <ActivityIndicator size={'large'}/>
                <Text className={`mt-3 text-lg ${theme==='dark'&&'text-white'}`}>Please wait...</Text>
            </View>
            </Modal>
        );
    }

    // payment options
    function PaymentOptions({name}){
        return(
            <Pressable className={`p-5 rounded-lg ${theme==='dark'?'bg-gray-700 border-gray-500':'bg-GGray border-gray-300'}  border  flex flex-row justify-between my-3`}
                onPress={()=>{ setShowLoading(true) ,PlaceOrder()}}>
                <Text className={`${theme==='dark'&&'text-white'} text-xl`}>{name}</Text>
                <AntDesign name="arrowright" size={24} color={`${theme==='dark'?'white':'black'}`} />
            </Pressable>
        );
    }

return (
    <View className={`w-full flex-1 ${theme==='dark'?'bg-gray-800':'bg-white'} z-0 relative`}>
        <SafeAreaView className='mt-20 mx-5'>
            <PaymentSuccess />
            <LoadingModal />
            <View className='flex flex-row items-center'>
                <Link href="/components/cart/MyCart">
                    <AntDesign name="leftcircleo" size={40} color="gray" />
                </Link>
                <Text className={`text-2xl font-bold ml-7 ${theme==='dark'&&'text-white'}`}>Payment Options</Text>
            </View>
            <View className='mt-16'>
            <PaymentOptions name={'Card'}/> 
            <PaymentOptions name={'Paypal'}/>
            </View>
        </SafeAreaView>
    </View>
)
}