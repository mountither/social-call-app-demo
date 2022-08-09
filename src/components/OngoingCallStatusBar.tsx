import React, { ComponentProps, ReactNode, useState } from 'react'
import { ScrollView, View, Text, Dimensions } from 'react-native';
import tw from 'twrnc';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { useNavigation } from '@react-navigation/native';
import { AnimatePresence, MotiView } from 'moti';
import { TopicCallState, getCallState, getMuteState, getUserCallRole } from '../redux/slices/TopicCallSlice';
import { useRTCStream } from '../providers/RTCStreamProvider';


const {width} = Dimensions.get('window');

const OngoingCallStatusBar = () => {
    const state = useSelector((state: TopicCallState) => state);


    const activeCall = getCallState(state);
    // let activeCall = true

    // const [isOpen, setIsOpen] = useState<boolean>(true);

    const navigation = useNavigation();

    const isMuted = getMuteState(state);

    const userCallRole = getUserCallRole(state);

    const {
        handleLocalMute,
        handleEnd,
    } = useRTCStream()

    const callScreen = (): string | undefined => {
        if (userCallRole === "caller") {
            return "CallerView"
        }
        else if (userCallRole === "callee") {
            return "CalleeView"
        }

        return undefined
    }
    return (
        <TouchableOpacity
        onPress={() => {
            callScreen() ? navigation.navigate(callScreen() as never) : undefined
        }
        }
        containerStyle={tw`w-${width}px self-center`}
        disabled={!activeCall}
    >
        <AnimatePresence exitBeforeEnter>
            {activeCall &&
                <MotiView
                    animate={{
                        opacity: 1,
                        scale: 1,
                    }}
                    exit={{
                        opacity: 0,
                        scale: 0,
                    }}
                    style={tw`flex-row w-full shadow-lg self-center bg-green-400 h-13 mb-0 items-center  justify-between px-3`}>
                    <Text style={tw`text-sm text-gray-200 font-bold text-center`}>Go back to call</Text>

                    <View style={tw`flex-row`}>

                        <TouchableOpacity containerStyle={tw`flex-col items-center mr-4`}
                            onPress={() => {
                                handleEnd();
                            }}
                        >
                            <View style={tw`self-center`}>
                                <Icon name="phone-slash" size={20} color={'#c44343'} />
                            </View>

                            <Text style={tw`text-xs text-red-500 font-semibold`}>End Call</Text>
                        </TouchableOpacity>

                        <TouchableOpacity containerStyle={tw`flex-col items-center `}
                            onPress={handleLocalMute}
                        >
                            <View style={tw`self-center`}>
                                <Icon name={isMuted ? "microphone-slash" : "microphone"} size={20} color={'gray'} />
                            </View>

                            <Text style={tw`text-xs text-gray-500 font-semibold`}>Mute</Text>
                        </TouchableOpacity>
                    </View>


                </MotiView>
            }

        </AnimatePresence>

    </TouchableOpacity>
    )
}

export default OngoingCallStatusBar
