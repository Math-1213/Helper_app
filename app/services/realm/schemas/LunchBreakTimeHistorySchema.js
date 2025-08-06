import Realm from 'realm';

export default class LunchBreakTimeHistory extends Realm.Object {
    static schema = {
        name: 'LunchBreakTimeHistory',
        primaryKey: 'id',
        properties: {
            id: { type: 'int', indexed: true },
            date: 'date', // Representa o dia completo (YYYY-MM-DD)
            weekday: 'string', // Ex: 'Segunda-feira'
            startTime: 'date', // Hora de saída para o almoço
            endTime: 'date',   // Hora de volta do almoço
            durationMinutes: 'int', // Tempo total de almoço feito em minutos
        },
    };
}
