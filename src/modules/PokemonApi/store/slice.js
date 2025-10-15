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
  },
});

export const { addPokemon, setPokemons } = pokemonSlice.actions;
export default pokemonSlice.reducer;
