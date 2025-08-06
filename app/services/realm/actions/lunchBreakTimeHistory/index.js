const { default: getRealm } = require('../..');

const lunchBreakTimeHistory = {
  index: async () => {
    const realm = await getRealm();
    return realm.objects('LunchBreakTimeHistory').sorted('id');
  },

  store: async (payload) => {
    const realm = await getRealm();
    realm.write(() => {
      let history = realm.objects('LunchBreakTimeHistory').sorted('id', true);

      if (history.length > 0) {
        payload.id = history[0].id + 1;
      } else {
        payload.id = 1;
      }

      realm.create('LunchBreakTimeHistory', payload, 'modified');
    });
  },

  show: async (id) => {
    const realm = await getRealm();
    return realm.objects('LunchBreakTimeHistory').filtered(`id = ${id}`)[0];
  },

  update: async (id, payload) => {
    const realm = await getRealm();
    let setting = realm.objects('LunchBreakTimeHistory').filtered(`id = ${id}`)[0];

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
};

module.exports = { lunchBreakTimeHistory };