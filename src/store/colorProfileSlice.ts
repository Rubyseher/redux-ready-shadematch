import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ColorProfile {
  skinTone: string | null;
  undertone: string | null;
  extractedColors: string[];
  season: string | null;
}

interface ColorProfileState {
  profile: ColorProfile;
  loading: boolean;
  error: string | null;
}

const initialState: ColorProfileState = {
  profile: {
    skinTone: null,
    undertone: null,
    extractedColors: [],
    season: null,
  },
  loading: false,
  error: null,
};

const colorProfileSlice = createSlice({
  name: "colorProfile",
  initialState,
  reducers: {
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    setColorProfile(state, action: PayloadAction<Partial<ColorProfile>>) {
      state.profile = { ...state.profile, ...action.payload };
    },
    setExtractedColors(state, action: PayloadAction<string[]>) {
      state.profile.extractedColors = action.payload;
    },
    resetProfile(state) {
      state.profile = initialState.profile;
      state.error = null;
    },
  },
});

export const { setLoading, setError, setColorProfile, setExtractedColors, resetProfile } =
  colorProfileSlice.actions;
export default colorProfileSlice.reducer;
