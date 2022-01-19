import React, { useEffect, useMemo, useState } from 'react'
import { Text, TouchableOpacity, View, Dimensions } from 'react-native';
import tw from 'twrnc';
import { Topic } from '../screens/home/Topics';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { MotiPressable } from 'moti/interactions';
import Toast from 'react-native-toast-message';


const { width } = Dimensions.get('window')

// TODO add cancel call request function


type TopicCardProps = {
    topic: Topic
}

const TopicCard = ({ topic }: TopicCardProps) => {


    const [hasUserRequestedCall, setHasUserRequestedCall] = useState<boolean>(false)

    const currentUserUID = auth().currentUser?.uid as string;

    useEffect(() => {

        let hasRequested = false;
        for (var userUID in topic?.call_requests) {
            if (userUID === auth().currentUser?.uid) {
                hasRequested = true;
            }
        }
        setHasUserRequestedCall(hasRequested)

    }, [topic.call_requests])

    const requestCallHandler = async () => {
        try {
            if (!topic.is_callable && auth().currentUser?.uid == topic.author_uid) {
                console.log("Error requesting call. Either topic is not callable or user cannot access this resource")
                return;
            }
            //* add this request to the topic's field "call_requests"
            //* the field should include the requester's uid. 

            const topicRef = firestore().collection("topics").doc(topic.id);

            const topicDoc = await topicRef.get()
            if (!topicDoc.exists) {
                console.log("Topic document is non existent");
                Toast.show({
                    type: 'error',
                    text1: "Topic does not exist anymore",
                    text2: 'Please refresh your feed',
                });
                return;
            }
            //* chnage check with count of requests (add field to reflect the count)
            if (topicDoc?.data()?.call_requests) {
                for (var userUID in topicDoc?.data()?.call_requests) {
                    if (userUID === auth().currentUser?.uid) {
                        console.log("You have already requested a call")
                        Toast.show({
                            type: 'error',
                            text1: 'You have already requested a call',
                            text2: 'Your call request is still pending.',
                        });
                        return;
                    }
                }
            }

            await topicRef.update({
                [`call_requests.${currentUserUID}`]: {
                    date_requested: firestore.Timestamp.now()
                }
            });
            setHasUserRequestedCall(true)
            Toast.show({
                type: 'success',
                text1: 'You have requested a call',
                text2: 'You will be notified when the author of topic accepts your call'
            });
            console.log("Added new call requester to topic")

        } catch (error) {
            console.log(error)
        }
    }

    const cancelCallRequest = async () => {
        try {
            //! delete object inside call_requests field in topic

            const topicRef = firestore().collection("topics").doc(topic.id);

            const topicDoc = await topicRef.get()
            if (!topicDoc.exists) {
                console.log("Topic document is non existent");
                Toast.show({
                    type: 'error',
                    text1: "Topic does not exist anymore",
                    text2: 'Please refresh your feed',
                });
                return;
            }

            if (topicDoc?.data()?.call_requests) {
                await topicRef.set({
                    call_requests:{
                        [currentUserUID]: firestore.FieldValue.delete()
                    }
                }, { merge: true })

                Toast.show({
                    type: 'info',
                    text1: "Your call request has been cancelled",
                });
                setHasUserRequestedCall(false);
            }

        } catch (error) {
            console.log(error)
        }
    }

    return (
        <View style={tw`relative px-10 py-9 mt-2 flex flex-col items-center ${auth().currentUser?.uid != topic.author_uid ? 'bg-gray-100' : 'bg-green-100'} w-${width}px self-center`}>
            <View style={tw`absolute top-2 right-2`}>
                <Text style={tw`text-xs text-gray-500`}>{new Date(topic.date_published.seconds * 1000).toDateString() + " " + new Date(topic.date_published.seconds * 1000).toTimeString().substring(0, 5)}</Text>
            </View>
            <View style={tw`absolute top-2 left-2`}>
                <Text style={tw`text-xs text-gray-500`}>{topic.author_name}</Text>
            </View>

            <Text style={tw`text-3xl mt-3`}>{topic.title}</Text>
            <Text style={tw`text-sm mt-5`}>{topic.desc}</Text>
            {(topic.is_callable && auth().currentUser?.uid != topic.author_uid) &&
                <MotiPressable
                    animate={useMemo(
                        () => ({ hovered, pressed }) => {
                            'worklet'

                            return {
                                opacity: hovered || pressed ? 0.5 : 1,
                                scale: hovered || pressed ? 0.95 : 1,
                                translateY: hovered || pressed ? -5 : 0,

                            }
                        },
                        []
                    )}
                    transition={useMemo(
                        () => ({ hovered, pressed }) => {
                            'worklet'

                            return {
                                delay: hovered || pressed ? 0 : 300,
                            }
                        },
                        []
                    )}
                    containerStyle={tw`mt-10 shadow-md rounded-lg p-3 ${hasUserRequestedCall ? 'bg-yellow-300' : 'bg-green-500'}  self-end`}
                    onPress={() => { hasUserRequestedCall ? cancelCallRequest() : requestCallHandler() }}
                >

                    <Text style={tw`text-xs text-white font-bold`}>{hasUserRequestedCall ? "Cancel Request" : 'Request a call'}</Text>
                </MotiPressable>}

        </View>

    )
}

export default TopicCard
