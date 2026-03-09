import { configureStore } from "@reduxjs/toolkit";
import colorProfileReducer from "./colorProfileSlice";
import outfitHistoryReducer from "./outfitHistorySlice";

export const store = configureStore({
  reducer: {
    colorProfile: colorProfileReducer,
    outfitHistory: outfitHistoryReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
