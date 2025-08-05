const { default: getRealm } = require('../..');
const { Helper } = require('../../../helper');
const { default: store } = require('../../../redux');

const timeHistory = {
    index: async () => {
        const realm = await getRealm();
        return realm.objects('TimeHistory').sorted('id');
    },
    store: async (payload) => {
        const realm = await getRealm();
        realm.write(() => {
            let History = realm.objects('TimeHistory').sorted('id', true);

            if (History.length > 0) {
                payload.id = TimeHistory[0].id;
                payload.id++;
            } else {
                payload.id = 1;
            }
            realm.create('TimeHistory', payload, true);
        });
    },
    show: async (id) => {
        const realm = await getRealm();
        return realm.objects('TimeHistory').sorted('id', true)[0];
    },
    update: async (id, payload) => {

        const realm = await getRealm();
        let setting = realm.objects('TimeHistory').filtered(`id="${id}"`)[0];
        if (setting)
            realm.write(() => {
                realm.create('TimeHistory', payload, true);
            });
        else
            console.warn("TimeHistory not found!");
    },
    delete: async (id) => {
        const realm = await getRealm();
        realm.write(() => {
            let timeHistory = realm.objects('TimeHistory').filtered(`id="${id}"`);
            realm.delete(timeHistory);
        });
    },
};

module.exports = { timeHistory };