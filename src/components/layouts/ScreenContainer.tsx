import React, { ReactNode } from 'react'
import { View } from 'react-native';
import tw from 'twrnc';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ScreenContainer = ({children}: {children : ReactNode}) => {
    
    const insets = useSafeAreaInsets();

    return (
        <View style={tw`mt-${insets.top}px px-4`} >
            {children}
        </View>
    )
}

export default ScreenContainer;