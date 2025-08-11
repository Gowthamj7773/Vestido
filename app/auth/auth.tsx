import { View, Text, TextInput, TouchableOpacity ,Image} from 'react-native'
import React, { use, useEffect, useState } from 'react'
import { Link, router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import axios from "axios"
import Constants from "expo-constants";
import AsyncStorage from '@react-native-async-storage/async-storage'
//logo import
import google from "../../assets/images/google_logo.png"
import apple from "../../assets/images/apple.png"
import facebook from "../../assets/images/facebook.png"

//theme
import { useContext } from 'react';
import { ThemeContext } from '@/app/Theme/ThemProvider';

export default function Auth() {


const [e , sE] = useState(""); //for email
const [p , sP] = useState(""); //for password

const [invalidEmail ,setInvalidEmail] = useState("data"); // for showing invalid email
const [invalidPassword,setInvalidPassword] = useState("data"); // for showing showing invalid pasword
const [error , setError] = useState(""); //displaying error

const [user , setUser] = useState([]); // this is for geting auth api
const SUPABASE_KEY = Constants.expoConfig.extra.SUPABASE_KEY; //API KEY
const BASE_URL = Constants.expoConfig.extra.SUPABASE_URL // base url
const {theme} = useContext(ThemeContext); // getting theme

  // continue with ...
  function Signin({image , content})
  {
    return(
            <TouchableOpacity className=  {`${theme==='dark'?'bg-gray-600':'bg-GGray'} mt-5 items-center rounded-3xl `}>
              <View className='flex-row w-full justify-center'>
                <View className='pl-7 justify-center'>
                  <Image className='w-7 h-7' source={image}/>
                </View>
                <View>
                  <Text className={`${theme==='dark'&&'text-white'} text-base font-bold p-4 text-center`}>{content}</Text>
                </View>
              </View>
          </TouchableOpacity>
    );
  }

  // error handling , redirect and submission
  function HandleSubmit()
  {

    if (e && p){
      setInvalidEmail("error");
      setInvalidPassword("error");

      async function GetUserDetails() {
        try{
          const response = await axios.get(`${BASE_URL}/rest/v1/users`,
            {
              headers:{apikey: SUPABASE_KEY , Authorization: `Bearer ${SUPABASE_KEY}`},
              params:{email:`eq.${e}` , password:`eq.${p}`}
            },

          )
          console.log("here: ",response.data);
          if(response.data.length !== 0){
            
              // stored user's ID
              const user_id = response.data[0].user_id
              await AsyncStorage.setItem("user_id",JSON.stringify(user_id));
            router.replace("/(tabs)/home")
          }
          else
            setError("Email or Password incorrect")

        }
        catch (err)
        {
          console.log("error came");
        }

      }
      GetUserDetails();
    }
    else if (!(e || p))
    {
      setInvalidEmail("");
      setInvalidPassword("");
    }
    else if (e)
        setInvalidPassword("");
    else
      setInvalidEmail("");
  }

  return (
    <View className={`w-full h-full ${theme==='dark'?'bg-gray-800':'bg-white'}`}>
      <SafeAreaView className='mt-24 mx-5 h-screen'>

        <View>
        <Text className={`${theme==='dark'&&'text-white'} text-3xl font-bold`}>Sign in</Text>
        {error && <Text className='text-red-500 mt-2'>{error}</Text>}
        <TextInput 
          className={`${theme==='dark'?'bg-gray-600 text-white':'bg-GGray'} py-5 rounded-sm pl-5 mt-5 ${!invalidEmail && "border-[1px] border-collapse border-red-600 text-gray-800"}`}  
          placeholderTextColor={!invalidEmail ? 'red' : (theme==='dark' ? 'white' : 'black')} 
          placeholder={`${invalidEmail ? "Email Address" : "* Email Address"}`} 
          onChangeText={(value)=>sE(value)}  
          keyboardType='email-address' 
          autoCapitalize='none'
        />

        <TextInput 
          className={`${theme==='dark'?'bg-gray-600 text-white':'bg-GGray'} mt-8 py-5 rounded-sm pl-5 ${!invalidPassword && "border-[1px] border-collapse border-red-600 text-gray-800"}`}  
          placeholderTextColor={!invalidPassword ? 'red' : (theme==='dark' ? 'white' : 'black')} 
          placeholder={`${invalidPassword ? "Password" : "* Password"}`} 
          onChangeText={(value)=>sP(value)}  
          secureTextEntry={true}
        />



        <TouchableOpacity className=' bg-GViolet mt-5 items-center rounded-3xl' onPress={()=>HandleSubmit()}>
          <Text className='text-white text-base font-bold p-4'>Continue</Text>
        </TouchableOpacity>

        <Link href={"/auth/signup"} className={`${theme==='dark'&&'text-white'} mt-3`}>Don't have a account?</Link>
        </View>

        <View className='mt-16'>
          <Signin image={apple} content={"Continue with apple"}/>
          <Signin image={google} content={"Continue with google"}/>
          <Signin image={facebook} content={"Continue with facebook"}/>
        </View>
      </SafeAreaView>
    </View>
  )
}