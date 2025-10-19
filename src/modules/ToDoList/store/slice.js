import { createSlice } from '@reduxjs/toolkit';

const pokemonSlice = createSlice({
  name: 'pokemon',
  initialState: {
    list: [],
  },
  reducers: {
    addPokemon: (state, action) => {
      const exists = state.list.find(p => p.id === action.payload.id);
      if (!exists) state.list.push(action.payload);
    },
    setPokemons: (state, action) => {
      state.list = action.payload;
    },
    removePokemon: (state, action) => {
      state.list = state.list.filter(p => p.id !== action.payload);
    },
    clearPokemon: (state) => {
      state.list = [];
    },
  },
});

export const { addPokemon, setPokemons, removePokemon, clearPokemon } = pokemonSlice.actions;
export default pokemonSlice.reducer;
