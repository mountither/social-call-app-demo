import React, { useState, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    Dimensions,
    TouchableOpacity,
    NativeScrollEvent,
    FlatList,
    ViewabilityConfig,
    ViewToken,
    Platform,
} from 'react-native';
import tw from 'twrnc';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import YTPlayer from '../../components/YTPlayer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import OngoingCallStatusBar from '../../components/OngoingCallStatusBar';

const options = {
    enableVibrateFallback: true,
    ignoreAndroidSystemSettings: false,
};

const { width, height } = Dimensions.get('window');

const viewabilityConfig: ViewabilityConfig = {
    // waitForInteraction: true,
    // viewAreaCoveragePercentThreshold: 95,
    itemVisiblePercentThreshold: 90
}

export type Film = {
    title: string,
    year: string,
    desc: string,
    videoID: string,
}

const films: Film[] = [
    {
        title: 'The Hunt',
        year: '2020',
        desc: "Twelve strangers wake up in a clearing. They don't know where they are—or how they got...",
        videoID: 'sowGYbxTPgU',
    },
    {
        title: 'The Matrix Resurrections',
        year: '2021',
        desc: "Plagued by strange memories, Neo's life takes an unexpected...",
        videoID: '9ix7TUGVYIo',
    },
    {
        title: 'Sing 2',
        year: '2021',
        desc: 'Buster and his new cast now have their sights set on debuting a new show at the Crystal Tower Theater in glamorous Redshore City...',
        videoID: 'EPZu5MA2uqI',
    },
    {
        title: 'Encanto',
        year: '2021',
        desc: 'The tale of an extraordinary family, the Madrigals, who live hidden in the mountains of Colombia, in a magical house, in a vibrant town...',
        videoID: 'CaimKeDcudo',
    },
    {
        title: 'Ghostbusters: Afterlife',
        year: '2021',
        desc: 'When a single mom and her two kids arrive in a small town, they begin to discover...',
        videoID: 'ahZFCF--uRY',
    },
    {
        title: 'Resident Evil: Welcome to Raccoon City',
        year: '2021',
        desc: 'Once the booming home of pharmaceutical giant Umbrella Corporation, Raccoon City is now...',
        videoID: '4q6UGCyHZCI',
    },
];

const HEADER_HEIGHT = 40;

const isCloseToBottom = (props: NativeScrollEvent) => {
    const { layoutMeasurement, contentOffset, contentSize } = props;

    const paddingToBottom = 20;
    return (
        layoutMeasurement.height + contentOffset.y >=
        contentSize.height - paddingToBottom
    );
};

const Videos = () => {
    const [playVideoID, setPlayVideoID] = useState<string | undefined>(undefined);

    const [loadingVideos, setLoadingVideos] = useState<boolean>(Platform.OS === 'android' ? false : true);


    const insets = useSafeAreaInsets();

    const onViewableItemsChanged = useCallback(({ viewableItems, changed }: { viewableItems: ViewToken[], changed: ViewToken[] }) => {
        //* get video id here and set as playable video
        if (viewableItems[0]?.item) {
            // console.log("Visible video ID ", viewableItems[0].item.videoID);
            setPlayVideoID(viewableItems[0].item.videoID);
        }

        // console.log("Changed in this iteration", changed);
    }, []);

    return (
        <>
            <View style={tw`mt-${insets.top}px`}>
                <OngoingCallStatusBar />
            </View>

            <FlatList
                contentContainerStyle={tw`px-5 mt-5`}
                ItemSeparatorComponent={() => (
                    <View style={tw`h-0.5 bg-gray-300 rounded-xl w-${width * 0.2} self-center mb-5 ${loadingVideos ? 'hidden' : ''
                        }`} />

                )}
                renderItem={({ item }: { item: Film }) => {
                    const film = item;
                    return (
                        <>
                            <View
                                key={film.title}
                                style={tw`w-${width}px self-center h-${450}px ${loadingVideos ? 'hidden' : ''
                                    }`}>
                                <View style={tw`flex-row items-center justify-between px-2`}>

                                    <View style={tw`flex-col w-${width * 0.15}`}>
                                        <Text style={tw`text-lg font-bold `}>{film.title}</Text>
                                        <Text style={tw`text-sm text-gray-500 mt-1`}>{film.year}</Text>
                                    </View>
                                    <TouchableOpacity
                                        style={tw`rounded-xl bg-black px-4 py-2`}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={tw`text-white font-bold text-sm`}>Discover</Text>
                                    </TouchableOpacity>

                                </View>

                                <YTPlayer setLoading={setLoadingVideos} id={film.videoID} idToPlay={playVideoID} />

                            </View>

                        </>
                    )
                }}
                data={films}
                keyExtractor={(item) => item.videoID}
                ListHeaderComponent={() => (
                    <>
                        <View
                            style={tw`flex flex-row justify-between w-full h-${HEADER_HEIGHT}px mb-10`}>
                            <Text style={tw`text-black text-4xl font-semibold`}>Videos Demo</Text>
                        </View>
                        <View style={tw`p-20 ${loadingVideos ? '' : 'hidden'}`}>
                            <Text style={tw`text-4xl`}>Fetching Videos...</Text>
                        </View>
                    </>
                )}
                decelerationRate="fast"
                snapToInterval={450 + HEADER_HEIGHT}
                disableIntervalMomentum
                snapToAlignment='center'
                scrollEnabled={!loadingVideos}
                onScrollEndDrag={e => {
                    if (e.nativeEvent.contentOffset.y < 0 || isCloseToBottom(e.nativeEvent)) return;
                    ReactNativeHapticFeedback.trigger('impactLight', options);
                }}
                scrollEventThrottle={16}
                ListFooterComponent={() => (
                    <Text style={tw`mt-10 mb-20 text-4xl text-gray-400 ${loadingVideos ? 'hidden' : ''}`}>You're up to date</Text>
                )}
                viewabilityConfig={viewabilityConfig}
                onViewableItemsChanged={onViewableItemsChanged}
            />
            {/* <ScrollScreenContainer
                props={{
                    decelerationRate: "fast",
                    snapToInterval: 450 + HEADER_HEIGHT - 10,
                    snapToAlignment: 'center',
                    scrollEnabled: !loadingVideos,
                    onScrollEndDrag: e => {
                        if (e.nativeEvent.contentOffset.y < 0 || isCloseToBottom(e.nativeEvent)) return;
                        ReactNativeHapticFeedback.trigger('impactLight', options);
                    },
                    scrollEventThrottle: 16,
                }}

            >
                <View
                    style={tw`flex flex-row justify-between w-full h-${HEADER_HEIGHT}px mb-10`}>
                    <Text style={tw`text-black text-4xl font-semibold`}>Videos Demo</Text>
                </View>
                <View style={tw`p-20 ${loadingVideos ? '' : 'hidden'}`}>
                    <Text style={tw`text-4xl`}>Fetching Videos...</Text>
                </View>
                {films.map(film => (
                    <View
                        key={film.title}
                        style={tw`flex-col  justify-between h-${450}px w-${width}px self-center  mb-3 ${loadingVideos ? 'hidden' : ''
                            }`}>
                        <View style={tw`flex-row items-center justify-between px-4`}>

                            <View style={tw`flex-col w-${width * 0.15}`}>
                                <Text style={tw`text-xl font-bold `}>{film.title}</Text>
                                <Text style={tw`text-lg text-gray-500 mt-1`}>{film.year}</Text>
                            </View>
                            <TouchableOpacity
                                style={tw`rounded-xl bg-red-400 px-4 py-2`}
                            >
                                <Text style={tw`text-white font-bold text-sm`}>See more</Text>
                            </TouchableOpacity>

                        </View>

                        <YTPlayer setLoading={setLoadingVideos} id={film.videoID} />
                        <View style={tw`border-white border-2 w-${width * 0.2}  self-center my-5`} />

                    </View>

                ))
                }

                <Text style={tw`mt-10 mb-20 text-4xl text-gray-400 ${loadingVideos ? 'hidden' : ''}`}>You're upto date</Text>
            </ScrollScreenContainer> */}
        </>

    )

};

export default Videos;
