// =========================
// 🌐 API
// =========================
import { HttpWrapper } from './api/HttpWrapper';

// =========================
// 🧩 REDUX
// =========================
import store from './redux/Store';
import * as DynamicModules from './redux/DynamicModuleManager';
import * as ModuleContext from './redux/ModuleContext';
import * as ModuleRegistry from './redux/ModuleRegistry';
import * as ReducerManager from './redux/ReducerManager';

// =========================
// 🧱 REALM
// =========================
import RealmManager from './realm/RealmManager';

// =========================
// 🔐 SECURITY
// =========================
import KeyManager from './security/KeyManager';

// =========================
// ⚙️ HOOKS
// =========================
import * as UseExternalModuleSelector from './hooks/useExternalModuleSelector';
import * as UseModuleSelector from './hooks/useModuleSelector';
import * as UseGlobalSelector from './hooks/useGlobalSelector';

// =========================
// 🚀 EXPORTS CENTRALIZADOS
// =========================
export const Core = {
  api: {
    HttpWrapper,
  },
  redux: {
    store,
    ...DynamicModules,
    ...ModuleContext,
    ...ModuleRegistry,
    ...ReducerManager,
  },
  realm: {
    RealmManager,
  },
  security: {
    KeyManager,
  },
  hooks: {
    ...UseExternalModuleSelector,
    ...UseModuleSelector,
    ...UseGlobalSelector,
  },
};

export default Core;