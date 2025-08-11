import { View, Text,TextInput, FlatList,Image, Pressable, Modal, ScrollView } from 'react-native'
import React, { use, useCallback, useEffect, useState } from 'react'
import { useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import axios from 'axios';
import  Constants  from 'expo-constants';
import ItemCard from './ItemCard';
import MultiSlider from '@ptomasroos/react-native-multi-slider'
import AsyncStorage from '@react-native-async-storage/async-storage';
//icon
import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';
import FontAwesome from '@expo/vector-icons/FontAwesome';

//skeleton
import { Skeleton } from 'moti/skeleton'

//theme
import { useContext } from 'react';
import { ThemeContext } from '@/app/Theme/ThemProvider';

export default function List() {

    const {theme} = useContext(ThemeContext); // getting theme

    const {List} = useLocalSearchParams();
    const SUPABASE_KEY = Constants.expoConfig?.extra.SUPABASE_KEY; //API KEY
    const [product ,setProduct] = useState([]); // for storing products list filtered by useLocalSearchParams();
    const [search,setSearch] = useState(""); // for dynamic and simultaneous result fetching

    const [user_id,setUser_id] = useState(null); //getting user id for updating liked items

    // tablet
    const [tint,setTint] = useState(-1); // for setting colors 
    const [categoryOption,setCategoryOption] = useState(0); // for showing category option in modal
    const [sortBy,setSortBy] = useState(0); // for showing sortBy in modal

    //filtering var
    const [sortOrder, setSortOrder] = useState('default'); // or 'desc'
    const [category, setCategory] = useState('all');   // 'men', 'women', 'unisex', or 'all'
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [range, setRange] = useState([0,50000]);

    // results found
    var count  = Object.keys(filteredProducts).length; // for this UI, (10) results found

    //and filters found
    var filterCount = 0;
    if(range[0] !== 0 || range[1] !== 50000 )
      filterCount+=1
    if(sortOrder !== "default")
      filterCount+=1
    if(category !== "all")
      filterCount+=1

    //skeleton
    const [skeleton,setSkeleton] = useState(false); // showing skeleton

    //getting user's id for liked items
    useEffect(()=>{
              async function GetID() {
          try{
              const id = await AsyncStorage.getItem("user_id");
              console.log("user_id List: ",id);
              if(!id){
                  console.error("User_id is not available in AsyncStorage");
                  return;
              }
              setUser_id(id);
          }
          catch(err){
            console.log('couldn\'t get user_id from ayncStorage ',err);
          }
        } GetID();
      },[])

    //getting the filtered data using useLocalParam()
    useEffect(()=>{
        async function GetList() {
      try{
        const res = await axios.get(`https://hgfqxtizuwtuvpryiacy.supabase.co/rest/v1/product`,{
          headers:{apikey:SUPABASE_KEY , Authorization:`Bearer ${SUPABASE_KEY}`},
          params:{search_name:`ilike.%${List}%`}
        })
        //console.log("inside List: ",res.data);
        setProduct(res.data);
        setSearch(List)
      }
      catch(err){
        console.error("unable to fetch, ",err);
      }
    }
    GetList();
    },[])

    //getting dynamic results
useEffect(() => {
  const send = setTimeout(() => {
    if (search.length > 0) {
      const GetDynamicResults = async () => {
        try {
          const res = await axios.get(`https://hgfqxtizuwtuvpryiacy.supabase.co/rest/v1/product`, {
            headers: {
              apikey: SUPABASE_KEY,
              Authorization: `Bearer ${SUPABASE_KEY}`,
            },
            params: {
              product_name: `ilike.%${search}%` ,
            },
          });
          setProduct(res.data);
          setSkeleton(true);
        } catch (err) {
          console.error("Unable to connect to DB", err);
        }
      };

      GetDynamicResults();
    }
    else{
        async function GetList() {
      try{
        const res = await axios.get(`https://hgfqxtizuwtuvpryiacy.supabase.co/rest/v1/product`,{
          headers:{apikey:SUPABASE_KEY , Authorization:`Bearer ${SUPABASE_KEY}`},
        })
        setProduct(res.data);

      }
      catch(err){
        console.error("unable to fetch, ",err);
      }
    }
    GetList();
    }
  }, 300);

  return () => clearTimeout(send);
}, [search]);


  //filterig based on price , sortby, category
useEffect(() => {
    const result = product
      .filter((item) => {
        const priceOk = item.price >= range[0] && item.price <= range[1];
        const categoryOk = item.gender === category;

        if(product.length === 0) 
          return
        
        else if(category !== 'all'){
        return priceOk && categoryOk}

        else
          return priceOk;
      })
      .sort((a, b) => {
        return sortOrder === 'asc' ? a.price - b.price : sortOrder === 'dsc' ? b.price - a.price : 0;
      });

    setFilteredProducts(result);
    console.log("Filtered ::: ",result)
  }, [range, sortOrder, category ,product]);

const handleSliderFinish = useCallback((values) => {
  setRange(values);
  console.log(values)
}, []);

  //filter ui model
function FilterModal(){
  return(
  <Modal visible={tint === 0} transparent animationType="slide"  >          
      <View className="flex-1 flex justify-end">
        <View className={`flex h-1/3 w-full ${theme==='dark'?'bg-gray-700':'bg-GGray border-gray-300 border'} rounded-tr-3xl rounded-tl-3xl `}>
      <View className='mt-2 flex items-end p-3'>
        <Pressable onPress={()=>setTint(-1)}>
          <AntDesign name='close'color={`${theme==='dark'?'white':'black'}`} size={30} />
        </Pressable>
      </View>
      {
          (range[0] !== 0 || range[1] !== 50000 ) &&
          <View className='p-3 my-3 border mx-3 border-gray-300 rounded-md flex flex-row items-center justify-between'>
            <Text className={`text-lg ${theme === 'dark' && 'text-white'}`}>Price filter applied</Text>
            <Pressable onPress={() => setRange([0, 50000])}>
              <Text className='text-lg font-medium text-red-500'>clear</Text>
            </Pressable>
          </View>
      }
      {
          sortOrder !== "default" &&
          <View className='p-3 my-3 border mx-3 border-gray-300 rounded-md flex flex-row items-center justify-between'>
            <Text className={`text-lg ${theme === 'dark' && 'text-white'}`}>SortBy filter applied</Text>
            <Pressable onPress={() => setSortOrder('default')}>
              <Text className='text-lg font-medium text-red-500'>clear</Text>
            </Pressable>
          </View>
      }
      {
          category !== 'all' &&
          <View className='p-3 my-3 border mx-3 border-gray-300 rounded-md flex flex-row items-center justify-between'>
            <Text className={`text-lg ${theme === 'dark' && 'text-white'}`}>Category filter applied</Text>
            <Pressable onPress={() => setCategory('all')}>
              <Text className='text-lg font-medium text-red-500'>clear</Text>
            </Pressable>
          </View>
      }
      {
          range[0] === 0 && range[1] === 50000 && sortOrder === "default" && category === "all" && 
          <View className='flex flex-row justify-center items-center h-1/2'>
              <Feather name='search' size={30} color={"#8e6cef"}/>
              <Text className={`ml-2 text-xl font-medium ${theme === 'dark' && 'text-white'}`}>No filter(s) applied</Text>
          </View>
      }

        </View>
      </View>
  </Modal>
  );
}

function PriceFilter(){
return(
    <Modal visible={tint === 1} transparent pointerEvents="box-none">          
      <View className="flex-1 flex justify-end pointer-events-box-none">
        <View className={`flex h-1/3 w-full ${theme==='dark'?'bg-gray-800 border border-gray-600 ':'bg-GGray border border-gray-300'} rounded-tr-3xl rounded-tl-3xl `}>
            <View className='mt-2 flex items-end p-3'><Pressable onPress={()=>setTint(-1)}><AntDesign name='close' size={30} color={`${theme==='dark'&&'white'}`}/></Pressable></View>
                      <MultiSlider
        values={range}
        min={0}
        max={5000}
        step={1}
        sliderLength={300}
        onValuesChangeFinish={handleSliderFinish}
        containerStyle={{alignSelf:'center'}}
        selectedStyle={{ backgroundColor: '#8e6cef' }}
        unselectedStyle={{ backgroundColor: '#ccc' }}
        markerStyle={{
          backgroundColor: '#8e6cef',
          height: 20,
          width: 20,
          borderRadius: 10,
        }}
      />
            <View className='flex flex-row items-center justify-around mt-10'>
              <View className='w-1/4 flex-row border rounded-sm border-gray-300  justify-center'><Text className='text-2xl font-medium text-GViolet p-2'>₹ {range[0]}</Text></View>
              <View className='w-1/4 flex items-center justify-center'><FontAwesome name="exchange" size={24} color={`${theme==='dark' && 'white'}`} /></View>
              <View className='w-1/4 flex-row border rounded-sm border-gray-300 mr-1 justify-center'><Text className='text-2xl font-medium text-GViolet p-2'>₹ {range[1]}</Text></View>            
            </View>
        </View>
      </View>
    </Modal>
);
}

function SortBy() {
  return (
    <Modal visible={tint === 2} transparent>
      <View className="flex-1 flex justify-end pointer-events-box-none">
        <View
          className={`flex h-1/2 w-full rounded-tr-3xl rounded-tl-3xl border 
            ${theme === 'dark' ? 'bg-gray-700 border-gray-500' : 'bg-GGray border-gray-300'}`}
        >
          <View className="mt-2 flex items-end p-3">
            <Pressable onPress={() => setTint(-1)}>
              <AntDesign
                name="close"
                size={30}
                color={theme === 'dark' ? 'white' : 'black'}
              />
            </Pressable>
          </View>

          <View className="mt-5">
            {/* Recommended */}
            <Pressable
              onPress={() => {
                setSortBy(0), setSortOrder('default');
              }}
              className={`flex flex-row justify-between px-5 mx-5 py-5 my-3 rounded-lg items-center 
                ${
                  sortBy === 0
                    ? 'bg-GViolet'
                    : theme === 'dark'
                    ? 'bg-gray-600'
                    : 'bg-gray-200'
                }`}
            >
              <Text
                className={`text-xl font-medium 
                  ${
                    sortBy === 0
                      ? 'text-white'
                      : theme === 'dark'
                      ? 'text-white'
                      : 'text-black'
                  }`}
              >
                Recommended
              </Text>
              {sortBy === 0 && <Feather name="check" size={25} color={'white'} />}
            </Pressable>

            {/* Lowest - Highest */}
            <Pressable
              onPress={() => {
                setSortBy(1), setSortOrder('asc');
              }}
              className={`flex flex-row justify-between px-5 mx-5 py-5 my-3 rounded-lg items-center 
                ${
                  sortBy === 1
                    ? 'bg-GViolet'
                    : theme === 'dark'
                    ? 'bg-gray-600'
                    : 'bg-gray-200'
                }`}
            >
              <Text
                className={`text-xl font-medium 
                  ${
                    sortBy === 1
                      ? 'text-white'
                      : theme === 'dark'
                      ? 'text-white'
                      : 'text-black'
                  }`}
              >
                Lowest - Highest price
              </Text>
              {sortBy === 1 && <Feather name="check" size={25} color={'white'} />}
            </Pressable>

            {/* Highest - Lowest */}
            <Pressable
              onPress={() => {
                setSortBy(2), setSortOrder('dsc');
              }}
              className={`flex flex-row justify-between px-5 mx-5 py-5 my-3 rounded-lg items-center 
                ${
                  sortBy === 2
                    ? 'bg-GViolet'
                    : theme === 'dark'
                    ? 'bg-gray-600'
                    : 'bg-gray-200'
                }`}
            >
              <Text
                className={`text-xl font-medium 
                  ${
                    sortBy === 2
                      ? 'text-white'
                      : theme === 'dark'
                      ? 'text-white'
                      : 'text-black'
                  }`}
              >
                Highest - Lowest price
              </Text>
              {sortBy === 2 && <Feather name="check" size={25} color={'white'} />}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}


function Category() {
  return (
    <Modal visible={tint === 3} transparent>
      <View className="flex-1 flex justify-end pointer-events-box-none">
        <View
          className={`flex h-1/2 w-full rounded-tr-3xl rounded-tl-3xl border 
            ${theme === 'dark' ? 'bg-gray-700 border-gray-500' : 'bg-GGray border-gray-300'}`}
        >
          <View className="mt-2 flex items-end p-3">
            <Pressable onPress={() => setTint(-1)}>
              <AntDesign
                name="close"
                size={30}
                color={theme === 'dark' ? 'white' : 'black'}
              />
            </Pressable>
          </View>

          <View>
            {/* Recommended */}
            <Pressable
              onPress={() => {
                setCategoryOption(0), setCategory('all');
              }}
              className={`flex flex-row justify-between px-5 mx-5 py-5 my-3 rounded-lg items-center 
                ${
                  categoryOption === 0
                    ? 'bg-GViolet'
                    : theme === 'dark'
                    ? 'bg-gray-600'
                    : 'bg-gray-200'
                }`}
            >
              <Text
                className={`text-xl font-medium 
                  ${
                    categoryOption === 0
                      ? 'text-white'
                      : theme === 'dark'
                      ? 'text-white'
                      : 'text-black'
                  }`}
              >
                Recommended
              </Text>
              {categoryOption === 0 && <Feather name="check" size={25} color={'white'} />}
            </Pressable>

            {/* Men */}
            <Pressable
              onPress={() => {
                setCategoryOption(1), setCategory('men');
              }}
              className={`flex flex-row justify-between px-5 mx-5 py-5 my-3 rounded-lg items-center 
                ${
                  categoryOption === 1
                    ? 'bg-GViolet'
                    : theme === 'dark'
                    ? 'bg-gray-600'
                    : 'bg-gray-200'
                }`}
            >
              <Text
                className={`text-xl font-medium 
                  ${
                    categoryOption === 1
                      ? 'text-white'
                      : theme === 'dark'
                      ? 'text-white'
                      : 'text-black'
                  }`}
              >
                Men
              </Text>
              {categoryOption === 1 && <Feather name="check" size={25} color={'white'} />}
            </Pressable>

            {/* Women */}
            <Pressable
              onPress={() => {
                setCategoryOption(2), setCategory('women');
              }}
              className={`flex flex-row justify-between px-5 mx-5 py-5 my-3 rounded-lg items-center 
                ${
                  categoryOption === 2
                    ? 'bg-GViolet'
                    : theme === 'dark'
                    ? 'bg-gray-600'
                    : 'bg-gray-200'
                }`}
            >
              <Text
                className={`text-xl font-medium 
                  ${
                    categoryOption === 2
                      ? 'text-white'
                      : theme === 'dark'
                      ? 'text-white'
                      : 'text-black'
                  }`}
              >
                Women
              </Text>
              {categoryOption === 2 && <Feather name="check" size={25} color={'white'} />}
            </Pressable>

            {/* Unisex */}
            <Pressable
              onPress={() => {
                setCategoryOption(3), setCategory('unisex');
              }}
              className={`flex flex-row justify-between px-5 mx-5 py-5 my-3 rounded-lg items-center 
                ${
                  categoryOption === 3
                    ? 'bg-GViolet'
                    : theme === 'dark'
                    ? 'bg-gray-600'
                    : 'bg-gray-200'
                }`}
            >
              <Text
                className={`text-xl font-medium 
                  ${
                    categoryOption === 3
                      ? 'text-white'
                      : theme === 'dark'
                      ? 'text-white'
                      : 'text-black'
                  }`}
              >
                Unisex
              </Text>
              {categoryOption === 3 && <Feather name="check" size={25} color={'white'} />}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}


    return (
  <View className={`w-full h-full ${theme==='dark'?'bg-gray-800':' bg-white'}`}>
    <FilterModal/>
    <PriceFilter/>
    <SortBy/>
    <Category/>
        <SafeAreaView className='mt-5 mx-5 h-screen'>
          <View className='flex flex-row items-center'>
            <Link className='mt-5 mr-3' href="/(tabs)/home">
                <AntDesign name="leftcircleo" size={40} color="gray" />
            </Link>
            <View className={`${theme === 'dark' ? 'bg-gray-700':'bg-GGray'} py-3 pl-5 mt-5 rounded-full flex flex-row items-center`} >
                <Feather name="search" size={22} color={`${theme==='dark'?'white':'black'}`}/>
                <TextInput className={`pl-5 w-72 ${theme==='dark'&& 'text-white'}`} placeholder='Search' value={search} onChangeText={setSearch}/>
            </View>
          </View>
          <View className='flex flex-row mt-6'>
              <Pressable className={`flex flex-row rounded-full p-2 px-4 mr-2 ${theme === 'light' ? (tint === -1 ? 'bg-GViolet': 'bg-GGray'):(tint === -1 ? 'bg-GViolet': 'bg-gray-600') } `} onPress={()=>setTint(-1)}>
                <Text className={`${ theme==='light' ? (tint === -1 ? 'text-white' : 'text-black'):'text-white'}`}>All</Text>
              </Pressable>

              <Pressable className={`flex flex-row rounded-full p-2 mr-2 ${theme === 'light' ? (tint === 0 ? 'bg-GViolet': 'bg-GGray'): (tint === 0 ? 'bg-GViolet': 'bg-gray-600') } `} onPress={()=>setTint(0)}>
                <AntDesign name="filter" size={20} color={theme === 'light' ? (tint === 0 ? 'white':'black'): 'white'} />
                <Text className={`${ theme === 'light' ? (tint === 0 ? 'text-white' : 'text-black'): 'text-white'}`}>({filterCount})</Text>
              </Pressable>

              <Pressable className={`flex flex-row rounded-full p-2 mr-2 ${theme === 'light' ? (tint === 1 ? 'bg-GViolet': 'bg-GGray'):(tint === 1 ? 'bg-GViolet': 'bg-gray-600')} `} onPress={()=>setTint(1)}>
                <Text className={`${ theme === 'light'?(tint === 1 ? 'text-white' : 'text-black'):'text-white'}`}>Price</Text>
                <AntDesign className='pl-1' name="down" size={15} color={theme === 'light' ? (tint === 1 ? 'white':'black'):'white'} />
              </Pressable>

              <Pressable className={`flex flex-row rounded-full p-2 mr-2 ${theme === 'light' ? (tint === 2 ? 'bg-GViolet': 'bg-GGray'):(tint === 2 ? 'bg-GViolet': 'bg-gray-600')} `} onPress={()=>setTint(2)}>
                <Text className={`${ theme === 'light'?(tint === 2 ? 'text-white' : 'text-black'):'text-white'}`}>sortby</Text>
                <AntDesign className='pl-1' name="down" size={15} color={theme === 'light' ? (tint === 2 ? 'white':'black'):'white'} />
              </Pressable>

              <Pressable className={`flex flex-row rounded-full p-2 mr-2 ${theme === 'light' ? (tint === 3 ? 'bg-GViolet': 'bg-GGray'):(tint === 3 ? 'bg-GViolet': 'bg-gray-600')} `} onPress={()=>setTint(3)}>
                <Text className={`${ theme === 'light'?(tint === 3 ? 'text-white' : 'text-black'):'text-white'}`}>category</Text>
                <AntDesign className='pl-1' name="down" size={15} color={theme === 'light' ? (tint === 3 ? 'white':'black'):'white'} />
              </Pressable>
          </View>

          <Text className={`my-5 font-medium ${theme ==='dark' && 'text-white'}`}>({count}) Results found</Text>

          {(count === 0 && skeleton) ?
                    <View className='flex items-center mt-40'>
            <Feather name='search' size={45} color={"#8e6cef"}/>
            <Text className='text-2xl font-medium text-center'>Sorry, we couldn't find any matching results for your search.</Text>
          </View> :
          (count === 0 && !skeleton ) ?
          <ScrollView showsVerticalScrollIndicator={false} className="mt-3">
            <View className="flex-row flex-wrap justify-between px-2">
              {[1, 2, 3, 4, 5,6].map((id) => (
                <View key={id} className="m-2">
                  <Skeleton
                  colorMode={theme === 'dark' ? 'dark' : 'light'}
                  transition={{ type: 'timing', duration: 500 }}
                  radius="square"
                  width={155}
                  height={300}
                  />
                </View>
              ))}
            </View>
          </ScrollView>

          :
          <FlatList className='mb-16'
          data={filteredProducts}
          renderItem={({item})=>
          <View className='w-[50%]'>
            <ItemCard quantity={item.quantity} user_id={user_id} prod_id={item.prod_id} url={item.image} product_name={item.product_name} price={item.price} rating={item.rating}/>
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