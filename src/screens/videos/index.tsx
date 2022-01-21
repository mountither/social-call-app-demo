import React, {useState, useCallback, useEffect} from 'react';
import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  Button,
  Alert,
  Image,
  NativeScrollEvent,
} from 'react-native';
import ScrollScreenContainer from '../../components/layouts/ScrollScreenContainer';
import tw from 'twrnc';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import YTPlayer from '../../components/YTPlayer';

const options = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

const {width, height} = Dimensions.get('window');

const films = [
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
    videoID: 'wdskyfJtyt8',
  },
  {
    title: 'Sing 2',
    year: '2021',
    desc: 'Buster and his new cast now have their sights set on debuting a new show at the Crystal Tower Theater in glamorous Redshore City...',
    videoID: 'EPZu5MA2uqI',
  },
  {
    title: 'Sing 21',
    year: '2021',
    desc: 'Buster and his new cast now have their sights set on debuting a new show at the Crystal Tower Theater in glamorous Redshore City...',
    videoID: 'EPZu5MA2uqI',
  },
  {
    title: 'Sing 22',
    year: '2021',
    desc: 'Buster and his new cast now have their sights set on debuting a new show at the Crystal Tower Theater in glamorous Redshore City...',
    videoID: 'EPZu5MA2uqI',
  },
  {
    title: 'Sing 23',
    year: '2021',
    desc: 'Buster and his new cast now have their sights set on debuting a new show at the Crystal Tower Theater in glamorous Redshore City...',
    videoID: 'EPZu5MA2uqI',
  },
];

const HEADER_HEIGHT = 40;

const isCloseToBottom = (props: NativeScrollEvent) => {
  const {layoutMeasurement, contentOffset, contentSize} = props;

  const paddingToBottom = 20;
  return (
    layoutMeasurement.height + contentOffset.y >=
    contentSize.height - paddingToBottom
  );
};

const Videos = () => {
  const [playVideoID, setPlayVideoID] = useState<string | undefined>(
    'sowGYbxTPgU',
  );

  const [loadingVideos, setLoadingVideos] = useState<boolean>(true);

  // const onStateChange = useCallback((state) => {

  //     if (state === "ended") {
  //         setPlaying(false);
  //         Alert.alert("video has finished playing!");
  //     }
  // }, []);

  return (
    <ScrollScreenContainer
      props={{
        decelerationRate: 'fast',
        snapToInterval: 400 + HEADER_HEIGHT,
        scrollEnabled: !loadingVideos,
        onScrollEndDrag: e => {
          console.log(e.nativeEvent.contentOffset);
          if (e.nativeEvent.contentOffset.y < 0) return;
          if (isCloseToBottom(e.nativeEvent)) return;
          ReactNativeHapticFeedback.trigger('impactLight', options);
        },
      }}>
      <View
        style={tw`flex flex-row justify-between w-full h-${HEADER_HEIGHT}px`}>
        <Text style={tw`text-black text-4xl font-semibold`}>Videos Demo</Text>
      </View>
      <View style={tw`p-20 ${loadingVideos ? '' : 'hidden'}`}>
        <Text style={tw`text-4xl`}>Fetching Videos...</Text>
      </View>
      {/* <Button title="Play Video" onPress={()=> setPlayVideo(!playVideo)}/> */}
      {films.map(film => (

        <View
          key={film.title}
          style={tw`flex-col h-${400}px shadow-md bg-white rounded-xl w-${width}px self-center px-2 my-5 items-center ${
            loadingVideos ? 'hidden' : ''
          }`}>

          <YTPlayer setLoading={setLoadingVideos} id={film.videoID}/>
         

          <View style={tw`self-start`}>
            <Text style={tw`text-3xl font-bold `}>{film.title}</Text>
            <Text style={tw`text-lg text-gray-500 mt-2`}>{film.year}</Text>
            <Text style={tw`text-sm text-gray-600 mt-2`}>
              {film.desc}
              <TouchableOpacity>
                <Text style={tw`text-blue-700 text-sm`}>read more</Text>
              </TouchableOpacity>
            </Text>
          </View>

          {/* <View
                            style={tw`h-5px bg-white w-${width}px self-center`}
                        /> */}
        </View>
      ))}
    </ScrollScreenContainer>
  );
};

export default Videos;
