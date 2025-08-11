import { View, Text,SafeAreaView, TouchableOpacity, TextInput, ScrollView, FlatList ,Image, Pressable} from 'react-native'
import React, { useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';
import axios from 'axios';
import  Constants  from 'expo-constants';
import { router} from 'expo-router'

// lazy loading
import {Skeleton} from 'moti/skeleton'
//for icons
import CircleUI from '../components/category_circle/circle';

//for default user profile
import DefaultPic from '../../assets/images/user.png'
import ItemCard from '../components/ItemList/ItemCard';

// for imediate profile image updation
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

// dark / light mode
import { useContext } from 'react';
import { ThemeContext } from '../Theme/ThemProvider';

export default function Home() {

    const {theme} = useContext(ThemeContext);

    const SUPABASE_API_KEY = Constants.expoConfig?.extra.SUPABASE_KEY //api key
    const SUPABASE_URL = Constants.expoConfig?.extra.SUPABASE_URL // base url
    const [category , setCategory] = useState([]); // for getting category data
    const [popular ,setPopular] = useState([]); // for storing popular items
    const [newIn ,setNewIn] = useState([]); // for storing new in items
    const [profilePic ,setProfilePic] = useState(""); // profile pic
    const [search,setSearch] = useState(""); // for searching for items dynamically
    const [userId,setUserId] = useState(null);

    // to get stored user_id and profile_pic from DB
useFocusEffect(
        useCallback(()=>{
    async function GetID() {
        try{
            const id = await AsyncStorage.getItem("user_id");
            console.log("user_id from home: ",id);
            if(!id){
                console.error("User_id is not available in AsyncStorage");
                return;
            }
            setUserId(id);
        const res = await axios.get(`${SUPABASE_URL}/rest/v1/users`,
                {
                    headers:{apikey: SUPABASE_API_KEY , Authorization: `Bearer ${SUPABASE_API_KEY}`},
                    params:{user_id:`eq.${Number(id)}`,select:"image"}
                })
                        //console.log("Image returned from home: ",res.data[0].image);
                        setProfilePic(res.data[0].image?res.data[0].image : null)
        }
        catch(err){
            console.error("error: ",err);
        }
            
    }
    GetID();
    },[])
)


    //getting category for displaying circle UI and showing popular , new in
    useEffect(()=>{
            async function GetCategory() {
            try{
                const response = await axios.get(`${SUPABASE_URL}/rest/v1/category`,
                {
                    headers:{apikey: SUPABASE_API_KEY , Authorization: `Bearer ${SUPABASE_API_KEY}`},
                })
                //console.log("Circle UI: ",response.data);
                setCategory(response.data);
            }
            catch(err){
            console.error("Error from DB:",err);}
        }
        
        async function GetPopularItem()
        {
        try{
            const response = await axios.get(`${SUPABASE_URL}/rest/v1/product`,
                {
                    headers:{apikey:SUPABASE_API_KEY ,Authorization:`Bearer ${SUPABASE_API_KEY}`},
                    params:{rating:`gt.${Number(4)}`,select:'*'},
                }, 
            )
            //console.log("Popular items: ",response.data);
            setPopular(response.data);
        }
        catch(err){
            console.error("Can't get popular items from DB ",err)
        }

        }
    async function GetNewItem() {
        const date = new Date();
        const  startDate = date.toISOString().split('T')[0];
        const day = date.getDate();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear() - 1;
        const endDate = `${year}-${month}-${day}`;

    try {
        const response = await axios.get(`${SUPABASE_URL}/rest/v1/product`, {
        headers: {
            apikey: SUPABASE_API_KEY,
            Authorization: `Bearer ${SUPABASE_API_KEY}`,
        },
        params: {
            date:[`lte.${startDate}`,`gte.${endDate}`],
            select: '*',
        },
        });
        //console.log('new Items: ', response.data);
        setNewIn(response.data);

    } catch (err) {
        console.error("Can't get new items from DB", err);
    }
}
        GetPopularItem();
        GetNewItem();
        GetCategory();
    },[])

return (
    <View className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} w-full h-full`}>
        <ScrollView className='mt-16 mx-5 h-screen' showsVerticalScrollIndicator={false}>
            <View className='flex flex-row justify-between'>
                {
                    profilePic && typeof profilePic === 'string' ?  
                    <Pressable className='w-16 h-16 rounded-full bg-violet-400' onPress={()=>router.push("/settings")}>
                        <Image className='w-16 h-16 rounded-full' source={{uri:profilePic}}/>
                    </Pressable>:
                    <Pressable className='w-16 h-16 rounded-full items-center justify-center' onPress={()=>router.push("/settings")}>
                        <Image className='w-16 h-16 rounded-full' source={DefaultPic}/>
                    </Pressable>
                }
                <Pressable onPress={()=>router.push('/components/cart/LandingPage')} className='bg-GViolet w-16 h-16 rounded-full items-center justify-center'>
                    <AntDesign name="shoppingcart" size={28} color="white" />
                </Pressable>
            </View>
            <View className={`${theme === 'dark' ? 'bg-gray-700':'bg-GGray'} py-3 pl-5 mt-5 rounded-full flex flex-row items-center`}>
                <Feather name="search" size={22} color={`${theme==='dark'?'white':'black'}`}/>
                <TextInput placeholderTextColor={theme ==='dark' ? 'white' : 'black'} className={`${theme === 'dark'?'text-white':'text-black'} pl-5 w-full`} placeholder='Search' onChangeText={(val)=> setSearch(val)} onSubmitEditing={()=>{router.push(`/components/ItemList/${search}`)}}/>
            </View>
            <View className={`flex flex-row justify-between my-5`}>
                <Text className={`${theme==='dark'?'text-white':'text-black'} font-bold text-xl`}>Categories</Text>
                <Text className={`${theme==='dark'?'text-white':'text-black'} font-medium text-lg`} onPress={()=>router.push("/components/category_list/category")}>See All</Text>
            </View>
            <ScrollView className='grow-0' horizontal={true} showsHorizontalScrollIndicator={false}>
                { category.length === 0 ? 
                [1,2,3,4,5].map((id)=> (
                    <View className='mx-1' key={id}>
                    <Skeleton colorMode={`${theme==='dark'?'dark':'light'}`} transition={{type:'timing', duration:500}} radius={'round'} width={80} height={80}/>
                    </View>
                    ))
                :
                category.map(({image,name},item)=>(
                    <CircleUI image={image} key={item} name={name}/>
                ))
                }
            </ScrollView>
            <Text className={`${theme==='dark' && 'text-white'} my-5 font-bold text-xl`}>Popular</Text>
            {
                popular.length === 0 ? 
            <ScrollView className='mt-3' showsHorizontalScrollIndicator={false} horizontal={true}>
            {[1, 2, 3, 4, 5].map((id) => (
                <View key={id} className="mx-2">
                    <Skeleton
                        colorMode={theme === 'dark' ? 'dark' : 'light'}
                        transition={{ type: 'timing', duration: 500 }}
                        radius="square"
                        width={150}
                        height={300}
                    />
                </View>
            ))}
            </ScrollView>

                :
            <FlatList className='grow-0'
            data={popular}
            renderItem={({item})=>
            <View className='w-48'>
                <ItemCard quantity={item.quantity} rating={item.rating} user_id={userId} prod_id={item.prod_id} url={item.image} product_name={item.product_name} price={item.price}/>
            </View>
            }
            showsHorizontalScrollIndicator={false}
            horizontal={true}
            keyExtractor={item => item.prod_id}
            />
            }
            <Text className='my-5 font-bold text-xl text-GViolet'>New in</Text>
        {
        newIn.length === 0 ? 
            <ScrollView className='mt-3' showsHorizontalScrollIndicator={false} horizontal={true}>
            {[1, 2, 3, 4, 5].map((id) => (
                <View key={id} className="mx-2">
                    <Skeleton
                        colorMode={theme === 'dark' ? 'dark' : 'light'}
                        transition={{ type: 'timing', duration: 500 }}
                        radius="square"
                        width={150}
                        height={300}
                    />
                </View>
            ))}
            </ScrollView>
            :
            <FlatList className='grow-0'
            data={newIn}
            renderItem={({item})=>
            <View className='w-48'>
                <ItemCard quantity={item.quantity} rating={item.rating} user_id={userId} prod_id={item.prod_id}  url={item.image} product_name={item.product_name} price={item.price}/>
            </View>
            }
            showsHorizontalScrollIndicator={false}
            horizontal={true}
            keyExtractor={item => item.prod_id}
            />
        }
        </ScrollView>
    </View>
)
}