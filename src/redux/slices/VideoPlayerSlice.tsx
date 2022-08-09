import { createSlice } from '@reduxjs/toolkit';

type VideoPlayerSliceState = {
    isMuted: boolean,
}

//* Initial State
const init : VideoPlayerSliceState = {
    isMuted: true,
};

//* reducers (mutations)
export const VideoPlayerSlice = createSlice({
    name: 'videoPlayer',
    initialState: init,
    reducers: {
        triggerMute: (state) => {
            return {
                ...state,
                isMuted: !state.isMuted,
                status: 'MUTE_SET',
            };
        },
    },
});

//* actions
export const {
    triggerMute,
} = VideoPlayerSlice.actions;

export type VideoPlayerState = {
    videoPlayer: VideoPlayerSliceState
}
//* getters
export const getVideoMuteState = (state : VideoPlayerState) => state.videoPlayer.isMuted;

//* reducer - register this @ store
export default VideoPlayerSlice.reducer;
