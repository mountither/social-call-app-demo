import { createSlice } from '@reduxjs/toolkit';

type TopicCallSliceState = {
    activeCall: boolean,
    peerName: string | undefined,
    peerUID: string | undefined,
    callSessionID: string | undefined,
    topicID: string | undefined,
    userCallRole: "caller" | "callee" | undefined,
    isMuted: boolean,
    isSpeaker: boolean,
    isCallAnswered: boolean,
}

const init : TopicCallSliceState = {
    activeCall: false,
    peerName: undefined,
    peerUID: undefined,
    callSessionID: undefined,
    topicID: undefined,
    userCallRole: undefined,
    isMuted: false,
    isSpeaker: false,
    isCallAnswered: false,
};

export const TopicCallSlice = createSlice({
    name: 'topicCall',
    initialState: init,
    reducers: {
        startCall: (state) => {
            console.log("SLICE - STARTING CALL")
            return {
                ...state,
                activeCall: true,
                status: 'ON_CALL',
            };
        },
        setPeerDetails: (state, action) => {
            return{
                ...state,
                peerName: action.payload.peerName,
                peerUID: action.payload.peerUID,
                status: 'PEER_DETAILS_SET'
            }
        },
        setCallSessionID: (state, action) => {
            return{
                ...state,
                callSessionID: action.payload.callSessionID,
                status: 'CALL_SESSION_SET'
            }
        },
        setTopicID: (state, action) => {
            return {
                ...state,
                topicID: action.payload.topicID,
                status: "TOPIC_ID_SET"
            }
        },
        setIsCallAnswered: (state, action) => {
            return {
                ...state,
                isCallAnswered: action.payload.isCallAnswered,
                status: "CALL_ANSWER_TOGGLED"
            }
        },
        setUserCallRole: (state, action) => {
            return {
                ...state,
                userCallRole: action.payload.userCallRole,
                status: "USER_CALL_ROLE_SET"
            }
        },
        setMute: (state, action) => {
            return {
                ...state,
                isMuted: action.payload.isMuted,
                status: "MUTE_TOGGLED"
            }
        },
        setSpeaker: (state, action) => {
            return{
                ...state,
                isSpeaker: action.payload.isSpeaker,
                status: "SPEAKER_TOGGLED"
            }
        },
        endCall: state => {
            console.log("SLICE - ENDING CALL")

            return {
                ...init,
                status: 'END_CALL',
            };
        },
    },
});

export const {
    startCall,
    endCall,
    setPeerDetails,
    setCallSessionID,
    setTopicID,
    setIsCallAnswered,
    setUserCallRole,
    setMute,
    setSpeaker,
} = TopicCallSlice.actions;

export type TopicCallState = {
    topicCall: TopicCallSliceState
}

export const getCallState = (state : TopicCallState) => state.topicCall.activeCall;
export const getPeerName = (state : TopicCallState) => state.topicCall.peerName;
export const getPeerUID = (state : TopicCallState) => state.topicCall.peerUID;
export const getSpeakerState = (state : TopicCallState) => state.topicCall.isSpeaker;
export const getMuteState = (state : TopicCallState) => state.topicCall.isMuted;
export const getTopicID = (state : TopicCallState) => state.topicCall.topicID;
export const getIsCallAnswered = (state : TopicCallState) => state.topicCall.isCallAnswered;
export const getUserCallRole = (state : TopicCallState) => state.topicCall.userCallRole;
export const getCallSessionID = (state : TopicCallState) => state.topicCall.callSessionID;

export default TopicCallSlice.reducer;
