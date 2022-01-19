import { configureStore } from "@reduxjs/toolkit";
import TopicCallSlice from '../slices/TopicCallSlice';

const store = configureStore({
  reducer: {
    topicCall: TopicCallSlice
  },
});

export default store;
