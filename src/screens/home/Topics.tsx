/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import auth from '@react-native-firebase/auth';
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
    Text, View
} from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialIcons';
import SimpleIcon from 'react-native-vector-icons/SimpleLineIcons';
import tw from 'twrnc';
import ScrollScreenContainer from '../../components/layouts/ScrollScreenContainer';
import TopicCard from '../../components/TopicCard';





export type Topic = {
    id: string,
    author_name: string,
    author_uid: string,
    date_published: FirebaseFirestoreTypes.Timestamp,
    title: string,
    desc: string,
    is_callable: boolean
    call_requests?: Array<{ date_requested: FirebaseFirestoreTypes.Timestamp, uid: string }>
}

// const topics: Topic[] = [
//     {
//         title: "My first topic",
//         desc: "Hello there people of my land",
//         isCallable: true
//     },
//     {
//         title: "My 2nd topic",
//         desc: "Hello there people of pluto",
//         isCallable: false
//     },
//     {
//         title: "My best topic",
//         desc: "Hello there people of mars",
//         isCallable: true
//     },
//     {
//         title: "My radical topic",
//         desc: "Hello there people of earth",
//         isCallable: true
//     }
// ]



const Topics = () => {
    console.log("RENDERED TOPICS")


    const [topics, setTopics] = useState<Array<any>>([])

    const navigation = useNavigation();

    const fetchTopics = async () => {
        try {
            const topicDocs = await firestore().collection("topics").
            orderBy("date_published", "desc").
            limit(10).
            get()

            const tempTopics: Array<any> = [];

            topicDocs.forEach(doc => {
                const data = doc.data();

                tempTopics.push({ id: doc.id, ...data })

            })

            setTopics(tempTopics)
        } catch (error) {
            console.log(error)
        }
    }
    useEffect(() => {
        //Listen to topics collection
      
        fetchTopics();

        // return () => {
        //     subscribeTopics();
        // }
    }, [])

    return (
        <ScrollScreenContainer>
            <View style={tw`flex flex-row justify-between w-full`}>
                <Text style={tw`text-black text-4xl font-semibold`}>
                    Hello {auth().currentUser?.displayName?.split(" ")[0]}
                </Text>
                <TouchableOpacity
                    style={tw`bg-blue-900 p-2 rounded-2xl`}
                    onPress={async () => {
                        try {
                            await auth().signOut()

                        } catch (error) {
                            console.log(error)
                        }
                    }}
                >
                    <Text style={tw`text-xs text-white`}>
                        Sign out
                    </Text>
                </TouchableOpacity>
            </View>
            <View style={tw`flex-row justify-between items-center mt-5 mb-5`}>

                <View style={tw`mt-5 flex flex-col items-end `}>

                    <TouchableOpacity
                        onPress={() => {
                            navigation.navigate("RequestedTopicCallsModal" as never)
                        }}
                        style={tw`items-center`}
                    >
                        <View style={tw`rounded-full p-3 bg-blue-400 mb-1`}>
                            <SimpleIcon name="call-in" size={25} color='white' />

                        </View>

                        <Text style={tw`text-xs`}>Topic calls</Text>
                    </TouchableOpacity>
                </View>

                <View style={tw`mt-5 flex flex-col items-end `}>
                    <TouchableOpacity
                        onPress={() => {
                            navigation.navigate("CreateTopicModal" as never)
                        }}
                        style={tw`items-center`}
                    >
                        <View style={tw`rounded-full bg-green-400 p-2 mb-1`}>
                            <Icon name="add" size={30} color={'white'} />

                        </View>

                        <Text style={tw`text-xs`}>Add a topic</Text>
                    </TouchableOpacity>

                </View>


            </View>

            {/* <MotiPressable
                 animate={useMemo(
                    () => ({ hovered, pressed }) => {
                      'worklet'
            
                      return {
                        opacity: hovered || pressed ? 0.5 : 1,
                        scale:  hovered || pressed ? 0.95 : 1,
                        translateY: hovered || pressed ? -10 : 0,

                      }
                    },
                    []
                  )}
                  transition={useMemo(
                    () => ({ hovered, pressed }) => {
                      'worklet'
            
                      return {
                        delay: hovered || pressed ? 0 : 100,
                      }
                    },
                    []
                  )}
                    onPress={()=> console.log("lets animate")}
                    style={tw`rounded-lg bg-pink-700 p-3 mb-10 mt-10 w-40 self-center`}
                >
                    <Text style={tw`text-sm text-white self-center`}>Animated button</Text>
                </MotiPressable> */}
            {
                topics.map(topic => (
                    <TopicCard key={topic.id} topic={topic} />
                ))
            }
        </ScrollScreenContainer>
    );
};


export default Topics;