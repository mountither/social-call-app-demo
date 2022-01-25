import React, { ComponentProps, ReactNode, useState } from 'react'
import { FlatList, View, Text, ScrollViewProps, FlatListProps, ListRenderItem } from 'react-native';
import tw from 'twrnc';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import OngoingCallStatusBar from '../OngoingCallStatusBar';
import { Film } from '../../screens/videos';

const FlatScrollScreenContainer = ({ itemNode, screenHeader, data, props }: { itemNode: ListRenderItem<Film>, screenHeader: ReactNode, props?: ScrollViewProps, data: any[] }) => {

    const insets = useSafeAreaInsets();


    return (
        <FlatList
            style={tw`mt-${insets.top}px`}
            data={data}
            renderItem={itemNode}
            ListHeaderComponent={() => (
                <>
                    <OngoingCallStatusBar />
                    {screenHeader}
                </>
            )}
            contentContainerStyle={tw` px-5`}
            stickyHeaderIndices={[0]}

            {...props}
        />
    )
}

export default FlatScrollScreenContainer;