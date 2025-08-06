const { default: getRealm } = require('../..');

const lunchBreakTimeHistory = {
    index: async () => {
        const realm = await getRealm();
        return realm.objects('LunchBreakTimeHistory').sorted('id');
    },

    store: async (payload) => {
        const realm = await getRealm();
        try {
            realm.write(() => {
                let history = realm.objects('LunchBreakTimeHistory').sorted('id', true);

                if (history.length > 0) {
                    payload.id = history[0].id + 1;
                } else {
                    payload.id = 1;
                }

                realm.create('LunchBreakTimeHistory', payload, 'modified');
            });
        } catch (error) {
            console.error('Erro ao salvar no Realm:', error);
        }
    },

    show: async (id) => {
        const realm = await getRealm();
        return realm.objects('LunchBreakTimeHistory').filtered(`id = ${parseInt(id, 10)}`)[0];
    },

    update: async (id, payload) => {
        const realm = await getRealm();
        let setting = realm.objects('LunchBreakTimeHistory').filtered(`id = ${parseInt(id, 10)}`)[0];

        if (setting) {
            realm.write(() => {
                realm.create('LunchBreakTimeHistory', { ...setting, ...payload, id }, 'modified');
            });
        } else {
            console.warn("LunchBreakTimeHistory not found!");
        }
    },

    delete: async (id) => {
        const realm = await getRealm();
        realm.write(() => {
            let items = realm.objects('LunchBreakTimeHistory').filtered(`id = ${id}`);
            realm.delete(items);
        });
    },
    stopTimerBefore: async ({ startTime, stoppedAt, durationMinutes }) => {
        try {
            const realm = await Realm();

            const existing = realm
                .objects('LunchBreakHistory')
                .filtered('startTime == $0', new Date(startTime))[0];

            if (!existing) {
                console.warn('Nenhum registro encontrado com este horário de início.');
                return;
            }

            realm.write(() => {
                existing.endTime = new Date(stoppedAt);
                existing.durationMinutes = durationMinutes;
            });

            console.log('Horário de almoço atualizado com sucesso.');
        } catch (error) {
            console.error('Erro ao atualizar horário no Realm:', error);
        }
    },
};

module.exports = { lunchBreakTimeHistory };