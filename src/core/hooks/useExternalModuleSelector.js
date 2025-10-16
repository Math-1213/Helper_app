// src/core/hooks/useExternalModuleSelector.js
import { useSelector } from 'react-redux';
import ModuleRegistry from '../redux/ModuleRegistry';

export function useExternalModuleSelector(targetModuleId, providedKey, selectorFn) {
  const target = ModuleRegistry.getModule(targetModuleId);
  if (!target) throw new Error("Target module not found: " + targetModuleId);

  // target.config.sharedSlices example: { profile: ["keyA", "keyB"] }
  const validKeys = [];
  if (target.config && target.config.sharedSlices) {
    Object.values(target.config.sharedSlices).forEach(arr => validKeys.push(...arr));
  }

  if (!validKeys.includes(providedKey)) {
    throw new Error("Invalid access key for module: " + targetModuleId);
  }

  // If key valid, let selector access global state — selector must know target slice path
  return useSelector(selectorFn);
}
