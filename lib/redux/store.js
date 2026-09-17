// A store *factory*, not a module-level singleton. Next.js App Router still renders Client
// Components on the server for the initial HTML, so a singleton created at module scope would
// be shared and mutated across every concurrent request/user on that server process. Each
// ReduxProvider instance calls makeStore() once (via useRef) so every request/browser tab gets
// its own store, matching Redux Toolkit's own documented Next.js pattern.

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import propertiesReducer from './slices/propertiesSlice';
import filtersReducer from './slices/filtersSlice';
import uiReducer from './slices/uiSlice';

export function makeStore() {
  return configureStore({
    reducer: {
      auth: authReducer,
      properties: propertiesReducer,
      filters: filtersReducer,
      ui: uiReducer,
    },
  });
}
