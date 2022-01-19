import React, { ComponentProps, ReactNode, useState } from 'react'
import { ScrollView, View, Text } from 'react-native';
import tw from 'twrnc';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import OngoingCallStatusBar from '../OngoingCallStatusBar';

const ScrollScreenContainer = ({ children }: { children: ReactNode }) => {

    const insets = useSafeAreaInsets();


    return (
        <ScrollView style={tw`mt-${insets.top}px`} contentContainerStyle={tw` px-5`} stickyHeaderIndices={[0]}>
            <OngoingCallStatusBar/>
            {children}
        </ScrollView>
    )
}

export default ScrollScreenContainer;