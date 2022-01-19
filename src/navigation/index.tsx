import React, { useEffect, useState } from 'react'
import { View, Text } from 'react-native';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import firebase from '@react-native-firebase/app';
import '@react-native-firebase/functions';

import AuthStack from './authentication/AuthStack';
import tw from 'twrnc';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import HomeNavigator from './home';
import messaging from '@react-native-firebase/messaging';
import RTCStreamProvider from '../providers/RTCStreamProvider';

export const functions = firebase.app().functions('australia-southeast1');

const darkBG = "#023047";
const lightBG = "#F1ECE0"

const AppTheme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        background: lightBG
    },
};


const AppNavigation = () => {
    // Set an loading state whilst Firebase connects
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any | undefined>(undefined);

    const requestNotificationPermission = async () => {
        const authorizationStatus = await messaging().requestPermission();
        if (authorizationStatus) {
            console.log('Permission status:', authorizationStatus);
        }
    }
    useEffect(() => {
        const subscriber = auth().onAuthStateChanged((userState: any) => {

            if (userState) {
                //* check phone notif permissions
                requestNotificationPermission();
                //* set component state
                setUser(userState);
                //* get auth session token and process @ backend 
                messaging()
                    .getToken()
                    .then(async (token) => {
                        const cfRes = await functions.httpsCallable("processMessagingToken")({
                            userID: userState.uid,
                            token
                        })

                        console.log(cfRes)
                    })
                    .catch(error => {
                        console.log(error)
                    });

            }
            else {
                setUser(undefined)
            }

            if (loading) {
                setLoading(false);
            }
        });

        return () => {
            subscriber();
            // if (user) {
            //     //* in case tokens are invalid/changes to tokens.
            //     messaging().onTokenRefresh(async (token) => {
            //         console.log('Refresh Token detected');
            //         const cfRes = await functions.httpsCallable("processMessagingToken")({
            //             userID: user.uid,
            //             token
            //         })

            //         console.log(cfRes)
            //     });
            // }

        }
    }, []);


    if (loading) {
        return <View style={tw`mt-24`}><Text>Loading...</Text></View>
    }
    return (

        <NavigationContainer theme={AppTheme}>
            <RTCStreamProvider>
                {
                    user ?
                        <HomeNavigator />
                        :
                        <AuthStack />

                }

            </RTCStreamProvider>
        </NavigationContainer>
    )
}

export default AppNavigation
