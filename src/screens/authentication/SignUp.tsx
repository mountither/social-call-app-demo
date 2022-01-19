import React, { useState } from 'react'
import { Button, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import tw from 'twrnc';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { NavigationProp, ParamListBase } from '@react-navigation/native';
import ScrollScreenContainer from '../../components/layouts/ScrollScreenContainer';

const SignUp = ({navigation}: {navigation: NavigationProp<ParamListBase>}) => {

    const [email, setEmail] = useState<string | undefined>(undefined)
    const [name, setName] = useState<string | undefined>(undefined)
    const [password, setPassword] = useState<string | undefined>(undefined)

    const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined)

    const onSubmit = async () => {
        try {

            if (!email || !name || !password) {
                setErrorMsg("Please dont leave fields empty");
                return;
            }

            const authResponse = await auth().createUserWithEmailAndPassword(email, password);

            authResponse.user.updateProfile({
                displayName: name
            })


            //create doc in firestore for the user.
            await firestore().collection("users").doc(authResponse.user.uid).set({
                name,
                email
            })

        } catch (error: any) {
            setErrorMsg(error.message as string)
        }
    }

    return (
        <ScrollScreenContainer>
            <View>
                <View style={tw`flex-row items-center justify-between`}>
                    <TouchableOpacity
                        onPress={()=>{
                            navigation.goBack()
                        }}
                    >

                        <Icon name="arrow-back" size={30} />
                    </TouchableOpacity>

                    <Text style={tw`text-3xl font-bold self-center`}>Sign up</Text>
                </View>

                <View style={tw`mt-5 flex flex-col`}>

                    <Text style={tw`text-lg font-bold`}>Email address</Text>
                    <TextInput
                        style={tw`h-10 m-5 border-2 p-1 rounded-lg`}
                        onChangeText={setEmail}
                        keyboardType='email-address'
                        autoCapitalize='none'
                        value={email}
                    />

                    <Text style={tw`mt-2 text-lg font-bold`}>Name</Text>
                    <TextInput
                        style={tw`h-10 m-5 border-2 p-1 rounded-lg`}
                        onChangeText={setName}
                        value={name}
                    />

                    <Text style={tw`mt-2 text-lg font-bold`}>Password</Text>
                    <TextInput
                        style={tw`h-10 m-5 border-2 p-1 rounded-lg`}
                        onChangeText={setPassword}
                        textContentType='password'
                        autoCapitalize='none'
                        value={password}
                    />
                    <View style={tw`relative mt-3`}>

                        {errorMsg && <Text style={tw`absolute top-15 left-10 text-red-600 mt-3 italic`}>{errorMsg}</Text>}

                        <TouchableOpacity
                            style={tw`p-2 bg-blue-900 self-center rounded-xl`}
                            onPress={onSubmit}

                        >
                            <Text
                                style={tw`text-white text-xl`}
                            >
                                Create Account
                            </Text>

                        </TouchableOpacity>
                    </View>

                </View>

            </View>

        </ScrollScreenContainer>
    )
}

export default SignUp
