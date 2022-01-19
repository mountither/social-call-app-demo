import React from 'react'
import { Text, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialIcons';
import tw from 'twrnc';
import { useNavigation } from '@react-navigation/native';
import ScreenContainer from './layouts/ScreenContainer';
import { useSelector } from 'react-redux';
import { getPeerName, TopicCallState } from '../redux/slices/TopicCallSlice';
import { MotiView } from 'moti';

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
                <Icon name='arrow-back' size={35} />
            </TouchableOpacity>
            <View
                style={tw`flex-1 items-center justify-center`}>

                <View style={tw`w-45 h-45 rounded-full bg-indigo-400`} />
                <Text style={tw`text-2xl text-gray-500 mt-3 `}>{peerName}</Text>

                <View style={tw`absolute bottom-10 flex-row justify-between`}>
                    <TouchableOpacity
                        onPress={handleLocalSpeaker}
                        style={tw`rounded-lg bg-indigo-600 p-3 mr-10`}
                    >

                        <Text style={tw`text-xs text-white`}>{isLocalSpeaker ? 'Speaker on' : "Speaker off"}</Text>

                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleLocalMute}
                        style={tw`rounded-lg bg-gray-600 p-3 mr-10`}
                    >

                        <Text style={tw`text-xs text-white`}>{isLocalTrackMuted ? 'Muted' : "Mute"}</Text>

                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleEnd}
                        style={tw`rounded-lg bg-red-600 p-3 `}
                    >
                        <Text style={tw`text-xs text-white`}>End</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </>

    )
}

export default ActiveCallView
