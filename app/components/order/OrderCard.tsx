import { View, Text ,Image, Pressable} from 'react-native'
import React, { useEffect, useState } from 'react'
import  Constants  from 'expo-constants';
import axios from 'axios';
import { router } from 'expo-router';

//theme
import { useContext } from 'react';
import { ThemeContext } from '@/app/Theme/ThemProvider';

export default function OrderCard({order_id,prod_id,status ,ETA , feedback}) {

  const {theme} = useContext(ThemeContext);
  const SUPABASE_API_KEY = Constants.expoConfig?.extra.SUPABASE_KEY; //API key
  const BASE_URL = Constants.expoConfig?.extra.SUPABASE_URL; // base URL
  const [productTable,setProductTable] = useState([]);

  // for getting product 
  useEffect(()=>{
      async function GetProduct(){
        try{
          const res = await axios.get(`${BASE_URL}/rest/v1/product`,{params:
            {
              prod_id : `eq.${prod_id}`,
          },
              headers:{
                apikey:SUPABASE_API_KEY,
                Authorization:`Bearer ${SUPABASE_API_KEY}`
          }})
          setProductTable(res.data);
        }
        catch(err){
          console.error('error in fetching orders',err);
        }
      }
      GetProduct();
  },[])
  return (
    <Pressable className={`${theme==='dark'?'bg-gray-600 border-gray-700':'bg-GGray border-gray-200' } flex flex-row rounded-lg my-3 border`}
    onPress={()=>router.push({pathname:'/components/order/[OrderDetail]',params:{order_id:order_id}})}>
      <View className='p-2'>
        <Image className='w-20 h-28 rounded-lg' source={{uri:productTable[0]?.image || "dummy"}}/>
      </View>
      <View className='ml-5'>
        <Text className={`${theme==='dark'&&'text-white'} text-lg`}>order #{2100 + prod_id}</Text>
        <Text className={`${theme==='dark'&&'text-white'} text-lg my-2`}>{productTable[0]?.product_name}</Text>
        {
          status === 'cancelled' ? 
          <View className='self-start bg-red-200 border border-red-300 rounded-lg p-2 mb-2'>
            <Text className='text-red-900'>{status}</Text>
        </View> :
          status === 'recieved' && feedback === false ?
          <View className='self-start bg-violet-300 border border-violet-400 rounded-lg p-2 mb-2'>
            <Text className='text-violet-800'>How was it? Give feedBack</Text>
          </View> :
          status === 'recieved' && feedback === true ?
          <View className='self-start bg-gray-300 border border-gray-400 rounded-lg p-2 mb-2'>
            <Text className='text-black'>Feedback given</Text>
          </View>
          :
          <View className='self-start bg-green-200 border border-green-300 rounded-lg p-2 mb-2'>
            <Text className='text-green-900'>ETA: {ETA}</Text>
        </View>}
      </View>
    </Pressable>
  )
}