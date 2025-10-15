import { configureStore } from '@reduxjs/toolkit';
import createReducerManager from './ReducerManager.js';
import userReducer from './slices/userSlice.js';

const staticReducers = {
  user: userReducer,
  // other global reducers here
};

const reducerManager = createReducerManager(staticReducers);

const store = configureStore({
  reducer: reducerManager.reduce,
  middleware: (getDefault) => getDefault(),
});

store.reducerManager = reducerManager;

export default store;
