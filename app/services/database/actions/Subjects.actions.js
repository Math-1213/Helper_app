import { getDB } from '../';

export const SubjectsActions =
{
    insert: async ({ name, grades }) => {
        const db = await getDB();
        return new Promise((resolve, reject) => {
            db.transaction(tx => {
                tx.executeSql(
                    `INSERT INTO subjects (name) VALUES (?);`,
                    [name],
                    (_, result) => {
                        const subjectId = result.insertId;
                        grades.forEach(({ name, weight, score }) => {
                            tx.executeSql(
                                `INSERT INTO grades (subject_id, name, weight, score) VALUES (?, ?, ?, ?);`,
                                [subjectId, name, weight, score]
                            );
                        });
                        resolve(subjectId);
                    },
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
                    `SELECT s.id as subjectId, s.name as subjectName, g.id as gradeId, g.name as gradeName, g.weight, g.score 
         FROM subjects s 
         LEFT JOIN grades g ON s.id = g.subject_id
         ORDER BY s.name;`,
                    [],
                    (_, { rows }) => {
                        const data = {};
                        for (let i = 0; i < rows.length; i++) {
                            const row = rows.item(i);
                            if (!data[row.subjectId]) {
                                data[row.subjectId] = {
                                    id: row.subjectId,
                                    name: row.subjectName,
                                    grades: [],
                                };
                            }
                            if (row.gradeId) {
                                data[row.subjectId].grades.push({
                                    id: row.gradeId,
                                    name: row.gradeName,
                                    weight: row.weight,
                                    score: row.score,
                                });
                            }
                        }
                        resolve(Object.values(data));
                    },
                    (_, error) => reject(error)
                );
            });
        });
    },
    update: async ({ id, name, grades }) => {
        const db = await getDB();
        return new Promise((resolve, reject) => {
            db.transaction(tx => {
                tx.executeSql(
                    `UPDATE subjects SET name = ? WHERE id = ?;`,
                    [name, id]
                );

                tx.executeSql(
                    `DELETE FROM grades WHERE subject_id = ?;`,
                    [id]
                );

                grades.forEach(({ name, weight, score }) => {
                    tx.executeSql(
                        `INSERT INTO grades (subject_id, name, weight, score) VALUES (?, ?, ?, ?);`,
                        [id, name, weight, score]
                    );
                });

            },
                (error) => reject(error),
                () => resolve()
            );
        });
    },
    remove: async (id) => {
        const db = await getDB();
        return new Promise((resolve, reject) => {
            db.transaction(tx => {
                tx.executeSql(
                    `DELETE FROM subjects WHERE id = ?;`,
                    [id],
                    () => resolve(),
                    (_, error) => reject(error)
                );
            });
        });
    },
}