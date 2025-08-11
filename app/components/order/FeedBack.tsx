import React, { useState } from "react";
import { Modal, View, Text, TextInput, Pressable } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import Toast from "react-native-toast-message";
import axios from "axios";
import  Constants  from "expo-constants";

//theme
import { useContext } from 'react';
import { ThemeContext } from '@/app/Theme/ThemProvider';

export default function Feedback({visible, onClose,user_id,prod_id,feedback}) {

    const {theme} = useContext(ThemeContext); // getting theme
    const SUPABASE_API_KEY = Constants.expoConfig.extra.SUPABASE_KEY;
    const BASE_URL = Constants.expoConfig.extra.SUPABASE_URL
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState("");
    const [isAvailable , setIsAvailable] = useState(false); // if rating available

    // Posting feedback
    async function PostFeedBack() {
    if (rating && review) {
        try {
        await axios.post(
            `${BASE_URL}/rest/v1/rating`,
            {
            user_id: user_id,
            prod_id: prod_id,
            rating: rating,
            comment: review
            },
            {
            headers: {
                apikey: SUPABASE_API_KEY,
                Authorization: `Bearer ${SUPABASE_API_KEY}`
            }
            }
        );

        console.log("feedback posted");
        Toast.show({
            type: "successToast",
            text1: "Thanks for buying",
            text2: "Feedback submitted!"
        });
        setRating(0);
        setReview("");
        feedback();
        onClose();
        } catch (err) {
        console.error("error in posting feedback", err);
        }
    }
    else{
        onClose();
        Toast.show({
            type:"ErrorToast",
            text1:"Order summary",
            text2:'All fields are required'
        })
    }
    }

    return (
    <Modal visible={visible} transparent>
        <View className="flex-1 bg-black/50 justify-center items-center">
        <View className={`${theme==='dark'?'bg-gray-700':'bg-white'} rounded-xl w-11/12 p-5`}>
            <Text className={`text-xl font-semibold mb-2 ${theme==='dark'&&'text-white'}`}>Review Order</Text>
            <Text className={`${theme==='dark'?'text-white':'bg-gray-400'} mb-4`}>How was it? Give feedback.</Text>

            <View className="flex-row mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
                <Pressable className="mr-1" key={star} onPress={() => setRating(star)}>
                    <Ionicons name={star <= rating ? "star" : "star-outline"} size={28} color="#fbbf24"/>
                </Pressable>
            ))}
            </View>

            <TextInput
            placeholderTextColor={`${theme==='dark'?'white':'black'}`}
            placeholder="Write your review"
            value={review}
            onChangeText={setReview}
            multiline
            className={`border ${theme==='dark'?'border-gray-400 text-white':'border-gray-300'} rounded-lg p-3 min-h-[100px] text-base mb-4`}
            />

            <View className="flex-row justify-end">
            <Pressable onPress={onClose} className={`px-4 py-2 rounded-lg border  mr-3  ${theme==='dark'?'border-gray-400':'border-gray-300'}`}>
                <Text className={`${theme==='dark'?'text-white':'text-gray-600'}`}>Cancel</Text>
            </Pressable>
            <Pressable onPress={PostFeedBack} className="px-4 py-2 rounded-lg bg-GViolet">
                <Text className="text-white font-semibold">Post review</Text>
            </Pressable>
            </View>
        </View>
        </View>
    </Modal>
    );
    }
