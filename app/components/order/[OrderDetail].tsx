import { View, Text ,SafeAreaView ,Image, Pressable, Alert,Modal ,TextInput} from 'react-native'
import React from 'react'
import { Link, router, useLocalSearchParams } from 'expo-router'
import AntDesign from '@expo/vector-icons/AntDesign'
import { useEffect ,useState } from 'react'
import axios from 'axios'
import  Constants  from 'expo-constants'
import FeedBack from './FeedBack'

//theme
import { useContext } from 'react';
import { ThemeContext } from '@/app/Theme/ThemProvider';

export default function OrderDetail() {

  const {theme} = useContext(ThemeContext); // getting theme
  const SUPABASE_API_KEY = Constants.expoConfig?.extra.SUPABASE_KEY; //API key
  const BASE_URL = Constants.expoConfig?.extra.SUPABASE_URL; // base URL

  const [orderTable,setOrderTable] = useState([]);
  const [date,setDate] = useState(''); // for showing ETA
  const [status,setStatus] = useState('') // for status tablet

  const [productTable,setProductTable] = useState([]);
  const [userTable,setUserTable] = useState([]);

  const {order_id} = useLocalSearchParams(); // order id as param

  //Modal
  const [feedbackVisible, setFeedbackVisible] = useState(false);

// getting order table for ETA ,prod_id and quantity
  useEffect(()=>{
        if(!order_id)
          return;
  async function GetOrders(){
    try{
      const res = await axios.get(`${BASE_URL}/rest/v1/order`,{params:{order_id : `eq.${order_id}`},
          headers:{
            apikey:SUPABASE_API_KEY,
            Authorization:`Bearer ${SUPABASE_API_KEY}`
      }})
      setOrderTable(res.data);
      //console.log(res.data);
      const timeStamp = res.data[0].created_at;
      const date = new Date(timeStamp);
      date.setDate(date.getDate() + 3);
      const format = {day:'numeric',month:'long',year:'numeric'};
      const formatedDate = date.toLocaleDateString('en-US',format);
      setDate(formatedDate);

      setStatus(res.data[0]?.status);

    }
    catch(err){
      console.error('error in fetching orders',err);
    }
  }
  GetOrders();
    },[order_id])

// getting product details from product
  useEffect(()=>{
    async function GetProduct(){
      if (!orderTable[0].prod_id)
        return;
          try{
          const product = await axios.get(`${BASE_URL}/rest/v1/product`,{params:{prod_id : `eq.${orderTable[0]?.prod_id}`},
          headers:{
            apikey:SUPABASE_API_KEY,
            Authorization:`Bearer ${SUPABASE_API_KEY}`
      }})
      //console.log('prod :',product.data)
      setProductTable(product.data);
      
      try{
          const user = await axios.get(`${BASE_URL}/rest/v1/users`,{
          params:{
            user_id : `eq.${orderTable[0]?.user_id}`,
            select : 'name, address'
        },
          headers:{
            apikey:SUPABASE_API_KEY,
            Authorization:`Bearer ${SUPABASE_API_KEY}`
      }})
      //console.log('user: ',user.data)
      setUserTable(user.data);
      }
      catch(err){
        console.error('can\'t get user detail')
      }
      }
      catch(err){
        console.error('can\'t get product table ',err)
      }
    }
    GetProduct();
  },[orderTable])

  // patching to "cancelled" in status field
  async function PatchToCancelled() {
    try{
      const res = await axios.patch(`${BASE_URL}/rest/v1/order?order_id=eq.${order_id}`,{status:'cancelled'},{
        headers:{
            apikey:SUPABASE_API_KEY,
            Authorization:`Bearer ${SUPABASE_API_KEY}`
      }}
      )
      setStatus('cancelled');
    }
    catch(err){
      console.error('can\'t put deleted status',err);
    }
  }

  async function OrderTableFeedback(){
    try{
      const res = await axios.patch(`${BASE_URL}/rest/v1/order?order_id=eq.${order_id}`,{feedback:true},
        {
          headers:{
          apikey:SUPABASE_API_KEY,
          Authorization:`Bearer ${SUPABASE_API_KEY}`
        }
      }
      )
      const copy = [...orderTable];
      copy[0].feedback = true;
      setOrderTable(copy);
      console.log('feedback set true');
    }
    catch(err){
      console.error('cannot put feedback status ',err)
    }
  }
  // confirmation for deletion
  function HandleDeleteOrder(){
    Alert.alert('Order Summary','Do you want to cancel order',[
      {text:'cancel',style:'cancel'},
      {text:'Ok',onPress: PatchToCancelled}
    ])
  }



  return (
    <View className={`w-full flex-1 ${theme==='dark'?'bg-gray-800':'bg-white'} z-0 relative`}>
        <SafeAreaView className='mt-20 mx-5'>
          <FeedBack
            user_id={orderTable[0]?.user_id}
            prod_id={orderTable[0]?.prod_id} 
            visible={feedbackVisible} 
            onClose={()=>setFeedbackVisible(false)}
            feedback ={OrderTableFeedback}/>
                <View className='flex flex-row items-center'>
                  <Link href="/(tabs)/orders">
                    <AntDesign name="leftcircleo" size={40} color="gray" />
                  </Link>
                  <Text className={`text-2xl font-medium ml-5 ${theme==='dark'&&'text-white'}`}>Order summary</Text>
                </View>
                <View className={`mt-10 ${theme==='dark'?'bg-gray-600':'bg-GGray'} mx-2 rounded-lg`}>
                <View className='flex flex-row justify-between p-5'>
                    <View className='flex-1'>
                      <Text className={`text-lg ${theme==='dark'&&'text-white'}`}>{productTable[0]?.product_name}</Text>
                      <Text className={`my-2 text-lg font-bold text-GViolet ${theme==='dark'&&'text-white'}`}>₹ {productTable[0]?.price * orderTable[0]?.quantity}</Text>
                    </View>
                    <View className='flex flex-col'>
                      <Image className='w-32 h-32 overflow-hidden rounded-lg' source={{uri:productTable[0]?.image || 'dummy'}}/>
                      <View className='border flex items-center mt-2 p-2 bg-white rounded-lg border-gray-300'><Text>Qty: {orderTable[0]?.quantity}</Text></View>
                    </View>
                </View>
                <View className='flex flex-row justify-between  p-5'>
                  <View className='flex-1'>
                    <Text className={`${theme==='dark'&&'text-white'} text-xl`}>Delivering to </Text>
                    <Text className={`font-bold text-lg my-2 ${theme==='dark'&&'text-white'}`}>{userTable[0]?.name}</Text>
                    <Text className={`${theme==='dark'&&'text-white'}`}>{userTable[0]?.address}</Text>
                  </View>
                  <View className='flex-col ml-2 justify-center'>
                    <View className='bg-green-200 p-2 rounded-lg border border-green-400'>
                      <Text className='text-green-700'>ETA {date}</Text>
                    </View>
                    <View 
                      className={`my-4  border rounded-lg p-2 flex items-center ${status === 'pending' ? 'bg-orange-200 border-orange-400':status === 'recieved' ? 'bg-green-700 border-green-700' : 'bg-red-200 border-red-400' }`}>
                      <Text className={`${status === 'pending' ? 'text-orange-700':status === 'recieved' ? 'text-white' : 'text-red-700' }`}>Status : {status}</Text>
                    </View>
                    { (status !== "cancelled" && status !== "recieved")&&
                    <Pressable onPress={HandleDeleteOrder} className='bg-red-600 p-2 rounded-lg flex items-center'>
                      <Text className='text-white font-medium'>Cancel order</Text>
                    </Pressable>
                    }
                    {
                      (status === 'recieved' && orderTable[0]?.feedback === false) &&
                    <Pressable onPress={()=>setFeedbackVisible(true)} className='items-center bg-GViolet rounded-lg p-2 mb-2'>
                      <Text className='text-white'>Feedback</Text>
                    </Pressable>
                    }
                    {
                      orderTable[0]?.feedback === true &&
                      <View className='bg-gray-300 p-2 rounded-lg border border-gray-400 items-center'>
                        <Text>Feedback given</Text>
                      </View>
                    }
                  </View>
                </View>
                </View>
        </SafeAreaView>
    </View>
  )
}