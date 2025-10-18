import { createSlice } from '@reduxjs/toolkit';

const avgSlice = createSlice({
  name: 'avg',
  initialState: {
    subjects: [],
  },
  reducers: {
    setSubjects(state, action) {
      state.subjects = action.payload;
    },
    addSubject(state, action) {
      state.subjects.push(action.payload);
    },
    updateSubject(state, action) {
      const idx = state.subjects.findIndex(s => s.id === action.payload.id);
      if (idx > -1) state.subjects[idx] = action.payload;
    },
    removeSubject(state, action) {
      state.subjects = state.subjects.filter(s => s.id !== action.payload);
    },
  },
});

export const { addSubject, updateSubject, removeSubject, setSubjects } = avgSlice.actions;
export default avgSlice.reducer;