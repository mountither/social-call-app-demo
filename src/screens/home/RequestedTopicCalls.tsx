import React, { useEffect, useState } from 'react'
import ModalHeader from '../../components/modal/ModalHeader'
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { ScrollView, Text, View, TouchableOpacity, RefreshControl } from 'react-native';
import tw from 'twrnc';
import { useNavigation } from '@react-navigation/native';
import { functions } from '../../navigation';
import { setPeerDetails, TopicCallState, getCallState } from '../../redux/slices/TopicCallSlice';
import { useDispatch, useSelector } from 'react-redux';
import Toast from 'react-native-toast-message';

type RequestedCalls = {
    requestors: Array<{ id: string, name: string, date_requested: FirebaseFirestoreTypes.Timestamp }>
    title: string,
    id: string,
    topicPubDate: string,
}

const RequestedTopicCalls = () => {
    console.log("RENDERED REQ TOPIC CALLS MODAL")

    const navigation = useNavigation();

    const dispatch = useDispatch()
    const [callReqTopics, setCallReqTopics] = useState<Array<RequestedCalls> | undefined>(undefined);
    const state = useSelector((state: TopicCallState) => state)
    const activeCall = getCallState(state)

    const [fetchingRequests, setFetchingRequests] = useState<boolean>(false)

    //* [call_requests.user_uid] :{
    //*     date_requested: ...,
    //*     uid: ... ?  
    //*}
    useEffect(() => {
        const unsubscribe = firestore()
        .collection("topics")
        .where("author_uid", "==", auth().currentUser?.uid)
        .orderBy("date_published", "desc")
        .onSnapshot(async snapshot => {
            const tempRequestedCalls: RequestedCalls[] = []
            setFetchingRequests(true)

            for (const doc of snapshot.docs) {
                const data = doc.data();

                if (!data.is_callable) {
                    setFetchingRequests(false)
                    return;
                }

                const tempUserDetails = [];

                if (data.call_requests) {

                    //userUID => key
                    for (var userUID in data.call_requests) {
                        const details = await fetchRequesterDetails(userUID);
                        tempUserDetails.push({
                            name: details?.name,
                            date_requested: data.call_requests[userUID].date_requested,
                            id: userUID
                        })
                    }
                }


                tempRequestedCalls.push({
                    title: data.title,
                    topicPubDate: data.date_published,
                    requestors: tempUserDetails,
                    id: doc.id
                })

            }
            setCallReqTopics(tempRequestedCalls);
            setFetchingRequests(false)

        },
            error => {
                console.log(error);
                setFetchingRequests(false)

            })
        return () => {
            unsubscribe();
        }
    }, [])

    const fetchRequesterDetails = async (uid: string) => {
        try {

            const requesterDoc = await firestore().collection("users").doc(uid).get();

            if (!requesterDoc.exists) return;

            const userData = requesterDoc.data();
            return {
                name: userData?.name,
            }

        } catch (error) {
            console.log(error)
        }
    }


    const acceptCallHandler = async ({ calleeName, calleeUID, topicID }: { calleeName: string, calleeUID: string, topicID: string }) => {
        try {

            //! check if topic still exists
            const topicDoc = await firestore().collection("topics").doc(topicID).get();

            if(!topicDoc.exists){
                Toast.show({
                    type: 'error',
                    text1: 'Your topic does not exist anymore',
                });
                return;
            }

            // ! check if user's call request still exists
            if(!topicDoc?.data()?.call_requests[calleeUID]){
                Toast.show({
                    type: 'error',
                    text1: 'The requester has cancelled this call request',
                });
                return;
            }

            //! check if user is in an ongoing call
            const userMetaDoc = await firestore().collection("users_call_state").doc(calleeUID).get();
            if(userMetaDoc?.data()?.call_in_progress){
                Toast.show({
                    type: 'info',
                    text1: 'This user is currently in a call',
                    text2: 'Please, try again later.',

                });
                return;
            }
            

            //* render an 'awaiting response from user' screen
            navigation.goBack();

            dispatch(setPeerDetails({
                peerName: calleeName,
                peerUID: calleeUID,

            }));

            setTimeout(() => {
                navigation.navigate("CallerView" as never, { topicID } as never);

            }, 300)

            //* 3. @ CallerView => start a webrtc call (create offer) and let the other peer that thier call request has been accepted via FCM.

        } catch (error) {
            console.log(error)
        }
    }

    // const onRefresh = () => {
    //     fetchUserTopicCalls();
    // }
    return (
        <>
            <ModalHeader title={"Requested Calls"} />

            <ScrollView
                style={tw`pt-10 px-3`}
                // refreshControl={
                //     <RefreshControl
                //         refreshing={refreshing}
                //         onRefresh={onRefresh}
                //         tintColor={"black"}
                //     />
                // }
            >
                {
                    callReqTopics?.map(topic => {
                        if (topic.requestors.length === 0) return

                        return (
                            <View key={topic.id} style={tw`mb-5`}>
                                <View style={tw`mb-3 border-b-2 border-pink-400`}>
                                    <Text style={tw`text-sm`}>
                                        <Text >Your topic</Text>
                                        <Text style={tw`font-bold text-gray-600 italic`}> {topic.title} </Text>
                                        <Text >has {topic.requestors.length} call requests</Text>
                                    </Text>
                                </View>
                                {
                                    topic.requestors.map((req) => (
                                        <View key={req.id} style={tw`relative pl-5 ios:shadow-sm bg-blue-100 rounded-lg mb-3 p-3`}>
                                            <Text
                                                style={tw`absolute top-2 right-2 text-xs text-gray-600`}
                                            >{new Date(req.date_requested.seconds * 1000).toDateString() + " at " + new Date(req.date_requested.seconds * 1000).toTimeString().substring(0, 5)}</Text>

                                            <View style={tw`flex-col justify-center`}>
                                                <View style={tw`w-15 h-15 rounded-full bg-indigo-400`} />
                                                <Text style={tw`text-sm text-gray-600 mt-1`}>{req.name}</Text>

                                            </View>
                                            <TouchableOpacity
                                                style={tw`absolute bottom-2 right-2 rounded-xl ${activeCall ? 'bg-gray-400' : 'bg-green-400'} p-2`}
                                                onPress={() => acceptCallHandler({ calleeName: req.name, calleeUID: req.id, topicID: topic.id })}
                                                disabled={activeCall}

                                            >
                                                <Text style={tw`text-sm text-white`}>
                                                    Accept call request
                                                </Text>
                                            </TouchableOpacity>

                                        </View>
                                    ))
                                }
                            </View>

                        )
                    })
                }
            </ScrollView>

        </>
    )
}

export default RequestedTopicCalls
