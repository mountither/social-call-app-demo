import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { useNavigation } from '@react-navigation/native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import React, { useEffect } from 'react';
import { Dimensions } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { getCallState, setCallSessionID, setPeerDetails, setTopicID, TopicCallState } from '../../redux/slices/TopicCallSlice';
import CalleeView from '../../screens/call/CalleeView';
import CallerView from '../../screens/call/CallerView';
import CreateTopic from '../../screens/home/CreateTopic';
import RequestedTopicCalls from '../../screens/home/RequestedTopicCalls';
import AppTabs from './AppTabs';

const { height } = Dimensions.get("window")

const { Screen, Navigator, Group } = createStackNavigator();

const forFade = ({ current }: { current: any }) => ({
    cardStyle: {
        opacity: current.progress,
    },
});

const createTopicModal = () => {
    return (
        <Screen
            name="CreateTopicModal"
            component={CreateTopic}
            options={{
                cardStyle: {
                    borderRadius: 10,
                },
            }}

        />
    )
}

const requestedTopicCallsModal = () => {
    return (
        <Screen
            name="RequestedTopicCallsModal"
            component={RequestedTopicCalls}
            options={{
                cardStyle: {
                    borderRadius: 10,
                },
            }}

        />
    )
}

const MainNavigator = () => {
    console.log("RENDERED HOME NAV")

    const navigation = useNavigation();

    const state = useSelector((state: TopicCallState) => state);

    const activeCall = getCallState(state);

    const dispatch = useDispatch();

    const processTopicCallAnswer = async (message: FirebaseMessagingTypes.RemoteMessage) => {
        try {
            const data = message?.data;
            if (!data) return;

            // console.log("IS CALL ACTIVE? ", activeCall);

            const userMetaDoc = await firestore().collection("users_call_state").doc(auth().currentUser?.uid).get();

            console.log("Call progress", userMetaDoc?.data()?.call_in_progress)
            if (userMetaDoc?.data()?.call_in_progress) {
                console.log("USER IS IN CALL")
                return;
            }

            if (!data?.callSessionID) {
                console.log("Call session was not provided")
                return;
            }

            //* check if call has been cancelled/deleted.
            const callDoc = await firestore().collection("calls").doc(data.callSessionID).get();

            if (!callDoc.exists) {
                console.log("Call session has been cancelled.")
                return;
            }

            dispatch(setPeerDetails({ peerName: data?.callerName, peerUID: data?.callerUID }))
            dispatch(setCallSessionID({ callSessionID: data?.callSessionID }))
            dispatch(setTopicID({ topicID: data?.topicID }))

            navigation.navigate("CalleeView" as never)
        }
        catch (error) {
            console.log(error)
        }
    }



    useEffect(() => {

        if (auth().currentUser) {

            //! Code scability - Add types of notifications (in this example - only calling notif is used)
            const unsubscribeOnMsg = messaging().onMessage(async remoteMessage => {
                console.log('A new FCM message arrived!', remoteMessage);
                if (remoteMessage) {
                    await processTopicCallAnswer(remoteMessage);
                }
            });

            const unsubOnNotifOpenApp = messaging().onNotificationOpenedApp(async remoteMessage => {
                console.log(
                    'Notification caused app to open from background state:',
                    remoteMessage.notification,
                );
                if (remoteMessage) {
                    await processTopicCallAnswer(remoteMessage);
                }
            });

            // Check whether an initial notification is available
            messaging()
                .getInitialNotification()
                .then(async remoteMessage => {
                    if (remoteMessage) {
                        await processTopicCallAnswer(remoteMessage);
                    }
                });

            return () => {
                unsubscribeOnMsg();
                unsubOnNotifOpenApp();
            }
        }
    }, []);

    return (

        <Navigator
            initialRouteName='Main'
            screenOptions={{
                headerShown: false
            }}
        >

            <Group>
                <Screen component={AppTabs} name="Main" />
                <Screen component={CallerView} name="CallerView" options={{ gestureEnabled: false, cardStyleInterpolator: forFade }} />
                <Screen component={CalleeView} name="CalleeView" options={{ gestureEnabled: false, cardStyleInterpolator: forFade }} />
            </Group>

            <Group
                screenOptions={{
                    presentation: "modal",
                    headerShown: false,
                    gestureEnabled: true,
                    gestureVelocityImpact: 0.005,
                    cardOverlayEnabled: true,
                    ...TransitionPresets.ModalPresentationIOS,
                }}

            >
                {createTopicModal()}
                {requestedTopicCallsModal()}

            </Group>
        </Navigator>
    )
}


export default MainNavigator
