import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";

export interface TTSSettingsState {
  voiceKey: string;
  speed: number;
  volume: number;
}

const getInitialState = (): TTSSettingsState => {
  if (typeof window !== "undefined") {
    const storedSettings = localStorage.getItem("tts-settings");
    if (storedSettings) {
      return JSON.parse(storedSettings);
    }
  }
  return {
    voiceKey: "fa_IR-mana-medium",
    speed: 1,
    volume: 1,
  };
};

const initialState: TTSSettingsState = getInitialState();

export const ttsSlice = createSlice({
  name: "tts",
  initialState,

  reducers: {
    setTtsSettings: (
      state,
      action: PayloadAction<Partial<TTSSettingsState>>
    ) => {
      const newState = { ...state, ...action.payload };
      if (typeof window !== "undefined") {
        localStorage.setItem("tts-settings", JSON.stringify(newState));
      }
      return newState;
    },
  },
});

export const { setTtsSettings } = ttsSlice.actions;

export const selectTtsSettings = (state: RootState) => state.tts;

export default ttsSlice.reducer;
