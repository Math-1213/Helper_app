import { getDB } from '../'; // seu getDB

export const ModulesActions = {
    insert: async ({ id, name, usage = 0, screen_title }) => {
        const db = await getDB();
        return new Promise((resolve, reject) => {
            db.transaction(tx => {
                tx.executeSql(
                    `INSERT OR IGNORE INTO modules (id, name, usage, screen_title) VALUES (?, ?, ?, ?);`,
                    [id, name, usage, screen_title],
                    (_, result) => resolve(result),
                    (_, error) => reject(error)
                );
            });
        });
    },

    updateUsage: async (id, usage) => {
        const db = await getDB();
        return new Promise((resolve, reject) => {
            db.transaction(tx => {
                tx.executeSql(
                    `UPDATE modules SET usage = ? WHERE id = ?;`,
                    [usage, id],
                    (_, result) => resolve(result),
                    (_, error) => reject(error)
                );
            });
        });
    },

    getAll: async () => {
        const db = await getDB();
        return new Promise((resolve, reject) => {
            db.transaction(tx => {
                tx.executeSql(
                    `SELECT * FROM modules ORDER BY name;`,
                    [],
                    (_, { rows }) => resolve(rows._array),
                    (_, error) => reject(error)
                );
            });
        });
    },

    ensureDefaultsExist: async (defaults) => {
        for (const mod of defaults) {
            await ModulesActions.insert(mod);
        }
    },
};
