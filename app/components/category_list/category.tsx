import { View, Text,SafeAreaView ,FlatList} from 'react-native'
import React, { useEffect, useState } from 'react'
import AntDesign from '@expo/vector-icons/AntDesign'
import { Link } from 'expo-router'
import axios from 'axios'
import  Constants  from 'expo-constants'
import Cat_card from './cat_card'

// theme
import { useContext } from 'react'
import { ThemeContext } from '@/app/Theme/ThemProvider'

export default function Category() {

const {theme} = useContext(ThemeContext); 
const SUPABASE_KEY = Constants.expoConfig?.extra.SUPABASE_KEY;
const BASE_URL = Constants.expoConfig?.extra.SUPABASE_URL;
const [catData,setCatData] = useState([]); //stores category data

//getting category list
  useEffect(()=>{
    async function GetCategory()
    {
      try{
        const res = await axios.get(`${BASE_URL}/rest/v1/category`,
          {
            headers:{apikey:SUPABASE_KEY ,Authorization:`Bearer ${SUPABASE_KEY}`}
          }
        )
          setCatData(res.data);
          console.log("category_list: ",res.data);
      }
      catch(err){
          console.error("error from DB ",err);
        }
    }
    GetCategory();
  },[])
  return (
        <View className={`w-full h-full ${theme==='dark'?'bg-gray-800' :'bg-white'}`}>
            <SafeAreaView className='mt-16 mx-5 h-screen'>
                <Link className='mt-5' href="/(tabs)/home">
                    <AntDesign name="leftcircleo" size={40} color="gray" />
                </Link>
              <Text className={`text-3xl font-bold py-5 ${theme=='dark'&& 'text-white'}`}>Shop by Categories</Text>
              <FlatList data={catData}
              renderItem={({item})=><Cat_card name={item.name} image={item.image} />}
              keyExtractor={item => item.cat_id}
              />

            </SafeAreaView>
        </View>
  )
}