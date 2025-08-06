import Realm from 'realm';
export default class SubappUses extends Realm.Object{
    static schema = {
        name: 'SubappUses',
        primaryKey: 'id',
        properties:{
            id: { type:'int', indexed:true },
            uniqueName: 'string',
            uses: 'int'
        }
    };
}