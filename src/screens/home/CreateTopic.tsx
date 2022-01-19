import { NavigationProp, ParamListBase } from '@react-navigation/native';
import React, { useEffect, useState } from 'react'
import { NavigatorIOSProps, ScrollView, Switch, Text, TextInput, View } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialIcons';
import tw from 'twrnc';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import ModalHeader from '../../components/modal/ModalHeader';

const CreateTopic = ({ navigation }: { navigation: NavigationProp<ParamListBase> }) => {
    console.log("RENDERED CREATE TOPIC MODAL")

    const [title, setTitle] = useState<string | undefined>(undefined)
    const [desc, setDesc] = useState<string | undefined>(undefined)

    const [isCallable, setIsCallable] = useState<boolean>(false);

    const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined)
    
    const onSubmit = async () => {
        try {
            if (!title || !desc) {
                setErrorMsg("fields should not be empty")
                return;
            }

            await firestore().collection("topics").doc().set({
                author_name: auth().currentUser?.displayName,
                author_uid: auth().currentUser?.uid,
                date_published: firestore.Timestamp.now(),
                title,
                desc,
                is_callable: isCallable,
            })

            navigation.goBack();

        } catch (error: any) {
            console.log(error)
            setErrorMsg(error.message)
        }
    }

    return (
        <>

            <ModalHeader title={"Create Topic"}/>
            <ScrollView style={tw`mt-0 flex flex-col px-5 py-2`}>

                <Text style={tw`text-lg `}>Title</Text>
                <TextInput
                    style={tw`h-10 m-5 border-2 p-1 rounded-lg`}
                    onChangeText={setTitle}
                    value={title}
                />

                <Text style={tw`mt-2 text-lg `}>Description</Text>
                <TextInput
                    style={tw`m-5 border-2 p-1 rounded-lg min-h-30`}
                    onChangeText={setDesc}
                    value={desc}
                    multiline
                />
                <Text style={tw`mt-2 text-lg `}>Make topic Call Requestable</Text>
                <Switch
                    trackColor={{ false: "#767577", true: "#81b0ff" }}
                    thumbColor={isCallable ? "#f5dd4b" : "#f4f3f4"}
                    style={tw`self-center mt-2`}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={setIsCallable}
                    value={isCallable}
                />

                <View style={tw`relative mt-3`}>

                    {errorMsg &&
                        <View style={tw`absolute top-0 left-0`}>

                            <Text style={tw`text-red-600 italic`}>{errorMsg}</Text>
                        </View>
                    }
                    <TouchableOpacity
                        style={tw`p-2 mt-10 bg-blue-900 self-center w-full rounded-xl`}
                        onPress={onSubmit}

                    >
                        <Text
                            style={tw`text-white text-xl text-center font-bold`}
                        >
                            Post
                        </Text>

                    </TouchableOpacity>
                </View>


            </ScrollView>

        </>

    )
}

export default CreateTopic
