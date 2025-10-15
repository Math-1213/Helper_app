import { createSlice } from '@reduxjs/toolkit';

const slice = createSlice({
  name: 'user',
  initialState: { id: null, name: null },
  reducers: {
    setUser(state, action) { state.id = action.payload?.id; state.name = action.payload?.name; },
    clearUser(state) { state.id = null; state.name = null; }
  }
});

export const { setUser, clearUser } = slice.actions;
export default slice.reducer;
