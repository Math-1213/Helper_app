import Core from '../../../core';
import { TodoListSchema, TaskSchema } from '../schema/todoSchema';
import todoReducer, { setLists } from './slice';

let realmInstance = null;

export async function registerTodoListModule() {
    const { moduleId, moduleKey } = await Core.security.KeyManager.registerModule({
        name: 'todolist',
        version: '1.0.0',
        author: 'Matheus',
    });

    const realm = await Core.realm.RealmManager.initModuleRealm(moduleId, [TodoListSchema, TaskSchema], { moduleKey });
    realmInstance = realm;

    Core.redux.addDynamicModule(moduleId, 'todolist', todoReducer, { moduleKey });

    const saved = realm.objects('TodoList').map(l => ({
        id: l.id,
        name: l.name,
        tasks: l.tasks ? l.tasks.map(t => ({ text: t.text, checked: !!t.checked })) : [],
    }));

    Core.redux.store.dispatch(setLists(saved));
    return { moduleId, moduleKey, realm };
}

export function persistTodoList(list) {
    if (!realmInstance) return;
    const formatted = {
        id: list.id,
        name: list.name ?? '',
        tasks: Array.isArray(list.tasks) ? list.tasks.map(t => ({
            text: t.text ?? '',
            checked: !!t.checked,
        })) : [],
    };

    realmInstance.write(() => {
        realmInstance.create('TodoList', formatted, true);
    });
}

export function deleteTodoListById(id) {
    if (!realmInstance) return;

    realmInstance.write(() => {
        const obj = realmInstance.objectForPrimaryKey('TodoList', id);
        if (obj) realmInstance.delete(obj);
    });

    // atualiza redux com o estado atual do realm (mais seguro)
    const remaining = realmInstance.objects('TodoList').map(l => ({
        id: l.id,
        name: l.name,
        tasks: l.tasks ? l.tasks.map(t => ({ text: t.text, checked: !!t.checked })) : [],
    }));
    Core.redux.store.dispatch(setLists(remaining));
}

// debug: limpa tudo
export function clearRealmTodoLists() {
    if (!realmInstance) return;
    realmInstance.write(() => {
        const all = realmInstance.objects('TodoList');
        realmInstance.delete(all);
    });
    Core.redux.store.dispatch(setLists([]));
}
