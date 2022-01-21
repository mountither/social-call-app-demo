import React, { useState } from 'react';
import YoutubePlayer from 'react-native-youtube-iframe';
import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  Button,
  Alert,
  Image,
  NativeScrollEvent,
  Pressable,
} from 'react-native';

import tw from 'twrnc';

const {width, height} = Dimensions.get('window');

const YTPlayer = ({setLoading, id}: {setLoading: Function; id: string}) => {
  const [playing, setPlaying] = useState<boolean>(false);

  return (
    <Pressable
      onPress={() => {
        if (!playing) {
          setPlaying(true);
        }
      }}>
      <View pointerEvents={playing ? undefined : 'none'}>
        <YoutubePlayer
          height={230}
          mute={true}
          width={width}
          webViewStyle={tw`rounded-t-xl`}
          play={playing}
          videoId={id}
          initialPlayerParams={{
            loop: true,
            color: 'white',
            modestbranding: true,
          }}
          // onChangeState={onStateChange}
          onError={e => console.log(e)}
          onReady={() => setLoading(false)}
        />
      </View>
    </Pressable>
  );
};

export default YTPlayer;
