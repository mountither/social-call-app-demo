import React, { createContext, ReactNode, useContext, useRef, useState } from 'react'
import { RTCPeerConnection, MediaStream, RTCPeerConnectionConfiguration } from 'react-native-webrtc';
import { useNavigation } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import { mediaDevices, RTCOfferOptions, RTCSessionDescription, RTCIceCandidate, RTCIceCandidateType } from 'react-native-webrtc';
import InCallManager from 'react-native-incall-manager';
import auth from '@react-native-firebase/auth';
import { useDispatch, useSelector } from 'react-redux';
import { endCall, startCall, TopicCallState, getPeerUID } from '../redux/slices/TopicCallSlice';


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

export const RTCStreamContext = createContext<{
    isLocalTrackMuted: boolean,
    isLocalSpeaker: boolean,
    isCallAnswered: boolean,
    callInProgress: boolean,
    userCallRole: "caller" | "callee" | undefined,
    callSessionID: string | undefined,
    topicID: string | undefined,
    setCallSessionID: React.Dispatch<React.SetStateAction<string | undefined>>,
    setTopicID: React.Dispatch<React.SetStateAction<string | undefined>>,
    handleCall: (() => Promise<string | undefined>),
    handleAnswer: (sessionID: string) => Promise<void>,
    handleEnd: () => void,
    handleLocalMute: () => void,
    handleLocalSpeaker: () => void
}>({
    isLocalTrackMuted: false,
    isLocalSpeaker: false,
    isCallAnswered: false,
    callInProgress: false,
    userCallRole: undefined,
    callSessionID: undefined,
    topicID: undefined,
    setCallSessionID: () => undefined,
    setTopicID: () => undefined,
    handleCall: () => new Promise(() => undefined),
    handleAnswer: () => new Promise(() => { }),
    handleEnd: () => { },
    handleLocalMute: () => { },
    handleLocalSpeaker: () => { }
});

export const useRTCStream = () => useContext(RTCStreamContext);


const RTCStreamProvider = ({ children }: { children: ReactNode }) => {

    const [localStream, setLocalStream] = useState<MediaStream | undefined>(undefined)
    const navigation = useNavigation();

    const dispatch = useDispatch();
    const state = useSelector((state: TopicCallState) => state)

    const peerUID = getPeerUID(state);

    //! transfer to redux store
    const [isLocalTrackMuted, setIsLocalTrackMuted] = useState<boolean>(false);
    const [isLocalSpeaker, setIsLocalSpeaker] = useState<boolean>(false);

    const [callSessionID, setCallSessionID] = useState<string | undefined>(undefined)
    const [topicID, setTopicID] = useState<string | undefined>(undefined)

    const [callInProgress, setCallInProgress] = useState<boolean>(false);

    const [userCallRole, setUserCallRole] = useState<"caller" | "callee" | undefined>(undefined)


    const [isCallAnswered, setIsCallAnswered] = useState<boolean>(false);


    const pcConn = useRef<RTCPeerConnection>();



    console.log(localStream, isLocalSpeaker, isCallAnswered, callInProgress, callSessionID)
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

            setCallInProgress(true);

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
                setUserCallRole("caller")
                //* listener for remote answer
                callDoc.onSnapshot((snapshot) => {
                    const data = snapshot.data();
                    console.log("Activity @ Caller - Listening to call data")
                    if (!pcConn.current?.remoteDescription && data?.answer) {
                        setIsCallAnswered(true);
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

                setCallSessionID(callDoc.id)
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

            setCallInProgress(true);

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
                    setUserCallRole("callee")

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

            setCallSessionID(undefined);
            setCallInProgress(false);
            setIsCallAnswered(false);

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

                    //* change call in progress for that user.
                    await firestore().collection("users_call_state").doc(auth().currentUser?.uid).set({
                        call_in_progress: false
                    })

                    console.log("Deleted call request")
                }
            }


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

            setUserCallRole(undefined)

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

                    setIsLocalTrackMuted(!t.enabled)
                };
            })
        }
    }

    const handleLocalSpeaker = () => {
        if (pcConn.current && localStream) {

            InCallManager.setSpeakerphoneOn(!isLocalSpeaker)
            setIsLocalSpeaker(!isLocalSpeaker)
            InCallManager.setForceSpeakerphoneOn(!isLocalSpeaker)
        }
    }

    return (
        <RTCStreamContext.Provider
            value={{
                isLocalTrackMuted,
                isLocalSpeaker,
                isCallAnswered,
                callInProgress,
                userCallRole,
                callSessionID,
                topicID,
                setCallSessionID,
                setTopicID,
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
