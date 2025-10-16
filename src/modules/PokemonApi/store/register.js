import Realm from 'realm';
import { PokemonSchema } from '../schema/pokemonSchema';
import pokemonReducer from './slice';
import { setPokemons } from './slice';
import Core from '../../../core';

const { addDynamicModule, store } = Core.redux
const { KeyManager } = Core.security

let realmInstance = null;

export async function registerPokemonModule() {
    const moduleName = 'pokemon';
    const { moduleId, moduleKey } = await KeyManager.registerModule({
        name: moduleName,
        version: '1.0.0',
        author: 'Matheus',
    });

    // Abre Realm com schema do Pokémon
    if (!realmInstance) {
        realmInstance = await Realm.open({
            path: 'pokemon.realm',
            schema: [PokemonSchema],
        });
    }

    // Injeta reducer no Redux dinamicamente
    addDynamicModule(moduleId, moduleName, pokemonReducer, {
        moduleKey,
        description: 'Gerencia os dados dos pokemons buscados pela PokeAPI',
    });

    // Carrega dados persistidos do Realm e injeta no Redux
    const savedPokemons = realmInstance.objects('Pokemon').map(p => ({
        id: p.id,
        name: p.name,
        sprite: p.sprite,
        type: p.type,
        height: p.height,
        weight: p.weight,
    }));

    store.dispatch(setPokemons(savedPokemons));

    return { moduleId, moduleKey, realm: realmInstance };
}

export function persistPokemon(pokemon) {
    if (!realmInstance) return;
    realmInstance.write(() => {
        realmInstance.create('Pokemon', pokemon, Realm.UpdateMode.Modified);
    });
}