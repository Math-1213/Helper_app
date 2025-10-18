const ModuleRegistry = {
  modules: {}, // moduleId -> { moduleId, name, config, moduleKey, reducerRegistered }

  registerModuleMeta(moduleMeta) {
    // moduleMeta: { moduleId, name, config, moduleKey, path? }
    const { moduleId } = moduleMeta;
    if (!moduleId) throw new Error("moduleMeta.moduleId required");
    this.modules[moduleId] = { ...(this.modules[moduleId] || {}), ...moduleMeta };
    return this.modules[moduleId];
  },

  getModule(moduleId) {
    return this.modules[moduleId] || null;
  },

  exists(moduleId) {
    return !!this.modules[moduleId];
  },

  list() {
    return Object.values(this.modules);
  },

  setReducerRegistered(moduleId, flag = true) {
    if (this.modules[moduleId]) this.modules[moduleId].reducerRegistered = flag;
  },

  listModules() {
    console.log("Modules: ", this.modules)
  }
};

export default ModuleRegistry;
