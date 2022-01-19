import React, { useState } from 'react'
import { Button, ScrollView, Text, TextInput, View, TouchableOpacity } from 'react-native';
import tw from 'twrnc';
import auth from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';
import ScrollScreenContainer from '../../components/layouts/ScrollScreenContainer';

const SignIn = () => {

    const [email, setEmail] = useState<string | undefined>(undefined)
    const [password, setPassword] = useState<string | undefined>(undefined)

    const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined)


    const navigation = useNavigation();

    const onSubmit = async () => {
        try {

            if (!email || !password) {
                setErrorMsg("Please dont leave fields empty");
                return;
            }

            await auth().signInWithEmailAndPassword(email, password);


        } catch (error: any) {
            setErrorMsg(error.message as string)
        }
    }

    return (
        <ScrollScreenContainer>
            <View>
                <Text style={tw`text-3xl font-bold`}>Sign in</Text>
                <View style={tw`mt-3`}>
                    <TouchableOpacity
                        style={tw`p-2 bg-green-500 self-center rounded-xl`}
                        onPress={() => {
                            navigation.navigate("Sign Up" as never);
                        }}

                    >
                        <Text
                            style={tw`text-white text-xl`}
                        >
                            Register
                        </Text>

                    </TouchableOpacity>



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

                    <Text style={tw`mt-2 text-lg font-bold`}>Password</Text>
                    <TextInput
                        style={tw`h-10 m-5 border-2 p-1 rounded-lg`}
                        onChangeText={setPassword}
                        value={password}
                        autoCapitalize='none'
                        textContentType='password'
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
                                Sign In
                            </Text>

                        </TouchableOpacity>
                    </View>

                </View>

            </View>

        </ScrollScreenContainer>
    )
}

export default SignIn
