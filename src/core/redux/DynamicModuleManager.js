import store from './Store';
import ModuleRegistry from './ModuleRegistry';

/**
 * Adiciona dinamicamente um módulo Redux ao store e registra no registry.
 * @param {string} moduleId - ID único do módulo.
 * @param {string} moduleName - Nome do slice.
 * @param {Function} reducer - Função reducer do módulo.
 * @param {Object} [meta] - Dados opcionais (config, moduleKey, etc).
 */
export function addDynamicModule(moduleId, moduleName, reducer, meta = {}) {
  if (!moduleId || !moduleName || typeof reducer !== 'function') {
    throw new Error(`addDynamicModule: parâmetros inválidos. ${moduleId}, ${moduleName}, ${typeof reducer}`);
  }

  // verifica se já foi registrado
  if (ModuleRegistry.exists(moduleId) && ModuleRegistry.getModule(moduleId).reducerRegistered) {
    console.log(`[DynamicModuleManager] Reducer já registrado para módulo ${moduleName}`);
    return;
  }

  // registra o metadado
  ModuleRegistry.registerModuleMeta({
    moduleId,
    name: moduleName,
    ...meta,
  });

  // adiciona o reducer dinamicamente
  const reducerMap = store.reducerManager.getReducerMap();
  if (!reducerMap[moduleName]) {
    store.reducerManager.add(moduleName, reducer);
    ModuleRegistry.setReducerRegistered(moduleId, true);
    console.log(`[DynamicModuleManager] Reducer adicionado: ${moduleName}`);
  } else {
    console.warn(`[DynamicModuleManager] Reducer ${moduleName} já existe no store.`);
  }
}

/**
 * Remove dinamicamente um módulo 
 * @param {string} moduleId
 * @param {string} moduleName
 */
export function removeDynamicModule(moduleId, moduleName) {
  if (!moduleId || !moduleName) return;

  const module = ModuleRegistry.getModule(moduleId);
  if (!module) return;

  store.reducerManager.remove(moduleName);
  ModuleRegistry.setReducerRegistered(moduleId, false);
  console.log(`[DynamicModuleManager] Reducer removido: ${moduleName}`);
}
