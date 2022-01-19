import { createSlice } from '@reduxjs/toolkit';

type TopicCallSliceState = {
    activeCall: boolean,
    peerName: string | undefined,
    peerUID: string | undefined,
    callSessionID: string | undefined,
}

const init : TopicCallSliceState = {
    activeCall: false,
    peerName: undefined,
    peerUID: undefined,
    callSessionID: undefined
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
        endCall: state => {
            console.log("SLICE - ENDING CALL")

            return {
                ...state,
                activeCall: false,
                peerName: undefined,
                peerUID: undefined,
                status: 'END_CALL',
            };
        },
    },
});

export const {
    startCall,
    endCall,
    setPeerDetails,
    setCallSessionID
} = TopicCallSlice.actions;

export type TopicCallState = {
    topicCall: TopicCallSliceState
}

export const getCallState = (state : TopicCallState) => state.topicCall.activeCall;
export const getPeerName = (state : TopicCallState) => state.topicCall.peerName;
export const getPeerUID = (state : TopicCallState) => state.topicCall.peerUID;



export default TopicCallSlice.reducer;
