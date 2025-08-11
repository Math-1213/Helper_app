import SQLite from 'react-native-sqlite-storage';
import { LunchBreakTimeHistorySchema } from './schemas/LunchBreakTimeHistory.schema';
import { SubjectsSchema } from './schemas/Subjects.schema';
import { ModulesSchema } from './schemas/Modules.schema';

SQLite.enablePromise(true);

let dbInstance = null;

export async function getDB() {
    if (dbInstance) return dbInstance;
    dbInstance = await SQLite.openDatabase({ name: 'helper.db', location: 'default' });

    await dbInstance.executeSql(LunchBreakTimeHistorySchema.create);
    await dbInstance.executeSql(SubjectsSchema.createSubjects);
    await dbInstance.executeSql(SubjectsSchema.createGrades);
    await dbInstance.executeSql(ModulesSchema.create);

    return dbInstance;
}