import Core from '../../../core';
import { PokemonSchema } from '../schema/pokemonSchema';
import pokemonReducer, { setPokemons } from './slice';

let realmInstance = null;
let moduleMeta = null;

export async function registerPokemonModule() {
    const { moduleId, moduleKey } = await Core.security.KeyManager.registerModule({
        name: 'pokemon',
        version: '1.0.0',
        author: 'Matheus',
    });

    const realm = await Core.realm.RealmManager.initModuleRealm(moduleId, [PokemonSchema], { moduleKey });
    Core.redux.addDynamicModule(moduleId, 'pokemon', pokemonReducer, { moduleKey });

    const saved = realm.objects('Pokemon').map(p => ({
        id: p.id,
        name: p.name,
        sprite: p.sprite,
        type: p.type,
        height: p.height,
        weight: p.weight,
    }));

    Core.redux.store.dispatch(setPokemons(saved));
    return { moduleId, moduleKey, realm };
}


export function persistPokemon(pokemon) {
    if (!realmInstance) return;

    realmInstance.write(() => {
        // Atualiza se existir, cria se não existir
        realmInstance.create('Pokemon', pokemon, true);
    });
}