import Realm from 'realm';
Realm.flags.THROW_ON_GLOBAL_REALM = true;

import TimerHistory from './schemas/TimerHistorySchema';


//Intância do realm com todos os schemas
export default async function getRealm() {

    try {
      return await Realm.open({
        schemaVersion: 1,
        deleteIfMigrationNeeded: false,
        schema: [TimerHistory],
      });
    } catch (error) {
      console.error("Erro ao abrir o Realm:", error);
      throw error; // Rejoga se precisar tratar no chamador também
    }
  }