import { getDB } from '../';

export const LunchBreakTimeHistoryActions = {
    insert: async (payload) => {
        const db = await getDB();
        const arrayFromPayload = [
            payload.date.toISOString().split('T')[0],
            payload.weekday,
            payload.startTime.toISOString(),
            payload.endTime.toISOString(),
            payload.durationMinutes]
        const [result] = await db.executeSql(
            `INSERT INTO LunchBreakTimeHistory (date, weekday, startTime, endTime, durationMinutes)
            VALUES (?, ?, ?, ?, ?)`,
            arrayFromPayload
        );

        return result.insertId;
    },
    getAll: async () => {
        const db = await getDB();
        const [results] = await db.executeSql(`SELECT * FROM LunchBreakTimeHistory`);
        return results.rows.raw(); // retorna array de objetos
    },
    deleteById: async (id) => {
        const db = await getDB();
        await db.executeSql(`DELETE FROM LunchBreakTimeHistory WHERE id = ?`, [id]);
    },
    stopTimerBefore: async (payload) => {
        try {
            const db = await getDB();
            await db.executeSql(
                `UPDATE LunchBreakTimeHistory 
                SET startTime = ?, endTime = ?, durationMinutes = ?
                WHERE id = ?`,
                [
                    payload.startTime.toISOString(),
                    payload.stoppedAt.toISOString(),
                    payload.durationMinutes,
                    payload.id
                ]
            );
            console.log('Timer salvo no SQLite');
        } catch (err) {
            console.error('Erro ao salvar no SQLite:', err, payload);
        }
    },
    getWeekday: (date) => {
        const dias = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
        return dias[date.getDay()];
    }
};
