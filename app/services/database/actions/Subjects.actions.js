import { getDB } from '../';

export const SubjectsActions =
{
    insert: async ({ name, mode, grades }) => {
        const db = await getDB();
        return new Promise((resolve, reject) => {
            try {
                db.transaction(tx => {
                    tx.executeSql(
                        'INSERT INTO subjects (name, calc_mode) VALUES (?, ?);',
                        [name, mode],
                        (_, result) => {
                            const subjectId = result.insertId;
                            let completed = 0;
                            if (grades.length === 0) {
                                resolve(subjectId);
                                return;
                            }
                            grades.forEach((grade) => {
                                tx.executeSql(
                                    'INSERT INTO grades (subject_id, name, weight, score) VALUES (?, ?, ?, ?);',
                                    [subjectId, grade.name, grade.weight, grade.score],
                                    () => {
                                        completed++;
                                        if (completed === grades.length) {
                                            resolve(subjectId);
                                        }
                                    },
                                    (_, error) => {
                                        console.error('Erro ao inserir nota:', JSON.stringify(error), error);
                                        reject(error);
                                        return true;
                                    }
                                );
                            });
                        },
                        (_, error) => {
                            console.error('Erro ao inserir matéria:', JSON.stringify(error), error);
                            reject(error);
                            return true;
                        }
                    );
                });
            } catch (e) {
                console.error('Erro na transação:', e);
                reject(e);
            }
        });
    },
    getAll: async () => {
        const db = await getDB();
        return new Promise((resolve, reject) => {
            db.transaction(tx => {
                tx.executeSql(
                    `SELECT s.id as subjectId, s.name as subjectName, s.calc_mode as weightMode, g.id as gradeId, g.name as gradeName, g.weight, g.score 
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
                                    weightMode: row.weightMode,
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
    update: async ({ id, name, mode, grades }) => {
        const db = await getDB();
        return new Promise((resolve, reject) => {
            db.transaction(tx => {
                tx.executeSql(
                    `UPDATE subjects SET name = ?, calc_mode = ? WHERE id = ?;`,
                    [name, Number(mode), id],
                    () => {
                        tx.executeSql(
                            `DELETE FROM grades WHERE subject_id = ?;`,
                            [id],
                            () => {
                                const gradeInserts = grades.map(grade => {
                                    return new Promise((insertResolve, insertReject) => {
                                        tx.executeSql(
                                            `INSERT INTO grades (subject_id, name, weight, score) VALUES (?, ?, ?, ?);`,
                                            [id, grade.name, grade.weight, grade.grade],
                                            () => insertResolve(),
                                            (_, error) => {
                                                console.error('Erro ao inserir nota:', error);
                                                insertReject(error);
                                                return true;
                                            }
                                        );
                                    });
                                });

                                Promise.all(gradeInserts)
                                    .then(() => resolve())
                                    .catch(err => reject(err));
                            },
                            (_, error) => reject(error)
                        );
                    },
                    (_, error) => reject(error)
                );
            });
        });
    },
    remove: async (id) => {
        const db = await getDB();
        return new Promise((resolve, reject) => {
            db.transaction(tx => {
                tx.executeSql(
                    `DELETE FROM grades WHERE subject_id = ?;`,
                    [id],
                    () => {
                        tx.executeSql(
                            `DELETE FROM subjects WHERE id = ?;`,
                            [id],
                            () => resolve(),
                            (_, error) => reject(error)
                        );
                    },
                    (_, error) => reject(error)
                );
            });
        });
    },
    printAllSubjectsAsJSON: async () => {
        const db = await getDB();

        return new Promise((resolve, reject) => {
            db.transaction(tx => {
                tx.executeSql(
                    `SELECT s.id as subjectId, s.name as subjectName, s.calc_mode, 
                  g.id as gradeId, g.name as gradeName, g.weight, g.score
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
                                    calc_mode: row.calc_mode,
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
                        const result = Object.values(data);
                        console.log(JSON.stringify(result, null, 2));
                        resolve(result);
                    },
                    (_, error) => {
                        console.error('Erro ao buscar subjects:', error);
                        reject(error);
                        return false;
                    }
                );
            });
        });
    }
}