import { View, Text, SafeAreaView, TextInput ,TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import AntDesign from '@expo/vector-icons/AntDesign';
import { Link, router } from 'expo-router';
import axios from 'axios';
import  Constants  from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

//theme
import { useContext } from 'react';
import { ThemeContext } from '@/app/Theme/ThemProvider';

export default function signup() {

  const [name,setName] = useState("");
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [address ,setAddress] = useState("");
  const [error,setError] = useState(""); // all fields important

  const {theme} = useContext(ThemeContext); // getting theme
  const BASE_URL = Constants.expoConfig.extra.SUPABASE_URL // base url
  const SUPABASEAPI_KEY = Constants.expoConfig.extra.SUPABASE_KEY; // api key

  function HandleSubmit()
  {
    if (name && email && password && address)
    { setError("");
      async function GetuserDetails() {
              try{
              const response = await axios.get(`${BASE_URL}/rest/v1/users`,{
                headers:{apikey:SUPABASEAPI_KEY , Authorization:`Bearer ${SUPABASEAPI_KEY}`},
                params:{email:`eq.${email}`}
              })
              console.log("User found or not? " ,response.data);

              //stored user's ID
              if(response.data.length !==0){
                setError("Account already exists");
                return;
              }
              else{
                  const response = await axios.post(`${BASE_URL}/rest/v1/users`,
                  {name:name , email:email , password:password , address:address },
                  {
                      headers:{apikey:SUPABASEAPI_KEY , Authorization:`Bearer ${SUPABASEAPI_KEY}`},
                  }
                    ) 
                    console.log("posted! ",response.data);

                //getting data for storing in AsyncStorage
                const getData = await axios.get(`${BASE_URL}/rest/v1/users`,{
                headers:{apikey:SUPABASEAPI_KEY , Authorization:`Bearer ${SUPABASEAPI_KEY}`},
                params:{email:`eq.${email}`}
                })
                console.log("posted then recieved: ",getData.data);

                const user_id = getData.data[0]?.user_id;
                await AsyncStorage.setItem("user_id",JSON.stringify(user_id));

                router.replace("/(tabs)/home");
                }
              }
              catch(err){
                console.error(err);
              }
              }
              GetuserDetails();
              }
              else{
                setError('All fields are required');
              }

            }
          
    
  

  return (
    <View className={`w-full flex-1 ${theme==='dark'?'bg-gray-800':'bg-white'}`}>
      <SafeAreaView className='mt-24 mx-5'>
        <View>
          <Link href="/auth/auth">
            <AntDesign name="leftcircleo" size={40} color="gray" />
          </Link>
        </View>
          <View className='mt-5'>
            <Text className={`text-3xl font-bold ${theme==='dark'&&'text-white'}`}>Create Account</Text>
          <View className='mt-10'>
            {error && <Text className='text-red-500'>{error}</Text>}
            <TextInput className={`${theme==='dark' ? 'bg-gray-600' : 'bg-GGray'} py-5 rounded-sm pl-5 mt-5`} placeholder="Name" placeholderTextColor={theme==='dark' ? 'white' : undefined} onChangeText={(val)=>setName(val)}/>
            <TextInput className={`${theme==='dark' ? 'bg-gray-600' : 'bg-GGray'} py-5 rounded-sm pl-5 mt-5`} placeholder="Email" placeholderTextColor={theme==='dark' ? 'white' : undefined} onChangeText={(val)=>setEmail(val)} keyboardType="email-address" autoCapitalize="none"/>
            <TextInput className={`${theme==='dark' ? 'bg-gray-600' : 'bg-GGray'} py-5 rounded-sm pl-5 mt-5`} placeholder="Password" placeholderTextColor={theme==='dark' ? 'white' : undefined} onChangeText={(val)=>setPassword(val)} secureTextEntry/>
            <TextInput className={`${theme==='dark' ? 'bg-gray-600' : 'bg-GGray'} py-5 rounded-sm pl-5 mt-5`} placeholder="Address" placeholderTextColor={theme==='dark' ? 'white' : undefined} onChangeText={(val)=>setAddress(val)}/>
          </View>
          </View>
          <TouchableOpacity className=' bg-GViolet mt-10 items-center rounded-3xl' onPress={HandleSubmit}>
            <Text className='text-white text-base font-bold p-5'>Continue</Text>
          </TouchableOpacity>

      </SafeAreaView>
    </View>

  )
}
