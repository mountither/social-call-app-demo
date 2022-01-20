import React, { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react'
import { RTCPeerConnection, MediaStream, RTCPeerConnectionConfiguration } from 'react-native-webrtc';
import { useNavigation } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import { mediaDevices, RTCOfferOptions, RTCSessionDescription, RTCIceCandidate, RTCIceCandidateType } from 'react-native-webrtc';
import InCallManager from 'react-native-incall-manager';
import auth from '@react-native-firebase/auth';
import { useDispatch, useSelector } from 'react-redux';
import { endCall, startCall, TopicCallState, getPeerUID, setMute, setSpeaker, getSpeakerState, setIsCallAnswered, setUserCallRole, getUserCallRole, setCallSessionID, getCallSessionID, getTopicID } from '../redux/slices/TopicCallSlice';
import { AppState, AppStateEvent } from 'react-native';


// TODO - add call request amount in a seperate document that can be read effeciently.
// TODO - on implement user presence status, consider stream/firestore calls clean up.


//* this provider is to be wrapped around the app. RTC methods/classes are provided
//* try placing all the relevant callbacks here.
const STUN_SERVER = ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'];

export const RTCConfig: RTCPeerConnectionConfiguration = {
    iceServers: [
        {
            urls: STUN_SERVER,
        },
    ],
    iceCandidatePoolSize: 2
}

//! handlers are declared in this context. Other states at redux store
export const RTCStreamContext = createContext<{
    handleCall: (() => Promise<string | undefined>),
    handleAnswer: (sessionID: string) => Promise<void>,
    handleEnd: () => void,
    handleLocalMute: () => void,
    handleLocalSpeaker: () => void
}>({
    handleCall: () => new Promise(() => undefined),
    handleAnswer: () => new Promise(() => { }),
    handleEnd: () => { },
    handleLocalMute: () => { },
    handleLocalSpeaker: () => { }
});

export const useRTCStream = () => useContext(RTCStreamContext);

const RTCStreamProvider = ({ children }: { children: ReactNode }) => {

    const [localStream, setLocalStream] = useState<MediaStream | undefined>(undefined);

    const navigation = useNavigation();

    const dispatch = useDispatch();

    const state = useSelector((state: TopicCallState) => state)

    const peerUID = getPeerUID(state);
    const isSpeaker = getSpeakerState(state);
    const userCallRole = getUserCallRole(state)
    const callSessionID = getCallSessionID(state)
    const topicID = getTopicID(state)

    const pcConn = useRef<RTCPeerConnection>();

    const initCallConfig = async () => {
        try {
            console.log("Initialising audio call config")

            pcConn.current = new RTCPeerConnection(RTCConfig)

            const stream = await mediaDevices.getUserMedia({
                audio: true,
                video: false
            })

            setLocalStream(stream)

            // console.log(stream)

            //* stream listener on peer connection
            pcConn.current.addStream(stream)

            return;
        }
        catch (error) {
            console.log(error)
        }
    }
    const handleCall = async (): Promise<string | undefined> => {
        try {
            console.log("Starting a new call")


            await initCallConfig();

            const callDoc = firestore().collection("calls").doc();
            const offerCandidates = callDoc.collection("caller");
            const answerCandidates = callDoc.collection("callee");

            if (pcConn.current) {
                //* retrieve candidates for caller and save to collection
                pcConn.current.onicecandidate = event => {
                    event.candidate && offerCandidates.add({
                        sdpMLineIndex: event.candidate.sdpMLineIndex,
                        sdpMid: event.candidate.sdpMid,
                        candidate: event.candidate.candidate
                    });
                };

                //* create an offer
                //* store offer in call document
                const offerOptions: RTCOfferOptions = { offerToReceiveAudio: true, offerToReceiveVideo: false };

                const offerDesc = await pcConn.current.createOffer(offerOptions);

                console.log("Offer created")

                await pcConn.current.setLocalDescription(offerDesc)

                const offer = {
                    sdp: offerDesc.sdp,
                    type: offerDesc.type,
                };

                await callDoc.set({ offer });
                dispatch(setUserCallRole({ userCallRole: "caller" }))
                //* listener for remote answer
                callDoc.onSnapshot((snapshot) => {
                    const data = snapshot.data();
                    console.log("Activity @ Caller - Listening to call data")
                    if (!pcConn.current?.remoteDescription && data?.answer) {

                        dispatch(setIsCallAnswered({ isCallAnswered: true }));

                        console.log("Activity @ Caller - Found an answer to offer")
                        InCallManager.start({ media: 'audio' });
                        // RNCallKeep.startCall("dsgadsg", "44444", 'monti2');

                        const answerDescription = new RTCSessionDescription(data.answer);
                        pcConn.current?.setRemoteDescription(answerDescription);
                    }
                });

                //* Listen for remote ICE candidates
                answerCandidates.onSnapshot(snapshot => {
                    snapshot.docChanges().forEach((change) => {
                        console.log("Activity @ Caller - Listening to answer (callee) data")

                        if (change.type === 'added') {
                            console.log("Activity @ Caller - Found an ICE candidate")
                            const candidate = new RTCIceCandidate(change.doc.data() as RTCIceCandidateType);
                            pcConn.current?.addIceCandidate(candidate).catch(error => console.log(error));;
                        }
                        // on deletion of document by other peer. => hangup
                        if (change.type === "removed") {
                            console.log("Found removed callee data - hang up @ CALLER")

                            handleEnd();

                        }
                    });
                });

                dispatch(setCallSessionID({ callSessionID: callDoc.id }))
                dispatch(startCall())

            }
            else {
                throw Error("RTCPeerConnection is undefined")
            }
            return callDoc.id;

        }
        catch (error) {
            console.log(error)
        }
    }

    //* invoked by callee (on mount)
    const handleAnswer = async (sessionID: string) => {
        try {

            console.log("Processing answer to a call")


            const callDoc = firestore().collection('calls').doc(sessionID);
            const offerCandidates = callDoc.collection('caller');
            const answerCandidates = callDoc.collection('callee');

            const callOffer = (await callDoc.get()).data()?.offer;

            //* check if there is offer field exists
            if (callOffer) {

                await initCallConfig();

                InCallManager.start({ media: 'audio' });
                // RNCallKeep.startCall("dsgadsg", "554455", 'monti');

                // InCallManager.setForceSpeakerphoneOn(true);
                // InCallManager.setSpeakerphoneOn(true);
                if (pcConn.current) {
                    // * add the candidate data in answer sub-collection
                    pcConn.current.onicecandidate = event => {
                        event.candidate && answerCandidates.add({
                            sdpMLineIndex: event.candidate.sdpMLineIndex,
                            sdpMid: event.candidate.sdpMid,
                            candidate: event.candidate.candidate
                        });
                    };

                    //* get call data => set offer and answer
                    const callData = (await callDoc.get()).data();

                    if (callData) {

                        //* offer was created by other peer.
                        const offerDescription = callData?.offer;
                        await pcConn.current.setRemoteDescription(new RTCSessionDescription(offerDescription));
                    }

                    //* now, setlocaldesc with created answer desc
                    const answerDescription = await pcConn.current.createAnswer();
                    await pcConn.current.setLocalDescription(answerDescription);

                    const answer = {
                        type: answerDescription.type,
                        sdp: answerDescription.sdp,
                    };

                    await callDoc.update({ answer });
                    dispatch(setUserCallRole({ userCallRole: "callee" }))


                    //* listen for any offer changes in collection
                    offerCandidates.onSnapshot((snapshot) => {
                        snapshot.docChanges().forEach((change) => {
                            console.log("Activity @ Callee - Listening to offer (caller) data")
                            if (change.type === 'added') {

                                console.log("Activity @ Callee - Found a new Offer (add ice candidate)")
                                let data = change.doc.data();
                                pcConn.current?.addIceCandidate(new RTCIceCandidate(data as RTCIceCandidateType)).catch(error => console.log(error));

                            }
                            // when the caller subcollection is deleted, it has hung up.
                            if (change.type === "removed") {
                                console.log("Found removed caller data - hang up @ CALLEE")
                                handleEnd();
                            }
                        });
                    });
                }
                else {
                    throw Error("RTCPeerConnection is undefined")

                }
            }

        } catch (error) {
            console.log(error)
        }
    }

    const handleStreamCleanUp = () => {
        console.log("- - Stream clean up")

        if (pcConn.current) {

            pcConn.current.close();

            if (localStream) {
                localStream.getAudioTracks().forEach((t) => t.stop())
                localStream.release();
            }

            InCallManager.stop();
        }

    }
    const handleFirestoreCleanUp = async () => {
        try {
            console.log("- - Firestore clean up")

            //! delete the topic call request (call_requests field) from topic document.
            //* get topic document ID and remove object from 'call_requests' field
            if (topicID) {
                const topicRef = firestore().collection("topics").doc(topicID);

                const topicDoc = await topicRef.get()

                const requesterUID = userCallRole === "callee" ? auth().currentUser?.uid : peerUID;

                if (topicDoc?.data()?.call_requests) {
                    await topicRef.set({
                        call_requests: {
                            [requesterUID as string]: firestore.FieldValue.delete()
                        },
                    }, { merge: true })

                    console.log("Deleted call request")
                }
            }

            //* change call in progress for that user.
            await firestore().collection("users_call_state").doc(auth().currentUser?.uid).set({
                call_in_progress: false
            })


            //* delete current call
            const callDoc = firestore().collection("calls").doc(callSessionID);

            if (callDoc && pcConn.current) {
                (await callDoc.collection("callee").get()).forEach(async (candidate) => {
                    await candidate.ref.delete();
                });

                (await callDoc.collection("caller").get()).forEach(async (candidate) => {
                    await candidate.ref.delete();
                });

                await callDoc.delete();
            }
        } catch (error) {
            console.log(error)
        }
    }

    const handleEnd = () => {
        try {
            console.log("Hanging up @ CALLER")

            handleStreamCleanUp();
            handleFirestoreCleanUp();

            dispatch(endCall());

            navigation.canGoBack() ? navigation.goBack() : navigation.navigate("Home" as never)
            // RNCallKeep.endCall("dsgadsg");
        } catch (error) {
            console.log(error)
        }
    }
    const handleLocalMute = () => {
        if (pcConn.current && localStream) {
            console.log("Muting tracks")
            localStream.getTracks().forEach(t => {
                if (t.kind === 'audio') {
                    t.enabled = !t.enabled

                    // setIsLocalTrackMuted(!t.enabled)
                    dispatch(setMute({ isMuted: !t.enabled }))
                };
            })
        }
    }

    const handleLocalSpeaker = () => {
        if (pcConn.current && localStream) {

            InCallManager.setSpeakerphoneOn(!isSpeaker)
            dispatch(setSpeaker({ isSpeaker: !isSpeaker }))
            InCallManager.setForceSpeakerphoneOn(!isSpeaker)
        }
    }

    return (
        <RTCStreamContext.Provider
            value={{
                handleCall,
                handleAnswer,
                handleEnd,
                handleLocalMute,
                handleLocalSpeaker,
            }}
        >

            {children}
        </RTCStreamContext.Provider>

    )
}

export default RTCStreamProvider
