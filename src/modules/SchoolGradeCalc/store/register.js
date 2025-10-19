import Core from '../../../core';
import { GradeSchema, SubjectSchema } from '../schema/subjectSchema';
import subjectReducer, { setSubject } from './slice';

let realmInstance = null;
let moduleMeta = null;

export async function registerSubjectModule() {
    const { moduleId, moduleKey } = await Core.security.KeyManager.registerModule({
        name: 'subjects',
        version: '1.0.0',
        author: 'Matheus',
    });

    const realm = await Core.realm.RealmManager.initModuleRealm(moduleId, [SubjectSchema, GradeSchema], { moduleKey });
    realmInstance = realm;
    Core.redux.addDynamicModule(moduleId, 'subject', subjectReducer, { moduleKey });

    const saved = realm.objects('Subject').map(s => ({
        id: s.id,
        name: s.name,
        type: s.type,
        grades: s.grade?.array.map(e => {
            return {
                name: e.name,
                value: e.value,
                weight: e.weight,
            }
        })
    }));

    Core.redux.store.dispatch(setSubject(saved));
    return { moduleId, moduleKey, realm };
}


export function persistSubject(subject) {
    // console.log(subject, realmInstance)
    if (!realmInstance) return;

    realmInstance.write(() => {
        // Atualiza se existir, cria se não existir
        realmInstance.create('Subject', subject, true);
    });
}

export function clearRealmSubjects() {
    if (!realmInstance) return;

    realmInstance.write(() => {
        const allSubjects = realmInstance.objects('Subject');
        realmInstance.delete(allSubjects);
    });
}
