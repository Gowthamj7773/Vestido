import { View, Text,SafeAreaView, FlatList } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Link } from 'expo-router'
import AntDesign from '@expo/vector-icons/AntDesign'
import axios from 'axios';
import  Constants  from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ItemCard from '../ItemList/ItemCard';

//theme
import { useContext } from 'react';
import { ThemeContext } from '@/app/Theme/ThemProvider';

export default function MyFavorite() {

    const {theme} = useContext(ThemeContext); // getting theme
    const BASE_URL = Constants.expoConfig?.extra.SUPABASE_URL; // base url
    const SUPABASE_API_KEY = Constants.expoConfig?.extra.SUPABASE_KEY; //API key

    const [ProductTable , setProductTable] = useState([]) // to store records from product table
    const [LikedTable,setLikedTable] = useState([]); // to store records from liked table
    const [userId,setUserId] = useState(null); // storing user_id

    // getting user_id
    useEffect(()=>{
                async function GetID() {
        try{
            const id = await AsyncStorage.getItem("user_id");
            console.log("user_id from fav: ",id);
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

    // getting products table and liked table records
    useEffect(()=>{

        async function GetLikedTable(){
            try{
                const res = await axios.get(`${BASE_URL}/rest/v1/likes?select=*` ,{
                    headers:{
                        apikey:SUPABASE_API_KEY , Authorization:`Bearer ${SUPABASE_API_KEY}`
                    },
                })
                //console.log('liked table: ',res.data);
                setLikedTable(res.data);
            }
            catch(err){
                console.error('error in getting liked items ',err);
            }
        }
        async function GetProductTable() {
            try{
                const res = await axios.get(`${BASE_URL}/rest/v1/product?select=*` ,{
                    headers:{
                        apikey:SUPABASE_API_KEY , Authorization:`Bearer ${SUPABASE_API_KEY}`
                    },
                })
                //console.log('products tabele: ',res.data);
                setProductTable(res.data);
            }
            catch(err){
                console.error('error in getting getProductTable ',err);
            }
        }
        GetProductTable();
        GetLikedTable();
    },[]);

      // Filter only liked products by the current user
    const filteredProducts = ProductTable.filter(product =>
        LikedTable.some(like =>
        like.user_id === Number(userId) &&
        like.prod_id === product.prod_id &&
        like.is_liked === true
        )
    );
    var count  = Object.keys(filteredProducts).length; // for this UI, (10) results found
    return (
    <View className={`w-full flex-1 ${theme==='dark'?'bg-gray-800':'bg-GGray'}`}>
        <SafeAreaView className='mt-24 mx-5'>
            <View className='flex flex-row items-center'>
                <Link href="/components/cart/LandingPage">
                    <AntDesign name="leftcircleo" size={40} color="gray" />
                </Link>
                <Text className={`text-2xl font-bold ml-7 ${theme==='dark'&&'text-white'}`}>My favorites({count})</Text>
            </View>
    {
        filteredProducts.length === 0 ?
        <View className='h-2/3 w-full items-center justify-end pb-20'>
            <AntDesign name="hearto" size={50} color="red" />
            <Text className={`text-2xl font-bold mt-5 ${theme==='dark'&&'text-white'}`}>Your favorites list is feeling lonely.</Text>
        </View>
        
        :
        <FlatList className='mt-5 mb-32'
    data={filteredProducts}
    renderItem={({ item }) =>
    <View className='w-[50%]'>
        <ItemCard quantity={item.quantity} user_id={userId} prod_id={item.prod_id} price={item.price} rating={item.rating} product_name={item.product_name} url={item.image}/>
    </View>
    }
    keyExtractor={item=>item.prod_id}

    numColumns={2}
    showsVerticalScrollIndicator={false}
    />
}
        </SafeAreaView>
    </View>
    )
}