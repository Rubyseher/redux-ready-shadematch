import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface OutfitEntry {
  id: string;
  colors: string[];
  category: string;
  timestamp: number;
  shoppingLinks?: string[];
}

interface OutfitHistoryState {
  entries: OutfitEntry[];
}

const initialState: OutfitHistoryState = {
  entries: [],
};

const outfitHistorySlice = createSlice({
  name: "outfitHistory",
  initialState,
  reducers: {
    addOutfitEntry(state, action: PayloadAction<OutfitEntry>) {
      state.entries.unshift(action.payload);
    },
    removeOutfitEntry(state, action: PayloadAction<string>) {
      state.entries = state.entries.filter((e) => e.id !== action.payload);
    },
    clearHistory(state) {
      state.entries = [];
    },
  },
});

export const { addOutfitEntry, removeOutfitEntry, clearHistory } =
  outfitHistorySlice.actions;
export default outfitHistorySlice.reducer;
