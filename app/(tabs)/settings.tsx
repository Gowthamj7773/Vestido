import { View, Text, SafeAreaView, Modal ,Image, Pressable, Alert, TextInput, KeyboardAvoidingView ,ScrollView,Platform, Switch} from 'react-native';
import React, { useState, useEffect } from 'react';
import Constants from 'expo-constants';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, withLayoutContext } from 'expo-router';

import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { decode as atob } from 'base-64';
import mime from 'mime';
import { createClient } from '@supabase/supabase-js';

import DefaultPic from '../../assets/images/user.png';
import AntDesign from '@expo/vector-icons/AntDesign';

//theme
import { useContext } from 'react';
import { ThemeContext } from '../Theme/ThemProvider';

export default function Settings() {
  const {theme,toggleTheme} = useContext(ThemeContext); // theme setting
  const SUPABASE_URL = Constants.expoConfig?.extra.SUPABASE_URL
  const SUPABASE_API_KEY =Constants.expoConfig?.extra.SERVICE_KEY; // service key
  const FETCH_API = Constants.expoConfig?.extra.SUPABASE_KEY; // actual API key
  const supabase = createClient(SUPABASE_URL, SUPABASE_API_KEY);

  const [profilePic, setProfilePic] = useState("");
  const [UserData, setUserData] = useState([]);
  const [userId, setUserID] = useState(null);
  const [isModalVisible ,setIsModalVisible] = useState(false);

  //editing name and address variables
  const [tickName ,setTickName] = useState(false);
  const [crossName ,setCrossName] = useState(false);
  const [editName ,setEditName] = useState("");
  const [tickAddress ,setTickAddress] = useState(false);
  const [crossAddress, setCrossAddress] = useState(false);
  const [editAddress ,setEditAddress] = useState("");
  const [deleteProfile , setDeleteProfile] = useState(false);

  // Open gallery and upload image
const pickAndUploadImage = async () => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert("Permission denied", "Please allow access to media library.");
    return;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.7,
    allowsEditing: true,
  });

  if (result.canceled || result.assets.length === 0) return;

  const img = result.assets[0];
  const uri = img.uri;
  const ext = uri.split('.').pop();
  const contentType = mime.getType(uri) || `image/${ext}`;

  try {
    const userId = await AsyncStorage.getItem('user_id');
    if (!userId) {
      Alert.alert("Error", "User ID not found");
      return;
    }

    const fileName = `${userId}/${Date.now()}.${ext}`;
    const file = {
      uri,
      name: fileName,
      type: contentType,
    };

    const formData = new FormData();
    formData.append('file', file);

    const uploadResponse = await fetch(`${SUPABASE_URL}/storage/v1/object/users/${fileName}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_API_KEY}`,
      },
      body: formData,
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error(errorText || "Upload failed");
    }

    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/users/${fileName}`;

    // 🔁 Update user row with public URL
    await axios.patch(
      `${SUPABASE_URL}/rest/v1/users?user_id=eq.${userId}`,
      { image: publicUrl },
      {
        headers: {
          apikey: FETCH_API,
          Authorization: `Bearer ${FETCH_API}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation'
        }
      }
    );

    // ✅ Get updated user image URL
    const getURL = await axios.get(`${SUPABASE_URL}/rest/v1/users`, {
      headers: {
        apikey: FETCH_API,
        Authorization: `Bearer ${FETCH_API}`
      },
      params: {
        user_id: `eq.${userId}`,
        select: 'image'
      }
    });

    const imgUrl = getURL.data?.[0]?.image || "";
    setProfilePic(imgUrl);

    Alert.alert("Success", "Profile picture updated!");
  } catch (err) {
    console.error("Upload error:", err);
    Alert.alert("Upload failed", err.message || "Something went wrong");
  }
};

  useEffect(() => {
    async function GetID() {
      try {
        const id = await AsyncStorage.getItem("user_id");
        console.log("user_id from settings: ", id);
        if (!id) return;

        setUserID(Number(id));

        const res = await axios.get(`${SUPABASE_URL}/rest/v1/users`, {
          headers: {
            apikey: SUPABASE_API_KEY,
            Authorization: `Bearer ${SUPABASE_API_KEY}`,
          },
          params: { user_id: `eq.${Number(id)}` },
        });

        setUserData(res.data);
        setProfilePic(res.data[0]?.image || null);
        setEditName(res.data[0].name);
        setEditAddress(res.data[0].address);
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    }

    GetID();
  }, []);

async function PutName() {
  setTickName(false);
  setCrossName(false);
  try {
    const res = await axios.patch(
      `${SUPABASE_URL}/rest/v1/users?name=eq.${UserData[0]?.name}`,
      { name: editName },                                            
      {
        headers: {
          apikey: SUPABASE_API_KEY,
          Authorization: `Bearer ${SUPABASE_API_KEY}`,
        }
      }
    );
    Alert.alert("Personal Info", "Modified successfully");
    const updated = [...UserData];
    updated[0].name = editName;
    setUserData(updated);

  } catch (err) {
    console.error("Error in patching name", err);
  }
}

async function PutAddress() {
  setTickAddress(false);
  setCrossAddress(false);
  try {
    const res = await axios.patch(
      `${SUPABASE_URL}/rest/v1/users?address=eq.${UserData[0]?.address}`,
      { address: editAddress },                                            
      {
        headers: {
          apikey: SUPABASE_API_KEY,
          Authorization: `Bearer ${SUPABASE_API_KEY}`,
        }
      }
    );
    Alert.alert("Personal Info", "Modified successfully");
    const updated = [...UserData];
    updated[0].address = editAddress;
    setUserData(updated);

  } catch (err) {
    console.error("Error in patching name", err);
  }
}

async function Del_Profile_pic(){
  try{
    const res = await axios.patch(`${SUPABASE_URL}/rest/v1/users?image=eq.${UserData[0].image}`,
    {image:null},
    {headers:{
      apikey:SUPABASE_API_KEY,
      Authorization:`Bearer ${SUPABASE_API_KEY}`
    }})
    const updated = [...UserData];
    updated[0].image = "";
    setUserData(updated);
    Alert.alert('Personal Info','Profile picture deleted!');
  }
  catch(err){
    console.log('can\'t delete profile pic',err)
  }
}
  return (
    <KeyboardAvoidingView className={`w-full h-full ${theme==='dark'?'bg-gray-800':'bg-white'}`} keyboardVerticalOffset={0}   behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex:1}}>
      <SafeAreaView className='mt-20 mx-5'>
          <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            
        {/* modal for displaying the image */}
      <Modal visible={isModalVisible && profilePic !== null } transparent animationType="fade" onRequestClose={() => setIsModalVisible(false)}>
          <View className="flex-1 bg-black/80 justify-center items-center">
            <View className="relative">
              <Image
                source={{ uri:profilePic}} // plug in your profilePic state here
                className="w-96 h-96 rounded-xl"
                resizeMode="cover"
              />
              <Pressable onPress={() => setIsModalVisible(false)} className="absolute top-2 right-2 bg-black/60 rounded-full p-2">
                <AntDesign name='close' size={20} color={'white'}/>
              </Pressable>
            </View>
          </View>
      </Modal>

        <View className='flex items-center'>
          <Text className={`text-2xl font-bold text-center ${theme==='dark'&&'text-white'}`}>Your Profile</Text>
          <View className='items-center mt-5'>
            <View className='relative'>
              <Pressable onPress={()=>setIsModalVisible(prev => !prev)}><Image source={profilePic ? { uri: profilePic } : DefaultPic} className='w-44 h-44 rounded-full overflow-hidden'/></Pressable>
                <Pressable className='absolute bottom-2 right-0 w-10 h-10 rounded-full bg-GViolet items-center justify-center' onPress={pickAndUploadImage}>
                  <Text className='text-white font-bold text-xl'>+</Text>
                </Pressable>
            </View>
          </View>

          {(deleteProfile && UserData[0].image !== null) ? 
          <Pressable onPress={Del_Profile_pic}>
            <Text className='text-red-500 mt-3 text-lg font-medium'>Delete</Text>
          </Pressable>
          : <Text className={`text-xl font-medium mt-3  ${theme==='dark'&&'text-white'}`}>{UserData[0]?.name || "name"}</Text>}
        </View>

        <View className='flex flex-row justify-between mt-10'>
          <Text className={`text-xl font-bold  ${theme==='dark'&&'text-white'}`}>Personal info</Text>
          <Text className={`text-xl ${theme==='dark'&&'text-white'}`} onPress={()=>{
              setTickName(prev => !prev),
              setCrossName(prev => !prev),
              setTickAddress(prev => !prev),
              setCrossAddress(prev => !prev),
              setDeleteProfile(prev => !prev)
              }}>Edit</Text>
        </View>

        <View className='mt-3'>

          <Text className={`my-2 font-medium  ${theme==='dark'&&'text-white'}`}>Name</Text>
          <View className={`${theme==='dark'?'bg-gray-700':'bg-GGray'} ${tickName && crossName? 'py-3 pl-3': 'py-5 pl-5'} rounded-sm flex flex-row justify-between`}>
            {
            tickName && crossName ?<TextInput  className={`flex-1  ${theme==='dark'&&'text-white'}`} value={editName} onChangeText={setEditName}/> :
              <Text className={`${theme==='dark'&&'text-white'}`}>{UserData[0]?.name}</Text>
            }
            {
            tickName && crossName &&
            <View className='flex flex-row items-center'>
              <Pressable className='mr-3' onPress={PutName}>
                <AntDesign  name="check" size={24} color="green" />
              </Pressable>
              <Pressable className='mr-3' onPress={()=>{setTickName(false), setCrossName(false)}}>
                <AntDesign  name="close" size={24} color="red" />
              </Pressable>
            </View>
            }
          </View>
          <Text className={`my-2 font-medium  ${theme==='dark'&&'text-white'}`}>Email</Text>
          <View className={`${theme==='dark'?'bg-gray-700':'bg-GGray'} py-5 rounded-sm pl-5`}>
            <Text className={` ${theme==='dark'&&'text-white'}`}>{UserData[0]?.email}</Text>
          </View>

          <Text className={`my-2 font-medium  ${theme==='dark'&&'text-white'}`}>Address</Text>
          <View className={`${theme === 'dark'?'bg-gray-700':'bg-GGray'} ${tickAddress && crossAddress? 'py-3 pl-3': 'py-5 px-5'} rounded-sm flex flex-row justify-between`}>
            {
            tickAddress && crossAddress ?<TextInput className={`flex-1 ${theme==='dark'&&'text-white'}`} value={editAddress} onChangeText={setEditAddress}/> :
              <Text className={` ${theme==='dark'&&'text-white'}`}>{UserData[0]?.address}</Text>
            }
            {
            tickAddress && crossAddress &&
            <View className='flex flex-row items-center'>
              <Pressable className='mr-3' onPress={PutAddress}>
                <AntDesign  name="check" size={24} color="green" />
              </Pressable>
              <Pressable className='mr-3' onPress={()=>{setTickAddress(false), setCrossAddress(false)}}>
                <AntDesign  name="close" size={24} color="red" />
              </Pressable>
            </View>
            }
          </View>
        </View>
        <View className='flex flex-row items-center mt-2'>
          <Text className={`${theme==='dark'&& 'text-white'}`}>{theme} mode</Text>
          <Switch className='ml-2' value={theme==='dark'?true :false} trackColor={{false:'gray',true:'#A78BFA'}}  thumbColor={theme === 'dark' ?'#8e6cef':'white'}onValueChange={toggleTheme}/>
        </View>
        <Text
          className='text-center text-red-500 font-bold'
          onPress={() => {AsyncStorage.clear(); router.replace("/auth/auth")}}
        >
          Sign out
        </Text> 
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
