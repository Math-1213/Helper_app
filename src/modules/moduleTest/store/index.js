import ModuleRegistry from '../../../core/redux/ModuleRegistry';
import KeyManager from '../../../core/security/KeyManager';
import store from '../../../core/redux/Store';
import RealmManager from '../../../core/realm/RealmManager';
import { createSlice } from '@reduxjs/toolkit';

// slice privado/public example
const pokemonSlice = createSlice({
  name: 'pokemon',
  initialState: { list: [], selected: null },
  reducers: {
    add(state, action) { state.list.push(action.payload); },
    setSelected(state, action) { state.selected = action.payload; }
  }
});

// function module initializer (call when module is loaded)
export async function registerPokemonModule() {
  // load config.json (you can import or fetch)
  const config = require('../module.config.json');

  // register/generate key (if not exists)
  const reg = await KeyManager.registerModule({ name: config.name, version: config.version, author: 'dev' });
  const { moduleId, moduleKey } = reg;

  // register meta to ModuleRegistry
  ModuleRegistry.registerModuleMeta({ moduleId, name: config.name, config, moduleKey });

  // register reducer dynamically in store
  if (!store.reducerManager.getReducerMap()[config.name]) {
    store.reducerManager.add(config.name, pokemonSlice.reducer);
    ModuleRegistry.setReducerRegistered(moduleId, true);
  }

  // init realm for this module with simple schema
  const schema = [{
    name: 'Poke',
    properties: { id: 'int', name: 'string', data: 'string?' },
    primaryKey: 'id'
  }];
  await RealmManager.initModuleRealm(moduleId, schema);

  return { moduleId, moduleKey };
}

// export actions for module internal use
export const { add, setSelected } = pokemonSlice.actions;
export default pokemonSlice.reducer;
