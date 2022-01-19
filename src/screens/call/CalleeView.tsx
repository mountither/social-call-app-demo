import RNCallKeep from 'react-native-callkeep';
import InCallManager from 'react-native-incall-manager';
import { RouteProp, useNavigation } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react'
import { NativeModules, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import tw from 'twrnc';
import firestore from '@react-native-firebase/firestore';
import { MediaStream, RTCPeerConnection, mediaDevices, RTCPeerConnectionConfiguration, RTCOfferOptions, RTCSessionDescription, RTCIceCandidate, RTCIceCandidateType } from 'react-native-webrtc';
import ActiveCallView from '../../components/ActiveCallView';
import ScreenContainer from '../../components/layouts/ScreenContainer';
import { functions } from '../../navigation';
import auth from '@react-native-firebase/auth';
import { RTCConfig } from './CallerView';
import { useDispatch, useSelector } from 'react-redux';
import { endCall, setPeerDetails, startCall, TopicCallState, getMuteState, getSpeakerState, getCallState, getCallSessionID } from '../../redux/slices/TopicCallSlice';
import { useRTCStream } from '../../providers/RTCStreamProvider';

const CalleeView = () => {
    console.log("RENDERED CALLEE VIEW")

    const navigation = useNavigation();

    const dispatch = useDispatch();

    const state = useSelector((state: TopicCallState) => state);

    const activeCall = getCallState(state);

    const isMuted = getMuteState(state);
    const isSpeaker = getSpeakerState(state)

    const callSessionID = getCallSessionID(state);

    const {
        handleAnswer,
        handleEnd,
        handleLocalMute,
        handleLocalSpeaker } = useRTCStream()

    const processAnswerCall = async () => {
        console.log("PROCESSING ANSWER CALLL")

        if (activeCall) return;

        if (!callSessionID) return;
        await handleAnswer(callSessionID);
        await firestore().collection("users_call_state").doc(auth().currentUser?.uid).set({
            call_in_progress: true
        })
        dispatch(startCall());
    }

    useEffect(() => {
        if (callSessionID) {
            processAnswerCall();

            if (Platform.OS === 'ios') {
                NativeModules.InCallManager.addListener('Proximity')
            }
        }

    }, [])

    return (
        <View style={tw`flex-1 items-center justify-center`}>
            <ActiveCallView
                handleEnd={handleEnd}
                handleLocalMute={handleLocalMute}
                handleLocalSpeaker={handleLocalSpeaker}
                isLocalSpeaker={isSpeaker}
                isLocalTrackMuted={isMuted}
            />
        </View>

    )
}

export default CalleeView
