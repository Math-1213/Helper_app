import { useContext } from 'react';
import { useSelector } from 'react-redux';
import { ModuleContext } from '../redux/ModuleContext';
import ModuleRegistry from '../redux/ModuleRegistry';

export function useModuleSelector(selectorFn) {
  const { moduleId } = useContext(ModuleContext);
  if (!moduleId) throw new Error("useModuleSelector must be used inside a ModuleProvider");

  const meta = ModuleRegistry.getModule(moduleId);
  if (!meta) throw new Error("Module not registered: " + moduleId);

  // developer's selector should select using slice keys defined by the module
  return useSelector(selectorFn);
}
