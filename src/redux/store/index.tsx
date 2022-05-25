import { configureStore } from "@reduxjs/toolkit";
import TopicCallSlice from '../slices/TopicCallSlice';
import VideoPlayerSlice from '../slices/VideoPlayerSlice';

const store = configureStore({
  reducer: {
    topicCall: TopicCallSlice,
    videoPlayer: VideoPlayerSlice
  },
});

export default store;
