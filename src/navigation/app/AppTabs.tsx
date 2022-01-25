import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React, { useEffect } from 'react'
import HomeNavigator from '.';
import Topics from '../../screens/home/Topics';

import Icon from 'react-native-vector-icons/Ionicons'
import HomeStack from './HomeStack';
import CreateTopic from '../../screens/home/CreateTopic';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { View, Text, Dimensions } from 'react-native';
import { MotiView } from 'moti';
import { MotiPressable } from 'moti/interactions';
import Videos from '../../screens/videos/index';
import tw from 'twrnc';

const { width } = Dimensions.get('window')
const Tabs = createBottomTabNavigator();


const AppTabs = () => {
    //! when user exits app when on call call in prog field is not changed
    //* this is changed here, since no onDestory-like method exists in js
    const changeUserCallInProgress = async () => {
        try {
            await firestore().collection("users_call_state").doc(auth().currentUser?.uid).set({
                call_in_progress: false
            })
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        if (auth().currentUser) {
            changeUserCallInProgress();
        }
    }, [])
    return (
        <Tabs.Navigator
            initialRouteName="Home"
            screenOptions={({ route }) => ({
                tabBarStyle: tw`bg-[#F1ECE0]`,
                tabBarActiveTintColor: "#4f4f4f",
                tabBarInactiveTintColor: "#a6a6a6",
                headerShown: false,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    switch (route.name) {
                        case "Home":
                            iconName = focused ? 'home' : 'home-outline';
                            break;
                        case "Videos":
                            iconName = focused ? 'videocam' : 'videocam-outline';
                            break;
                        default:
                            break;
                    }

                    return (
                            <Icon name={iconName as string} size={size} color={color} />
                    )
                },
            })}>
            <Tabs.Screen
                name={"Home"}
                component={HomeStack}
            />
            <Tabs.Screen
                name={"Videos"}
                component={Videos}
            />
        </Tabs.Navigator>
    )
}

export default AppTabs
