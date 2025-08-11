import { View, Text , SafeAreaView, FlatList,ScrollView ,Dimensions} from 'react-native'
import React, { useEffect, useState } from 'react'
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import  Constants  from 'expo-constants';
import OrderCard from '../components/order/OrderCard';
import Feather from '@expo/vector-icons/Feather';
import { Skeleton } from 'moti/skeleton' // skeleton

//theme
import { useContext } from 'react';
import { ThemeContext } from '../Theme/ThemProvider';

export default function Orders() {

  const {theme} = useContext(ThemeContext);
  const SUPABASE_API_KEY = Constants.expoConfig?.extra.SUPABASE_KEY; //API key
  const BASE_URL = Constants.expoConfig?.extra.SUPABASE_URL; // base URL
  const [orderTable,setOrderTable] = useState([]);
  const [userId,setUserId] = useState(null);
  const [ETA , setETA] = useState(''); // showing ETA

  // for skeleton
  const [skeleton,setSkeleton] = useState(false); // for skeletion
  const screenWidth = Dimensions.get('window').width
  const trimWidth = 8;
  // getting userId
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
          console.error('can\'t fetch user_id',err);
        }
      }
      GetID();
  },[])

  useFocusEffect(
          useCallback(()=>{
            if(!userId)
              return;
      async function GetOrders(){
        try{
          const res = await axios.get(`${BASE_URL}/rest/v1/order`,{params:{user_id : `eq.${userId}`},
              headers:{
                apikey:SUPABASE_API_KEY,
                Authorization:`Bearer ${SUPABASE_API_KEY}`
          }})
          setOrderTable(res.data);
      const timeStamp = res.data[0]?.created_at;
      const date = new Date(timeStamp);
      date.setDate(date.getDate() + 3);
      const format = {day:'numeric',month:'long',year:'numeric'};
      const formatedDate = date.toLocaleDateString('en-US',format);
      setETA(formatedDate);
      setSkeleton(true);
        }
        catch(err){
          console.error('error in fetching orders',err);
        }
      }
      GetOrders();
    },[userId]))

  return (
    <View className={`${theme==='dark'?'bg-gray-800':'bg-white'} w-full flex-1 z-0 relative`}>
        <SafeAreaView className='mt-20 mx-5'>
          <Text className={`text-center text-2xl font-medium ${theme==='dark'&&'text-white'}`}>My orders</Text>
          {
            (orderTable.length === 0 && skeleton) ? 
            <View className='h-full items-center justify-center pb-20'>
                <Feather name="search" size={50} color="#8e6cef" />
                <Text className={`text-2xl font-bold mt-5  ${theme==='dark'&&'text-white'}`}>No orders yet</Text>
            </View> :
            (orderTable.length === 0 && !skeleton) ? 
            <ScrollView showsVerticalScrollIndicator={false} className="mt-3">
              <View className="px-2">
                {[1, 2, 3].map((id) => (
                  <View key={id} className="m-2">
                    <Skeleton
                      colorMode={`${theme==='dark'?'dark':'light'}`}
                      transition={{ type: 'timing', duration: 500 }}
                      radius="square"
                      width={screenWidth - trimWidth * 2}
                      height={150}
                    />
                  </View>
                ))}
              </View>
            </ScrollView>
            :
          <FlatList className='mt-5' data={orderTable}
          renderItem={({item})=><OrderCard order_id={item.order_id} prod_id={item.prod_id} ETA={ETA} status={item.status} feedback={item.feedback}/>}
          keyExtractor={(item) =>item.order_id}
          showsVerticalScrollIndicator={false}
          />
          }
        </SafeAreaView>
    </View>
  )
}