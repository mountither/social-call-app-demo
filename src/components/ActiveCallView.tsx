import React from 'react'
import { Text, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import tw from 'twrnc';
import { useNavigation } from '@react-navigation/native';
import ScreenContainer from './layouts/ScreenContainer';
import { useSelector } from 'react-redux';
import { getPeerName, TopicCallState } from '../redux/slices/TopicCallSlice';
import { MotiView } from 'moti';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';


type ActiveCallViewProps = {
    handleLocalSpeaker: () => void,
    handleLocalMute: () => void,
    handleEnd: () => void,
    isLocalSpeaker: boolean,
    isLocalTrackMuted: boolean
}

const ActiveCallView = ({ handleEnd, handleLocalMute, handleLocalSpeaker, isLocalSpeaker, isLocalTrackMuted }: ActiveCallViewProps) => {

    const navigation = useNavigation();

    const state = useSelector((state: TopicCallState) => state)

    const peerName = getPeerName(state);

    return (
        <>
            <TouchableOpacity onPress={() => navigation.goBack()} containerStyle={tw`absolute flex-1 top-10 left-5 z-10`}>
                <MaterialIcons name='arrow-back' size={35} />
            </TouchableOpacity>
            <View
                style={tw`flex-1 items-center justify-center`}>

                <View style={tw`w-45 h-45 rounded-full bg-indigo-400`} />
                <Text style={tw`text-2xl text-gray-500 mt-3 `}>{peerName}</Text>

                <View style={tw`absolute bottom-10 flex-row justify-between`}>
                    <TouchableOpacity
                        onPress={handleLocalSpeaker}
                        style={tw`flex-col items-center rounded-lg bg-indigo-600 p-3 mr-10 ${isLocalSpeaker? '': 'bg-opacity-30'}`}
                    >
                        <FontAwesome5 name="volume-up" color="white" size={20} style={tw`mb-2`}/>
                        <Text style={tw`text-xs text-white`}>{isLocalSpeaker ? 'Speaker on' : "Speaker off"}</Text>

                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleLocalMute}
                        style={tw`flex-col items-center rounded-lg bg-gray-600 p-3 mr-10`}
                    >   
                        <FontAwesome5 name={isLocalTrackMuted ? "microphone-slash" : "microphone"} color="white" size={20} style={tw`mb-2`}/>
                        <Text style={tw`text-xs text-white`}>{isLocalTrackMuted ? 'Muted' : "Mute"}</Text>

                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleEnd}
                        style={tw`flex-col items-center rounded-lg bg-red-600 p-3 `}
                    >
                        <FontAwesome5 name="phone-slash" size={20} color={'white'} style={tw`mb-2`}/>
                        <Text style={tw`text-xs text-white`}>End</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </>

    )
}

export default ActiveCallView
