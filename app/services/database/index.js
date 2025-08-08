import SQLite from 'react-native-sqlite-storage';
import { LunchBreakTimeHistorySchema } from './schemas/LunchBreakTimeHistory.schema';

SQLite.enablePromise(true);

let dbInstance = null;

export async function getDB() {
    if (dbInstance) return dbInstance;
    dbInstance = await SQLite.openDatabase({ name: 'helper.db', location: 'default' });

    // Tabelas
    await dbInstance.executeSql(LunchBreakTimeHistorySchema.create);
    return dbInstance;
}

