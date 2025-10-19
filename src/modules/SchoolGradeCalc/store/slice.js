import { createSlice } from '@reduxjs/toolkit';

const SubjectSlice = createSlice({
  name: 'subjects',
  initialState: {
    list: [],
  },
  reducers: {
    addSubject: (state, action) => {
      const exists = state.list.find(p => p.id === action.payload.id);
      if (!exists) state.list.push(action.payload);
    },
    setSubject: (state, action) => {
      state.list = action.payload;
    },
    removeSubject: (state, action) => {
      state.list = state.list.filter(p => p.id !== action.payload);
    },
    clearSubject: (state) => {
      state.list = [];
    },
    updateSubject: (state, action) => {
      console.log("UpdateSubject chamado", action.payload);
      const index = state.list.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.list[index] = { ...state.list[index], ...action.payload };
      } else {
        console.log(action, state)
        console.warn(action.payload.id, state, 'Subject não encontrado para update');
      }
    }
  },
});

export const { addSubject, setSubject, removeSubject, clearSubject, updateSubject } = SubjectSlice.actions;
export default SubjectSlice.reducer;
