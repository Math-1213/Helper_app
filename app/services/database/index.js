import SQLite from 'react-native-sqlite-storage';
import { LunchBreakTimeHistorySchema } from './schemas/LunchBreakTimeHistory.schema';
import { SubjectsSchema } from './schemas/Subjects.schema';

SQLite.enablePromise(true);

let dbInstance = null;

export async function getDB() {
    if (dbInstance) return dbInstance;
    dbInstance = await SQLite.openDatabase({ name: 'helper.db', location: 'default' });

    // Tabelas
    await dbInstance.executeSql(LunchBreakTimeHistorySchema.create);
    await dbInstance.executeSql(SubjectsSchema.createSubjects);
    await dbInstance.executeSql(SubjectsSchema.createGrades);
    return dbInstance;
}

