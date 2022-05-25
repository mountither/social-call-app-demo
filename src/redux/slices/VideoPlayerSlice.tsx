import { createSlice } from '@reduxjs/toolkit';

type VideoPlayerSliceState = {
    isMuted: boolean,
}

const init : VideoPlayerSliceState = {
    isMuted: true,
};

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

export const {
    triggerMute,
} = VideoPlayerSlice.actions;

export type VideoPlayerState = {
    videoPlayer: VideoPlayerSliceState
}

export const getVideoMuteState = (state : VideoPlayerState) => state.videoPlayer.isMuted;

export default VideoPlayerSlice.reducer;
