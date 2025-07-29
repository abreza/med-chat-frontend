import { configureStore } from "@reduxjs/toolkit";
import ttsReducer from "./slices/ttsSlice";

export const store = configureStore({
  reducer: {
    tts: ttsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
