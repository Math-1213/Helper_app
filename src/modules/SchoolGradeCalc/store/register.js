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
        grades: s.grades?.map(e => {
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
    if (!realmInstance) return;

    realmInstance.write(() => {
        const formatted = {
            ...subject,
            grades: subject.grades
                ? subject.grades.map(g => ({
                    name: g.name ?? null,
                    value: g.value ?? null,
                    weight: g.weight ?? null,
                }))
                : [],
        };

        realmInstance.create('Subject', formatted, true);
    });
}


export function clearRealmSubjects() {
    if (!realmInstance) return;

    realmInstance.write(() => {
        const allSubjects = realmInstance.objects('Subject');
        realmInstance.delete(allSubjects);
    });
}

export function deleteSubjectById(id) {
    if (!realmInstance) return;

    realmInstance.write(() => {
        const subject = realmInstance.objectForPrimaryKey('Subject', id);
        if (subject) realmInstance.delete(subject);
    });

    // Atualiza o Redux também
    const currentState = Core.redux.store.getState();
    const updatedList = currentState.subject.list.filter(s => s.id !== id);
    Core.redux.store.dispatch({
        type: 'subjects/setSubject',
        payload: updatedList,
    });

    console.log(`🗑️ Subject com ID ${id} removido do Realm e Redux`);
}
