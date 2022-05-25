import React, { useEffect, useMemo, useRef, useState } from 'react';
import YoutubePlayer, { YoutubeIframeRef } from 'react-native-youtube-iframe';
import {
  Dimensions, View,
} from 'react-native';

import tw from 'twrnc';
import Icon from 'react-native-vector-icons/Octicons';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useDispatch, useSelector } from 'react-redux';
import { setMute } from '../redux/slices/TopicCallSlice';
import { VideoPlayerState, getVideoMuteState, triggerMute } from '../redux/slices/VideoPlayerSlice';
import { MotiView } from 'moti';
import { MotiPressable } from 'moti/interactions';

const { width, height } = Dimensions.get('window');

const YTPlayer = ({ setLoading, id, idToPlay }: { setLoading: Function; id: string, idToPlay: string | undefined }) => {

  const vidRef = useRef<YoutubeIframeRef>(null);

  const dispatch = useDispatch()

  const state = useSelector((state: VideoPlayerState) => state)

  const isMuted = getVideoMuteState(state);

  return (
    <View style={tw`relative`}>
      <YoutubePlayer
        ref={vidRef}
        height={370}
        mute={isMuted}
        width={width}
        webViewStyle={tw`rounded-sm mt-3 mx-0`}
        webViewProps={{
          injectedJavaScript: `
            var element = document.getElementsByClassName('container')[0];
            element.style.position = 'unset';
            true;
          `,
          androidLayerType:'hardware'
        }}
        play={id === idToPlay}
        playList={[id]}
        initialPlayerParams={{
          loop: true,
          color: 'white',
          // modestbranding: true,
          controls: false
        }}
        onError={e => console.log(e)}
        onReady={() => setLoading(false)}
      />
      <MotiPressable style={tw`bg-gray-700 p-2 rounded-full mt-2`} containerStyle={tw`absolute bottom-3 left-3 `} onPress={() => dispatch(triggerMute())}
        animate={useMemo(
          () => ({ hovered, pressed }) => {
            'worklet'

            return {
              opacity: hovered || pressed ? 0.5 : 1,
              translateY: hovered || pressed ? -5 : 0,
            }
          },
          []
        )}
        transition={useMemo(
          () => ({ hovered, pressed }) => {
            'worklet'
  
            return {
              delay: hovered || pressed ? 0 : 300,
            }
          },
          []
        )}
      >

        <Icon name={isMuted ? "mute" : "unmute"} size={15} color={'white'} />
      </MotiPressable>

    </View>

  );
};

export default YTPlayer;
