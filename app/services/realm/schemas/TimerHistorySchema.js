import Realm from 'realm';
export default class AnimalSchema extends Realm.Object{
    static schema = {
        name: 'TimerHistory',
        primaryKey: 'id',
        properties:{
            id: { type:'int', indexed:true },
            startTime: 'date',
            endTime: 'date',
            
        }
    };
}