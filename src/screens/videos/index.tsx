import React, { useState, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    Dimensions,
    TouchableOpacity,
    Button,
    Alert,
    Image,
    NativeScrollEvent,
    FlatList,
    ViewabilityConfig,
} from 'react-native';
import ScrollScreenContainer from '../../components/layouts/ScrollScreenContainer';
import tw from 'twrnc';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import YTPlayer from '../../components/YTPlayer';
import FlatScrollScreenContainer from '../../components/layouts/FlatScrollScreenContainer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NavigationProp, useNavigation } from '@react-navigation/native';

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

    const navigation = useNavigation();


    const [loadingVideos, setLoadingVideos] = useState<boolean>(true);

    // const onStateChange = useCallback((state) => {

    //     if (state === "ended") {
    //         setPlaying(false);
    //         Alert.alert("video has finished playing!");
    //     }
    // }, []);
    const insets = useSafeAreaInsets();

    const onViewableItemsChanged = useCallback(({ viewableItems, changed }: { viewableItems: any, changed: any }) => {
        //* get video id here and set as playable video
        if (viewableItems[0]?.item) {
            console.log("Visible video ID ", viewableItems[0].item.videoID);
            setPlayVideoID(viewableItems[0].item.videoID);

        }

        console.log("Changed in this iteration", changed);
    }, []);

    // console.log(loadingVideos);
    // useEffect(() => {
    //     if (films[0].videoID && !loadingVideos) {
    //         setPlayVideoID(films[0].videoID);
    //     }
    // }, [loadingVideos])
    return (
        <>
            <FlatList
                style={tw`mt-${insets.top}px`}
                contentContainerStyle={tw` px-5`}
                renderItem={({ item }: { item: Film }) => {
                    const film = item;
                    return (
                        <>

                        <View
                            key={film.title}
                            style={tw`h-${450}px w-${width}px self-center ${loadingVideos ? 'hidden' : ''
                                }`}>
                            <View style={tw`flex-row items-center justify-between px-2`}>

                                <View style={tw`flex-col w-${width * 0.15}`}>
                                    <Text style={tw`text-xl font-bold `}>{film.title}</Text>
                                    <Text style={tw`text-lg text-gray-500 mt-1`}>{film.year}</Text>
                                    {/* <Text style={tw`text-sm text-gray-600 mt-2`}>
                            {film.desc}
                            <TouchableOpacity>
                                <Text style={tw`text-blue-700 text-sm`}>read more</Text>
                            </TouchableOpacity>
                        </Text> */}
                                </View>
                                <TouchableOpacity
                                    style={tw`rounded-xl bg-red-400 px-4 py-3`}
                                >
                                    <Text style={tw`text-white font-bold text-sm`}>Discover</Text>
                                </TouchableOpacity>

                            </View>

                            <YTPlayer setLoading={setLoadingVideos} id={film.videoID} idToPlay={playVideoID} />

                        </View>
                            <View style={tw`border-white border-2 w-${width * 0.2}  self-center  mb-5`} />

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
                snapToInterval={450 + HEADER_HEIGHT + 10}
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
