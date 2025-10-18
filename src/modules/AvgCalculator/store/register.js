import Realm from 'realm';
import { AvgSchema } from './schema';
import avgReducer from './slice';
import { setSubjects } from './slice';
import Core from '../../../core';

const { addDynamicModule, store } = Core.redux;
const { KeyManager } = Core.security;

let realmInstance = null;

export async function registerModule() {
    const moduleName = 'avgSubjects';
    const { moduleId, moduleKey } = await KeyManager.registerModule({
        name: moduleName,
        version: '1.0.0',
        author: 'Matheus',
    });

    // Abre Realm com schema
    if (!realmInstance) {
        realmInstance = await Realm.open({
            path: 'avgSubjects.realm',
            schema: [AvgSchema],
        });
    }

    addDynamicModule(
        moduleId,
        moduleKey,
        avgReducer,
        {
            moduleKey,
            description: 'Gerencia as notas das matérias registradas'
        },
    );

    const savedSubjects = realmInstance.objects('AvgCalculator').map(p => ({
        id: p.id,
        name: p.name,
        type: p.type,
        grades: Array.from(p.grades),
        weights: Array.from(p.weights),

    }));

    store.dispatch(setSubjects(savedSubjects));

    return { moduleId, moduleKey, realm: realmInstance };
}

export function persistSubject(sub) {
    if (!realmInstance) return;
    realmInstance.write(() => {
        realmInstance.create('AvgCalculator', sub, Realm.UpdateMode.Modified);
    });
}
