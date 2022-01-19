import { RouteProp, useNavigation } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react'
import { Platform, ScrollView, Text, TouchableOpacity, View, NativeModules } from 'react-native';
import tw from 'twrnc';
import firestore from '@react-native-firebase/firestore';
import { MediaStream, RTCPeerConnection, mediaDevices, RTCPeerConnectionConfiguration, RTCOfferOptions, RTCSessionDescription, RTCIceCandidate, RTCIceCandidateType } from 'react-native-webrtc';
import InCallManager from 'react-native-incall-manager';
import ActiveCallView from '../../components/ActiveCallView';
import ScreenContainer from '../../components/layouts/ScreenContainer';
import { functions } from '../../navigation';
import auth from '@react-native-firebase/auth';
import { endCall, setPeerDetails, startCall, TopicCallState, getPeerName, getPeerUID } from '../../redux/slices/TopicCallSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useRTCStream } from '../../providers/RTCStreamProvider';
import { MotiView } from 'moti';

const STUN_SERVER = ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'];

export const RTCConfig: RTCPeerConnectionConfiguration = {
    iceServers: [
        {
            urls: STUN_SERVER,
        },
    ],
    iceCandidatePoolSize: 10
}

const CallerView = ({route}: {route :any}) => {
    console.log("RENDERED CALLER VIEW")

    const navigation = useNavigation();

    const state = useSelector((state: TopicCallState) => state);

    const peerUID = getPeerUID(state);
    const peerName = getPeerName(state);



    const {
        isLocalTrackMuted,
        isLocalSpeaker,
        isCallAnswered,
        callInProgress,
        setTopicID,
        handleCall,
        handleEnd,
        handleLocalMute,
        handleLocalSpeaker } = useRTCStream()

    const processCallSession = async () => {
        try {
            console.log("Proccesing Call session @ CALLER")

            if (callInProgress) return;

            //* create a call
            const sessionID = await handleCall()
            await firestore().collection("users_call_state").doc(auth().currentUser?.uid).set({
                call_in_progress: true
            })
            const topicID = route?.params?.topicID

            if (!peerUID || !sessionID || !topicID) {
                throw Error("The relevant callee/call information must be provided to continue with call.")
            }

            setTopicID(topicID);
            //* send info via cf => notify callee of session

            const sendData = functions.httpsCallable("notifyUserTopicCallAccept");

            const cfRes = await sendData({
                receiverID: peerUID,
                callSessionID: sessionID,
                notifierName: auth().currentUser?.displayName,
                topicID
            })

            console.log(cfRes)

        } catch (error) {
            console.log(error)
            // handleEnd();

        }
    }

    useEffect(() => {
        processCallSession();

        if (Platform.OS === 'ios') {
            NativeModules.InCallManager.addListener('Proximity')
        }

    }, [])

    return (
        <View style={tw`flex-1 items-center justify-center`}>
            {(!isCallAnswered) ?
                <>
                    <Text style={tw`text-gray-600 text-2xl  mt-10 px-5 text-center`}>
                        <Text>Awaiting a response from</Text>
                        <Text style={tw`font-semibold text-black`}>{"\n"}{peerName}</Text>
                    </Text>
                    <View style={tw`w-80 border-pink-200 border-2 self-center mt-10 border-dotted`} />
                    <TouchableOpacity
                        onPress={() => {
                            handleEnd();
                        }}
                        style={tw`rounded-xl p-2 bg-red-400 items-center w-40% self-center mt-10`}>
                        <Text style={tw`text-lg font-bold text-white`}>Cancel</Text>
                    </TouchableOpacity>
                </> :
                <MotiView
                    from={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ type: 'timing', duration: 800 }}
                    style={tw`relative w-full h-full`}
                    >
                    <ActiveCallView
                        handleEnd={handleEnd}
                        handleLocalMute={handleLocalMute}
                        handleLocalSpeaker={handleLocalSpeaker}
                        isLocalSpeaker={isLocalSpeaker}
                        isLocalTrackMuted={isLocalTrackMuted} />
                </MotiView>

            }
        </View>

    )
}


export default CallerView
