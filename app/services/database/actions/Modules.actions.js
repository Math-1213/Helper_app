import { getDB } from '../';

export const ModulesActions = {
    insert: async ({ id, name, usage = 0, screen_title }) => {
        const db = await getDB();
        return new Promise((resolve, reject) => {
            db.transaction(tx => {
                console.log(id, name, usage, screen_title)
                tx.executeSql(
                    `INSERT OR IGNORE INTO modules (id, name, usage, screen_title) VALUES (?, ?, ?, ?);`,
                    [id, name, usage, screen_title],
                    (_, result) => resolve(result),
                    (_, error) => {
                        console.error('Erro no insert:', error);
                        reject(error);
                    }
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
                    (_, result) => {
                        console.log(id, usage, )
                        resolve(result)
                    },
                    (_, error) => {
                        console.error('Erro no updateUsage:', error);
                        reject(error);
                    }
                );
            });
        });
    },

    getAll: async () => {
        const db = await getDB();
        return new Promise((resolve, reject) => {
            db.transaction(tx => {
                tx.executeSql(
                    `SELECT * FROM modules ORDER BY usage, name;`,
                    [],
                    (_, result) => {
                        const rows = result.rows;
                        let modules = [];
                        for (let i = 0; i < rows.length; i++) {
                            modules.push(rows.item(i));
                        }
                        resolve(modules);
                    },
                    (_, error) => {
                        console.log('SQL ERROR:', error);
                        reject(error);
                    }
                );
            }, (error) => {
                console.log('TRANSACTION ERROR:', error);
                reject(error);
            });
        });
    },

    ensureDefaultsExist: async (defaults) => {
        for (const mod of defaults) {
            try {
                await ModulesActions.insert(mod);
            } catch (error) {
                console.log('Error inserting default module:', error);
            }
        }
    },

    updateUsageIncrement: async (id) => {
        const db = await getDB();

        return new Promise((resolve, reject) => {
            db.transaction(tx => {
                tx.executeSql(
                    `UPDATE modules SET usage = usage + 1 WHERE id = ?;`,
                    [id],
                    (_, result) => resolve(result),
                    (_, error) => reject(error)
                );
            });
        });
    },

};
