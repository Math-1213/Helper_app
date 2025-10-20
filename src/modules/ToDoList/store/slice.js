import { createSlice } from '@reduxjs/toolkit';

const TodoListSlice = createSlice({
  name: 'todolist', // chave usada no store
  initialState: {
    list: [], // array de listas { id, name, tasks: [{text, checked}] }
  },
  reducers: {
    addList: (state, action) => {
      const exists = state.list.find(p => p.id === action.payload.id);
      if (!exists) state.list.push(action.payload);
    },
    setLists: (state, action) => {
      state.list = action.payload;
    },
    removeList: (state, action) => {
      state.list = state.list.filter(p => p.id !== action.payload);
    },
    clearLists: (state) => {
      state.list = [];
    },
    updateList: (state, action) => {
      const index = state.list.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.list[index] = { ...state.list[index], ...action.payload };
      } else {
        console.warn('updateList: list not found', action.payload.id);
      }
    }
  },
});

export const { addList, setLists, removeList, clearLists, updateList } = TodoListSlice.actions;
export default TodoListSlice.reducer;
