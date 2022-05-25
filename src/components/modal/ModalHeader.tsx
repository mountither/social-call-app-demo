import { useNavigation } from '@react-navigation/native';
import React from 'react'
import { Text, View } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialIcons';
import tw from 'twrnc';



const ModalHeader = ({ title }: { title: string }) => {

    const navigation = useNavigation();
    return (
        <View style={tw`flex flex-col rounded-sm bg-[#F1ECE0] shadow-md`}>
            <View
                style={tw`border-2 rounded-3xl w-10 self-center border-gray-300 mt-2 h-0`}
            />
            <View style={tw`flex-row items-center px-2 w-full h-12`}>
                <View style={tw`flex-1`} />
                <View >
                    <Text style={tw`text-xl ml-3 font-semibold`}>
                        {title}
                    </Text>

                </View>
                <View
                    style={tw`flex-1 items-end`}
                >

                    <TouchableOpacity
                        onPress={() => {
                            navigation.goBack();
                        }}
                    >
                        <Icon name="close" size={25} color={"gray"} />

                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}

export default ModalHeader;