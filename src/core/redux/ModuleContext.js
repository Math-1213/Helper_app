import React from 'react';

export const ModuleContext = React.createContext({
  moduleId: null,
  moduleKey: null,
  config: null,
});

export function ModuleProvider({ moduleId, moduleKey, config, children }) {
  return (
    <ModuleContext.Provider value={{ moduleId, moduleKey, config }}>
      {children}
    </ModuleContext.Provider>
  );
}
