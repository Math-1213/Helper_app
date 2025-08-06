import Realm from 'realm';
Realm.flags.THROW_ON_GLOBAL_REALM = true;

import LunchBreakTimeHistorySchema from './schemas/LunchBreakTimeHistorySchema';


//Intância do realm com todos os schemas
export default async function getRealm() {

    try {
      return await Realm.open({
        schemaVersion: 2,
        deleteIfMigrationNeeded: false,
        schema: [LunchBreakTimeHistorySchema],
      });
    } catch (error) {
      console.error("Erro ao abrir o Realm:", error);
      throw error; 
    }
  }