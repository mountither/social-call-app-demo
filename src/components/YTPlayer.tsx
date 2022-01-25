import React, { useCallback, useMemo, useState } from 'react';
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
import InViewPort from '../utils/InViewPort';
import InViewPortX from '../utils/InViewPortX';

const {width, height} = Dimensions.get('window');

const YTPlayer = ({setLoading, id, idToPlay}: {setLoading: Function; id: string, idToPlay:string | undefined}) => {
  const [playing, setPlaying] = useState<boolean>(false);


  // const onStateChange = (state: any) => {
  //   console.log(state);

  // }
  const OnVisibilty = useCallback((isVisible : boolean) => {
    // console.log('Video ' + id + ' is now %s', isVisible ? 'visible' : 'hidden');
    setPlaying(isVisible);
  }, [])

  return (
    // <InViewPortX onChange={(isVisible: any)=>OnVisibilty(isVisible)}>
    // <Pressable
    //   onPress={() => {
    //     if (!playing) {
    //       setPlaying(true);
    //     }
    //   }}>
      // <View pointerEvents={playing ? undefined : 'none'}>
        <YoutubePlayer
          height={350}
          mute={true}
          width={width}
          webViewStyle={tw`rounded-sm mt-3 mx-0`}
          webViewProps={{
            injectedJavaScript: `
              var element = document.getElementsByClassName('container')[0];
              element.style.position = 'unset';
              true;
            `,
          }}
          play={id === idToPlay}
          playList={[id]}
          initialPlayerParams={{
            loop: true,
            color: 'white',
            modestbranding: true,
          }}
          // onChangeState={onStateChange}
          onError={e => console.log(e)}
          onReady={() => setLoading(false)}
        />
    //   </View>
    // </Pressable>
    // </InViewPortX>

  );
};

export default YTPlayer;
